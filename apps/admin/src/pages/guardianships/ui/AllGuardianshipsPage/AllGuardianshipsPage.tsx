import { Loader2 } from 'lucide-react';
import { JSX, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
	GuardianshipItem,
	useCanAccessAllGuardianships,
	useGuardianshipsList
} from '../../../../entities/guardianship';
import { CancelGuardianshipModal } from '../../../../features/guardianship-cancel';
import { SendReportModal } from '../../../../features/guardianship-send-report';
import { ROUTES } from '../../../../shared/config';
import { EmptyState, ErrorState, PageTitle, Pagination, Select } from '../../../../shared/ui';
import { useGuardianshipsPageFilters } from '../../model/use-guardianships-page-filters';
import { GuardianshipsFilters } from '../GuardianshipsFilters/GuardianshipsFilters';
import { GuardianshipsTabs } from '../GuardianshipsLayout/GuardianshipsTabs';
import { GuardianshipsTable } from '../GuardianshipsTable/GuardianshipsTable';

export const AllGuardianshipsPage = (): JSX.Element => {
	const hasAccess = useCanAccessAllGuardianships();
	const { filters, patchFilters, resetFilters } = useGuardianshipsPageFilters();
	const [reportTarget, setReportTarget] = useState<GuardianshipItem | null>(null);
	const [cancelTarget, setCancelTarget] = useState<GuardianshipItem | null>(null);

	const query = useGuardianshipsList(filters, { enabled: hasAccess });

	if (!hasAccess) {
		return <Navigate to={ROUTES.guardianshipsMy} replace />;
	}

	const data = query.data?.data ?? [];
	const meta = query.data?.meta;

	if (query.isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (query.isError) {
		return (
			<ErrorState
				description={query.error?.message ?? 'Не удалось загрузить список опекунств.'}
				onRetry={() => void query.refetch()}
			/>
		);
	}

	return (
		<div className="space-y-6 pb-10">
			<PageTitle
				title="Опекунство"
				subtitle="Все опекунства приюта. Отменяйте, отслеживайте платежи и отправляйте отчёты."
			/>

			<GuardianshipsTabs />

			<GuardianshipsFilters
				status={filters.status}
				curatorId={filters.curatorId}
				search={filters.search}
				onStatusChange={(status) => patchFilters({ status, page: 1 })}
				onCuratorChange={(curatorId) => patchFilters({ curatorId, page: 1 })}
				onSearchChange={(search) => patchFilters({ search, page: 1 })}
				onReset={resetFilters}
			/>

			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-(--color-text-secondary)">Всего: {meta?.total ?? 0}</p>
				<div className="flex items-center gap-2">
					<Select<number>
						value={filters.perPage}
						onChange={(event) => patchFilters({ page: 1, perPage: Number(event.target.value) })}
						options={[
							{ value: 10, label: '10 на странице' },
							{ value: 20, label: '20 на странице' },
							{ value: 50, label: '50 на странице' }
						]}
						small
					/>
				</div>
			</div>

			{data.length === 0 ? (
				<EmptyState
					title="Опекунства не найдены"
					description="Попробуйте изменить фильтры или сбросить их."
					actionLabel="Сбросить фильтры"
					onAction={resetFilters}
				/>
			) : (
				<GuardianshipsTable
					guardianships={data}
					onSendReport={(item) => setReportTarget(item)}
					onCancel={(item) => setCancelTarget(item)}
				/>
			)}

			<Pagination
				page={meta?.page ?? filters.page}
				totalPages={meta?.totalPages ?? 1}
				onPageChange={(page) => patchFilters({ page })}
			/>

			{reportTarget && (
				<SendReportModal
					animalId={reportTarget.animal.id}
					animalName={reportTarget.animal.name}
					guardianName={reportTarget.guardian.name}
					onClose={() => setReportTarget(null)}
				/>
			)}

			{cancelTarget && (
				<CancelGuardianshipModal
					guardianshipId={cancelTarget.id}
					animalName={cancelTarget.animal.name}
					guardianName={cancelTarget.guardian.name}
					onClose={() => setCancelTarget(null)}
				/>
			)}
		</div>
	);
};

export default AllGuardianshipsPage;
