import { GetGuardianProfileResult } from '@pif/contracts';

export type GuardianProfileData = GetGuardianProfileResult['data'];
export type GuardianProfileUser = GuardianProfileData['user'];
export type GuardianProfileStats = GuardianProfileData['stats'];
export type GuardianProfileGuardianship = GuardianProfileData['guardianships'][number];
