import { AnimalGenderNames, AnimalSpeciesNames, getAgeAtNow, UserRole } from '@pif/shared';
import { HTMLAttributes, JSX, ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../shared/config';
import { cn } from '../../../../shared/lib';
import { Badge, Button } from '../../../../shared/ui';
import { useSession } from '../../../session/model/hooks';
import { useVolunteers } from '../../../volunteer';
import { AnimalItem } from '../../model/types';
import { AnimalAvatar } from '../AnimalAvatar/AnimalAvatar';
import { AnimalStatusBadge } from '../AnimalStatusBadge/AnimalStatusBadge';
import { Characteristics } from './Characteristics';

interface Props extends HTMLAttributes<HTMLDivElement> {
	animals: AnimalItem[];
	setEditingAnimal: (animal: AnimalItem) => void;
	renderStatus?: (animal: AnimalItem) => ReactNode;
}

export const AnimalsTable = ({ animals, setEditingAnimal, renderStatus, className, ...props }: Props): JSX.Element => {
	const { data: session } = useSession();
	const { data: volunteers = [] } = useVolunteers();

	const canEdit = useMemo(() => {
		if (!session?.user) {
			return () => false;
		}

		const role = session.user.role;
		return (animal: AnimalItem) => {
			if (role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER) {
				return true;
			}
			return role === UserRole.VOLUNTEER && animal.curatorId === session.user.id;
		};
	}, [session]);

	const renderStatusCell = (animal: AnimalItem): ReactNode =>
		renderStatus ? renderStatus(animal) : <AnimalStatusBadge status={animal.status} />;
	return (
		<>
			<div
				{...props}
				className={cn(
					className,
					'hidden md:block overflow-auto rounded-2xl border border-(--color-border) bg-(--color-bg-secondary)'
				)}>
				<table className="w-full min-w-[900px] text-sm">
					<thead>
						<tr className="text-left text-(--color-text-secondary) border-b border-(--color-border)">
							<th className="p-3">Животное</th>
							<th className="p-3">Статус</th>
							<th className="p-3">Характеристики</th>
							<th className="p-3">Ярлыки</th>
							<th className="p-3">Куратор</th>
							<th className="p-3">Действия</th>
						</tr>
					</thead>
					<tbody>
						{animals.map((animal) => (
							<tr key={animal.id} className="border-b border-(--color-border) last:border-0">
								<td className="p-3">
									<div className="flex items-center gap-3">
										<Link to={ROUTES.animalDetails.replace(':id', animal.id)}>
											<AnimalAvatar
												className="shrink-0"
												animal={animal}
												width={52}
												height={52}
												rounded
											/>
										</Link>
										<div>
											<Link
												to={ROUTES.animalDetails.replace(':id', animal.id)}
												className="font-semibold hover:underline">
												{animal.name}
											</Link>
											<div className="text-xs text-(--color-text-secondary)">
												<span>{AnimalSpeciesNames[animal.species]}</span> ·{' '}
												<span>{AnimalGenderNames[animal.gender]}</span> ·{' '}
												<span>{getAgeAtNow(animal.birthDate).years + ' г.'}</span>
											</div>
										</div>
									</div>
								</td>

								<td className="p-3">{renderStatusCell(animal)}</td>

								<td className="p-3">
									<Characteristics animal={animal} />
								</td>

								<td className="p-3">
									<div className="flex flex-wrap gap-1 max-w-md">
										{animal.labels?.length ? (
											animal.labels.map((label) => (
												<Badge color={label.color} key={label.id}>
													{label.name}
												</Badge>
											))
										) : (
											<span className="text-(--color-text-secondary)">—</span>
										)}
									</div>
								</td>

								<td className="p-3">
									{animal.curatorId ? (
										<Link
											to={ROUTES.user.replace(':id', animal.curatorId)}
											className="hover:underline text-xs">
											{findVolunteerName(volunteers, animal.curatorId)}
										</Link>
									) : (
										<span className="text-(--color-text-secondary)">Не назначен</span>
									)}
								</td>

								<td className="p-3">
									{canEdit(animal) ? (
										<Button
											type="button"
											className="mt-0 w-auto px-4 py-2"
											onClick={() => setEditingAnimal(animal)}>
											Редактировать
										</Button>
									) : (
										<span className="text-(--color-text-secondary)">Нет доступа</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div {...props} className={cn(className, 'md:hidden grid grid-cols-1 gap-3')}>
				{animals.map((animal) => (
					<div
						key={animal.id}
						className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 space-y-3">
						<div className="flex items-start gap-3">
							<Link to={ROUTES.animalDetails.replace(':id', animal.id)}>
								<AnimalAvatar animal={animal} width={74} height={74} rounded />
							</Link>
							<div className="flex-1">
								<Link
									to={ROUTES.animalDetails.replace(':id', animal.id)}
									className="font-semibold hover:underline">
									{animal.name}
								</Link>
								<p className="text-xs text-(--color-text-secondary)">
									{AnimalSpeciesNames[animal.species]} · {AnimalGenderNames[animal.gender]} ·{' '}
									{getAgeAtNow(animal.birthDate).years + ' г.'}
								</p>
								<div className="mt-2">{renderStatusCell(animal)}</div>
							</div>
						</div>
						<div className="text-xs text-(--color-text-secondary)">
							<p>
								Куратор:{' '}
								{animal.curatorId ? (
									<Link
										to={ROUTES.user.replace(':id', animal.curatorId)}
										className="hover:underline text-(--color-text-primary)">
										{findVolunteerName(volunteers, animal.curatorId)}
									</Link>
								) : (
									<span>Не назначен</span>
								)}
							</p>
							<p>
								Ярлыки:{' '}
								{animal.labels?.length
									? animal.labels.map((label) => label.name).join(', ')
									: 'Не назначены'}
							</p>
						</div>
						<Characteristics animal={animal} />
						{canEdit(animal) && (
							<Button type="button" className="mt-0 px-4 py-2" onClick={() => setEditingAnimal(animal)}>
								Редактировать
							</Button>
						)}
					</div>
				))}
			</div>
		</>
	);
};

const findVolunteerName = (volunteers: Array<{ id: string; name: string }>, id: string): string => {
	const volunteer = volunteers.find((item) => item.id === id);
	return volunteer?.name ?? id;
};
