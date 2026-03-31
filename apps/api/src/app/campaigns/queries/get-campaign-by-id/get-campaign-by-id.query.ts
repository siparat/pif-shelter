import { Query } from '@nestjs/cqrs';
import { animals, campaigns } from '@pif/database';

export type CampaignDetails = typeof campaigns.$inferSelect & {
	animal: Pick<typeof animals.$inferSelect, 'id' | 'name' | 'avatarUrl' | 'gender' | 'status' | 'species'> | null;
};

export class GetCampaignByIdQuery extends Query<CampaignDetails> {
	constructor(public readonly id: string) {
		super();
	}
}
