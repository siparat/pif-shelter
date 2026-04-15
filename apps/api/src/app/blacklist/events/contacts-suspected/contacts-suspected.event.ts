import { SuspectContactsRequestDto } from '../../../core/dto';

export class ContactsSuspectedEvent {
	constructor(
		public readonly dto: SuspectContactsRequestDto,
		public readonly moderatorId: string
	) {}
}
