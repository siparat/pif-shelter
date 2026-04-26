import { API_URL } from '../../../shared/config/api';

export const buildLedgerReceiptRedirectUrl = (ledgerEntryId: string): string => {
	return `${API_URL}/finance/public/monthly-ledger/receipts/${ledgerEntryId}`;
};
