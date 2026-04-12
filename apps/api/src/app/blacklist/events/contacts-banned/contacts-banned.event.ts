import { BanContactsRequestDto } from '@pif/contracts';

export class ContactsBannedEvent {
	constructor(
		public readonly dto: BanContactsRequestDto,
		public readonly moderatorId: string
	) {}
}
