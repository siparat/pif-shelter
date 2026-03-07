import { Guardianship } from '@pif/database';

export class GuardianshipCreatedEvent {
	constructor(public readonly guardianship: Guardianship) {}
}
