export const ALLOWED_POST_REACTION_EMOJIS = ['🤪', '😍', '😂', '😱', '😭', '😎'] as const;

export type AllowedPostReactionEmoji = (typeof ALLOWED_POST_REACTION_EMOJIS)[number];
