import { Extension, mergeAttributes } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import CodeBlock from '@tiptap/extension-code-block';
import Italic from '@tiptap/extension-italic';

export const PostEditorEnter = Extension.create({
	name: 'postEditorEnter',
	priority: 10_000,
	addKeyboardShortcuts() {
		return {
			Enter: ({ editor }) => {
				if (editor.isActive('codeBlock')) {
					return false;
				}
				editor.chain().focus().setHardBreak().run();
				return true;
			}
		};
	}
});

export const PostEditorBold = Bold.extend({
	renderHTML({ HTMLAttributes }) {
		return ['b', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
	}
});

export const PostEditorItalic = Italic.extend({
	renderHTML({ HTMLAttributes }) {
		return ['i', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
	}
});

export const PostEditorCodeBlock = CodeBlock.extend({
	addCommands() {
		return {
			...this.parent?.(),
			toggleCodeBlock:
				(attributes) =>
				({ editor, state, chain, commands }) => {
					if (editor.isActive(this.name)) {
						return commands.toggleNode(this.name, 'paragraph', attributes);
					}

					const { empty, from, to } = state.selection;
					if (empty) {
						return commands.toggleNode(this.name, 'paragraph', attributes);
					}

					const text = state.doc.textBetween(from, to, '\n');
					const safeAttrs =
						attributes && typeof attributes === 'object' && !Array.isArray(attributes) ? attributes : {};

					return chain()
						.deleteRange({ from, to })
						.insertContent({
							type: this.name,
							attrs: safeAttrs,
							content: text.length ? [{ type: 'text', text }] : []
						})
						.run();
				}
		};
	}
});
