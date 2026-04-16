import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { ClubOnboardingDialog } from './ClubOnboardingDialog';
import api from '@/services/api';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, backendUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Only fetch club settings when user is logged in and is an owner
  const { data: clubData, isLoading } = useQuery({
    queryKey: ['club-settings-onboarding'],
    queryFn: async () => {
      const response = await api.get('/settings/club');
      return response.data.data;
    },
    enabled: !!user && !!backendUser?.clubId,
    staleTime: 5 * 60 * 1000,
  });

  // Don't show anything while loading or if not logged in
  if (!user || !backendUser || isLoading || dismissed) {
    return <>{children}</>;
  }

  // Show onboarding if club hasn't completed it
  const needsOnboarding = clubData && !clubData.onboardingCompleted;

  return (
    <>
      {children}
      {needsOnboarding && (
        <ClubOnboardingDialog
          open={true}
          onComplete={() => setDismissed(true)}
          existingClubName={clubData?.clubName || clubData?.name || ''}
        />
      )}
    </>
  );
}
