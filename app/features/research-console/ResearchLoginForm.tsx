"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { PrimaryButton } from "@/components/ArrowLink";

export function ResearchLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus(
      "Authentication is not connected yet. No credentials were sent and no session was created.",
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
      <form className="grid gap-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="research-email" className="meta mb-3 block text-muted">
            Team email
          </label>
          <input
            id="research-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setStatus(null);
            }}
            placeholder="name@example.com"
            className="w-full border border-rule bg-transparent p-4 outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
          />
        </div>

        <div>
          <label
            htmlFor="research-password"
            className="meta mb-3 block text-muted"
          >
            Password
          </label>
          <input
            id="research-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setStatus(null);
            }}
            className="w-full border border-rule bg-transparent p-4 outline-none transition-colors focus:border-ink"
          />
        </div>

        <div className="flex flex-col items-start gap-5 border-t border-rule pt-6 sm:flex-row sm:items-center">
          <PrimaryButton type="submit" disabled={!email || !password}>
            Sign in
          </PrimaryButton>

          <p className="text-sm text-muted" aria-live="polite" role="status">
            {status ?? "Authentication provider not connected."}
          </p>
        </div>
      </form>

      <aside className="border-l-2 border-accent-strong pl-5">
        <p className="meta text-muted">Prototype access</p>
        <p className="mt-3 text-sm leading-6 text-muted">
          The dashboard preview is intentionally public during frontend
          development. Do not enter a real password.
        </p>
        <Link
          href="/research/dashboard"
          className="group mt-6 inline-flex items-center gap-2 border-b border-ink/25 pb-0.5 text-sm hover:border-ink"
        >
          Preview dashboard
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </aside>
    </div>
  );
}
