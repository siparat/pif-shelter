import { LedgerEntryDirectionEnum, LedgerEntrySourceEnum } from '@pif/shared';

export const LEDGER_SOURCE_LABEL: Record<LedgerEntrySourceEnum, string> = {
	[LedgerEntrySourceEnum.DONATION_ONE_OFF]: 'Разовый донат',
	[LedgerEntrySourceEnum.DONATION_SUBSCRIPTION]: 'Донат-подписка',
	[LedgerEntrySourceEnum.GUARDIANSHIP]: 'Опекунство',
	[LedgerEntrySourceEnum.MANUAL_EXPENSE]: 'Ручной расход'
};

export const LEDGER_DIRECTION_LABEL: Record<LedgerEntryDirectionEnum, string> = {
	[LedgerEntryDirectionEnum.INCOME]: 'Приход',
	[LedgerEntryDirectionEnum.EXPENSE]: 'Расход'
};
