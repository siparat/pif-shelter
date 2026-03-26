export class GenerateMonthlyPublicXlsxReportJob {
	constructor(
		public readonly year?: number,
		public readonly month?: number
	) {}
}
