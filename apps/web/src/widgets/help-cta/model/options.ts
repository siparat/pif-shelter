import { FC, SVGProps } from 'react';
import AdoptIcon from '../ui/icons/adopt.svg?react';
import DonationsIcon from '../ui/icons/donations.svg?react';
import GuardianshipIcon from '../ui/icons/guardianship.svg?react';
import VolunteerIcon from '../ui/icons/volunteer.svg?react';
import WishIcon from '../ui/icons/wish.svg?react';
import { ROUTES } from '../../../shared/config/routes';

export type HelpOption = {
	id: string;
	title: string;
	description: string;
	href: string;
	icon: FC<SVGProps<SVGSVGElement>>;
	highlighted?: boolean;
};

export const helpOptions: HelpOption[] = [
	{
		id: 'adopt',
		title: 'Возьми друга из приюта',
		description:
			'Каждый хвостик мечтает о доме. Усыновив питомца, вы не только спасаете жизнь, но и освобождаете место для нового спасённого животного',
		href: ROUTES.animals,
		icon: AdoptIcon,
		highlighted: true
	},
	{
		id: 'guardian',
		title: 'Стань опекуном',
		description:
			'Если не можете забрать питомца домой — помогите ему дистанционно. Оплата кормов или лечения делает жизнь конкретного животного лучше',
		href: ROUTES.guardianship,
		icon: GuardianshipIcon
	},
	{
		id: 'goods',
		title: 'Помоги вещами и кормом',
		description:
			'Приюту ежедневно нужны корма, лекарства, миски, подстилки, стройматериалы. Любая переданная вещь помогает выжить',
		href: ROUTES.donations + '?section=items',
		icon: WishIcon
	},
	{
		id: 'donate',
		title: 'Сделай пожертвование',
		description:
			'Даже 50 рублей — это шанс вылечить, накормить или обогреть хвостика. Все средства идут только на нужды животных',
		href: ROUTES.donations,
		icon: DonationsIcon
	},
	{
		id: 'volunteer',
		title: 'Стань волонтёром',
		description:
			'Погуляй с собакой, помоги на территории, подмени сотрудников. Это реальная помощь, без которой приют не справится',
		href: '#',
		icon: VolunteerIcon
	}
];

export const helpCircles = [
	{ id: 'c1', src: '/cta-animal-1.png', alt: 'Собаки в приюте' },
	{ id: 'c2', src: '/cta-animal-2.png', alt: 'Кошка даёт лапу' },
	{ id: 'c3', src: '/cta-animal-3.png', alt: 'Собаки бегут' },
	{ id: 'c4', src: '/cta-animal-4.png', alt: 'Кот в приюте' }
];
