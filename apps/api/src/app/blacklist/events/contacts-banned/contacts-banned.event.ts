import { BanContactsRequestDto } from '../../../core/dto';

export class ContactsBannedEvent {
	constructor(
		public readonly dto: BanContactsRequestDto,
		public readonly moderatorId: string
	) {}
}
