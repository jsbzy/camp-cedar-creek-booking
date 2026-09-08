"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  from: "guest" | "host";
  body: string;
  createdAt: string;
}

/**
 * The guest's side of the conversation, on the page they already have a link
 * to. No account, no password: the magic-link token in the URL is the key, the
 * same one that lets them cancel.
 */
export function BookingThread({ token }: { token: string }) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/bookings/messages?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => alive && setMessages(d.messages ?? []))
      .catch(() => alive && setMessages([]));
    return () => {
      alive = false;
    };
  }, [token]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/messages?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "That did not send.");
      setMessages((m) => [...(m ?? []), d.message]);
      setDraft("");
      box.current?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not send.");
    } finally {
      setSending(false);
    }
  }

  const when = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? ""
      : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  return (
    <section aria-labelledby="thread-heading" className="mt-10">
      <h2 id="thread-heading" className="font-heading text-xl font-semibold">
        Questions about your stay
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Write to Lauren and Jeremy here. They are emailed when you do, and you will
        get an email when they answer.
      </p>

      <div className="mt-5 space-y-3">
        {messages === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing here yet. Ask away: check-in, the road down, bringing a dog, anything.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={
                m.from === "guest"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-primary-foreground"
                  : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3"
              }
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
              <p
                className={
                  m.from === "guest"
                    ? "mt-1 text-right text-[11px] text-primary-foreground/60"
                    : "mt-1 text-[11px] text-muted-foreground"
                }
              >
                {m.from === "guest" ? "You" : "Camp Cedar Creek"} · {when(m.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="mt-5">
        <label htmlFor="thread-input" className="sr-only">
          Your message
        </label>
        <textarea
          id="thread-input"
          ref={box}
          rows={3}
          value={draft}
          maxLength={4000}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a question about your stay…"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        <button
          type="button"
          onClick={send}
          disabled={sending || !draft.trim()}
          className="mt-2 rounded-md bg-primary px-5 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </section>
  );
}
