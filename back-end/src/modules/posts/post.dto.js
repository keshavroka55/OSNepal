import { sanitizeMarkdown } from "../../utils/markdown.js";

// Prisma include shared by every read, so list and detail stay consistent
// and each request is a single query (no N+1).
export const postInclude = (userId) => ({
  author: { select: { id: true, name: true, username: true, avatar: true, verified: true } },
  space: { select: { id: true, slug: true, name: true, icon: true } },
  startup: { select: { id: true, name: true, slug: true, logo: true, tagline: true } },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
  ...(userId && {
    votes: { where: { userId }, select: { value: true } },
    saves: { where: { userId }, select: { id: true } },
  }),
});

// Shapes a DB row for the API: sanitised markdown, flat tags, viewer state.
export function toPostDto(post) {
  const { votes, saves, tags, body, ...rest } = post;
  return {
    ...rest,
    body: sanitizeMarkdown(body),
    tags: tags.map((t) => t.tag),
    viewerVote: votes?.[0]?.value ?? 0,
    viewerSaved: Boolean(saves?.length),
  };
}
