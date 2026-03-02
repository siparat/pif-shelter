import { AnimalCoatEnum, AnimalGenderEnum, AnimalSizeEnum, AnimalSpeciesEnum, AnimalStatusEnum } from '@pif/shared';
import { boolean, date, index, jsonb, pgEnum, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './timestamps';

export const animalSpeciesEnum = pgEnum('animal_species', AnimalSpeciesEnum);
export const animalGenderEnum = pgEnum('animal_gender', AnimalGenderEnum);
export const animalSizeEnum = pgEnum('animal_size', AnimalSizeEnum);
export const animalStatusEnum = pgEnum('animal_status', AnimalStatusEnum);
export const animalCoatEnum = pgEnum('animal_coat', AnimalCoatEnum);

export const animalLabels = pgTable('animal_labels', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	color: text('color').notNull(),
	...timestamps
});

export const animals = pgTable(
	'animals',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull(),
		species: animalSpeciesEnum('species').notNull(),
		gender: animalGenderEnum('gender').notNull(),
		birthDate: date('birth_date').notNull(),
		size: animalSizeEnum('size').notNull(),
		coat: animalCoatEnum('coat').notNull(),
		color: text('color').notNull(),
		tags: jsonb('tags').$type<string[]>().default([]),
		description: text('description'),

		isSterilized: boolean('is_sterilized').default(false).notNull(),
		isVaccinated: boolean('is_vaccinated').default(false).notNull(),
		isParasiteTreated: boolean('is_parasite_treated').default(false).notNull(),

		avatarUrl: text('avatar_url'),
		galleryUrls: jsonb('gallery_urls').$type<string[]>().default([]),

		status: animalStatusEnum('status').default(AnimalStatusEnum.DRAFT).notNull(),
		...timestamps
	},
	(table) => [index('animals_name_idx').on(table.name), index('animals_description_idx').on(table.description)]
);

export const animalsToAnimalLabels = pgTable(
	'animals_to_animal_labels',
	{
		animalId: uuid('animal_id')
			.notNull()
			.references(() => animals.id, { onDelete: 'cascade' }),
		labelId: uuid('label_id')
			.notNull()
			.references(() => animalLabels.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.animalId, t.labelId] })]
);
