"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getPrincipal, assertMfa } from "@/lib/auth";
import { assertPasswordChanged, AccessError } from "@/lib/access";
import { can } from "@/lib/authz";
import { appendToChainTx } from "@/lib/chain";
import { createBooking, cancelBooking, BookingError } from "@/lib/bookings";
import type { FormState } from "@/app/actions/records";

/** Managing the lettings is a financial power — gate it like the Treasury. */
function assertLettings(principalRole: string | null | undefined) {
  if (!(can(principalRole, "registry:financial") || principalRole === "SOVEREIGN")) {
    throw new AccessError("You do not hold the power to manage the Kingdom's lettings.");
  }
}

function dollarsToCents(raw: string, label: string): number {
  const n = Number(String(raw).replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n) || n < 0) throw new BookingError(`${label} must be a non-negative amount.`);
  const cents = Math.round(n * 100);
  if (!Number.isSafeInteger(cents)) throw new BookingError(`${label} is too large.`);
  return cents;
}

export async function createZomeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertMfa(principal);
    assertPasswordChanged(principal);
    assertLettings(principal.role);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Refused." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "Name the zome.", fieldErrors: { name: "Required." } };

  try {
    const nightlyCents = dollarsToCents(String(formData.get("nightly") ?? "0"), "The nightly rate");
    const cleaningCents = dollarsToCents(String(formData.get("cleaning") ?? "0"), "The cleaning fee");
    const sleeps = Math.max(1, Math.trunc(Number(formData.get("sleeps") ?? 2)) || 2);
    const listNow = formData.get("list") ? "LISTED" : "DRAFT";

    const zome = await prisma.$transaction(async (tx) => {
      const created = await tx.zome.create({
        data: {
          name,
          location: String(formData.get("location") ?? "").trim() || null,
          description: String(formData.get("description") ?? "").trim() || null,
          sleeps,
          nightlyCents,
          cleaningCents,
          status: listNow,
        },
      });
      if (listNow === "LISTED") {
        await appendToChainTx(tx, {
          eventType: "ZOME_LISTED",
          actorId: principal.id,
          actorLabel: `${principal.displayName} (${principal.role})`,
          payload: { zomeId: created.id, name, nightlyCents },
        });
      }
      return created;
    });

    revalidatePath("/zomes");
    return { ok: true, message: `${zome.name} created.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not create the zome." };
  }
}

export async function bookAction(zomeId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertMfa(principal);
    assertPasswordChanged(principal);
    assertLettings(principal.role);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Refused." };
  }

  try {
    await createBooking(principal, {
      zomeId,
      guestName: String(formData.get("guestName") ?? ""),
      guestContact: String(formData.get("guestContact") ?? "") || null,
      channel: String(formData.get("channel") ?? "DIRECT"),
      checkIn: String(formData.get("checkIn") ?? ""),
      checkOut: String(formData.get("checkOut") ?? ""),
      note: String(formData.get("note") ?? "") || null,
    });
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "The booking could not be made.",
      values: {
        guestName: String(formData.get("guestName") ?? ""),
        checkIn: String(formData.get("checkIn") ?? ""),
        checkOut: String(formData.get("checkOut") ?? ""),
      },
    };
  }

  revalidatePath(`/zomes/${zomeId}`);
  revalidatePath("/bookings");
  return { ok: true, message: "Booked. The nights are held." };
}

/**
 * A family member books their own stay, paying in Stays. No stewardship power
 * required — the gate is the balance itself: no Stays, no stay. That is the
 * whole anti-squat rule, and it is enforced inside the booking transaction.
 */
export async function bookFamilyStayAction(
  zomeId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertMfa(principal);
    assertPasswordChanged(principal);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Refused." };
  }

  try {
    await createBooking(principal, {
      zomeId,
      guestName: principal.displayName,
      guestContact: null,
      channel: "FAMILY",
      checkIn: String(formData.get("checkIn") ?? ""),
      checkOut: String(formData.get("checkOut") ?? ""),
      note: String(formData.get("note") ?? "") || null,
    });
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "The stay could not be booked.",
      values: {
        checkIn: String(formData.get("checkIn") ?? ""),
        checkOut: String(formData.get("checkOut") ?? ""),
      },
    };
  }

  revalidatePath(`/zomes/${zomeId}`);
  revalidatePath("/bookings");
  revalidatePath("/stays");
  return { ok: true, message: "Booked — your Stays paid for the nights. Enjoy the place you keep." };
}

export async function cancelBookingAction(
  bookingId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const principal = await getPrincipal();
  try {
    assertMfa(principal);
    assertPasswordChanged(principal);
    assertLettings(principal.role);
    await cancelBooking(principal, bookingId, String(formData.get("reason") ?? "") || undefined);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not cancel." };
  }
  revalidatePath("/bookings");
  return { ok: true, message: "Cancelled. The nights are released." };
}
