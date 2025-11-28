

export enum Sentiment {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
  TOXIC = 'TOXIC'
}

export type AppView = 'login' | 'chats' | 'contacts' | 'moments' | 'trending' | 'settings' | 'profile' | 'compose' | 'chat';

export type TrendingCategory = 'all' | 'tech' | 'lifestyle' | 'entertainment' | 'finance';

export type MediaType = 'text' | 'image' | 'video' | 'audio' | 'sticker' | 'transfer' | 'dice' | 'rps' | 'share_card';

export type ShareWallFilter = 'news' | 'friends' | 'mine';

export interface Comment {
  id: string;
  userId: string;
  user: {
    name: string;
    handle: string;
    avatar: string;
    isVerified: boolean;
  };
  content: string;
  timestamp: number;
  qualityScore: number;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
  points: number;
  postsToday: number;
  actionsToday: number; 
  commentsToday: number;
  maxPostsPerDay: number;
  maxActionsPerDay: number;
  maxCommentsPerDay: number;
  isVerified: boolean;
  verifiedBy?: 'passport' | 'driver_license' | 'social_link';
  deviceName: string;
  location: string;
  newsRegion: string; // 'Global', 'US', 'CN', 'JP', etc.
  networkType?: string;
  blockedUserIds: string[];
  interests: Record<string, number>;
  lastLogin?: number;
}

export interface Contact {
  userId: string;
  originalName: string;
  handle: string;
  avatar: string;
  note?: string;
  isVerified: boolean;
  isGroup?: boolean;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUser: {
      name: string;
      avatar: string;
      handle: string;
  };
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // UserID or GroupID
  content: string;
  type: MediaType;
  timestamp: number;
  isGroup?: boolean;
  meta?: any; // For transfer amount, dice result, share_card data, etc
}

export interface Post {
  id: string;
  userId: string;
  user: {
    name: string;
    handle: string;
    avatar: string;
    isVerified: boolean;
  };
  content: string;
  mediaUrl?: string;
  mediaType: MediaType;
  topicId?: string;
  category?: TrendingCategory | string;
  deviceName?: string;
  location?: string;
  region?: string; // For news filtering
  networkType?: string;
  timestamp: number;
  likes: number;
  dislikes: number;
  reposts: number;
  comments: Comment[];
  qualityScore?: number;
  hasLiked: boolean;
  hasDisliked: boolean;
  hasReposted: boolean;
  allowDownload: boolean;
  watermark: boolean;
  visibility?: 'public' | 'friends';
  systemGenerated?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface TrendingTopic {
  id: string;
  rank: number;
  tag: string;
  heat: number;
  description: string;
  category: TrendingCategory | string;
}

// Unified interface for what is being forwarded
export interface ForwardingContent {
    type: 'post' | 'message';
    data: Post | Message;
}