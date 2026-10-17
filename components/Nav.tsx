"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { ANNOUNCEMENT, NAV_LINKS } from "@/lib/site";
import { Arrow } from "./ArrowLink";
import { Container } from "./Container";
import { Wordmark } from "./Wordmark";

const ease = [0.22, 1, 0.36, 1] as const;

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const [hovered, setHovered] = useState<string | null>(null);
  const menuId = useId();

  // Close the mobile menu after navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const active = NAV_LINKS.find(
    (l) => pathname === l.href || pathname.startsWith(`${l.href}/`),
  )?.href;
  // The pill sits behind the hovered link, or the current page at rest.
  const marked = hovered ?? active ?? null;

  return (
    <>
      <a
        href="#main"
        className="meta sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <div className="bg-ink text-paper">
        <Container className="flex h-10 items-center">
          <Link
            href={ANNOUNCEMENT.href}
            className="group meta flex min-w-0 items-center gap-3 text-paper/70 transition-colors hover:text-paper"
          >
            <span className="shrink-0 text-paper">{ANNOUNCEMENT.label}</span>
            <span aria-hidden="true" className="h-3 w-px shrink-0 bg-paper/25" />
            <span className="truncate normal-case tracking-normal font-sans text-[0.8125rem]">
              {ANNOUNCEMENT.text}
            </span>
            <Arrow className="shrink-0" />
          </Link>
        </Container>
      </div>

      <header className="sticky top-0 z-40 border-b border-rule bg-paper">
        <Container className="flex h-16 items-center justify-between">
          <Wordmark />

          <nav aria-label="Primary" className="hidden md:block">
            <LayoutGroup id="nav">
              <ul className="-mr-3 flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
                {NAV_LINKS.map((link) => (
                  <li
                    key={link.href}
                    className="group/dd relative"
                    onMouseEnter={() => setHovered(link.href)}
                  >
                    <Link
                      href={link.href}
                      aria-current={active === link.href ? "page" : undefined}
                      onFocus={() => setHovered(link.href)}
                      onBlur={() => setHovered(null)}
                      className={`meta relative isolate flex items-center gap-1.5 px-3.5 py-2 transition-colors duration-200 hover:text-ink ${
                        active === link.href ? "text-ink" : "text-muted"
                      }`}
                    >
                      {link.label}
                      {"children" in link ? (
                        <span
                          aria-hidden="true"
                          className="inline-block text-[0.6rem] transition-transform duration-300 ease-out-soft group-hover/dd:rotate-180"
                        >
                          ▾
                        </span>
                      ) : null}
                      {marked === link.href ? (
                        <motion.span
                          layoutId="nav-pill"
                          aria-hidden="true"
                          className={`absolute inset-0 -z-10 rounded-full border transition-colors duration-200 ${
                            marked === active
                              ? "border-accent-strong/40 bg-accent"
                              : "border-ink/15 bg-paper-hover"
                          }`}
                          transition={{ duration: 0.4, ease }}
                        />
                      ) : null}
                    </Link>

                    {"children" in link ? (
                      <div className="invisible absolute top-full right-0 z-50 translate-y-1 pt-2 opacity-0 transition-all duration-300 ease-out-soft group-focus-within/dd:visible group-focus-within/dd:translate-y-0 group-focus-within/dd:opacity-100 group-hover/dd:visible group-hover/dd:translate-y-0 group-hover/dd:opacity-100">
                        <ul className="w-72 overflow-hidden rounded-[6px] border border-rule bg-paper py-1">
                          {link.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="row-glide group flex items-center justify-between gap-4 px-4 py-3"
                              >
                                <span className="flex flex-col gap-0.5">
                                  <span className="text-[0.9375rem] tracking-[-0.01em]">
                                    {child.label}
                                  </span>
                                  <span className="meta text-[0.6875rem] text-muted">{child.meta}</span>
                                </span>
                                <Arrow className="text-muted" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </LayoutGroup>
          </nav>

          <button
            type="button"
            className="meta -mr-2 px-2 py-2 md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </Container>

        <nav
          id={menuId}
          aria-label="Menu"
          hidden={!open}
          className="border-t border-rule md:hidden"
        >
          <Container as="ul" className="flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-rule last:border-0">
                <Link
                  href={link.href}
                  aria-current={active === link.href ? "page" : undefined}
                  className="group flex items-center justify-between py-4 text-2xl tracking-[-0.02em]"
                >
                  {link.label}
                  <Arrow className="text-muted" />
                </Link>
              </li>
            ))}
          </Container>
        </nav>
      </header>
    </>
  );
}
