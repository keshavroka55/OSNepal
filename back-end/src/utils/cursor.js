// Cursor = the sort value and id of the last row seen, base64 encoded.
// Pairing with id keeps ordering stable when many rows share the same value.
export const encodeCursor = (value, id) =>
  Buffer.from(JSON.stringify({ v: value, id })).toString("base64url");

export function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString());
    return typeof parsed.id === "string" ? parsed : null;
  } catch {
    return null;
  }
}
