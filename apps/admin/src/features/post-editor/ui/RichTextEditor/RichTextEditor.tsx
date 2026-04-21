import Code from '@tiptap/extension-code';
import Document from '@tiptap/extension-document';
import History from '@tiptap/extension-history';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Strike from '@tiptap/extension-strike';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import {
	Bold as BoldIcon,
	Code as CodeIcon,
	Italic as ItalicIcon,
	Strikethrough,
	Underline as UnderlineIcon
} from 'lucide-react';
import { JSX, memo, useCallback, useEffect, useRef } from 'react';
import { cn } from '../../../../shared/lib';
import { parseStoredPostHtmlToEditorHtml, serializePostEditorBodyHtml } from '../../lib/post-editor-body-html';
import { sanitizeEditorHtml } from '../../lib/sanitize';
import { PostEditorHardBreak } from '../../lib/tiptap-hard-break';
import {
	PostEditorBold,
	PostEditorCodeBlock,
	PostEditorEnter,
	PostEditorItalic
} from '../../lib/tiptap-post-editor-extensions';

interface Props {
	value: string;
	onChange: (value: string) => void;
	label?: string;
	error?: string;
	placeholder?: string;
	disabled?: boolean;
}

interface ToolbarButtonProps {
	active: boolean;
	onPress: () => void;
	disabled?: boolean;
	label: string;
	children: JSX.Element;
}

const ToolbarButton = memo<ToolbarButtonProps>(({ active, onPress, disabled, label, children }) => (
	<button
		type="button"
		onClick={onPress}
		disabled={disabled}
		aria-label={label}
		aria-pressed={active}
		title={label}
		className={cn(
			'inline-flex items-center justify-center h-8 w-8 rounded-md border border-(--color-border) text-sm transition-colors',
			'hover:bg-(--color-bg-primary) disabled:opacity-50 disabled:cursor-not-allowed',
			active && 'bg-(--color-bg-primary) text-(--color-brand-orange)'
		)}>
		{children}
	</button>
));
ToolbarButton.displayName = 'ToolbarButton';

const Toolbar = memo<{ editor: Editor; disabled?: boolean }>(({ editor, disabled }) => {
	const toggleBold = useCallback(() => editor.chain().focus().toggleBold().run(), [editor]);
	const toggleItalic = useCallback(() => editor.chain().focus().toggleItalic().run(), [editor]);
	const toggleUnderline = useCallback(() => editor.chain().focus().toggleUnderline().run(), [editor]);
	const toggleStrike = useCallback(() => editor.chain().focus().toggleStrike().run(), [editor]);
	const toggleCode = useCallback(() => editor.chain().focus().toggleCode().run(), [editor]);
	const toggleCodeBlock = useCallback(() => editor.chain().focus().toggleCodeBlock().run(), [editor]);

	return (
		<div
			role="toolbar"
			aria-label="Форматирование текста"
			className="flex shrink-0 flex-wrap gap-1 border-b border-(--color-border) bg-(--color-bg-secondary) px-2 py-1.5">
			<ToolbarButton active={editor.isActive('bold')} onPress={toggleBold} disabled={disabled} label="Жирный">
				<BoldIcon size={16} />
			</ToolbarButton>
			<ToolbarButton active={editor.isActive('italic')} onPress={toggleItalic} disabled={disabled} label="Курсив">
				<ItalicIcon size={16} />
			</ToolbarButton>
			<ToolbarButton
				active={editor.isActive('underline')}
				onPress={toggleUnderline}
				disabled={disabled}
				label="Подчёркнутый">
				<UnderlineIcon size={16} />
			</ToolbarButton>
			<ToolbarButton
				active={editor.isActive('strike')}
				onPress={toggleStrike}
				disabled={disabled}
				label="Зачёркнутый">
				<Strikethrough size={16} />
			</ToolbarButton>
			<ToolbarButton
				active={editor.isActive('code')}
				onPress={toggleCode}
				disabled={disabled}
				label="Код (инлайн)">
				<CodeIcon size={16} />
			</ToolbarButton>
			<ToolbarButton
				active={editor.isActive('codeBlock')}
				onPress={toggleCodeBlock}
				disabled={disabled}
				label="Блок кода">
				<span className="font-mono text-[11px] leading-none">{'{ }'}</span>
			</ToolbarButton>
		</div>
	);
});
Toolbar.displayName = 'PostEditorToolbar';

export const RichTextEditor = ({ value, onChange, label, error, placeholder, disabled }: Props): JSX.Element => {
	const skipExternalSyncRef = useRef(false);

	const editor = useEditor({
		extensions: [
			Document,
			Paragraph,
			Text,
			PostEditorHardBreak,
			PostEditorBold,
			PostEditorItalic,
			Underline,
			Strike,
			Code,
			PostEditorCodeBlock,
			PostEditorEnter,
			History,
			Placeholder.configure({ placeholder: placeholder ?? 'Введите текст поста...' })
		],
		editable: !disabled,
		content: parseStoredPostHtmlToEditorHtml(value ?? ''),
		editorProps: {
			attributes: {
				class: cn(
					'rte-content max-w-full min-h-[min(12rem,40vh)] min-w-0 w-full px-4 py-3 focus:outline-none',
					'text-(--color-text-primary)',
					disabled && 'opacity-60 cursor-not-allowed'
				),
				role: 'textbox',
				'aria-multiline': 'true'
			},
			transformPastedHTML: (html: string) => sanitizeEditorHtml(html)
		},
		onUpdate: ({ editor: updatedEditor }) => {
			skipExternalSyncRef.current = true;
			onChange(serializePostEditorBodyHtml(updatedEditor));
		},
		immediatelyRender: false
	});

	useEffect(() => {
		if (!editor) return;
		if (skipExternalSyncRef.current) {
			skipExternalSyncRef.current = false;
			return;
		}
		const nextValue = (value ?? '').trim();
		const current = serializePostEditorBodyHtml(editor);
		if (current === nextValue) return;
		editor.commands.setContent(parseStoredPostHtmlToEditorHtml(value ?? ''), { emitUpdate: false });
	}, [editor, value]);

	useEffect(() => {
		if (!editor) return;
		if (editor.isEditable === !disabled) return;
		editor.setEditable(!disabled);
	}, [editor, disabled]);

	return (
		<div className="flex min-w-0 flex-col gap-2">
			{label && <span className="text-sm font-semibold text-(--color-text-primary) px-1">{label}</span>}
			<div
				className={cn(
					'flex min-h-0 min-w-0 flex-col rounded-xl border bg-(--color-bg-primary) transition-colors',
					error ? 'border-red-400' : 'border-(--color-border) focus-within:border-(--color-brand-orange)'
				)}>
				{editor && <Toolbar editor={editor} disabled={disabled} />}
				<div className="editor min-h-0 min-w-0 max-h-[min(70dvh,32rem)] overflow-y-auto overflow-x-hidden">
					<EditorContent editor={editor} className="min-w-0 w-full" />
				</div>
			</div>
			{error && <span className="text-xs text-red-400 px-1 font-medium">{error}</span>}
		</div>
	);
};
