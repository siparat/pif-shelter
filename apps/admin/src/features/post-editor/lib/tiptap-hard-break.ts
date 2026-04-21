import { mergeAttributes, Node, type CommandProps } from '@tiptap/core';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		hardBreak: {
			setHardBreak: () => ReturnType;
		};
	}
}

export const PostEditorHardBreak = Node.create({
	name: 'hardBreak',
	addOptions() {
		return {
			keepMarks: true,
			HTMLAttributes: {}
		};
	},
	inline: true,
	group: 'inline',
	selectable: false,
	linebreakReplacement: false,
	parseHTML() {
		return [{ tag: 'br' }];
	},
	renderHTML({ HTMLAttributes }) {
		return ['br', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
	},
	renderText() {
		return '\n';
	},
	addCommands() {
		return {
			setHardBreak: () => (props: CommandProps) => {
				const { chain, state, editor } = props;
				const { selection, storedMarks } = state;
				if (selection.$from.parent.type.spec.isolating) {
					return false;
				}
				const { keepMarks } = this.options;
				const { splittableMarks } = editor.extensionManager;
				const marks = storedMarks || (selection.$to.parentOffset ? selection.$from.marks() : null);
				return chain()
					.insertContent({ type: this.name })
					.command(({ tr, dispatch }) => {
						if (dispatch && keepMarks && marks?.length) {
							const filteredMarks = marks.filter((mark) => splittableMarks.includes(mark.type.name));
							tr.ensureMarks(filteredMarks);
						}
						return true;
					})
					.run();
			}
		};
	},
	addKeyboardShortcuts() {
		return {
			'Mod-Enter': () => this.editor.commands.setHardBreak(),
			'Shift-Enter': () => this.editor.commands.setHardBreak()
		};
	}
});
