import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import {
  ClubSettings,
  UpdateClubSettingsData,
  UserProfile,
  UpdateUserProfileData,
  Subscription,
} from '@/types';

// Transform backend club data to frontend format
const transformClubSettings = (data: any): ClubSettings => ({
  id: data._id || data.id,
  clubName: data.clubName || data.name || '',
  address: data.address || '',
  phoneNumber: data.phoneNumber || '',
  email: data.email || '',
  logoUrl: data.logoUrl || '',
  sport: data.sport || '',
  currency: data.currency || 'RSD',
  onboardingCompleted: data.onboardingCompleted || false,
  description: data.description || '',
  foundedYear: data.foundedYear || '',
  stadium: data.stadium || '',
  clubColors: data.clubColors || '',
  history: data.history || '',
  achievements: data.achievements || '',
  website: data.website || '',
  facebook: data.facebook || '',
  instagram: data.instagram || '',
  twitter: data.twitter || '',
});

// Fetch club settings
export const useClubSettings = () => {
  return useQuery({
    queryKey: ['club-settings'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: any }>('/settings/club');
      return transformClubSettings(response.data.data);
    },
  });
};

// Update club settings
export const useUpdateClubSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateClubSettingsData) => {
      // Transform frontend data to backend format
      const backendData: any = {};
      if (data.clubName !== undefined) backendData.name = data.clubName;
      if (data.address !== undefined) backendData.address = data.address;
      if (data.phoneNumber !== undefined) backendData.phoneNumber = data.phoneNumber;
      if (data.email !== undefined) backendData.email = data.email;
      if (data.logoUrl !== undefined) backendData.logoUrl = data.logoUrl;
      if (data.sport !== undefined) backendData.sport = data.sport;
      if (data.currency !== undefined) backendData.currency = data.currency;
      if (data.onboardingCompleted !== undefined) backendData.onboardingCompleted = data.onboardingCompleted;
      if (data.description !== undefined) backendData.description = data.description;
      if (data.foundedYear !== undefined) backendData.foundedYear = data.foundedYear;
      if (data.stadium !== undefined) backendData.stadium = data.stadium;
      if (data.clubColors !== undefined) backendData.clubColors = data.clubColors;
      if (data.history !== undefined) backendData.history = data.history;
      if (data.achievements !== undefined) backendData.achievements = data.achievements;
      if (data.website !== undefined) backendData.website = data.website;
      if (data.facebook !== undefined) backendData.facebook = data.facebook;
      if (data.instagram !== undefined) backendData.instagram = data.instagram;
      if (data.twitter !== undefined) backendData.twitter = data.twitter;

      const response = await api.put<{ success: boolean; data: any }>('/settings/club', backendData);
      return transformClubSettings(response.data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-settings'] });
    },
  });
};

// Transform backend user data to frontend format
const transformUserProfile = (data: any): UserProfile => ({
  id: data._id || data.id,
  fullName: data.fullName || '',
  email: data.email || '',
  phoneNumber: data.phoneNumber || '',
  profileImage: data.profileImage,
  role: data.role,
});

// Fetch user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: any }>('/settings/profile');
      return transformUserProfile(response.data.data);
    },
  });
};

// Update user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserProfileData) => {
      const response = await api.put<{ success: boolean; data: any }>('/settings/profile', data);
      return transformUserProfile(response.data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};

// Transform backend subscription data to frontend format
const transformSubscription = (data: any): Subscription => ({
  plan: data.plan || 'FREE',
  memberLimit: data.memberLimit || 50,
  currentMembersCount: data.currentMembers || 0,
  validUntil: data.validUntil,
});

// Fetch subscription info
export const useSubscription = () => {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: any }>('/settings/subscription');
      return transformSubscription(response.data.data);
    },
  });
};
