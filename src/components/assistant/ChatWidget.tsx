"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Check, LifeBuoy, MessageCircle, Phone, RotateCcw, Sparkles, X } from "lucide-react";
import { site } from "@/data/site";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { RichText } from "./RichText";
import { answerText, humanMessage, resetGuideCache, runStep, startChips, type GuideContext, type GuideResult } from "./guide";
import type { ActionState, Chip, Entry, PortalGuideData, ProposedAction, SiteGuideData } from "./guide-types";

/**
 * Assistant Bon Traiteur — guidé, sans IA (aucun coût à l'usage).
 *  - site   : sujets, questions fréquentes, recherche par mots, plats et allergènes déclarés ;
 *  - portal : parcours en quelques clics (livraison, menu, changer un plat, suspendre,
 *             annuler, factures, équipe). Chaque changement passe par « Confirmer ».
 */
export function ChatWidget({
  mode,
  locale,
  t,
  siteData,
  portalData,
  establishmentId,
}: {
  mode: "site" | "portal";
  locale: Locale;
  t: Dictionary["assistant"];
  siteData: SiteGuideData;
  portalData?: PortalGuideData;
  establishmentId?: string;
}) {
  const router = useRouter();
  const storageKey = `bt-guide-${mode}-${establishmentId ?? "public"}`;
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [awaitHuman, setAwaitHuman] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const loaded = useRef(false);

  const fetchData = useCallback(
    async <R,>(kind: string, params?: Record<string, unknown>): Promise<R> => {
      const res = await fetch("/api/assistant/portal/data", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, establishmentId, kind, params }),
      });
      const json = (await res.json()) as { data?: R; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? String(res.status));
      return json.data as R;
    },
    [locale, establishmentId],
  );
  const ctx: GuideContext = { mode, locale, t, site: siteData, portal: portalData, fetchData, cacheKey: storageKey };
  const supportHref = mode === "portal" ? portalData!.links.support : siteData.links.contact;

  // Conversation conservée pendant la visite (onglet)
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null") as { entries: Entry[]; awaitHuman: string | null } | null;
      if (saved) {
        setEntries(saved.entries.map((e) => (e.kind === "action" && e.state === "running" ? { ...e, state: "pending" } : e)));
        setAwaitHuman(saved.awaitHuman);
      }
    } catch {}
    loaded.current = true;
  }, [storageKey]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ entries: entries.slice(-50), awaitHuman }));
    } catch {}
  }, [entries, awaitHuman, storageKey]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, busy, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    if (awaitHuman && open) inputRef.current?.focus();
  }, [awaitHuman, open]);

  const apply = async (userText: string | null, work: () => Promise<GuideResult>) => {
    if (busy) return;
    if (userText) setEntries((cur) => [...cur, { kind: "user", text: userText }]);
    setBusy(true);
    try {
      const res = await work();
      setEntries((cur) => [...cur, ...res.entries]);
      if (res.awaitHuman !== undefined) setAwaitHuman(res.awaitHuman);
    } catch {
      setEntries((cur) => [...cur, { kind: "bot", text: t.dataError, contacts: true, chips: startChips(ctx) }]);
    } finally {
      setBusy(false);
    }
  };

  const choose = (chip: Chip) => {
    setAwaitHuman(null);
    void apply(chip.label, () => runStep(ctx, chip.step));
  };

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    if (awaitHuman) {
      const subject = awaitHuman;
      setAwaitHuman(null);
      void apply(text, async () => ({ entries: [humanMessage(ctx, subject, text)] }));
      return;
    }
    void apply(text, () => answerText(ctx, text));
  };

  const setActionState = (id: string, state: ActionState) =>
    setEntries((cur) => cur.map((e) => (e.kind === "action" && e.proposal.id === id ? { ...e, state } : e)));

  /** Exécutée côté serveur avec les droits de la personne, seulement après son clic. */
  const confirmAction = async (proposal: ProposedAction) => {
    setActionState(proposal.id, "running");
    let ok = false;
    try {
      const res = await fetch("/api/assistant/portal/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, establishmentId, action: proposal.action }),
      });
      ok = ((await res.json()) as { ok: boolean }).ok;
    } catch {}
    setActionState(proposal.id, ok ? "done" : "failed");
    resetGuideCache();
    if (ok) router.refresh(); // la page derrière se met à jour
    setEntries((cur) => [
      ...cur,
      ok
        ? { kind: "bot", text: t.afterDone, chips: startChips(ctx) }
        : { kind: "bot", text: t.afterFailed, contacts: true, chips: [{ label: t.portalActions.human, step: { s: "p:human" } }, { label: t.backToStart, step: { s: "start" } }] },
    ]);
  };

  const cancelAction = (proposal: ProposedAction) => {
    setActionState(proposal.id, "cancelled");
    setEntries((cur) => [...cur, { kind: "bot", text: t.afterCancelled, chips: startChips(ctx) }]);
  };

  const restart = () => {
    setEntries([]);
    setAwaitHuman(null);
  };

  const lastBot = entries.reduce((idx, e, i) => (e.kind === "bot" ? i : idx), -1);
  const contacts = (
    <div className="mt-2 flex flex-wrap gap-2">
      {site.contact.phones.map((p) => (
        <a key={p.href} href={p.href} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold ring-1 ring-line hover:ring-charcoal">
          <Phone aria-hidden="true" className="size-3.5" /> {p.display}
        </a>
      ))}
    </div>
  );
  const chipRow = (chips: Chip[]) => (
    <div className="flex flex-wrap gap-2 pt-1">
      {chips.map((c, i) => (
        <button
          key={`${c.label}-${i}`}
          type="button"
          disabled={busy}
          onClick={() => choose(c)}
          className="rounded-full bg-paper px-3 py-1.5 text-left text-sm font-semibold ring-1 ring-line transition-colors hover:bg-saffron-soft hover:ring-saffron disabled:opacity-50"
        >
          {c.label}
        </button>
      ))}
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
        <div className="flex items-start gap-3 bg-olive px-5 py-4 text-cream">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-saffron text-charcoal">
            <Sparkles aria-hidden="true" className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg leading-tight font-bold">{mode === "portal" ? t.portalTitle : t.siteTitle}</p>
            <p className="mt-0.5 text-xs text-cream/80">{mode === "portal" ? t.portalSubtitle : t.siteSubtitle}</p>
          </div>
          {entries.length > 0 && (
            <button type="button" onClick={restart} title={t.restart} aria-label={t.restart} className="grid size-8 shrink-0 place-items-center rounded-full text-cream/80 hover:bg-cream/10 hover:text-cream">
              <RotateCcw aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
          <Bubble role="bot">
            <RichText text={mode === "portal" ? t.portalGreeting : t.siteGreeting} />
          </Bubble>
          {entries.length === 0 && chipRow(startChips(ctx))}

          {entries.map((e, i) => {
            if (e.kind === "user")
              return (
                <Bubble key={i} role="user">
                  <p className="whitespace-pre-wrap">{e.text}</p>
                </Bubble>
              );
            if (e.kind === "action")
              return <ActionCard key={e.proposal.id} entry={e} t={t} onConfirm={() => confirmAction(e.proposal)} onCancel={() => cancelAction(e.proposal)} />;
            return (
              <div key={i} className="space-y-2">
                <Bubble role="bot">
                  <RichText text={e.text} />
                  {e.contacts && contacts}
                  {e.links && e.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {e.links.map((l) => (
                        <Link key={l.href} href={l.href} className="inline-flex items-center gap-1.5 rounded-full bg-charcoal px-3 py-1.5 text-xs font-semibold text-cream hover:bg-olive-deep">
                          {l.label} <ArrowRight aria-hidden="true" className="size-3.5" />
                        </Link>
                      ))}
                    </div>
                  )}
                </Bubble>
                {i === lastBot && e.chips && e.chips.length > 0 && chipRow(e.chips)}
              </div>
            );
          })}

          {busy && (
            <div className="flex items-center gap-2 text-sm text-ink-soft" role="status">
              <span className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="size-1.5 animate-bounce rounded-full bg-olive" style={{ animationDelay: `${d * 120}ms` }} />
                ))}
              </span>
              {t.loading}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
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
              rows={awaitHuman ? 3 : 1}
              value={input}
              maxLength={awaitHuman ? 3000 : 300}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !awaitHuman) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={awaitHuman ? t.humanAsk : t.placeholder}
              className={cn(
                "max-h-32 min-h-11 flex-1 resize-none rounded-[var(--radius-md)] bg-cream px-3.5 py-2.5 text-sm ring-1 outline-none focus:ring-2 focus:ring-charcoal",
                awaitHuman ? "ring-saffron" : "ring-line",
              )}
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
            <Link href={supportHref} className="inline-flex shrink-0 items-center gap-1 font-semibold underline underline-offset-2 hover:text-charcoal">
              <LifeBuoy aria-hidden="true" className="size-3" /> {t.humanTitle}
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

function Bubble({ role, children }: { role: "user" | "bot"; children: React.ReactNode }) {
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
  const active = state === "pending" || state === "running";
  return (
    <div className={cn("rounded-[var(--radius-md)] p-4 text-sm ring-2", state === "done" ? "bg-olive-soft ring-olive" : active ? "bg-paper ring-saffron" : "bg-paper ring-line")}>
      <p className="text-[0.68rem] font-bold tracking-[0.08em] text-coral-ink uppercase">{t.pendingAction}</p>
      <p className="mt-1 font-semibold whitespace-pre-wrap">{proposal.summary}</p>
      {proposal.action.type === "contact_team" && <p className="mt-2 line-clamp-4 text-ink-soft whitespace-pre-wrap">{proposal.action.message}</p>}
      {active ? (
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
