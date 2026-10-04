"use client";

import { useActionState, useEffect, useRef } from "react";
import { SendHorizontal } from "lucide-react";
import { replyToConversation, type ReplyState } from "@/lib/actions/inbox";

export function ReplyForm({ requestId, t }: { requestId: string; t: { reply: string; replyPlaceholder: string; sendReply: string; replyError: string } }) {
  const [state, action, pending] = useActionState<ReplyState, FormData>(replyToConversation, { status: "idle" });
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "sent") ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="rounded-[var(--radius-lg)] bg-paper p-3 ring-1 ring-line">
      <input type="hidden" name="requestId" value={requestId} />
      <label htmlFor="reply-body" className="sr-only">
        {t.reply}
      </label>
      <textarea
        id="reply-body"
        name="body"
        required
        maxLength={4000}
        rows={3}
        placeholder={t.replyPlaceholder}
        className="w-full resize-y rounded-[var(--radius-md)] bg-cream px-3.5 py-2.5 text-sm ring-1 ring-line outline-none focus:ring-2 focus:ring-charcoal"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p role="alert" className="text-sm text-coral-ink">
          {state.status === "error" ? t.replyError : ""}
        </p>
        <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-full bg-charcoal px-5 text-sm font-semibold text-cream hover:bg-olive-deep disabled:opacity-60">
          <SendHorizontal aria-hidden="true" className="size-4" /> {t.sendReply}
        </button>
      </div>
    </form>
  );
}
