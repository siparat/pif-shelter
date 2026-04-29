import { JSX, createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useTeamQuery } from '../../../entities/team';
import { VolunteerInviteModal } from '../ui/VolunteerInviteModal';

type VolunteerInviteContextValue = {
	open: () => void;
};

const VolunteerInviteContext = createContext<VolunteerInviteContextValue | null>(null);

export const VolunteerInviteProvider = ({ children }: { children: ReactNode }): JSX.Element => {
	const [open, setOpen] = useState(false);
	const { data: teamMembers = [] } = useTeamQuery();

	const close = useCallback(() => setOpen(false), []);
	const openModal = useCallback(() => setOpen(true), []);

	const value = useMemo(() => ({ open: openModal }), [openModal]);

	return (
		<VolunteerInviteContext.Provider value={value}>
			{children}
			<VolunteerInviteModal open={open} onClose={close} teamMembers={teamMembers} />
		</VolunteerInviteContext.Provider>
	);
};

export const useVolunteerInvite = (): VolunteerInviteContextValue => {
	const ctx = useContext(VolunteerInviteContext);
	if (!ctx) {
		throw new Error('useVolunteerInvite must be used within VolunteerInviteProvider');
	}
	return ctx;
};
