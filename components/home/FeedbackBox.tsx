"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { CONTACT_EMAIL } from "@/lib/site";
import { PrimaryButton } from "../ArrowLink";
import { Container } from "../Container";
import { Kicker } from "../Kicker";
import { MetaLabel } from "../MetaLabel";
import { Reveal } from "../Reveal";
import { Section } from "../Section";

const TYPES = ["Suggestion", "Feedback", "Bug", "Question"] as const;
type FeedbackType = (typeof TYPES)[number];

const MAX = 1000;
const MIN = 10;
const ease = [0.22, 1, 0.36, 1] as const;

/** Input styling; the border colour is passed separately so error states don't clash. */
const field = (invalid: boolean) =>
  `w-full border bg-transparent px-4 py-3 text-[0.9375rem] transition-colors duration-200 placeholder:text-muted/70 focus:border-ink focus:outline-none ${
    invalid ? "border-ink" : "border-rule hover:border-muted"
  }`;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = { message?: string; email?: string };

/**
 * Suggestion box. There is no backend yet: sending opens the visitor's mail
 * app with the message addressed to the lab, then shows a thank-you state.
 */
export function FeedbackBox({ index }: { index?: number }) {
  const [type, setType] = useState<FeedbackType>("Suggestion");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const id = useId();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Errors = {};
    if (message.trim().length < MIN) {
      next.message = `Write at least ${MIN} characters so we know what you mean.`;
    }
    if (email.trim() && !EMAIL.test(email.trim())) {
      next.email = "That email doesn’t look right. Leave it empty if you don’t need a reply.";
    }
    setErrors(next);
    if (next.message || next.email) return;
    const signature = [name.trim(), email.trim() && `<${email.trim()}>`].filter(Boolean).join(" ");
    const body = `${message.trim()}${signature ? `\n\n— ${signature}` : ""}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `[${type}] Adaptive TTS site`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const reset = () => {
    setMessage("");
    setName("");
    setEmail("");
    setType("Suggestion");
    setErrors({});
    setSent(false);
  };

  return (
    <Section id="feedback" aria-labelledby="feedback-title">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-6">
        <Reveal className="lg:col-span-5">
          <Kicker index={index}>Suggestion box</Kicker>
          <h2
            id="feedback-title"
            className="mt-6 max-w-[22ch] text-lede font-medium text-balance"
          >
            Tell us what to build, fix or measure next.
          </h2>
          <p className="mt-6 max-w-[42ch] text-muted">
            Ideas, bugs, a number that looks wrong, a sample you want to hear.
            Every message is read by the team.
          </p>
          <MetaLabel className="mt-10 block">
            Or write to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="normal-case tracking-normal text-ink underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
            >
              {CONTACT_EMAIL}
            </a>
          </MetaLabel>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div
                key="sent"
                role="status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease }}
                className="flex flex-col items-start gap-6 border-t border-ink pt-8"
              >
                <MetaLabel tone="ink">{type} · ready to send</MetaLabel>
                <p className="max-w-[40ch] text-lede font-medium">Thank you.</p>
                <p className="max-w-measure text-muted">
                  Your mail app should have opened with the message filled in. Press
                  send there and it reaches the team. If nothing opened, write to{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-ink underline decoration-current/30 underline-offset-4 hover:decoration-current"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="group inline-flex cursor-pointer items-baseline gap-2 border-b border-current/25 pb-0.5 transition-colors duration-200 hover:border-current"
                >
                  Send another
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-300 ease-out-soft group-hover:translate-x-1"
                  >
                    →
                  </span>
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                noValidate
                onSubmit={onSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease }}
                className="flex flex-col gap-6 border-t border-ink pt-8"
              >
                <fieldset>
                  <legend className="meta mb-3 text-muted">Type</legend>
                  <div className="grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4">
                    {TYPES.map((t) => {
                      const on = t === type;
                      return (
                        <label
                          key={t}
                          className={`meta cursor-pointer px-4 py-3 text-center transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-4 has-[:focus-visible]:outline-ink ${
                            on ? "bg-ink text-paper" : "bg-paper text-muted hover:bg-paper-hover hover:text-ink"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`${id}-type`}
                            value={t}
                            checked={on}
                            onChange={() => setType(t)}
                            className="sr-only"
                          />
                          {t}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="flex flex-col gap-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <label htmlFor={`${id}-message`} className="meta text-muted">
                      Message
                    </label>
                    <span className="meta text-[0.6875rem] text-muted tabular-nums" aria-hidden="true">
                      {message.length} / {MAX}
                    </span>
                  </div>
                  <textarea
                    id={`${id}-message`}
                    required
                    rows={6}
                    maxLength={MAX}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                    }}
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={errors.message ? `${id}-message-error` : undefined}
                    placeholder="What should we try, fix or explain?"
                    className={`${field(!!errors.message)} min-h-40 resize-y leading-relaxed`}
                  />
                  {errors.message ? (
                    <p id={`${id}-message-error`} role="alert" className="text-[0.875rem] text-ink">
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    <label htmlFor={`${id}-name`} className="meta text-muted">
                      Name <span className="opacity-60">· optional</span>
                    </label>
                    <input
                      id={`${id}-name`}
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={field(false)}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label htmlFor={`${id}-email`} className="meta text-muted">
                      Email <span className="opacity-60">· optional, for a reply</span>
                    </label>
                    <input
                      id={`${id}-email`}
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? `${id}-email-error` : undefined}
                      className={field(!!errors.email)}
                    />
                    {errors.email ? (
                      <p id={`${id}-email-error`} role="alert" className="text-[0.875rem] text-ink">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <MetaLabel className="text-[0.6875rem]">Opens your mail app to send</MetaLabel>
                  <PrimaryButton type="submit">Send {type.toLowerCase()}</PrimaryButton>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </Section>
  );
}
