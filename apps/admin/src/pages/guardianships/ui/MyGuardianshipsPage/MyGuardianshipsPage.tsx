import { GuardianshipStatusEnum, UserRole } from '@pif/shared';
import { Loader2 } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { GuardianshipItem, useGuardianshipsList } from '../../../../entities/guardianship';
import { useSession } from '../../../../entities/session/model/hooks';
import { CancelGuardianshipModal } from '../../../../features/guardianship-cancel';
import { SendReportModal } from '../../../../features/guardianship-send-report';
import { EmptyState, ErrorState, PageTitle } from '../../../../shared/ui';
import { GuardianshipsTable } from '../GuardianshipsTable/GuardianshipsTable';
import { GuardianshipsTabs } from '../GuardianshipsLayout/GuardianshipsTabs';

export const MyGuardianshipsPage = (): JSX.Element => {
	const { data: session } = useSession();
	const [reportTarget, setReportTarget] = useState<GuardianshipItem | null>(null);
	const [cancelTarget, setCancelTarget] = useState<GuardianshipItem | null>(null);

	const effectiveCuratorId = useMemo(() => {
		if (!session?.user) {
			return undefined;
		}
		return session.user.role === UserRole.VOLUNTEER ? undefined : session.user.id;
	}, [session?.user]);

	const query = useGuardianshipsList(
		{
			status: GuardianshipStatusEnum.ACTIVE,
			curatorId: effectiveCuratorId,
			perPage: 100,
			page: 1,
			sort: 'startedAt:desc'
		},
		{ enabled: Boolean(session?.user) }
	);

	const guardianships = query.data?.data ?? [];

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
				subtitle="Подопечные, для которых вы являетесь куратором. Здесь можно отправить отчёт опекуну."
			/>

			<GuardianshipsTabs />

			<GuardianshipsTable
				guardianships={guardianships}
				onSendReport={(item) => setReportTarget(item)}
				onCancel={(item) => setCancelTarget(item)}
				emptyState={
					<EmptyState
						title="У вас пока нет подопечных"
						description="Как только за одним из ваших животных закрепится опекун, опекунство появится здесь."
					/>
				}
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

export default MyGuardianshipsPage;
