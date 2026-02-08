import { defineRelations } from 'drizzle-orm';
import { boolean, date, jsonb, pgEnum, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './timestamps';

export const animalSpeciesEnum = pgEnum('animal_species', ['DOG', 'CAT']);
export const animalGenderEnum = pgEnum('animal_gender', ['MALE', 'FEMALE']);
export const animalSizeEnum = pgEnum('animal_size', ['SMALL', 'MEDIUM', 'LARGE']);
export const animalStatusEnum = pgEnum('animal_status', [
	'DRAFT',
	'PUBLISHED',
	'ON_TREATMENT',
	'ON_PROBATION',
	'ADOPTED',
	'RAINBOW'
]);
export const animalCoatEnum = pgEnum('animal_coat', ['SHORT', 'MEDIUM', 'LONG', 'WIRE', 'CURLY', 'HAIRLESS']);

export const labels = pgTable('labels', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	color: text('color').notNull(),
	...timestamps
});

export const animals = pgTable('animals', {
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

	status: animalStatusEnum('status').default('DRAFT').notNull(),
	...timestamps
});

export const animalsToLabels = pgTable(
	'animals_to_labels',
	{
		animalId: uuid('animal_id')
			.notNull()
			.references(() => animals.id, { onDelete: 'cascade' }),
		labelId: uuid('label_id')
			.notNull()
			.references(() => labels.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.animalId, t.labelId] })]
);

export const animalsRelations = defineRelations(
	{
		labels,
		animals,
		animalsToLabels
	},
	(r) => ({
		animals: {
			labels: r.many.labels({
				from: r.animals.id.through(r.animalsToLabels.animalId),
				to: r.labels.id.through(r.animalsToLabels.labelId)
			})
		},
		labels: {
			animals: r.many.animals({
				from: r.labels.id.through(r.animalsToLabels.labelId),
				to: r.animals.id.through(r.animalsToLabels.animalId)
			})
		}
	})
);
