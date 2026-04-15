const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "both",
  "each", "few", "more", "most", "other", "some", "such", "no", "nor",
  "not", "only", "own", "same", "so", "than", "too", "very", "just",
  "and", "but", "or", "if", "while", "about", "up", "this", "that",
  "these", "those", "it", "its", "i", "me", "my", "we", "our", "you",
  "your", "he", "him", "his", "she", "her", "they", "them", "their",
]);

export function preprocessText(text: string): string {
  let processed = text.toLowerCase();
  processed = processed.replace(/[^\w\s.+#@₹$€,;:/\-()]/g, ' ');
  processed = processed.replace(/\s+/g, ' ').trim();
  return processed;
}

export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(t => t.length > 0);
}

export function removeStopwords(tokens: string[]): string[] {
  return tokens.filter(t => !STOPWORDS.has(t));
}

export function normalizeText(text: string): string {
  const processed = preprocessText(text);
  const tokens = tokenize(processed);
  return tokens.join(' ');
}
