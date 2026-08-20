import { describe, expect, it } from 'vitest';
import {
  getDefaultNavSidebarOpen,
  getDefaultSidePanelOpen,
} from '../editorLayoutDefaults';

describe('getDefaultSidePanelOpen', () => {
  it('keeps the writing surface first on a phone', () => {
    expect(getDefaultSidePanelOpen({
      viewportWidth: 390,
      hasOpenedAnalysisPanel: false,
      analysisPanelOpen: null,
    })).toBe(false);
  });

  it('restores an explicitly opened mobile panel', () => {
    expect(getDefaultSidePanelOpen({
      viewportWidth: 390,
      hasOpenedAnalysisPanel: true,
      analysisPanelOpen: true,
    })).toBe(true);
  });

  it('still opens the panel for first-time desktop visitors', () => {
    expect(getDefaultSidePanelOpen({
      viewportWidth: 1280,
      hasOpenedAnalysisPanel: false,
      analysisPanelOpen: null,
    })).toBe(true);
  });
});

describe('getDefaultNavSidebarOpen', () => {
  it('starts collapsed on a phone so poems do not overlay the text', () => {
    expect(getDefaultNavSidebarOpen(390)).toBe(false);
    expect(getDefaultNavSidebarOpen(1280)).toBe(true);
  });
});
