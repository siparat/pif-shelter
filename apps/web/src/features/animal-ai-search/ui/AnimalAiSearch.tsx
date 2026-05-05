import { Bot, Loader2, RotateCcw, Search, Sparkles, X } from 'lucide-react';
import { JSX, useEffect, useRef, useState } from 'react';
import { AiSearchSuggestion, useAiSearch } from '../model/use-ai-search';

const SUGGESTIONS = [
	'Котик для уютной квартиры с ребёнком',
	'Маленькая собачка, ладит с кошками',
	'Молодая кошечка, активная'
];

type Props = {
	onClose: () => void;
	onResult?: (result: { matchedIds: string[]; suggestions: AiSearchSuggestion[] }) => void;
	onReset?: () => void;
};

export const AnimalAiSearch = ({ onClose, onResult, onReset }: Props): JSX.Element => {
	const [input, setInput] = useState('');
	const { state, search, reset } = useAiSearch();
	const inputRef = useRef<HTMLInputElement>(null);

	const isStreaming = state.status === 'streaming';
	const isDone = state.status === 'done';
	const isError = state.status === 'error';
	const hasAnswer = isStreaming || isDone || isError;

	useEffect(() => {
		if (isDone) {
			onResult?.({ matchedIds: state.matchedIds, suggestions: state.suggestions });
		}
	}, [isDone]);

	const handleSubmit = (): void => {
		const q = input.trim();
		if (!q) return;
		search(q);
	};

	const handleReset = (): void => {
		reset();
		setInput('');
		onReset?.();
		inputRef.current?.focus();
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-brand-accent)/15">
						<Sparkles className="h-4 w-4 text-(--color-brand-accent)" />
					</div>
					<span className="text-sm font-bold text-(--color-text-primary)">ИИ-подбор питомца</span>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="flex h-7 w-7 items-center justify-center rounded-full text-(--color-text-secondary) transition-colors hover:bg-(--color-surface-secondary) hover:text-(--color-text-primary)">
					<X className="h-4 w-4" />
				</button>
			</div>

			{!hasAnswer && (
				<div className="flex flex-col gap-3">
					<p className="text-sm text-(--color-text-secondary)">
						Опишите, какого питомца вы ищете — ИИ подберёт подходящих из нашего приюта.
					</p>
					<div className="flex gap-2">
						<input
							ref={inputRef}
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
							placeholder="Например: кошечка для квартиры с детьми…"
							className="min-w-0 flex-1 rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) px-4 py-2.5 text-sm text-(--color-text-primary) outline-none placeholder:text-(--color-text-secondary) focus:border-(--color-brand-accent) focus:ring-2 focus:ring-(--color-brand-accent)/20"
						/>
						<button
							type="button"
							onClick={handleSubmit}
							disabled={!input.trim()}
							className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-(--color-brand-accent) text-white shadow-[0_4px_12px_rgba(254,134,81,0.30)] transition-opacity disabled:opacity-40">
							<Search className="h-4 w-4" />
						</button>
					</div>
					<div className="flex flex-wrap gap-2">
						{SUGGESTIONS.map((s) => (
							<button
								key={s}
								type="button"
								onClick={() => {
									setInput(s);
									search(s);
								}}
								className="rounded-full border border-(--color-border-soft) bg-(--color-surface-primary) px-3 py-1 text-xs text-(--color-text-secondary) transition-colors hover:border-(--color-brand-accent) hover:text-(--color-brand-accent)">
								{s}
							</button>
						))}
					</div>
				</div>
			)}

			{hasAnswer && (
				<div className="flex flex-col gap-3">
					<div className="flex gap-3">
						<div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--color-brand-brown-soft)">
							<Bot className="h-4 w-4 text-(--color-brand-brown)" />
						</div>
						<div className="flex-1">
							<p className="text-sm leading-relaxed text-(--color-text-primary) whitespace-pre-line">
								{isStreaming || isDone ? state.message : null}
								{isStreaming && (
									<span className="ml-1 inline-flex items-center gap-1 text-(--color-text-secondary)">
										<Loader2 className="h-3 w-3 animate-spin" />
									</span>
								)}
								{isError && <span className="text-(--color-text-secondary)">{state.message}</span>}
							</p>
						</div>
					</div>

					{!isStreaming && (
						<button
							type="button"
							onClick={handleReset}
							className="flex items-center gap-1.5 self-start text-xs font-semibold text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)">
							<RotateCcw className="h-3 w-3" />
							Новый поиск
						</button>
					)}
				</div>
			)}
		</div>
	);
};
