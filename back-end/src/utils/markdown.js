// Markdown is stored as written and sanitised on the way out. The client also
// renders without raw HTML, so this is a second layer: it strips any HTML tag
// and neutralises script-capable link targets.
const HTML_TAG = /<\/?[a-z][^>]*>/gi;
// Allows one level of nested parentheses, e.g. javascript:alert(1).
const UNSAFE_LINK = /\]\(\s*(?:javascript|vbscript|data):(?:[^()]|\([^)]*\))*\)/gi;

export function sanitizeMarkdown(text) {
  if (!text) return "";
  return text.replace(HTML_TAG, "").replace(UNSAFE_LINK, "](#)");
}
