export type Item = {
  source: "app_store" | "google_play";
  id: string;
  title?: string;
  body?: string;
  rating?: number | null;
  author?: string;
  created_at: string;
  url: string;
  version?: string;
  features?: string[];
};
