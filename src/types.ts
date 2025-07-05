export interface ImageResult {
  url: string;
  alt: string;
  source: string;
  credit?: string;
}

export interface SavedItem {
  id: string;
  input: string;
  result: string;
  mode: string;
  depth: string;
  wikiImage: string;
  images: ImageResult[];
  suggestions: string[];
  timestamp: number;
}

export interface SavedResearchPageProps {
  user: any; // SupabaseUser | null
  onSuggestionClick: (suggestion: string) => void;
}
