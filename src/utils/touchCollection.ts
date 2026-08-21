import { supabase } from '../lib/supabase';

export async function touchCollectionUpdatedAt(collectionId: string | undefined | null): Promise<void> {
  if (!collectionId || !supabase) return;
  try {
    await supabase
      .from('collections')
      .update({ updated_at: new Date().toISOString() } as any)
      .eq('id', collectionId);
  } catch (err) {
    console.error('Failed to update collection timestamp:', err);
  }
}
