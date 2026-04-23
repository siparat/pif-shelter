import { AnimalSpeciesNames, PostMediaTypeEnum } from '@pif/shared';
import dayjs from 'dayjs';
import { ExternalLink, Film, ImageIcon, Loader2, MessageSquare } from 'lucide-react';
import { JSX, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimalAvatar } from '../../../../entities/animal';
import { GuardianReportItem, useGuardianReports } from '../../../../entities/guardian';
import { ROUTES } from '../../../../shared/config';
import { getMediaUrl } from '../../../../shared/lib';
import { EmptyState, ErrorState, Pagination } from '../../../../shared/ui';

interface Props {
	userId: string;
}

const PER_PAGE = 10;

const formatDateTime = (iso: string): string => dayjs(iso).format('DD.MM.YYYY HH:mm');

export const GuardianReportsList = ({ userId }: Props): JSX.Element => {
	const [page, setPage] = useState(1);
	const query = useGuardianReports(userId, { page, perPage: PER_PAGE });

	if (query.isLoading) {
		return (
			<div className="flex items-center justify-center min-h-40">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={32} />
			</div>
		);
	}

	if (query.isError) {
		return (
			<ErrorState
				description={query.error?.message ?? 'Не удалось загрузить историю отчётов.'}
				onRetry={() => void query.refetch()}
			/>
		);
	}

	const items = query.data?.data ?? [];
	const meta = query.data?.meta;

	if (items.length === 0) {
		return (
			<EmptyState
				title="Отчётов пока нет"
				description="Здесь появятся все приватные посты-отчёты, отправленные этому опекуну в рамках действующего или прошлого опекунства."
			/>
		);
	}

	return (
		<div className="space-y-4">
			<p className="text-xs text-(--color-text-secondary)">
				Всего отчётов: <span className="text-(--color-text-primary) font-semibold">{meta?.total ?? 0}</span>
			</p>
			<ul className="space-y-3">
				{items.map((item) => (
					<li key={item.id}>
						<GuardianReportCard item={item} />
					</li>
				))}
			</ul>
			<Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
		</div>
	);
};

interface ReportCardProps {
	item: GuardianReportItem;
}

const GuardianReportCard = ({ item }: ReportCardProps): JSX.Element => {
	const photos = item.media.filter((m) => m.type === PostMediaTypeEnum.IMAGE).slice(0, 4);
	const videos = item.media.filter((m) => m.type === PostMediaTypeEnum.VIDEO);
	const hasMedia = photos.length > 0 || videos.length > 0;

	return (
		<article className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-5 space-y-3">
			<header className="flex items-start gap-3">
				<Link to={ROUTES.animalDetails.replace(':id', item.animal.id)} className="shrink-0">
					<AnimalAvatar
						animal={{
							avatarUrl: item.animal.avatarUrl,
							name: item.animal.name,
							species: item.animal.species
						}}
						width={48}
						height={48}
						rounded
					/>
				</Link>
				<div className="flex-1 min-w-0">
					<div className="flex flex-wrap items-center gap-2 text-xs text-(--color-text-secondary)">
						<Link
							to={ROUTES.animalDetails.replace(':id', item.animal.id)}
							className="font-semibold text-sm text-(--color-text-primary) hover:underline">
							{item.animal.name}
						</Link>
						<span>· {AnimalSpeciesNames[item.animal.species]}</span>
						<span>· {formatDateTime(item.createdAt)}</span>
					</div>
					<Link
						to={ROUTES.postDetails.replace(':animalId', item.animal.id).replace(':postId', item.id)}
						className="mt-1 inline-flex items-center gap-1.5 text-base font-semibold hover:text-(--color-brand-orange)">
						<MessageSquare size={16} className="text-(--color-brand-orange)" />
						{item.title}
					</Link>
				</div>
				<Link
					to={ROUTES.postDetails.replace(':animalId', item.animal.id).replace(':postId', item.id)}
					className="inline-flex items-center gap-1 text-xs text-(--color-text-secondary) hover:text-(--color-brand-orange) px-2 py-1 border border-(--color-border) rounded-lg shrink-0">
					<ExternalLink size={12} />
					Открыть
				</Link>
			</header>

			{hasMedia && (
				<div className="grid grid-cols-4 gap-2">
					{photos.map((photo) => (
						<div
							key={photo.id}
							className="aspect-square rounded-lg overflow-hidden bg-(--color-bg-primary) border border-(--color-border)">
							<img
								src={getMediaUrl(photo.storageKey)}
								alt=""
								loading="lazy"
								className="w-full h-full object-cover"
							/>
						</div>
					))}
					{videos.length > 0 && (
						<div className="aspect-square rounded-lg bg-(--color-bg-primary) border border-(--color-border) flex flex-col items-center justify-center text-xs text-(--color-text-secondary) gap-1">
							<Film size={24} className="text-(--color-brand-orange)" />
							{videos.length} видео
						</div>
					)}
					{photos.length === 0 && videos.length === 0 && (
						<div className="aspect-square rounded-lg bg-(--color-bg-primary) border border-(--color-border) flex items-center justify-center text-(--color-text-secondary)">
							<ImageIcon size={24} />
						</div>
					)}
				</div>
			)}
		</article>
	);
};
