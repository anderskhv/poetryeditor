export const NEW_POEM_CONFIRM_MESSAGE =
  'Start a new poem?\n\nOK starts a blank poem. Cancel keeps this draft.';

export function hasDraftToProtect(draftText: string, draftTitle: string): boolean {
  return draftText.trim() !== '' || draftTitle.trim() !== '';
}

export type NewPoemPath = 'abort' | 'create-cloud' | 'blank-local-after-leave' | 'blank-local';

export interface NewPoemPlanInput {
  confirmed: boolean;
  hasDraft: boolean;
  cloudPoemId: string | null;
  cloudCollectionId: string | null;
  isAuthenticated: boolean;
}

/**
 * File → New planning:
 * - Cancel always aborts (never means discard).
 * - A cloud poem is never blanked in place (that would autosave empty content).
 * - Signed-in + collection: save current, then create a new empty cloud poem.
 * - Otherwise: leave the current cloud URL first, then blank the local editor.
 */
export function planNewPoem(input: NewPoemPlanInput): NewPoemPath {
  if (input.hasDraft && !input.confirmed) return 'abort';

  if (input.cloudPoemId && input.isAuthenticated && input.cloudCollectionId) {
    return 'create-cloud';
  }

  if (input.cloudPoemId) {
    return 'blank-local-after-leave';
  }

  return 'blank-local';
}
