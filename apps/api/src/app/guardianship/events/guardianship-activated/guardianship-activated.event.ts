import { Guardianship } from '@pif/database';

export class GuardianshipActivatedEvent {
	constructor(public readonly guardianship: Guardianship) {}
}
