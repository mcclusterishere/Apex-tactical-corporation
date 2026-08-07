"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createZomeAction, bookAction, bookFamilyStayAction } from "@/app/actions/bookings";
import type { FormState } from "@/app/actions/records";

const INPUT =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-sm border border-ink-800 bg-ink-800 px-4 py-1.5 text-[13px] font-medium text-ink-50 hover:bg-ink-700 disabled:opacity-60 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
    >
      {pending ? "Working…" : label}
    </button>
  );
}

function Result({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p className={`text-sm ${state.ok ? "text-[var(--good)]" : "text-seal-700 dark:text-seal-300"}`}>
      {state.message}
    </p>
  );
}

export function NewZomeForm() {
  const [state, action] = useActionState<FormState, FormData>(createZomeAction, { ok: false });
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">Name</span>
        <input name="name" required className={INPUT} placeholder="Weldon Zome 1" />
      </label>
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">Location</span>
        <input name="location" className={INPUT} placeholder="Ash St, Weldon NC" />
      </label>
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">Description</span>
        <textarea name="description" rows={2} className={INPUT} />
      </label>
      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium">Nightly ($)</span>
          <input name="nightly" className={INPUT} inputMode="decimal" placeholder="120" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium">Cleaning ($)</span>
          <input name="cleaning" className={INPUT} inputMode="decimal" placeholder="50" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium">Sleeps</span>
          <input name="sleeps" className={INPUT} inputMode="numeric" defaultValue={2} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="list" type="checkbox" value="yes" defaultChecked /> List it now (bookable)
      </label>
      <Result state={state} />
      <Submit label="Create zome" />
    </form>
  );
}

/**
 * The family's own booking form — mobile-first: two big date fields and one
 * big thumb-sized button. The price is Stays, and the engine enforces it.
 */
export function FamilyStayForm({ zomeId }: { zomeId: string }) {
  const bound = bookFamilyStayAction.bind(null, zomeId);
  const [state, action] = useActionState<FormState, FormData>(bound, { ok: false });
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[15px] font-medium">Check-in</span>
          <input
            name="checkIn"
            type="date"
            required
            className="surface w-full rounded-lg border border-[var(--rule-strong)] px-3 py-3 text-[16px] outline-none focus:border-[var(--link)]"
            defaultValue={String(v.checkIn ?? "")}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[15px] font-medium">Check-out</span>
          <input
            name="checkOut"
            type="date"
            required
            className="surface w-full rounded-lg border border-[var(--rule-strong)] px-3 py-3 text-[16px] outline-none focus:border-[var(--link)]"
            defaultValue={String(v.checkOut ?? "")}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-[15px] font-medium">Note (optional)</span>
        <input
          name="note"
          className="surface w-full rounded-lg border border-[var(--rule-strong)] px-3 py-3 text-[16px] outline-none focus:border-[var(--link)]"
          placeholder="Who's coming, anything to know"
        />
      </label>
      <p className="muted text-[13px]">
        Your nights are paid in <strong>Stays</strong> — 2 nights = 1 Stay, earned on the task board
        or gifted by family. If your balance is short, the booking will tell you.
      </p>
      <Result state={state} />
      <button
        type="submit"
        className="w-full rounded-lg border border-ink-800 bg-ink-800 px-4 py-3.5 text-[16px] font-semibold text-ink-50 hover:bg-ink-700 disabled:opacity-60 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
      >
        Stay here — pay with Stays
      </button>
    </form>
  );
}

export function BookForm({ zomeId }: { zomeId: string }) {
  const bound = bookAction.bind(null, zomeId);
  const [state, action] = useActionState<FormState, FormData>(bound, { ok: false });
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">Guest name</span>
        <input name="guestName" required className={INPUT} defaultValue={String(v.guestName ?? "")} />
      </label>
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">Contact (email or phone)</span>
        <input name="guestContact" className={INPUT} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium">Check-in</span>
          <input name="checkIn" type="date" required className={INPUT} defaultValue={String(v.checkIn ?? "")} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium">Check-out</span>
          <input name="checkOut" type="date" required className={INPUT} defaultValue={String(v.checkOut ?? "")} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">Channel</span>
        <select name="channel" className={INPUT} defaultValue="DIRECT">
          <option value="DIRECT">Direct</option>
          <option value="AIRBNB">Airbnb</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">Note</span>
        <textarea name="note" rows={2} className={INPUT} />
      </label>
      <Result state={state} />
      <Submit label="Confirm booking" />
    </form>
  );
}
