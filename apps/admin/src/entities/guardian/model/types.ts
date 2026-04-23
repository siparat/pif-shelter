import { GetGuardianProfileResult, ListGuardianReportsItem, ListGuardianReportsResult } from '@pif/contracts';

export type GuardianProfileData = GetGuardianProfileResult['data'];
export type GuardianProfileUser = GuardianProfileData['user'];
export type GuardianProfileStats = GuardianProfileData['stats'];
export type GuardianProfileGuardianship = GuardianProfileData['guardianships'][number];

export type GuardianReportItem = ListGuardianReportsItem;
export type GuardianReportsPage = {
	data: GuardianReportItem[];
	meta: ListGuardianReportsResult['meta'];
};
