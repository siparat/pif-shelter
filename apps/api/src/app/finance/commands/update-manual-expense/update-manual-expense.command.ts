import { Command } from '@nestjs/cqrs';
import { UserRole } from '@pif/shared';
import { UpdateManualExpenseRequestDto } from '../../../core/dto';

export class UpdateManualExpenseCommand extends Command<{ id: string }> {
	constructor(
		public readonly dto: UpdateManualExpenseRequestDto,
		public readonly userId: string,
		public readonly userRole: UserRole
	) {
		super();
	}
}
