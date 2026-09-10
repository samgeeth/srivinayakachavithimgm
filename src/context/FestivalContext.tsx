import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SiteSettings,
  CommitteeMember,
  Volunteer,
  GalleryItem,
  Sponsor,
  ScheduleEvent,
  WorkUpdate,
  LiveUpdatePost,
  DonationRecord,
} from '../types';
import { DEFAULT_SITE_SETTINGS } from '../data/defaultSettings';
import {
  COMMITTEE_MEMBERS,
  VOLUNTEERS,
  GALLERY_ITEMS,
  SPONSORS,
  SCHEDULE_EVENTS,
  WORK_UPDATES,
  INITIAL_LIVE_UPDATES,
  INITIAL_DONATIONS,
} from '../data/mockData';
import { uploadImageToR2WithProgress } from '../lib/committeePhotos';

interface FestivalContextType {
  settings: SiteSettings;
  committee: CommitteeMember[];
  volunteers: Volunteer[];
  gallery: GalleryItem[];
  sponsors: Sponsor[];
  events: ScheduleEvent[];
  workUpdates: WorkUpdate[];
  livePosts: LiveUpdatePost[];
  donations: DonationRecord[];
  isLoading: boolean;
  isRefreshing: boolean;
  adminToken: string | null;
  isAdminLoggedIn: boolean;

  // Actions
  refreshAll: () => Promise<void>;
  loginAdmin: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<{ success: boolean; error?: string }>;
  saveCommitteeMember: (member: CommitteeMember) => Promise<{ success: boolean; error?: string }>;
  deleteCommitteeMember: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveVolunteer: (vol: Volunteer) => Promise<{ success: boolean; error?: string }>;
  deleteVolunteer: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveGalleryItem: (item: GalleryItem) => Promise<{ success: boolean; error?: string }>;
  deleteGalleryItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveSponsor: (sponsor: Sponsor) => Promise<{ success: boolean; error?: string }>;
  deleteSponsor: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveEvent: (event: ScheduleEvent) => Promise<{ success: boolean; error?: string }>;
  deleteEvent: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveWorkUpdate: (wu: WorkUpdate) => Promise<{ success: boolean; error?: string }>;
  deleteWorkUpdate: (id: string) => Promise<{ success: boolean; error?: string }>;
  addLivePost: (post: LiveUpdatePost) => Promise<{ success: boolean; error?: string }>;
  updateLivePost: (post: LiveUpdatePost) => Promise<{ success: boolean; error?: string }>;
  deleteLivePost: (id: string) => Promise<{ success: boolean; error?: string }>;
  reactToPost: (postId: string, reaction: string) => void;
  addDonation: (donation: DonationRecord) => Promise<{ success: boolean; error?: string }>;
  uploadImage: (file: File, category?: string, onProgress?: (pct: number) => void) => Promise<{ success: boolean; url?: string; error?: string }>;
}

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

const ADMIN_TOKEN_KEY = 'mvy_admin_session_token';

