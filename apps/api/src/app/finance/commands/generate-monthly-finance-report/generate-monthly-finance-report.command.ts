import { Command } from '@nestjs/cqrs';

export interface IGenerateMonthlyFinanceReportCommandResult {
	id: string;
	storageKey: string | null;
	reused: boolean;
}

export class GenerateMonthlyFinanceReportCommand extends Command<IGenerateMonthlyFinanceReportCommandResult> {
	constructor(
		public readonly year: number,
		public readonly month: number,
		public readonly forceRegenerate = false
	) {
		super();
	}
}
