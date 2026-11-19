import { api } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSessionScope } from './useSessionScope';

export type Story = {
  id: string;
  userId: string;
  userName: string;
  userAvatarUri: string | null;
  mediaUri: string;
  createdAt: number;
};

export type MyProfile = {
  userId: string | null;
  userName: string;
  userAvatarUri: string | null;
};

type SeenByUserMap = Record<string, number>; // userId -> lastSeenCreatedAt

type StoriesContextValue = {
  stories: Story[];
  myProfile: MyProfile;
  seenByUser: SeenByUserMap;
  isStoryViewerOpen: boolean;
  setStoryViewerOpen: (open: boolean) => void;
  isStorySeen: (story: Story) => boolean;
  markStorySeen: (story: Story) => Promise<void>;
  refreshStories: () => Promise<void>;
  refreshMyProfile: () => Promise<void>;
  addStory: (mediaUri: string) => Promise<{ uploaded: boolean }>;
};

const StoriesContext = createContext<StoriesContextValue | undefined>(undefined);

const DEFAULT_PROFILE: MyProfile = {
  userId: null,
  userName: 'Você',
  userAvatarUri: null,
};

export const StoriesProvider = ({ children, sessionUserId }: { children: React.ReactNode; sessionUserId: string | null }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [myProfile, setMyProfile] = useState<MyProfile>(DEFAULT_PROFILE);
  const [seenByUser, setSeenByUser] = useState<SeenByUserMap>({});
  const [isStoryViewerOpen, setStoryViewerOpen] = useState(false);
  const scope = useSessionScope(sessionUserId);

  useEffect(() => {
    const generation = scope.current;
    if (!sessionUserId) return;
    const loadSeen = async () => {
      try {
        const raw = await AsyncStorage.getItem('storiesSeenByUser');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (generation === scope.current && parsed && typeof parsed === 'object') {
          setSeenByUser(parsed as SeenByUserMap);
        }
      } catch {
        // no-op
      }
    };
    loadSeen();
  }, [scope, sessionUserId]);

  const refreshMyProfile = useCallback(async () => {
    const generation = scope.current;
    const userId = sessionUserId;
    if (!userId) {
      setMyProfile(DEFAULT_PROFILE);
      return;
    }
    try {
      const { data } = await api.get(`/usuarios/${userId}`);
      if (generation === scope.current) {
        setMyProfile({
          userId,
          userName: data?.nome || 'Você',
          userAvatarUri: data?.foto || null,
        });
      }
    } catch {
      if (generation === scope.current) {
        setMyProfile({
          userId,
          userName: 'Você',
          userAvatarUri: null,
        });
      }
    }
  }, [scope, sessionUserId]);

  const refreshStories = useCallback(async () => { setStories([]); }, []);

  useEffect(() => {
    setStories([]);
    setMyProfile(DEFAULT_PROFILE);
    setSeenByUser({});
    setStoryViewerOpen(false);
    void refreshMyProfile();
    void refreshStories();
  }, [refreshMyProfile, refreshStories]);

  const isStorySeen = useCallback((story: Story) => {
    const lastSeen = seenByUser[story.userId] ?? 0;
    return lastSeen >= story.createdAt;
  }, [seenByUser]);

  const markStorySeen = useCallback(async (story: Story) => {
    if (!sessionUserId) return;
    const generation = scope.current;
    setSeenByUser((prev) => {
      if (generation !== scope.current) return prev;
      const current = prev[story.userId] ?? 0;
      const nextValue = Math.max(current, story.createdAt);
      if (nextValue === current) return prev;
      const next: SeenByUserMap = { ...prev, [story.userId]: nextValue };
      AsyncStorage.setItem('storiesSeenByUser', JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, [scope, sessionUserId]);

  const addStory = async (mediaUri: string): Promise<{ uploaded: boolean }> => {
    throw new Error('Stories ainda não estão disponíveis nesta versão.');
  };

  const value = useMemo(
    () => ({
      stories,
      myProfile,
      seenByUser,
      isStoryViewerOpen,
      setStoryViewerOpen,
      isStorySeen,
      markStorySeen,
      refreshStories,
      refreshMyProfile,
      addStory,
    }),
    [stories, myProfile, seenByUser, isStoryViewerOpen, refreshMyProfile, refreshStories, isStorySeen, markStorySeen]
  );

  return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
};

export const useStories = () => {
  const ctx = useContext(StoriesContext);
  if (!ctx) throw new Error('useStories must be used within StoriesProvider');
  return ctx;
};
