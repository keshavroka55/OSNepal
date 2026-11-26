export type Category = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  startups?: { id: string; name: string; slug?: string; logo?: string }[];
};
