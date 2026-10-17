import { Kicker } from "./Kicker";
import { Reveal } from "./Reveal";

type SectionHeaderProps = {
  label: string;
  title: React.ReactNode;
  id?: string;
  /** Section number for the kicker, e.g. 1 → [ 01 // LABEL ]. */
  index?: number;
  /** Optional short note under the title. */
  aside?: React.ReactNode;
  as?: "h1" | "h2";
  className?: string;
};

/**
 * Asymmetric section header: the kicker sits in a 3-column left rail and the
 * title and note take the remaining 9, the same split the index rows use.
 * Inherits text color, so it works on the light canvas and the dark bands.
 */
export function SectionHeader({
  label,
  title,
  id,
  index,
  aside,
  as: Heading = "h2",
  className = "",
}: SectionHeaderProps) {
  return (
    <Reveal>
      <header className={`grid gap-6 lg:grid-cols-12 lg:gap-x-6 ${className}`}>
        <div className="lg:col-span-3 lg:pt-[0.6em]">
          <Kicker index={index}>{label}</Kicker>
        </div>
        <div className="flex flex-col gap-6 lg:col-span-9">
          <Heading
            id={id}
            className="max-w-[18ch] text-h2 font-medium text-balance"
          >
            {title}
          </Heading>
          {aside ? (
            <div className="max-w-measure text-base text-inherit opacity-70">{aside}</div>
          ) : null}
        </div>
      </header>
    </Reveal>
  );
}
