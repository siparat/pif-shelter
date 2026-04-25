import { UserRole } from '@pif/shared';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Loader2, Users } from 'lucide-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../../../../entities/session/model/hooks';
import { useVolunteers } from '../../../../entities/volunteer';
import { ROUTES } from '../../../../shared/config';
import { Button, PageTitle } from '../../../../shared/ui';
import { getDashboardSummary } from '../../api/get-summary';
import { AlertsBlock } from '../AlertsBlock/AlertsBlock';
import { TasksBlock } from '../TasksBlock/TasksBlock';

export const DashboardPage = (): JSX.Element => {
	const { data: session } = useSession();
	const role = session?.user.role;
	const canOpenTeam = role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER;
	const volunteersQuery = useVolunteers({
		enabled: canOpenTeam
	});
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['dashboard-summary'],
		queryFn: getDashboardSummary
	});
	const teamMembers = volunteersQuery.data ?? [];
	const teamLeadCount = teamMembers.filter(
		(item) => item.role === UserRole.ADMIN || item.role === UserRole.SENIOR_VOLUNTEER
	).length;
	const unavailableTelegramCount = teamMembers.filter((item) => item.telegramUnreachable).length;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="p-8 bg-red-400/10 border border-red-400/20 rounded-2xl text-red-400 text-center">
				<p className="font-bold">Ошибка загрузки данных дашборда</p>
				<p className="text-sm opacity-80">
					{error instanceof Error ? error.message : 'Попробуйте обновить страницу позже'}
				</p>
				<div className="mt-4 flex justify-center">
					<Button className="mt-0 w-auto px-6 py-2" onClick={() => void refetch()}>
						Повторить
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-8 pb-10">
			<PageTitle title="Обзор" subtitle="Оперативная информация на сегодня">
				<div className="flex flex-col sm:flex-row gap-2">
					<Link to={ROUTES.wishlist}>
						<Button className="mt-0 w-full sm:w-auto px-4 py-2">Открыть нужды</Button>
					</Link>
					<Link to={ROUTES.campaigns}>
						<Button appearance="ghost" className="mt-0 w-full sm:w-auto px-4 py-2">
							Открыть сборы
						</Button>
					</Link>
				</div>
			</PageTitle>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<AlertsBlock sosCount={data.wishlist.sosCount} activeItemsCount={data.wishlist.activeItemsCount} />
				<TasksBlock
					newCount={
						session?.user.role === UserRole.VOLUNTEER
							? data.meetingRequests.myNewCount
							: data.meetingRequests.newCount
					}
					upcoming24hCount={
						session?.user.role === UserRole.VOLUNTEER
							? data.meetingRequests.myUpcoming24hCount
							: data.meetingRequests.upcoming24hCount
					}
					newLink={`${ROUTES.meetings}?status=NEW`}
					upcomingLink={ROUTES.meetings}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl p-6 h-32 flex flex-col justify-center border-dashed opacity-50">
					<span className="text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">
						Статистика
					</span>
					<span className="text-sm">В разработке...</span>
				</div>
				<div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl p-6 h-32 flex flex-col justify-center border-dashed opacity-50">
					<span className="text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">
						Финансы
					</span>
					<span className="text-sm">В разработке...</span>
				</div>
				{canOpenTeam ? (
					<Link
						to={ROUTES.users}
						className="group bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl p-6 transition-colors hover:border-(--color-brand-orange)">
						<div className="flex items-start justify-between gap-3">
							<div className="space-y-2">
								<p className="text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">
									Команда
								</p>
								<p className="text-sm text-(--color-text-secondary)">
									Назначение ролей, инвайты и статусы сотрудников.
								</p>
							</div>
							<div className="rounded-xl border border-(--color-border) p-2 text-(--color-text-secondary) group-hover:text-(--color-brand-orange) group-hover:border-(--color-brand-orange) transition-colors">
								<ArrowRight size={16} />
							</div>
						</div>
						<div className="mt-4 grid grid-cols-3 gap-2">
							<Metric
								value={volunteersQuery.isLoading ? '...' : String(teamMembers.length)}
								label="Активные"
							/>
							<Metric
								value={volunteersQuery.isLoading ? '...' : String(teamLeadCount)}
								label="Адм/старш."
							/>
							<Metric
								value={volunteersQuery.isLoading ? '...' : String(unavailableTelegramCount)}
								label="TG недоступен"
							/>
						</div>
					</Link>
				) : (
					<div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl p-6">
						<div className="flex items-start gap-3">
							<div className="rounded-xl border border-(--color-border) p-2 text-(--color-text-secondary)">
								<Users size={16} />
							</div>
							<div>
								<p className="text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">
									Команда
								</p>
								<p className="mt-1 text-sm text-(--color-text-secondary)">
									Доступ к управлению командой открыт для старшего волонтёра и администратора.
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default DashboardPage;

interface MetricProps {
	value: string;
	label: string;
}

const Metric = ({ value, label }: MetricProps): JSX.Element => (
	<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
		<p className="text-base font-semibold">{value}</p>
		<p className="text-[11px] text-(--color-text-secondary)">{label}</p>
	</div>
);
