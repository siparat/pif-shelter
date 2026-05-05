import { useCallback, useRef, useState } from 'react';
import { API_URL } from '../../../shared/config/api';

export type AiSearchSuggestion = { id: string; note: string };

export type AiSearchState =
	| { status: 'idle' }
	| { status: 'streaming'; message: string }
	| { status: 'done'; message: string; matchedIds: string[]; suggestions: AiSearchSuggestion[] }
	| { status: 'error'; message: string };

type SseEnvelope =
	| { type: 'delta'; data: { text: string } }
	| { type: 'result'; data: { matchedIds: string[]; suggestions: AiSearchSuggestion[] } }
	| { type: 'error'; data: { message: string } };

export const useAiSearch = (): {
	state: AiSearchState;
	search: (query: string) => void;
	reset: () => void;
} => {
	const [state, setState] = useState<AiSearchState>({ status: 'idle' });
	const esRef = useRef<EventSource | null>(null);

	const search = useCallback((query: string) => {
		esRef.current?.close();

		setState({ status: 'streaming', message: '' });

		const es = new EventSource(`${API_URL}/animals/ai-search?q=${encodeURIComponent(query)}`);
		esRef.current = es;

		let accumulated = '';

		es.onmessage = (e: MessageEvent<string>) => {
			const envelope = JSON.parse(e.data) as SseEnvelope;

			if (envelope.type === 'delta') {
				accumulated += envelope.data.text;
				setState({ status: 'streaming', message: accumulated });
			} else if (envelope.type === 'result') {
				setState({
					status: 'done',
					message: accumulated,
					matchedIds: envelope.data.matchedIds,
					suggestions: envelope.data.suggestions
				});
				es.close();
			} else if (envelope.type === 'error') {
				setState({ status: 'error', message: envelope.data.message });
				es.close();
			}
		};

		es.onerror = (e) => {
			console.error(e);
			setState((prev) =>
				prev.status === 'streaming'
					? {
							status: 'error',
							message: 'data' in e && typeof e.data == 'string' ? e.data : 'Соединение прервано'
						}
					: prev
			);
			es.close();
		};
	}, []);

	const reset = useCallback(() => {
		esRef.current?.close();
		setState({ status: 'idle' });
	}, []);

	return { state, search, reset };
};
