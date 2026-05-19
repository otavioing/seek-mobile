import { api } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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

export const StoriesProvider = ({ children }: { children: React.ReactNode }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [myProfile, setMyProfile] = useState<MyProfile>(DEFAULT_PROFILE);
  const [seenByUser, setSeenByUser] = useState<SeenByUserMap>({});
  const [isStoryViewerOpen, setStoryViewerOpen] = useState(false);

  useEffect(() => {
    refreshMyProfile();
    refreshStories();
  }, []);

  useEffect(() => {
    const loadSeen = async () => {
      try {
        const raw = await AsyncStorage.getItem('storiesSeenByUser');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setSeenByUser(parsed as SeenByUserMap);
        }
      } catch {
        // no-op
      }
    };
    loadSeen();
  }, []);

  const refreshMyProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setMyProfile(DEFAULT_PROFILE);
        return;
      }

      try {
        const { data } = await api.get(`/usuarios/foto-perfil/${userId}`);
        setMyProfile({
          userId,
          userName: data?.nome || 'Você',
          userAvatarUri: data?.foto || null,
        });
      } catch (e) {
        setMyProfile({
          userId,
          userName: 'Você',
          userAvatarUri: null,
        });
      }
    } catch {
      setMyProfile(DEFAULT_PROFILE);
    }
  };

  const fetchProfile = async (userId: string): Promise<MyProfile> => {
    try {
      const { data } = await api.get(`/usuarios/foto-perfil/${userId}`);
      return {
        userId,
        userName: data?.nome || 'Você',
        userAvatarUri: data?.foto || null,
      };
    } catch {
      return {
        userId,
        userName: 'Você',
        userAvatarUri: null,
      };
    }
  };

  const refreshStories = async () => {
    try {
      const resp = await api.get('/stories');
      const normalized: Story[] = (resp.data || []).map((s: any) => ({
        id: String(s.id ?? `${s.user_id}-${s.criado_em ?? Date.now()}`),
        userId: String(s.user_id ?? s.userId ?? ''),
        userName: s.user?.nome || s.userName || 'Usuário',
        userAvatarUri: s.user?.foto || s.userAvatarUri || null,
        mediaUri: s.media || s.midia || s.url || s.mediaUri,
        createdAt: s.criado_em ? new Date(s.criado_em).getTime() : (s.createdAt ?? Date.now()),
      }))
        .filter((s: Story) => Boolean(s.mediaUri));

      setStories((prev) => {
        // Não descarta stories antigos: mantém o que já foi carregado e mescla com a resposta atual.
        // Isso evita ficar só com 1 story quando o backend retorna apenas o mais recente.
        const merged = [...prev, ...normalized];
        const uniq = new Map<string, Story>();
        for (const st of merged) {
          const key = `${st.userId}-${st.createdAt}-${st.mediaUri}`;
          uniq.set(key, st);
        }
        return Array.from(uniq.values()).sort((a, b) => b.createdAt - a.createdAt);
      });
    } catch {
      // Sem backend de stories: mantém apenas locais
    }
  };

  const isStorySeen = (story: Story) => {
    const lastSeen = seenByUser[story.userId] ?? 0;
    return lastSeen >= story.createdAt;
  };

  const markStorySeen = async (story: Story) => {
    setSeenByUser((prev) => {
      const current = prev[story.userId] ?? 0;
      const nextValue = Math.max(current, story.createdAt);
      if (nextValue === current) return prev;
      const next: SeenByUserMap = { ...prev, [story.userId]: nextValue };
      AsyncStorage.setItem('storiesSeenByUser', JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };

  const addStory = async (mediaUri: string): Promise<{ uploaded: boolean }> => {
    const userId = (await AsyncStorage.getItem('userId')) || 'me';

    let userName = myProfile.userName || 'Você';
    let userAvatarUri = myProfile.userAvatarUri;

    if (userId && userId !== 'me' && myProfile.userId !== userId) {
      const fetched = await fetchProfile(userId);
      userName = fetched.userName;
      userAvatarUri = fetched.userAvatarUri;
      setMyProfile(fetched);
    }

    const localStory: Story = {
      id: `local-${userId}-${Date.now()}`,
      userId,
      userName,
      userAvatarUri,
      mediaUri,
      createdAt: Date.now(),
    };

    setStories((prev) => [localStory, ...prev]);

    try {
      const ext = (mediaUri.split('?')[0].split('#')[0].split('.').pop() || '').toLowerCase();
      const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'heic' || ext === 'heif' ? 'image/heic' : 'image/jpeg';
      const filename = ext ? `story.${ext}` : 'story.jpg';

      const form = new FormData();
      form.append('user_id', String(userId));
      form.append('userId', String(userId));

      const filePayload = {
        uri: mediaUri,
        name: filename,
        type: mime,
      } as any;

      // Alguns backends usam "arquivo", outros "imagem".
      form.append('arquivo', filePayload);
      form.append('imagem', filePayload);

      const UPLOAD_TIMEOUT_MS = 20000;
      await Promise.race([
        api.post('/stories', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: UPLOAD_TIMEOUT_MS,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('STORY_UPLOAD_TIMEOUT')), UPLOAD_TIMEOUT_MS)
        ),
      ]);

      setStories((prev) => prev.filter((s) => s.id !== localStory.id));
      await refreshStories();
      return { uploaded: true };
    } catch {
      // fallback: story fica apenas local
      return { uploaded: false };
    }
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
    [stories, myProfile, seenByUser, isStoryViewerOpen]
  );

  return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
};

export const useStories = () => {
  const ctx = useContext(StoriesContext);
  if (!ctx) throw new Error('useStories must be used within StoriesProvider');
  return ctx;
};
