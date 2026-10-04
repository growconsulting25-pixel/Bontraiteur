"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Check, LifeBuoy, MessageCircle, Phone, RotateCcw, Sparkles, X } from "lucide-react";
import { site } from "@/data/site";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";
import type { AssistantReply, ChatTurn, ProposedAction } from "@/lib/assistant/types";
import { cn } from "@/lib/cn";
import { RichText } from "./RichText";

/**
 * Fenêtre de discussion de l'assistant Bon Traiteur.
 *  - mode « site »   : chatbot public (questions, orientation vers les bonnes pages) ;
 *  - mode « portal » : assistant support connecté au compte. Il PRÉPARE des actions
 *    (cartes « Confirmer / Annuler ») ; rien n'est exécuté sans le clic de la personne.
 */

type ActionState = "pending" | "running" | "done" | "failed" | "cancelled";
type Entry =
  | { kind: "turn"; turn: ChatTurn }
  | { kind: "action"; proposal: ProposedAction; state: ActionState }
  | { kind: "notice"; text: string; contacts?: boolean };

const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");

export function ChatWidget({
  mode,
  locale,
  t,
  supportHref,
  establishmentId,
}: {
  mode: "site" | "portal";
  locale: Locale;
  t: Dictionary["assistant"];
  /** Lien « parler à une personne » (page contact ou support du portail). */
  supportHref: string;
  establishmentId?: string;
}) {
  const router = useRouter();
  const storageKey = `bt-assistant-${mode}-${establishmentId ?? "public"}`;
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const loaded = useRef(false);

  // Conversation conservée pendant la visite (onglet)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) setEntries(JSON.parse(saved) as Entry[]);
    } catch {}
    loaded.current = true;
  }, [storageKey]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(entries.slice(-60)));
    } catch {}
  }, [entries, storageKey]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, busy, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const history = (list: Entry[]): ChatTurn[] => list.flatMap((e) => (e.kind === "turn" ? [e.turn] : []));

  const ask = useCallback(
    async (list: Entry[]) => {
      setBusy(true);
      try {
        const res = await fetch(`/api/assistant/${mode}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ locale, messages: history(list), establishmentId }),
        });
        if (res.status === 429) {
          setEntries((cur) => [...cur, { kind: "notice", text: t.rate, contacts: true }]);
          return;
        }
        const data = (await res.json()) as AssistantReply & { error?: string };
        if (!res.ok || data.error) throw new Error(data.error ?? String(res.status));
        if (data.unavailable) {
          setEntries((cur) => [...cur, { kind: "notice", text: t.unavailable, contacts: true }]);
          return;
        }
        setEntries((cur) => [
          ...cur,
          ...(data.text ? [{ kind: "turn", turn: { role: "assistant", content: data.text } } as Entry] : []),
          ...data.actions.map((proposal) => ({ kind: "action", proposal, state: "pending" }) as Entry),
        ]);
      } catch {
        setEntries((cur) => [...cur, { kind: "notice", text: t.error, contacts: true }]);
      } finally {
        setBusy(false);
      }
    },
    [mode, locale, establishmentId, t],
  );

  const send = (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next: Entry[] = [...entries, { kind: "turn", turn: { role: "user", content } }];
    setEntries(next);
    setInput("");
    void ask(next);
  };

  const setActionState = (id: string, state: ActionState) =>
    setEntries((cur) => cur.map((e) => (e.kind === "action" && e.proposal.id === id ? { ...e, state } : e)));

  /** Confirmation d'une action préparée : exécutée côté serveur avec les droits de la personne. */
  const runAction = async (proposal: ProposedAction) => {
    setActionState(proposal.id, "running");
    let ok = false;
    let error = "network";
    try {
      const res = await fetch("/api/assistant/portal/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, establishmentId, action: proposal.action }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      ok = data.ok;
      error = data.error ?? "?";
    } catch {}
    if (ok) router.refresh(); // la page derrière se met à jour
    const note = ok ? fill(t.actionNoteDone, { summary: proposal.summary }) : fill(t.actionNoteFailed, { summary: proposal.summary, error });
    // L'assistant est informé du résultat et peut enchaîner
    const next: Entry[] = [
      ...entriesRef.current.map((e) => (e.kind === "action" && e.proposal.id === proposal.id ? { ...e, state: (ok ? "done" : "failed") as ActionState } : e)),
      { kind: "turn", turn: { role: "user", content: note } },
    ];
    setEntries(next);
    void ask(next);
  };

  const cancelAction = (proposal: ProposedAction) => {
    setActionState(proposal.id, "cancelled");
    setEntries((cur) => [...cur, { kind: "turn", turn: { role: "user", content: fill(t.actionNoteCancelled, { summary: proposal.summary }) } }]);
  };

  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const greeting = mode === "portal" ? t.portalGreeting : t.siteGreeting;
  const suggestions = mode === "portal" ? t.portalSuggestions : t.siteSuggestions;
  const hasConversation = entries.length > 0;
  const isNote = (s: string) => s.startsWith("[") && s.endsWith("]");

  const contacts = (
    <div className="mt-2 flex flex-wrap gap-2">
      {site.contact.phones.map((p) => (
        <a key={p.href} href={p.href} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold ring-1 ring-line hover:ring-charcoal">
          <Phone aria-hidden="true" className="size-3.5" /> {p.display}
        </a>
      ))}
      <Link href={supportHref} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold ring-1 ring-line hover:ring-charcoal">
        <LifeBuoy aria-hidden="true" className="size-3.5" /> {t.humanTitle}
      </Link>
    </div>
  );

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6 print:hidden">
      <div
        id="assistant-panel"
        role="dialog"
        aria-modal="false"
        aria-label={t.dialogAria}
        hidden={!open}
        className="flex h-[min(40rem,calc(100dvh-6.5rem))] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[var(--radius-xl)] bg-cream shadow-[var(--shadow-lift)] ring-1 ring-line"
      >
        {/* En-tête */}
        <div className="flex items-start gap-3 bg-olive px-5 py-4 text-cream">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-saffron text-charcoal">
            <Sparkles aria-hidden="true" className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg leading-tight font-bold">{mode === "portal" ? t.portalTitle : t.siteTitle}</p>
            <p className="mt-0.5 text-xs text-cream/80">{mode === "portal" ? t.portalSubtitle : t.siteSubtitle}</p>
          </div>
          {hasConversation && (
            <button
              type="button"
              onClick={() => setEntries([])}
              title={t.restart}
              aria-label={t.restart}
              className="grid size-8 shrink-0 place-items-center rounded-full text-cream/80 hover:bg-cream/10 hover:text-cream"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
          <Bubble role="assistant">
            <RichText text={greeting} />
          </Bubble>
          {!hasConversation && (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full bg-paper px-3 py-1.5 text-left text-sm font-semibold ring-1 ring-line transition-colors hover:bg-saffron-soft hover:ring-saffron"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {entries.map((e, i) => {
            if (e.kind === "turn") {
              if (e.turn.role === "user" && isNote(e.turn.content)) return null;
              return (
                <Bubble key={i} role={e.turn.role}>
                  {e.turn.role === "assistant" ? <RichText text={e.turn.content} /> : <p className="whitespace-pre-wrap">{e.turn.content}</p>}
                </Bubble>
              );
            }
            if (e.kind === "notice")
              return (
                <div key={i} className="rounded-[var(--radius-md)] bg-saffron-soft px-4 py-3 text-sm">
                  <p>{e.text}</p>
                  {e.contacts && contacts}
                </div>
              );
            return <ActionCard key={e.proposal.id} entry={e} t={t} onConfirm={() => runAction(e.proposal)} onCancel={() => cancelAction(e.proposal)} />;
          })}

          {busy && (
            <div className="flex items-center gap-2 text-sm text-ink-soft" role="status">
              <span className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="size-1.5 animate-bounce rounded-full bg-olive" style={{ animationDelay: `${d * 120}ms` }} />
                ))}
              </span>
              {t.thinking}
            </div>
          )}
        </div>

        {/* Saisie */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-line bg-paper px-3 pt-3 pb-2"
        >
          <div className="flex items-end gap-2">
            <label className="sr-only" htmlFor={`assistant-input-${mode}`}>
              {t.placeholder}
            </label>
            <textarea
              id={`assistant-input-${mode}`}
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={1200}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={t.placeholder}
              className="max-h-32 min-h-11 flex-1 resize-none rounded-[var(--radius-md)] bg-cream px-3.5 py-2.5 text-sm ring-1 ring-line outline-none focus:ring-2 focus:ring-charcoal"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label={t.send}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-charcoal text-cream transition-colors hover:bg-olive-deep disabled:opacity-40"
            >
              <ArrowUp aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-[0.68rem] text-ink-soft">
            <span>{t.disclaimer}</span>
            <Link href={supportHref} className="shrink-0 font-semibold underline underline-offset-2 hover:text-charcoal">
              {t.humanTitle}
            </Link>
          </div>
        </form>
      </div>

      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="assistant-panel"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex size-14 items-center justify-center gap-2 rounded-full font-semibold shadow-[var(--shadow-lift)] transition-colors sm:w-auto sm:pr-5 sm:pl-4",
          open ? "bg-charcoal text-cream" : "bg-saffron text-charcoal hover:bg-coral",
        )}
      >
        {open ? <X aria-hidden="true" className="size-5" /> : <MessageCircle aria-hidden="true" className="size-5" />}
        <span className="sr-only text-sm sm:not-sr-only">{open ? t.close : t.open}</span>
      </button>
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-[1.1rem] px-4 py-2.5 text-sm leading-relaxed",
          role === "user" ? "rounded-br-sm bg-charcoal text-cream" : "rounded-bl-sm bg-paper ring-1 ring-line",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ActionCard({
  entry,
  t,
  onConfirm,
  onCancel,
}: {
  entry: { proposal: ProposedAction; state: ActionState };
  t: Dictionary["assistant"];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { proposal, state } = entry;
  return (
    <div className={cn("rounded-[var(--radius-md)] p-4 text-sm ring-2", state === "done" ? "bg-olive-soft ring-olive" : state === "pending" || state === "running" ? "bg-paper ring-saffron" : "bg-paper ring-line")}>
      <p className="text-[0.68rem] font-bold tracking-[0.08em] text-coral-ink uppercase">{t.pendingAction}</p>
      <p className="mt-1 font-semibold">{proposal.summary}</p>
      {state === "pending" || state === "running" ? (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={state === "running"}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-olive px-4 font-semibold text-cream hover:bg-olive-deep disabled:opacity-60"
          >
            <Check aria-hidden="true" className="size-4" strokeWidth={2.5} /> {state === "running" ? t.confirming : t.confirm}
          </button>
          <button type="button" onClick={onCancel} disabled={state === "running"} className="inline-flex h-9 items-center rounded-full px-4 font-semibold ring-1 ring-line hover:ring-charcoal">
            {t.cancel}
          </button>
        </div>
      ) : (
        <p className={cn("mt-2 font-semibold", state === "done" ? "text-olive-deep" : state === "failed" ? "text-coral-ink" : "text-ink-soft")}>
          {state === "done" ? t.actionDone : state === "failed" ? t.actionFailed : t.actionCancelled}
        </p>
      )}
    </div>
  );
}
