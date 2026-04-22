import { UserRole } from '@pif/shared';
import { Loader2, Plus } from 'lucide-react';
import { JSX, useState } from 'react';
import { AnimalItem, AnimalsTable, useAnimalLabels, useAnimalsList } from '../../../../entities/animal';
import { useSession } from '../../../../entities/session/model/hooks';
import { useVolunteers } from '../../../../entities/volunteer';
import { LabelsCatalogManager } from '../../../../features/animal-actions';
import { AnimalEditorModal } from '../../../../features/animal-editor';
import { AnimalStatusQuickChange } from '../../../../features/animal-status-quick-change';
import { AnimalsFilters } from '../../../../features/animals-filters';
import { Button, EmptyState, ErrorState, PageTitle, Pagination, Select } from '../../../../shared/ui';
import { useAnimalsPageFilters } from '../../model/use-animals-page-filters';

export const AnimalsPage = (): JSX.Element => {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingAnimal, setEditingAnimal] = useState<AnimalItem | null>(null);

	const { filters, patchFilters, setFilters, resetFilters } = useAnimalsPageFilters();
	const { data: session } = useSession();
	const isManager = session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.SENIOR_VOLUNTEER;

	const animalsQuery = useAnimalsList(filters);
	const labelsQuery = useAnimalLabels();
	const volunteersQuery = useVolunteers();

	const animals = animalsQuery.data?.data ?? [];
	const meta = animalsQuery.data?.meta;

	const handleRetry = async (): Promise<void> => {
		await Promise.all([animalsQuery.refetch(), labelsQuery.refetch(), volunteersQuery.refetch()]);
	};

	if (animalsQuery.isLoading || labelsQuery.isLoading || volunteersQuery.isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (animalsQuery.error || labelsQuery.error || volunteersQuery.error) {
		const description = animalsQuery.error?.message || labelsQuery.error?.message || volunteersQuery.error?.message;
		if (description) {
			return <ErrorState description={description} onRetry={() => void handleRetry()} />;
		}
	}

	return (
		<div className="space-y-6 pb-10">
			<PageTitle title="Животные" subtitle="Управление карточками животных, статусами, кураторами и ярлыками.">
				{isManager && (
					<Button type="button" className="mt-0 md:w-auto px-6 py-2" onClick={() => setIsCreateOpen(true)}>
						<Plus size={16} />
						Создать животное
					</Button>
				)}
			</PageTitle>

			<AnimalsFilters
				initialValues={filters}
				isLoading={animalsQuery.isFetching}
				onApply={(values) => setFilters({ ...filters, ...values, page: 1 })}
				onReset={resetFilters}
			/>

			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-(--color-text-secondary)">Всего: {meta?.total ?? 0}</p>
				<div className="flex items-center gap-2">
					<Select<number>
						value={Number(filters.perPage) || 20}
						onChange={(event) => patchFilters({ page: 1, perPage: Number(event.target.value) })}
						options={[
							{ value: 10, label: '10 на странице' },
							{ value: 20, label: '20 на странице' },
							{ value: 50, label: '50 на странице' }
						]}
					/>
				</div>
			</div>

			{animals.length === 0 ? (
				<EmptyState
					title="Животные не найдены"
					description="Измените фильтры или создайте новую карточку животного."
					actionLabel="Сбросить фильтры"
					onAction={resetFilters}
				/>
			) : (
				<AnimalsTable
					setEditingAnimal={setEditingAnimal}
					animals={animals}
					renderStatus={(animal) => (
						<AnimalStatusQuickChange
							animal={{
								id: animal.id,
								status: animal.status,
								avatarUrl: animal.avatarUrl,
								curatorId: animal.curatorId
							}}
						/>
					)}
				/>
			)}

			<Pagination
				page={meta?.page ?? 1}
				totalPages={meta?.totalPages ?? 1}
				onPageChange={(page) => patchFilters({ page })}
			/>

			{isManager && <LabelsCatalogManager />}

			{isCreateOpen && <AnimalEditorModal mode="create" animal={null} onClose={() => setIsCreateOpen(false)} />}

			{editingAnimal && (
				<AnimalEditorModal mode="edit" animal={editingAnimal} onClose={() => setEditingAnimal(null)} />
			)}
		</div>
	);
};

export default AnimalsPage;
