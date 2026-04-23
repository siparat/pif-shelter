import { Ban, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { JSX } from 'react';
import { GuardianProfileStats } from '../../../../entities/guardian';

interface Props {
	stats: GuardianProfileStats;
}

const formatMoney = (value: number): string => {
	return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(
		value
	);
};

const formatDate = (iso: string | null): string => {
	if (!iso) {
		return '—';
	}
	return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
};

interface StatCardProps {
	icon: JSX.Element;
	label: string;
	value: string | number;
	hint?: string;
	tone?: 'default' | 'positive' | 'warning' | 'danger';
}

const TONE_CLASSES: Record<NonNullable<StatCardProps['tone']>, string> = {
	default: 'text-(--color-text-primary)',
	positive: 'text-emerald-300',
	warning: 'text-amber-300',
	danger: 'text-rose-300'
};

const StatCard = ({ icon, label, value, hint, tone = 'default' }: StatCardProps): JSX.Element => {
	return (
		<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 flex flex-col gap-2">
			<div className="flex items-center gap-2 text-(--color-text-secondary) text-xs uppercase tracking-wider">
				{icon}
				<span>{label}</span>
			</div>
			<div className={`text-2xl font-bold ${TONE_CLASSES[tone]}`}>{value}</div>
			{hint && <p className="text-xs text-(--color-text-secondary)">{hint}</p>}
		</div>
	);
};

export const GuardianStatsGrid = ({ stats }: Props): JSX.Element => {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
			<StatCard
				icon={<CheckCircle2 size={14} />}
				label="Активные"
				value={stats.activeCount}
				hint={stats.totalCount > 0 ? `из ${stats.totalCount} всего` : undefined}
				tone="positive"
			/>
			<StatCard
				icon={<TrendingUp size={14} />}
				label="В месяц"
				value={formatMoney(stats.monthlyContribution)}
				hint="Сумма активных опекунств"
			/>
			<StatCard
				icon={<Clock size={14} />}
				label="С нами с"
				value={formatDate(stats.firstGuardianshipAt)}
				hint={stats.lastActivityAt ? `Последняя активность: ${formatDate(stats.lastActivityAt)}` : undefined}
			/>
			<StatCard
				icon={<Ban size={14} />}
				label="Отменено"
				value={stats.cancelledCount}
				tone={stats.cancelledCount > 0 ? 'danger' : 'default'}
			/>
		</div>
	);
};
