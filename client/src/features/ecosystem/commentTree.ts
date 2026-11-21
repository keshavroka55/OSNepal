import type { PostComment } from './types';

// Pure helpers for updating the nested comment tree without mutating state.

export function mapTree(nodes: PostComment[], id: string, change: (c: PostComment) => PostComment): PostComment[] {
  return nodes.map((node) =>
    node.id === id ? change(node) : { ...node, replies: mapTree(node.replies, id, change) },
  );
}

export function addReply(nodes: PostComment[], parentId: string, reply: PostComment): PostComment[] {
  return mapTree(nodes, parentId, (parent) => ({
    ...parent,
    replyCount: parent.replyCount + 1,
    replies: [...parent.replies, reply],
  }));
}

// Replaces a node's children with a fresh, complete set (after "load more").
export function setReplies(nodes: PostComment[], parentId: string, replies: PostComment[]): PostComment[] {
  return mapTree(nodes, parentId, (parent) => ({ ...parent, replies }));
}

export function markDeleted(nodes: PostComment[], id: string): PostComment[] {
  return mapTree(nodes, id, (c) => ({ ...c, deleted: true, body: '', author: null }));
}
