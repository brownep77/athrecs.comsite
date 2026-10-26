export type BiographyPresentation = {
  title: string;
  description: string;
  headings: string[];
  links?: { label: string; url: string }[];
  questions?: { question: string; answer: string }[];
  alternateName?: string[];
  sameAs?: string[];
  podcast?: { name: string; url: string; datePublished: string };
};

export function biographyParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
