import { Command } from '@nestjs/cqrs';
import { UserRole } from '@pif/shared';

export class DeleteManualExpenseCommand extends Command<{ success: true }> {
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public readonly userRole: UserRole
	) {
		super();
	}
}
