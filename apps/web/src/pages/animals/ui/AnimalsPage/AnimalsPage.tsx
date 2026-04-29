import { JSX } from 'react';
import { AnimalCard } from '../../../../entities/animal';
import { AnimalCoatEnum, AnimalGenderEnum, AnimalSizeEnum, AnimalSpeciesEnum, AnimalStatusEnum } from '@pif/shared';

const AnimalsPage = (): JSX.Element => {
	return (
		<div>
			<AnimalCard
				animal={{
					id: '57ab85ff-0d39-4359-a837-898bb4bd7e18',
					name: 'Мурзик',
					species: AnimalSpeciesEnum.CAT,
					gender: AnimalGenderEnum.MALE,
					birthDate: '2022-09-12',
					size: AnimalSizeEnum.MEDIUM,
					coat: AnimalCoatEnum.MEDIUM,
					color: 'Дефолтный',
					tags: [],
					description:
						'ФЫва\nыва\nыв\nаыв\nа\nыва\n авфываываываыв\nаыв\nаываываываываываыв\nаыв\nаыв\nа\nываролиывилроатрлоыфлор ФЫва\nыва\nыв\nаыв\nа\nыва\n авфываываываыв\nаыв\nаываываываываываыв\nаыв\nаыв\nа\nываролиывилроатрлоыфлор ФЫва\nыва\nыв\nаыв\nа\nыва\n авфываываываыв\nаыв\nаываываываываываыв\nаыв\nаыв\nа\nываролиывилроатрлоыфлор ФЫва\nыва\nыв\nаыв\nа\nыва\n авфываываываыв\nаыв\nаываываываываываыв\nаыв\nаыв\nа\nываролиывилроатрлоыфлор',
					isSterilized: true,
					isVaccinated: true,
					isParasiteTreated: false,
					avatarUrl: 'animals/a558b6e6-d4f8-4db1-ae8c-cb182e347740.jpg',
					galleryUrls: [
						'animals/58f4ef90-87d1-4fce-a295-808ab10ceb47.png',
						'animals/65d15dd5-ecc3-4c20-a00f-e97d5290d6e9.png',
						'animals/c9a9d9f7-820e-47a0-b307-a962138429ad.jpg',
						'animals/2640e3fe-b455-4f20-89d0-7bf12dc4cf41.png',
						'animals/74326617-5651-479c-91b1-8b3cc8dbad30.png'
					],
					status: AnimalStatusEnum.PUBLISHED,
					costOfGuardianship: 1200,
					curatorId: 'Ay0UB3Q4gLqs030IR90oxBgQDvfYkSLH',
					createdAt: '2026-04-29T16:53:01.463Z',
					updatedAt: '2026-04-29T16:54:55.149Z',
					deletedAt: null,
					labels: [
						{
							id: 'a37bcdd8-7d2e-48b7-9c06-46cba80c48a5',
							name: 'Белый',
							color: '#ffffff'
						},
						{
							id: 'b1ef090c-9d8a-4938-9f41-d41840acb74b',
							name: 'Темный',
							color: '#474747'
						},
						{
							id: 'e50675d3-08bf-4ca8-bbee-32b2754db6c0',
							name: 'Красный',
							color: '#f04242'
						},
						{
							id: '232e82f1-7a45-407c-bc99-9e5c841fcf17',
							name: 'Желтый',
							color: '#c0c22e'
						},
						{
							id: 'ecd72f70-4f43-4c82-97f8-5fc1ebe3f696',
							name: 'Зеленый',
							color: '#23e75d'
						}
					]
				}}
			/>
		</div>
	);
};

export default AnimalsPage;
