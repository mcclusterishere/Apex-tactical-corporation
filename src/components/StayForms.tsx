"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  postTaskAction,
  claimTaskAction,
  markDoneAction,
  verifyTaskAction,
  cancelTaskAction,
  giftAction,
} from "@/app/actions/stays";
import type { FormState } from "@/app/actions/records";

const INPUT =
  "surface w-full rounded-sm border border-[var(--rule-strong)] px-2.5 py-1.5 text-sm outline-none focus:border-ink-500";

function Submit({ label, quiet = false }: { label: string; quiet?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        quiet
          ? "rounded-sm border border-[var(--rule-strong)] px-2.5 py-1 text-[13px] hover:surface-tint disabled:opacity-60"
          : "inline-flex items-center rounded-sm border border-ink-800 bg-ink-800 px-4 py-1.5 text-[13px] font-medium text-ink-50 hover:bg-ink-700 disabled:opacity-60 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-900"
      }
    >
      {pending ? "Working…" : label}
    </button>
  );
}

function Result({ state }: { state: FormState }) {
  if (!state.message || state.message === "Done.") return null;
  return (
    <p className={`text-sm ${state.ok ? "text-[var(--good)]" : "text-seal-700 dark:text-seal-300"}`}>
      {state.message}
    </p>
  );
}

export function NewTaskForm() {
  const [state, action] = useActionState<FormState, FormData>(postTaskAction, { ok: false });
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">Task</span>
        <input name="title" required className={INPUT} placeholder="Mow and edge the whole yard" />
      </label>
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">Property or business</span>
        <input name="propertyLabel" required className={INPUT} placeholder="2243 Haverford Dr, Decatur" />
      </label>
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">What done looks like</span>
        <textarea
          name="detail"
          rows={2}
          className={INPUT}
          placeholder="Cut, edged, clippings bagged, photos sent"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">Reward (nights — 2 nights = 1 Stay)</span>
        <input name="rewardNights" required inputMode="numeric" className={INPUT} placeholder="1" />
      </label>
      <Result state={state} />
      <Submit label="Post the task" />
    </form>
  );
}

export function GiftForm({ members }: { members: { id: string; displayName: string }[] }) {
  const [state, action] = useActionState<FormState, FormData>(giftAction, { ok: false });
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-[13px] font-medium">To</span>
        <select name="toUserId" required className={INPUT} defaultValue="">
          <option value="" disabled>
            Choose a member…
          </option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.displayName}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium">Nights</span>
          <input name="nights" required inputMode="numeric" className={INPUT} placeholder="2" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium">Note (optional)</span>
          <input name="memo" className={INPUT} placeholder="For the Fourth of July week" />
        </label>
      </div>
      <Result state={state} />
      <Submit label="Gift the Stays" />
    </form>
  );
}

export function TaskActions({
  taskId,
  status,
  mine,
  steward,
}: {
  taskId: string;
  status: string;
  mine: boolean;
  steward: boolean;
}) {
  const [claimState, claim] = useActionState<FormState, FormData>(
    (prev: FormState) => claimTaskAction(taskId, prev),
    { ok: false },
  );
  const [doneState, done] = useActionState<FormState, FormData>(
    (prev: FormState, formData: FormData) => markDoneAction(taskId, prev, formData),
    { ok: false },
  );
  const [verifyState, verify] = useActionState<FormState, FormData>(
    (prev: FormState) => verifyTaskAction(taskId, prev),
    { ok: false },
  );
  const [cancelState, cancel] = useActionState<FormState, FormData>(
    (prev: FormState) => cancelTaskAction(taskId, prev),
    { ok: false },
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "OPEN" ? (
        <form action={claim}>
          <Submit label="Claim it" quiet />
        </form>
      ) : null}
      {status === "CLAIMED" && mine ? (
        <form action={done} className="flex items-center gap-2">
          <input name="note" className={`${INPUT} w-44`} placeholder="Done — note (optional)" />
          <Submit label="Mark done" quiet />
        </form>
      ) : null}
      {status === "DONE" && steward ? (
        <form action={verify}>
          <Submit label="Verify & credit" quiet />
        </form>
      ) : null}
      {status !== "VERIFIED" && status !== "CANCELLED" ? (
        <form action={cancel}>
          <Submit label="Cancel" quiet />
        </form>
      ) : null}
      <Result state={claimState} />
      <Result state={doneState} />
      <Result state={verifyState} />
      <Result state={cancelState} />
    </div>
  );
}
