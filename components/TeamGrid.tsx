import Image from "next/image";
import { TEAM } from "@/lib/content";
import { MetaLabel } from "./MetaLabel";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Team members: a 4:5 photo frame, name, role and a short bio. Without a
 * `photo` the frame renders as an empty, labelled placeholder.
 */
export function TeamGrid() {
  return (
    <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
      {TEAM.map((m, i) => (
        <li key={i} className="group flex flex-col gap-5">
          <figure className="relative aspect-[4/5] overflow-hidden border border-rule bg-sunk">
            {m.photo ? (
              <Image
                src={m.photo}
                alt={`${m.name}, ${m.role}`}
                fill
                sizes="(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, 100vw"
                className="object-cover grayscale transition-[filter,scale] duration-700 ease-out-soft group-hover:scale-[1.03] group-hover:grayscale-0"
              />
            ) : (
              <div className="texture-grid absolute inset-0 grid place-items-center transition-colors duration-300 group-hover:bg-paper-hover">
                {/* Registration marks in the corners, like the section rules. */}
                <span aria-hidden="true" className="crosshair absolute top-3 left-3 size-[11px] text-muted" />
                <span aria-hidden="true" className="crosshair absolute top-3 right-3 size-[11px] text-muted" />
                <span aria-hidden="true" className="crosshair absolute bottom-3 left-3 size-[11px] text-muted" />
                <span aria-hidden="true" className="crosshair absolute right-3 bottom-3 size-[11px] text-muted" />
                <span className="meta text-muted">Photo · 4:5</span>
              </div>
            )}
            <figcaption className="meta absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.6875rem] text-muted">
              <span className="sr-only">Photo of {m.role}</span>
              <span aria-hidden="true">T.{pad(i + 1)}</span>
            </figcaption>
          </figure>

          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-medium tracking-[-0.02em]">{m.name}</h3>
            <p className="text-[0.9375rem]">{m.role}</p>
            <MetaLabel className="text-[0.6875rem]">{m.focus}</MetaLabel>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{m.bio}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
