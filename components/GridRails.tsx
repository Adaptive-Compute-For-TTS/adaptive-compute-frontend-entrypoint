/**
 * Two vertical hairlines that run the length of <main>, between the page
 * edge and the content column. Purely structural: no pointer events, and
 * hidden on phones where the gutter is too narrow to carry them.
 */
export function GridRails() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 hidden md:block">
      <div className="rail-box h-full">
        <div className="h-full border-x border-grid" />
      </div>
    </div>
  );
}
