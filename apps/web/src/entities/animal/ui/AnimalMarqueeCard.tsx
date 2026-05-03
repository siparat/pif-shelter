import { formatAnimalAge } from '@pif/shared';
import { PawPrint } from 'lucide-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import { getMediaUrl } from '../../../shared/lib/get-media-url';
import { AnimalSummary } from '../model/types';

interface AnimalMarqueeCardProps {
	animal: AnimalSummary;
}

export const AnimalMarqueeCard = ({ animal }: AnimalMarqueeCardProps): JSX.Element => {
	const href = ROUTES.animalDetails.replace(':slug', animal.id);

	return (
		<Link to={href} className="group block w-[200px] shrink-0">
			<article className="w-full rounded-2xl overflow-hidden border border-white/10 transition-transform duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
				<div className="relative aspect-square overflow-hidden">
					{animal.avatarUrl ? (
						<img
							src={getMediaUrl(animal.avatarUrl)}
							alt={animal.name}
							loading="lazy"
							className="absolute inset-0 h-full w-full object-cover"
						/>
					) : (
						<div className="absolute inset-0 bg-white/10 flex items-center justify-center">
							<PawPrint size={40} className="text-white/30" strokeWidth={1.4} />
						</div>
					)}
					<div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent pt-8 pb-3 px-3">
						<p className="font-semibold text-white text-base leading-tight truncate">{animal.name}</p>
						<p className="text-sm text-white/70 leading-tight truncate">
							{animal.birthDate ? formatAnimalAge(animal.birthDate) : ''}
						</p>
					</div>
				</div>
			</article>
		</Link>
	);
};
