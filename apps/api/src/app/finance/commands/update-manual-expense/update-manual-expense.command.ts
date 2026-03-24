import { Command } from '@nestjs/cqrs';
import { UpdateManualExpenseRequestDto } from '@pif/contracts';
import { UserRole } from '@pif/shared';

export class UpdateManualExpenseCommand extends Command<{ id: string }> {
	constructor(
		public readonly dto: UpdateManualExpenseRequestDto,
		public readonly userId: string,
		public readonly userRole: UserRole
	) {
		super();
	}
}
