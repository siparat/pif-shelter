import { ChevronDown, Loader2, Search, X } from 'lucide-react';
import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import { AnimalItem, useAnimalsList } from '../../../../entities/animal';
import { cn } from '../../../../shared/lib';
import { ANIMAL_SEARCH_DEBOUNCE_MS, ANIMAL_STATUS_LABEL, ANIMALS_PER_PAGE, resolvePublicMediaUrl } from './utils';

interface Props {
	label?: string;
	value: string | undefined;
	onChange: (animalId: string | undefined, animal: AnimalItem | null) => void;
	selectedAnimal?: Pick<AnimalItem, 'id' | 'name' | 'avatarUrl' | 'status'> | null;
}

export const AnimalPicker = ({ label, value, onChange, selectedAnimal }: Props): JSX.Element => {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search.trim()), ANIMAL_SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [search]);

	useEffect(() => {
		const handler = (event: MouseEvent): void => {
			if (!(event.target instanceof Node)) {
				return;
			}
			if (!containerRef.current) {
				return;
			}
			if (!containerRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};
		window.addEventListener('mousedown', handler);
		return () => window.removeEventListener('mousedown', handler);
	}, []);

	const animalsQuery = useAnimalsList({
		page: 1,
		perPage: ANIMALS_PER_PAGE,
		q: debouncedSearch || undefined
	});

	const animals = animalsQuery.data?.data ?? [];

	const triggerLabel = useMemo(() => {
		if (!value) {
			return 'Без привязки';
		}
		const fromList = animals.find((item) => item.id === value);
		const animal = fromList ?? selectedAnimal;
		if (!animal) {
			return 'Животное';
		}
		return `${animal.name} · ${ANIMAL_STATUS_LABEL[animal.status]}`;
	}, [value, animals, selectedAnimal]);

	const handleSelect = (animal: AnimalItem | null): void => {
		onChange(animal?.id, animal);
		setIsOpen(false);
		setSearch('');
	};

	return (
		<div className="flex flex-col gap-2 relative" ref={containerRef}>
			{label && <span className="text-sm font-semibold text-(--color-text-primary) px-1">{label}</span>}
			<button
				type="button"
				onClick={() => setIsOpen((state) => !state)}
				className={cn(
					'flex items-center justify-between w-full bg-(--color-bg-primary) border rounded-xl py-2.5 px-3 text-sm text-(--color-text-primary) transition-all',
					isOpen
						? 'border-(--color-brand-orange)'
						: 'border-(--color-border) hover:border-(--color-brand-orange)/60'
				)}>
				<span className={cn('truncate', !value && 'text-(--color-text-secondary)')}>{triggerLabel}</span>
				<ChevronDown size={18} className={cn('transition-transform shrink-0', isOpen && 'rotate-180')} />
			</button>

			{isOpen && (
				<div className="mt-2 rounded-xl border border-(--color-border) bg-(--color-bg-secondary) shadow-lg overflow-hidden">
					<div className="relative border-b border-(--color-border)">
						<Search
							size={16}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-secondary)"
						/>
						<input
							autoFocus
							type="text"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Поиск по имени..."
							className="w-full bg-transparent py-2.5 pl-9 pr-9 text-sm focus:outline-none"
						/>
						{search && (
							<button
								type="button"
								onClick={() => setSearch('')}
								className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-(--color-bg-primary)">
								<X size={14} className="text-(--color-text-secondary)" />
							</button>
						)}
					</div>

					<div className="max-h-72 overflow-auto">
						<button
							type="button"
							onClick={() => handleSelect(null)}
							className={cn(
								'flex items-center gap-3 w-full px-3 py-2 text-sm text-left hover:bg-(--color-bg-primary) transition-colors',
								!value && 'bg-(--color-bg-primary)'
							)}>
							<div className="w-8 h-8 rounded-full bg-(--color-bg-primary) border border-(--color-border) flex items-center justify-center text-xs text-(--color-text-secondary)">
								—
							</div>
							<span>Без привязки</span>
						</button>

						{animalsQuery.isFetching && (
							<div className="flex items-center justify-center py-4">
								<Loader2 size={18} className="animate-spin text-(--color-brand-orange)" />
							</div>
						)}

						{!animalsQuery.isFetching && animals.length === 0 && (
							<p className="px-3 py-4 text-sm text-center text-(--color-text-secondary)">
								Ничего не найдено
							</p>
						)}

						{animals.map((animal) => {
							const avatarSrc = resolvePublicMediaUrl(animal.avatarUrl ?? undefined);
							return (
								<button
									key={animal.id}
									type="button"
									onClick={() => handleSelect(animal)}
									className={cn(
										'flex items-center gap-3 w-full px-3 py-2 text-sm text-left hover:bg-(--color-bg-primary) transition-colors',
										value === animal.id && 'bg-(--color-bg-primary)'
									)}>
									<div className="w-8 h-8 rounded-full overflow-hidden bg-(--color-bg-primary) border border-(--color-border) flex items-center justify-center text-xs shrink-0">
										{avatarSrc ? (
											<img
												src={avatarSrc}
												alt={animal.name}
												className="w-full h-full object-cover"
											/>
										) : (
											animal.name.charAt(0).toUpperCase()
										)}
									</div>
									<div className="flex flex-col min-w-0">
										<span className="truncate font-medium">{animal.name}</span>
										<span className="truncate text-xs text-(--color-text-secondary)">
											{ANIMAL_STATUS_LABEL[animal.status]}
										</span>
									</div>
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};
