import { ArrowLeft, Heart, Loader2, MessageSquare } from 'lucide-react';
import { JSX, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GuardianProfileGuardianship, useGuardianProfile } from '../../../../entities/guardian';
import { CancelGuardianshipModal } from '../../../../features/guardianship-cancel';
import { SendReportModal } from '../../../../features/guardianship-send-report';
import { ROUTES } from '../../../../shared/config';
import { cn } from '../../../../shared/lib';
import { Button, ErrorState, PageTitle } from '../../../../shared/ui';
import { GuardianGuardianshipsList } from './GuardianGuardianshipsList';
import { GuardianProfileCard } from './GuardianProfileCard';
import { GuardianReportsList } from './GuardianReportsList';
import { GuardianStatsGrid } from './GuardianStatsGrid';

type TabKey = 'guardianships' | 'reports';

interface Tab {
	key: TabKey;
	label: string;
	Icon: typeof Heart;
}

const TABS: Tab[] = [
	{ key: 'guardianships', label: 'Опекунства', Icon: Heart },
	{ key: 'reports', label: 'История отчётов', Icon: MessageSquare }
];

export const GuardianPage = (): JSX.Element => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [reportTarget, setReportTarget] = useState<GuardianProfileGuardianship | null>(null);
	const [cancelTarget, setCancelTarget] = useState<GuardianProfileGuardianship | null>(null);
	const [activeTab, setActiveTab] = useState<TabKey>('guardianships');

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

			<section className="space-y-4">
				<div className="flex flex-wrap gap-2 border-b border-(--color-border)">
					{TABS.map(({ key, label, Icon }) => {
						const isActive = activeTab === key;
						const count = key === 'guardianships' ? guardianships.length : null;
						return (
							<button
								key={key}
								type="button"
								onClick={() => setActiveTab(key)}
								className={cn(
									'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
									isActive
										? 'text-(--color-brand-orange) border-(--color-brand-orange)'
										: 'text-(--color-text-secondary) border-transparent hover:text-(--color-text-primary)'
								)}>
								<Icon size={16} />
								{label}
								{count !== null && (
									<span
										className={cn(
											'inline-flex items-center justify-center min-w-5 px-1.5 text-[11px] font-semibold rounded-full',
											isActive
												? 'bg-(--color-brand-orange) text-white'
												: 'bg-(--color-bg-secondary) text-(--color-text-secondary)'
										)}>
										{count}
									</span>
								)}
							</button>
						);
					})}
				</div>

				{activeTab === 'guardianships' && (
					<GuardianGuardianshipsList
						items={guardianships}
						onSendReport={(item) => setReportTarget(item)}
						onCancel={(item) => setCancelTarget(item)}
					/>
				)}

				{activeTab === 'reports' && <GuardianReportsList userId={id} />}
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
