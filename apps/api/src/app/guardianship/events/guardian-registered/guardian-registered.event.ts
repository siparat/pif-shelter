import { AppAuth } from '../../../configs/auth.config';

export class GuardianRegisteredEvent {
	constructor(
		public user: AppAuth['$Infer']['Session']['user'],
		public password: string
	) {}
}