export const FestivalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [committee, setCommittee] = useState<CommitteeMember[]>(COMMITTEE_MEMBERS);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(VOLUNTEERS);
  const [gallery, setGallery] = useState<GalleryItem[]>(GALLERY_ITEMS);
  const [sponsors, setSponsors] = useState<Sponsor[]>(SPONSORS);
  const [events, setEvents] = useState<ScheduleEvent[]>(SCHEDULE_EVENTS);
  const [workUpdates, setWorkUpdates] = useState<WorkUpdate[]>(WORK_UPDATES);
  const [livePosts, setLivePosts] = useState<LiveUpdatePost[]>(INITIAL_LIVE_UPDATES);
  const [donations, setDonations] = useState<DonationRecord[]>(INITIAL_DONATIONS);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  // Fetch all content from Cloudflare Worker / D1 API
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
        if (Array.isArray(data.committee) && data.committee.length > 0) setCommittee(data.committee);
        if (Array.isArray(data.volunteers) && data.volunteers.length > 0) setVolunteers(data.volunteers);
        if (Array.isArray(data.gallery) && data.gallery.length > 0) setGallery(data.gallery);
        if (Array.isArray(data.sponsors) && data.sponsors.length > 0) setSponsors(data.sponsors);
        if (Array.isArray(data.events) && data.events.length > 0) setEvents(data.events);
        if (Array.isArray(data.workUpdates) && data.workUpdates.length > 0) setWorkUpdates(data.workUpdates);
        if (Array.isArray(data.posts) && data.posts.length > 0) setLivePosts(data.posts);
        if (Array.isArray(data.donations) && data.donations.length > 0) setDonations(data.donations);
      }
    } catch (err) {
      console.warn('Could not refresh dynamic content:', err);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  // Initial load & automatic refresh on focus
  useEffect(() => {
    refreshAll();

    const handleFocus = () => {
      refreshAll();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshAll]);

  // Sync dynamic SEO title and meta description
  useEffect(() => {
    if (settings.seoMetaTitle) {
      document.title = settings.seoMetaTitle;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings.seoMetaDescription) {
      metaDesc.setAttribute('content', settings.seoMetaDescription);
    }
  }, [settings.seoMetaTitle, settings.seoMetaDescription]);

  // Admin Auth Helpers
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
    return headers;
  }, [adminToken]);

  const loginAdmin = async (username: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setAdminToken(data.token);
        try {
          sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
          localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        } catch {}
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid username or password' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login request failed' };
    }
  };

  const logoutAdmin = () => {
    if (adminToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      }).catch(() => {});
    }
    setAdminToken(null);
    try {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {}
  };

  // Upload image to Cloudflare R2
  const uploadImage = async (
    file: File,
    category: string = 'general',
    onProgress?: (pct: number) => void
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    return uploadImageToR2WithProgress(file, category, onProgress);
  };

  // Settings Save
  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(merged),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to save settings' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error saving settings' };
    }
  };

  // Committee Member CRUD
  const saveCommitteeMember = async (member: CommitteeMember): Promise<{ success: boolean; error?: string }> => {
    setCommittee((prev) => {
      const exists = prev.some((m) => m.id === member.id);
      if (exists) {
        return prev.map((m) => (m.id === member.id ? member : m));
      }
      return [...prev, member];
    });

    try {
      const res = await fetch('/api/committee', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(member),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteCommitteeMember = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setCommittee((prev) => prev.filter((m) => m.id !== id));
    try {
      const res = await fetch(`/api/committee/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Volunteer CRUD
  const saveVolunteer = async (vol: Volunteer): Promise<{ success: boolean; error?: string }> => {
    setVolunteers((prev) => {
      const exists = prev.some((v) => v.id === vol.id);
      if (exists) {
        return prev.map((v) => (v.id === vol.id ? vol : v));
      }
      return [...prev, vol];
    });

    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(vol),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteVolunteer = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setVolunteers((prev) => prev.filter((v) => v.id !== id));
    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Gallery CRUD
  const saveGalleryItem = async (item: GalleryItem): Promise<{ success: boolean; error?: string }> => {
    setGallery((prev) => {
      const exists = prev.some((g) => g.id === item.id);
      if (exists) {
        return prev.map((g) => (g.id === item.id ? item : g));
      }
      return [item, ...prev];
    });

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteGalleryItem = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setGallery((prev) => prev.filter((g) => g.id !== id));
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Sponsor CRUD
  const saveSponsor = async (sponsor: Sponsor): Promise<{ success: boolean; error?: string }> => {
    setSponsors((prev) => {
      const exists = prev.some((s) => s.id === sponsor.id);
      if (exists) {
        return prev.map((s) => (s.id === sponsor.id ? sponsor : s));
      }
      return [...prev, sponsor];
    });

    try {
      const res = await fetch('/api/sponsors', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sponsor),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteSponsor = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setSponsors((prev) => prev.filter((s) => s.id !== id));
    try {
      const res = await fetch(`/api/sponsors/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Events CRUD
  const saveEvent = async (event: ScheduleEvent): Promise<{ success: boolean; error?: string }> => {
    setEvents((prev) => {
      const eventId = event.id || event.title;
      const exists = prev.some((e) => (e.id || e.title) === eventId);
      if (exists) {
        return prev.map((e) => ((e.id || e.title) === eventId ? event : e));
      }
      return [...prev, event];
    });

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(event),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteEvent = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setEvents((prev) => prev.filter((e) => (e.id || e.title) !== id));
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Work Updates CRUD
  const saveWorkUpdate = async (wu: WorkUpdate): Promise<{ success: boolean; error?: string }> => {
    setWorkUpdates((prev) => {
      const exists = prev.some((w) => w.id === wu.id);
      if (exists) {
        return prev.map((w) => (w.id === wu.id ? wu : w));
      }
      return [...prev, wu];
    });

    try {
      const res = await fetch('/api/work-updates', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(wu),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteWorkUpdate = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setWorkUpdates((prev) => prev.filter((w) => w.id !== id));
    try {
      const res = await fetch(`/api/work-updates/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Live Updates CRUD
  const addLivePost = async (post: LiveUpdatePost): Promise<{ success: boolean; error?: string }> => {
    setLivePosts((prev) => [post, ...prev]);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(post),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateLivePost = async (post: LiveUpdatePost): Promise<{ success: boolean; error?: string }> => {
    setLivePosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(post),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteLivePost = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setLivePosts((prev) => prev.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const reactToPost = (postId: string, reactionType: string) => {
    setLivePosts((prev) => {
      const updated = prev.map((post) => {
        if (post.id === postId) {
          const currentCount = post.reactions[reactionType as keyof typeof post.reactions] || 0;
          const updatedPost: LiveUpdatePost = {
            ...post,
            reactions: {
              ...post.reactions,
              [reactionType]: currentCount + 1,
            },
          };
          fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedPost),
          }).catch(() => {});
          return updatedPost;
        }
        return post;
      });
      return updated;
    });
  };

  // Donations CRUD
  const addDonation = async (donation: DonationRecord): Promise<{ success: boolean; error?: string }> => {
    setDonations((prev) => [donation, ...prev]);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donation),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const value: FestivalContextType = {
    settings,
    committee,
    volunteers,
    gallery,
    sponsors,
    events,
    workUpdates,
    livePosts,
    donations,
    isLoading,
    isRefreshing,
    adminToken,
    isAdminLoggedIn: Boolean(adminToken),

    refreshAll,
    loginAdmin,
    logoutAdmin,
    updateSettings,
    saveCommitteeMember,
    deleteCommitteeMember,
    saveVolunteer,
    deleteVolunteer,
    saveGalleryItem,
    deleteGalleryItem,
    saveSponsor,
    deleteSponsor,
    saveEvent,
    deleteEvent,
    saveWorkUpdate,
    deleteWorkUpdate,
    addLivePost,
    updateLivePost,
    deleteLivePost,
    reactToPost,
    addDonation,
    uploadImage,
  };

  return <FestivalContext.Provider value={value}>{children}</FestivalContext.Provider>;
};

export const useFestivalData = (): FestivalContextType => {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error('useFestivalData must be used within a FestivalProvider');
  }
  return context;
};
