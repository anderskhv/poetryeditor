// Database types for Supabase tables

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  collection_id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Poem {
  id: string;
  collection_id: string;
  section_id: string | null;
  title: string;
  content: string;
  filename: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionInsert {
  user_id: string;
  name: string;
}

export interface SectionInsert {
  collection_id: string;
  name: string;
  parent_id?: string | null;
  sort_order?: number;
}

export interface PoemInsert {
  collection_id: string;
  section_id?: string | null;
  title: string;
  content: string;
  filename?: string | null;
  sort_order?: number;
}
