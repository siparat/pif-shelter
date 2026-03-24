import { Injectable, UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class RecordLedgerIncomePolicy {
	assertCanRecord(grossAmount: number, feeAmount: number, netAmount: number): void {
		if (grossAmount < 0 || feeAmount < 0 || netAmount < 0) {
			throw new UnprocessableEntityException('Суммы проводки не могут быть отрицательными');
		}

		if (grossAmount !== feeAmount + netAmount) {
			throw new UnprocessableEntityException('grossAmount должен быть равен feeAmount + netAmount');
		}
	}
}
