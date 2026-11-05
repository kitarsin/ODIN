// Tiny pixel symbols used like punctuation on the public pages (see
// Web_Design_Kit/11 Inspiration/1minus1-design-language.md, section 6).
// Each glyph is a list of [x, y, width, height] cells on a small grid.
const GLYPHS = {
  steps: { w: 8, h: 6, cells: [[0, 4, 2, 2], [3, 2, 2, 2], [6, 0, 2, 2]] },
  cross: { w: 5, h: 5, cells: [[0, 0, 1, 1], [4, 0, 1, 1], [1, 1, 1, 1], [3, 1, 1, 1], [2, 2, 1, 1], [1, 3, 1, 1], [3, 3, 1, 1], [0, 4, 1, 1], [4, 4, 1, 1]] },
  chevron: { w: 3, h: 5, cells: [[0, 0, 1, 1], [1, 1, 1, 1], [2, 2, 1, 1], [1, 3, 1, 1], [0, 4, 1, 1]] },
  down: { w: 5, h: 3, cells: [[0, 0, 1, 1], [4, 0, 1, 1], [1, 1, 1, 1], [3, 1, 1, 1], [2, 2, 1, 1]] },
  play: { w: 4, h: 7, cells: [[0, 0, 1, 7], [1, 1, 1, 5], [2, 2, 1, 3], [3, 3, 1, 1]] },
} as const;

export type PixelGlyphName = keyof typeof GLYPHS;

/** A decorative pixel symbol drawn in the current text colour. `scale` is screen px per cell. */
export function PixelGlyph({ name, scale = 2, className = '' }: { name: PixelGlyphName; scale?: number; className?: string }) {
  const glyph = GLYPHS[name];
  return (
    <svg
      className={`pixel-glyph ${className}`}
      width={glyph.w * scale}
      height={glyph.h * scale}
      viewBox={`0 0 ${glyph.w} ${glyph.h}`}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {glyph.cells.map(([x, y, w, h]) => <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} />)}
    </svg>
  );
}

/** A label that rolls up to a copy of itself on hover. The copy is hidden from screen readers. */
export function RollLabel({ children }: { children: string }) {
  return (
    <span className="roll">
      <span className="roll-a">{children}</span>
      <span className="roll-b" aria-hidden="true">{children}</span>
    </span>
  );
}
