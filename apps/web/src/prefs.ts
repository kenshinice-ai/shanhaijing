/**
 * Reader preferences the atlas honours.
 *
 * Motion is handled entirely in CSS. Data is not: the artistic master is an
 * 82 KB SVG, by far the heaviest single asset, and the workspace already
 * knows how to draw a structured substitute without it — that fallback exists
 * for the case where the master has not been generated, and it serves the
 * reader on a metered connection just as well.
 */
export function prefersReducedData(): boolean {
  if (typeof matchMedia !== "function") return false;
  try {
    return matchMedia("(prefers-reduced-data: reduce)").matches;
  } catch {
    // Browsers that do not know the query must not be treated as opting in.
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof matchMedia !== "function") return false;
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
