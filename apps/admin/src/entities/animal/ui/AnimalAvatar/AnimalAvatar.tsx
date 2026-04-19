import { AnimalSpeciesEnum } from '@pif/shared';
import { CatIcon, DogIcon, PawPrintIcon } from 'lucide-react';
import { ImgHTMLAttributes, JSX } from 'react';
import { cn, getMediaUrl } from '../../../../shared/lib';
import { AnimalItem } from '../../model/types';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
	animal: Pick<AnimalItem, 'avatarUrl' | 'name' | 'species'>;
	width?: number;
	height?: number;
	rounded?: boolean;
	fullUrl?: boolean;
}

export const AnimalAvatar = ({
	animal,
	className,
	width = 52,
	height = 52,
	rounded,
	fullUrl = false,
	...props
}: Props): JSX.Element => {
	if (animal.avatarUrl) {
		return (
			<div
				className={cn(className, rounded && 'rounded-[18%]', 'overflow-hidden bg-(--color-bg-primary)')}
				style={{ width, height }}>
				<img
					{...props}
					loading="lazy"
					src={!fullUrl ? getMediaUrl(animal.avatarUrl) : animal.avatarUrl}
					alt={animal.name}
					className={cn(className, `object-cover w-full h-full`)}
				/>
			</div>
		);
	}
	switch (animal.species) {
		case AnimalSpeciesEnum.DOG:
			return (
				<div
					className={cn(
						className,
						rounded && 'rounded-[18%]',
						'flex items-center justify-center overflow-hidden bg-(--color-bg-primary)'
					)}
					style={{ width, height }}>
					<DogIcon size={32} strokeWidth={1.5} />
				</div>
			);
		case AnimalSpeciesEnum.CAT:
			return (
				<div
					className={cn(
						className,
						rounded && 'rounded-[18%]',
						'flex items-center justify-center overflow-hidden bg-(--color-bg-primary)'
					)}
					style={{ width, height }}>
					<CatIcon size={32} strokeWidth={1.5} />
				</div>
			);
		default:
			return (
				<div
					className={cn(
						className,
						rounded && 'rounded-[18%]',
						'flex items-center justify-center overflow-hidden bg-(--color-bg-primary)'
					)}
					style={{ width, height }}>
					<PawPrintIcon size={32} strokeWidth={1.5} />
				</div>
			);
	}
};
