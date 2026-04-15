import { animalWithLabelsSchema } from '../common/schemas';

export const animalSummarySchema = animalWithLabelsSchema.omit({
	description: true,
	galleryUrls: true
});
