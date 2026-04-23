import { ArrowLeft, Loader2 } from 'lucide-react';
import { JSX, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GuardianProfileGuardianship, useGuardianProfile } from '../../../../entities/guardian';
import { CancelGuardianshipModal } from '../../../../features/guardianship-cancel';
import { SendReportModal } from '../../../../features/guardianship-send-report';
import { ROUTES } from '../../../../shared/config';
import { Button, ErrorState, PageTitle } from '../../../../shared/ui';
import { GuardianGuardianshipsList } from './GuardianGuardianshipsList';
import { GuardianProfileCard } from './GuardianProfileCard';
import { GuardianStatsGrid } from './GuardianStatsGrid';

export const GuardianPage = (): JSX.Element => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [reportTarget, setReportTarget] = useState<GuardianProfileGuardianship | null>(null);
	const [cancelTarget, setCancelTarget] = useState<GuardianProfileGuardianship | null>(null);

	const query = useGuardianProfile(id);

	if (!id) {
		return (
			<ErrorState
				description="Некорректный идентификатор опекуна."
				onRetry={() => navigate(ROUTES.guardianships)}
			/>
		);
	}

	if (query.isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (query.isError || !query.data) {
		return (
			<ErrorState
				description={query.error?.message ?? 'Не удалось загрузить профиль опекуна.'}
				onRetry={() => void query.refetch()}
			/>
		);
	}

	const { user, stats, guardianships } = query.data;

	return (
		<div className="space-y-6 pb-10">
			<PageTitle title={user.name} subtitle="Профиль опекуна, контакты и все оформленные опекунства.">
				<Button
					type="button"
					appearance="ghost"
					className="mt-0 md:w-auto px-6 py-2"
					onClick={() => navigate(-1)}>
					<ArrowLeft size={16} />
					Назад
				</Button>
			</PageTitle>

			<GuardianProfileCard user={user} />
			<GuardianStatsGrid stats={stats} />

			<section className="space-y-3">
				<h2 className="text-lg font-semibold">Опекунства ({guardianships.length})</h2>
				<GuardianGuardianshipsList
					items={guardianships}
					onSendReport={(item) => setReportTarget(item)}
					onCancel={(item) => setCancelTarget(item)}
				/>
			</section>

			{reportTarget && (
				<SendReportModal
					animalId={reportTarget.animal.id}
					animalName={reportTarget.animal.name}
					guardianName={user.name}
					onClose={() => setReportTarget(null)}
				/>
			)}

			{cancelTarget && (
				<CancelGuardianshipModal
					guardianshipId={cancelTarget.id}
					animalName={cancelTarget.animal.name}
					guardianName={user.name}
					onClose={() => setCancelTarget(null)}
				/>
			)}
		</div>
	);
};

export default GuardianPage;
