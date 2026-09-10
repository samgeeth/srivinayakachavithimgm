export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  category: 'core' | 'coordinator' | 'lead';
  phone: string;
  image: string;
  village: string;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface WorkUpdate {
  id: string;
  day: number;
  title: string;
  date: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Scheduled';
  progress: number;
  photos: string[];
  lead: string;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface LiveUpdatePost {
  id: string;
  author: string;
  role: string;
  title: string;
  content: string;
  timestamp: string;
  tag: 'Announcement' | 'Pooja' | 'Work' | 'Cultural' | 'Prasadam' | 'Important';
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  reactions: {
    pranam: number;
    heart: number;
    fire: number;
  };
  isPublished?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Festival' | 'Preparation' | 'Committee' | 'Volunteers' | 'Decoration' | 'Lighting' | 'Pooja' | 'Crowd';
  imageUrl: string;
  description: string;
  year?: string;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface Sponsor {
  id: string;
  name: string;
  company: string;
  tier: 'Title Sponsor' | 'Platinum' | 'Gold' | 'Silver' | 'Community Patron';
  contribution: string;
  amount?: string;
  logo: string;
  logoImageUrl?: string;
  message?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  village: string;
  amount: number;
  paymentMethod: 'UPI / PhonePe' | 'Google Pay' | 'Paytm' | 'Bank Transfer' | 'Cash / Offline';
  date: string;
  time: string;
  status: 'Verified' | 'Pending Verification';
  receiptNo: string;
  message?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  responsibility: string;
  phone: string;
  image: string;
  wing: string;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface ScheduleEvent {
  id?: string;
  time: string;
  title: string;
  description: string;
  venue: string;
  category: 'Pooja' | 'Annadanam' | 'Cultural' | 'Procession';
  isPublished?: boolean;
  sortOrder?: number;
}

export interface SiteSettings {
  festivalTitle: string;
  festivalTheme: string;
  festivalYear: string;
  festivalDate: string; // ISO date string e.g. "2026-09-14T08:00:00"
  festivalEndDate: string; // e.g. "2026-09-24T23:59:59"
  heroTitle: string;
  heroSubtitle: string;
  heroPosterUrl: string;
  heroVideoUrl: string;
  logoUrl?: string;
  livestreamUrl?: string;
  bannerActive: boolean;
  bannerText: string;
  bannerLink: string;
  aboutHeading: string;
  aboutDescription: string;
  aboutHistory: string;
  aboutPurpose: string;
  aboutCelebration: string;
  aboutImportance: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactMapsUrl: string;
  helplinePhone?: string;
  whatsappNumber?: string;
  officialEmail?: string;
  mandapamAddress?: string;
  upiId?: string;
  whatsappGroupUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoOgImage: string;
  seoKeywords: string;
  idolHeight: string;
  dailyFeastsCount: string;
  mandapamLocation: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'superadmin' | 'editor';
}

export interface AdminSession {
  token: string;
  username: string;
  expiresAt: number;
}

