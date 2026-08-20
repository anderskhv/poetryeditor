const NARROW_VIEWPORT_PX = 900;

export function isNarrowViewport(width: number): boolean {
  return width <= NARROW_VIEWPORT_PX;
}

/**
 * On a phone the writing surface must paint first.
 * The coach/analysis panel is full-screen below 900px, so it stays closed
 * unless the poet previously left it open.
 */
export function getDefaultSidePanelOpen(input: {
  viewportWidth: number;
  hasOpenedAnalysisPanel: boolean;
  analysisPanelOpen: boolean | null;
}): boolean {
  if (isNarrowViewport(input.viewportWidth)) {
    return input.analysisPanelOpen === true;
  }
  if (!input.hasOpenedAnalysisPanel) return true;
  return input.analysisPanelOpen === true;
}

export function getDefaultNavSidebarOpen(viewportWidth: number): boolean {
  return !isNarrowViewport(viewportWidth);
}
