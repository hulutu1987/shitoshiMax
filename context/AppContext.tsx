import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { User, Post, Notification, Sentiment, Comment, AppView, TrendingTopic, TrendingCategory, MediaType, Contact, Message, ShareWallFilter, FriendRequest, ForwardingContent } from '../types';

export type ThemeMode = 'light' | 'dark' | 'system';

interface AppContextType {
  currentUser: User;
  posts: Post[];
  shareWallPosts: Post[];
  trendingTopics: TrendingTopic[];
  notifications: Notification[];
  currentView: AppView;
  contacts: Contact[];
  friendRequests: FriendRequest[];
  messages: Message[];
  activeChatUser: string | null;
  isAuthenticated: boolean;
  themeMode: ThemeMode;
  browserUrl: string | null;
  shareWallFilter: ShareWallFilter;
  sparkLevel: number;
  chatBackground: string;
  forwardingContent: ForwardingContent | null;
  setForwardingContent: (content: ForwardingContent | null) => void;
  setChatBackground: (bg: string) => void;
  openBrowser: (url: string) => void;
  closeBrowser: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  login: () => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  navigateTo: (view: AppView) => void;
  addPost: (content: string, analysis: { isSafe: boolean; qualityScore: number; sentiment: Sentiment }, media?: { type: MediaType, url: string }, topicId?: string, settings?: { allowDownload: boolean, watermark: boolean, visibility: 'public' | 'friends' }) => void;
  addComment: (postId: string, content: string, analysis: { isSafe: boolean; qualityScore: number; sentiment: Sentiment }) => void;
  interactWithPost: (postId: string, action: 'like' | 'dislike' | 'repost') => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  verifyIdentity: (method: 'passport' | 'driver_license' | 'social_link') => void;
  followUser: (user: { id: string; name: string; handle: string; avatar: string; isVerified: boolean }) => void;
  updateContactNote: (userId: string, note: string) => void;
  openChat: (userId: string) => void;
  sendMessage: (content: string, type: MediaType, meta?: any, receiverId?: string) => void;
  transferPoints: (amount: number) => void;
  buyPoints: (amount: number) => void;
  blockUser: (userId: string) => void;
  reportPost: (postId: string) => void;
  deletePost: (postId: string) => void;
  inviteFriend: (userId: string) => void;
  sendFriendRequest: (userId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  sharePost: (post: Post) => void;
  forwardMessage: (message: Message) => void;
  setShareWallFilter: (filter: ShareWallFilter) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone 15 Pro';
  if (/iPad/.test(ua)) return 'iPad Pro';
  if (/Android/.test(ua)) {
      if (/Samsung/.test(ua)) return 'Samsung Galaxy S24';
      if (/Pixel/.test(ua)) return 'Google Pixel 8';
      return 'Android Device';
  }
  if (/Mac/.test(ua)) return 'MacBook Pro';
  if (/Win/.test(ua)) return 'Windows PC';
  return 'ZenDevice';
};

const getUserLocation = (): string => {
  // Optimized location logic: Persist location once determined for the session to maintain context
  const stored = sessionStorage.getItem('user_location');
  if (stored) return stored;
  
  // Simulation of "Smart IP Detection" based on browser info (simulated)
  const regions = [
      'New York, US', 'Los Angeles, US', 
      'London, UK', 'Manchester, UK',
      'Tokyo, JP', 'Osaka, JP',
      'Beijing, CN', 'Shanghai, CN',
      'Paris, FR', 'Berlin, DE', 'Sydney, AU'
  ];
  
  const index = new Date().getMinutes() % regions.length;
  const loc = regions[index];
  sessionStorage.setItem('user_location', loc);
  return loc;
};

// Initial detection of Region based on Location
const detectRegion = (location: string): string => {
    if (location.includes('US')) return 'US';
    if (location.includes('UK')) return 'UK';
    if (location.includes('CN')) return 'CN';
    if (location.includes('JP')) return 'JP';
    if (location.includes('FR') || location.includes('DE')) return 'EU';
    return 'Global';
};

const getNetworkType = (): string => {
    // Include VPN for simulation
    const networks = ['5G', 'WiFi', '4G', 'VPN'];
    return networks[Math.floor(Math.random() * networks.length)];
};

const userLoc = getUserLocation();

const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Chen',
  handle: '@alexc',
  avatar: 'https://picsum.photos/200/200',
  bio: 'Digital nomad. Exploring the world.',
  points: 125,
  postsToday: 0,
  actionsToday: 0,
  commentsToday: 0,
  maxPostsPerDay: 999999,
  maxActionsPerDay: 999999,
  maxCommentsPerDay: 999999,
  isVerified: false,
  deviceName: getDeviceName(),
  location: userLoc,
  newsRegion: detectRegion(userLoc), // Auto-detected initially
  networkType: getNetworkType(),
  blockedUserIds: [],
  interests: { 'tech': 10, 'lifestyle': 10, 'entertainment': 10, 'finance': 10 }
};

const MOCK_POSTS: Post[] = [
  {
    id: 'p1', userId: 'u2', user: { name: 'Sarah Jenkins', handle: '@sarah_j', avatar: 'https://picsum.photos/201/201', isVerified: true },
    content: 'Minimalism is not about having less. It’s about making room for more of what matters.',
    mediaType: 'image', mediaUrl: 'https://picsum.photos/600/400', category: 'lifestyle', timestamp: Date.now() - 3600000,
    likes: 12, dislikes: 0, reposts: 2, comments: [], hasLiked: false, hasDisliked: false, hasReposted: false, qualityScore: 85,
    deviceName: 'iPhone 14 Pro', location: 'London, UK', networkType: 'WiFi', allowDownload: true, watermark: false, visibility: 'public'
  },
  {
    id: 'p2', userId: 'u3', user: { name: 'Davide Russo', handle: '@drusso', avatar: 'https://picsum.photos/202/202', isVerified: false },
    content: 'Just finished a 5k run in Central Park.',
    mediaType: 'text', category: 'lifestyle', timestamp: Date.now() - 7200000,
    likes: 5, dislikes: 0, reposts: 0, comments: [], hasLiked: false, hasDisliked: false, hasReposted: false, qualityScore: 60,
    deviceName: 'Pixel 7', location: 'New York, US', networkType: '5G', allowDownload: true, watermark: true, visibility: 'friends'
  },
  {
    id: 'p_vpn', userId: 'u_vpn', user: { name: 'Cyber Nomad', handle: '@vpn_user', avatar: 'https://picsum.photos/seed/vpn/200/200', isVerified: false },
    content: 'Accessing the global feed securely.',
    mediaType: 'text', category: 'tech', timestamp: Date.now() - 900000,
    likes: 42, dislikes: 0, reposts: 5, comments: [], hasLiked: false, hasDisliked: false, hasReposted: false, qualityScore: 80,
    deviceName: 'Linux Terminal', location: 'Unknown Region', networkType: 'VPN', allowDownload: true, watermark: false, visibility: 'public'
  }
];

const MOCK_CONTACTS: Contact[] = [
  { userId: 'u2', originalName: 'Sarah Jenkins', handle: '@sarah_j', avatar: 'https://picsum.photos/201/201', isVerified: true, note: 'Design Lead' },
  { userId: 'u3', originalName: 'Davide Russo', handle: '@drusso', avatar: 'https://picsum.photos/202/202', isVerified: false },
  { userId: 'g1', originalName: 'Cat & Dog Lovers', handle: '@group_1', avatar: '', isVerified: false, isGroup: true }
];

const MOCK_FRIEND_REQUESTS: FriendRequest[] = [
    { id: 'fr1', fromUserId: 'u4', fromUser: { name: 'Kenji Sato', handle: '@movies_plus', avatar: 'https://picsum.photos/204/204' }, timestamp: Date.now() - 100000, status: 'pending' }
];

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'u2', receiverId: 'u1', content: 'Hey Alex, loved your post!', type: 'text', timestamp: Date.now() - 86400000 },
  { id: 'm2', senderId: 'u1', receiverId: 'u2', content: 'Thanks Sarah!', type: 'text', timestamp: Date.now() - 86300000 }
];

const generateMockTrending = (): TrendingTopic[] => {
  const categories: TrendingCategory[] = ['tech', 'lifestyle', 'entertainment', 'finance'];
  const topics: TrendingTopic[] = [];
  for (let i = 1; i <= 20; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    topics.push({
      id: `t${i}`, rank: i, tag: `#Topic${i}${cat}`,
      heat: 1000000 - (i * 20000), description: `${cat} discussion`, category: cat,
    });
  }
  return topics;
};

// System Bot Logic - Professional News Sources
const NEWS_SOURCES: Record<string, { name: string; handle: string; avatar: string }> = {
    'US': { name: 'US Daily Wire', handle: '@us_wire', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=US&backgroundColor=003366' },
    'UK': { name: 'London Dispatch', handle: '@uk_news', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=UK&backgroundColor=b91c1c' },
    'CN': { name: 'China Focus', handle: '@cn_focus', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CN&backgroundColor=d97706' },
    'JP': { name: 'Japan Today', handle: '@jp_today', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JP&backgroundColor=db2777' },
    'EU': { name: 'Euro Brief', handle: '@eu_brief', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=EU&backgroundColor=2563eb' },
    'Global': { name: 'World Beat', handle: '@world_beat', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Global&backgroundColor=4b5563' }
};

const NEWS_CONTENT: Record<string, string[]> = {
    'US': [
        "Tech giants announce new AI regulations in Silicon Valley.",
        "Market hits all-time high as renewable energy stocks surge.",
        "New national park conservation efforts approved by Congress.",
        "Major breakthrough in quantum computing announced at MIT."
    ],
    'UK': [
        "London tech week showcases fintech innovations.",
        "Premier League matches draw record viewership this weekend.",
        "Royal Family attends charity gala for ocean preservation.",
        "New high-speed rail link proposed for northern England."
    ],
    'CN': [
        "5G infrastructure expands to rural areas, boosting connectivity.",
        "New electric vehicle models unveiled in Shanghai Auto Show.",
        "Traditional tea culture gaining popularity among Gen Z.",
        "Space station completes new module docking successfully."
    ],
    'JP': [
        "Tokyo Game Show attracts millions of online viewers.",
        "Robotics advancements in elderly care sector shown in Osaka.",
        "Cherry blossom season starts early this year, boosting tourism.",
        "New anime release breaks box office records worldwide."
    ],
    'EU': [
        "European Union agrees on new digital privacy framework.",
        "Paris Fashion Week highlights sustainable clothing trends.",
        "Berlin startup hub attracts major international investment.",
        "Mediterranean cleanup initiative launches with volunteer support."
    ],
    'Global': [
        "Global climate summit reaches new agreement on emissions.",
        "Space tourism takes a leap forward with successful launch.",
        "Digital art sales surge in online marketplaces.",
        "WHO announces decline in tropical diseases globally."
    ]
};

const generateAllRegionalNews = (): Post[] => {
    let allNews: Post[] = [];
    
    Object.keys(NEWS_SOURCES).forEach(region => {
        const source = NEWS_SOURCES[region];
        const headlines = NEWS_CONTENT[region] || NEWS_CONTENT['Global'];
        
        const regionalPosts = headlines.map((headline, idx) => ({
            id: `news_${region}_${idx}`,
            userId: `bot_${region.toLowerCase()}`,
            user: { 
                name: source.name, 
                handle: source.handle, 
                avatar: source.avatar,
                isVerified: true
            },
            content: headline, // Plain text content for "flash" news style
            mediaType: 'text' as MediaType,
            category: 'news',
            deviceName: 'NewsFeed API',
            location: region === 'Global' ? 'Worldwide' : region,
            region: region, // Tag with region for filtering
            networkType: 'Server',
            timestamp: Date.now() - (idx * 3600000) - (Math.random() * 1000000),
            likes: Math.floor(Math.random() * 500) + 50,
            dislikes: Math.floor(Math.random() * 10),
            reposts: Math.floor(Math.random() * 100),
            comments: [],
            hasLiked: false,
            hasDisliked: false,
            hasReposted: false,
            qualityScore: 100,
            allowDownload: true,
            watermark: false,
            visibility: 'public' as 'public',
            systemGenerated: true
        }));
        
        allNews = [...allNews, ...regionalPosts];
    });

    return allNews;
};


export const AppProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(MOCK_FRIEND_REQUESTS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('chats');
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  const [browserUrl, setBrowserUrl] = useState<string | null>(null);
  
  // Theme state: can be 'light', 'dark', or 'system'
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  const [shareWallFilter, setShareWallFilter] = useState<ShareWallFilter>('news');
  const [sparkLevel, setSparkLevel] = useState(0);
  const [chatBackground, setChatBackground] = useState('bg-[#f2f2f2] dark:bg-slate-950');
  const [forwardingContent, setForwardingContent] = useState<ForwardingContent | null>(null);

  useEffect(() => {
    setTrendingTopics(generateMockTrending());
    
    // Initial theme load
    const storedTheme = localStorage.getItem('themeMode') as ThemeMode | null;
    if (storedTheme) {
        setThemeModeState(storedTheme);
    }

    // Generate All System News on startup
    const allRegionalNews = generateAllRegionalNews();
    setPosts(prev => [...allRegionalNews, ...prev]);

  }, []); // Run once on mount

  // Apply Theme Effect
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
        const isDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    applyTheme();

    // Listener for system changes if in system mode
    if (themeMode === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme();
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
      setThemeModeState(mode);
      localStorage.setItem('themeMode', mode);
  };

  const openBrowser = (url: string) => setBrowserUrl(url);
  const closeBrowser = () => setBrowserUrl(null);

  const shareWallPosts = useMemo(() => {
      let filtered = posts.filter(p => !currentUser.blockedUserIds.includes(p.userId));
      
      if (shareWallFilter === 'friends') {
          const contactIds = contacts.map(c => c.userId);
          filtered = filtered.filter(p => contactIds.includes(p.userId) || p.userId === currentUser.id);
      } else if (shareWallFilter === 'mine') {
          filtered = filtered.filter(p => p.userId === currentUser.id);
      } else {
          // News / All
          const contactIds = contacts.map(c => c.userId);
          filtered = filtered.filter(p => {
             // System News Logic: Only show news from user's selected region
             if (p.category === 'news' && p.systemGenerated) {
                 return p.region === currentUser.newsRegion;
             }
             // Standard Logic for user posts
             return p.visibility === 'public' || contactIds.includes(p.userId) || p.userId === currentUser.id;
          });
      }

      return [...filtered].sort((a, b) => b.timestamp - a.timestamp);
  }, [posts, currentUser, shareWallFilter, contacts]);

  const login = () => {
      setIsAuthenticated(true);
      setCurrentUser(prev => ({ ...prev, points: prev.points + 20, lastLogin: Date.now() }));
      navigateTo('chats');
  };

  const logout = () => {
      setIsAuthenticated(false);
      setCurrentView('chats');
  };

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updatedData }));
    if (updatedData.newsRegion) {
        addNotification(`News region switched to ${updatedData.newsRegion}`, "success");
    } else {
        addNotification("Profile updated.", "success");
    }
  };

  const verifyIdentity = (method: 'passport' | 'driver_license' | 'social_link') => {
      setTimeout(() => {
          setCurrentUser(prev => ({ ...prev, isVerified: true, verifiedBy: method }));
          addNotification("Identity Verified", "success");
      }, 1500);
  };

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => { setNotifications(prev => prev.filter(n => n.id !== id)); }, 4000);
  }, []);

  const followUser = (user: { id: string; name: string; handle: string; avatar: string; isVerified: boolean }) => {
      if (contacts.find(c => c.userId === user.id)) return;
      setContacts(prev => [...prev, { userId: user.id, originalName: user.name, handle: user.handle, avatar: user.avatar, isVerified: user.isVerified }]);
      addNotification("Following " + user.name, "success");
  };

  const sendFriendRequest = (userId: string) => {
      // Simulation
      if (contacts.find(c => c.userId === userId)) {
          addNotification("Already friends.", "info");
          return;
      }
      addNotification("Friend Request Sent!", "success");
  };

  const acceptFriendRequest = (requestId: string) => {
      const req = friendRequests.find(r => r.id === requestId);
      if (req) {
          setContacts(prev => [...prev, { 
              userId: req.fromUserId, 
              originalName: req.fromUser.name, 
              handle: req.fromUser.handle, 
              avatar: req.fromUser.avatar, 
              isVerified: false 
          }]);
          setFriendRequests(prev => prev.filter(r => r.id !== requestId));
          addNotification("Friend Request Accepted", "success");
      }
  };

  const rejectFriendRequest = (requestId: string) => {
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      addNotification("Friend Request Rejected", "info");
  };

  const inviteFriend = (userId: string) => {
      addNotification("Invite sent! +5 Reputation when they join.", "success");
  };

  const registerReferral = (referrerId: string) => {
      setCurrentUser(prev => ({ ...prev, points: prev.points + 50 })); // Bonus
      addNotification("Referral bonus applied!", "success");
  };

  const updateContactNote = (userId: string, note: string) => {
      setContacts(prev => prev.map(c => c.userId === userId ? { ...c, note } : c));
  };

  const openChat = (userId: string) => {
      if (currentUser.blockedUserIds.includes(userId)) {
          addNotification("Cannot chat with blocked user.", "error");
          return;
      }
      setActiveChatUser(userId);
      navigateTo('chat');
  };

  const sendMessage = (content: string, type: MediaType, meta?: any, receiverId?: string) => {
      const targetId = receiverId || activeChatUser;
      if (!targetId) return;

      const newMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          senderId: currentUser.id,
          receiverId: targetId,
          content,
          type,
          timestamp: Date.now(),
          meta
      };
      setMessages(prev => [...prev, newMessage]);
      
      if (targetId === activeChatUser) {
          setSparkLevel(prev => Math.min(100, prev + 5));
      }
  };

  const transferPoints = (amount: number) => {
      if (!activeChatUser) return;
      if (currentUser.points < amount) {
          addNotification("Insufficient points.", "error");
          return;
      }
      setCurrentUser(prev => ({ ...prev, points: prev.points - amount }));
      sendMessage(`Transfer: ${amount} pts`, 'transfer', { amount });
      addNotification(`Transferred ${amount} points.`, 'success');
  };

  const buyPoints = (amount: number) => {
      // Simulate Payment
      setTimeout(() => {
          setCurrentUser(prev => ({ ...prev, points: prev.points + amount }));
          addNotification(`Successfully purchased ${amount} pts!`, "success");
      }, 1000);
  };

  const blockUser = (userId: string) => {
      setCurrentUser(prev => ({ ...prev, blockedUserIds: [...prev.blockedUserIds, userId] }));
      setContacts(prev => prev.filter(c => c.userId !== userId));
      addNotification("User blocked.", "success");
  };

  const reportPost = (postId: string) => {
      addNotification("Post reported for review.", "success");
      setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const deletePost = (postId: string) => {
      setPosts(prev => prev.filter(p => p.id !== postId));
      addNotification("Post deleted.", "success");
  };

  const sharePost = (post: Post) => {
      // Trigger the Forward Modal which now acts as the central share sheet
      setForwardingContent({ type: 'post', data: post });
  };

  const forwardMessage = (message: Message) => {
      setForwardingContent({ type: 'message', data: message });
  };

  const addPost = (content: string, analysis: { isSafe: boolean; qualityScore: number; sentiment: Sentiment }, media?: { type: MediaType, url: string }, topicId?: string, settings?: { allowDownload: boolean, watermark: boolean, visibility: 'public' | 'friends' }) => {
    // Calculates logic: Base media cost + 1 point per char over 300
    const mediaCost = media?.type === 'video' ? 10 : 3;
    const charCost = Math.max(0, content.length - 300);
    const totalCost = mediaCost + charCost;

    if (currentUser.points < totalCost) {
        addNotification(`Insufficient Reputation. Need ${totalCost} pts.`, "error");
        return;
    }
    if (!analysis.isSafe) {
      setCurrentUser(prev => ({ ...prev, points: Math.max(0, prev.points - 50) }));
      addNotification("Content blocked: Policy violation.", "error");
      return; 
    }

    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      user: { name: currentUser.name, handle: currentUser.handle, avatar: currentUser.avatar, isVerified: currentUser.isVerified },
      content,
      mediaType: media?.type || 'text',
      mediaUrl: media?.url,
      topicId,
      category: 'lifestyle',
      deviceName: getDeviceName(),
      location: getUserLocation(),
      region: currentUser.newsRegion, // User posts inherit their region
      networkType: getNetworkType(), 
      timestamp: Date.now(),
      likes: 0, dislikes: 0, reposts: 0, comments: [], hasLiked: false, hasDisliked: false, hasReposted: false,
      qualityScore: analysis.qualityScore,
      allowDownload: settings?.allowDownload ?? true,
      watermark: settings?.watermark ?? false,
      visibility: settings?.visibility || 'public'
    };
    setPosts(prev => [newPost, ...prev]);
    // Deduct cost but reward 2 points instantly for activity
    setCurrentUser(prev => ({ ...prev, postsToday: prev.postsToday + 1, points: Math.max(0, prev.points - totalCost + 2) }));
  };

  const addComment = (postId: string, content: string, analysis: { isSafe: boolean; qualityScore: number; sentiment: Sentiment }) => {
     if (currentUser.points < 2) return; 
     if (!analysis.isSafe) {
        setCurrentUser(prev => ({ ...prev, points: Math.max(0, prev.points - 20) }));
        return;
     }
     const newComment: Comment = {
         id: Math.random().toString(36).substr(2, 9),
         userId: currentUser.id,
         user: { name: currentUser.name, handle: currentUser.handle, avatar: currentUser.avatar, isVerified: currentUser.isVerified },
         content, timestamp: Date.now(), qualityScore: analysis.qualityScore
     };
     setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
     setCurrentUser(prev => ({ ...prev, commentsToday: prev.commentsToday + 1 }));
  };

  const interactWithPost = (postId: string, action: 'like' | 'dislike' | 'repost') => {
    if (currentUser.points < 1) {
        addNotification("Insufficient points to interact (-1 pt).", "error");
        return;
    }
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      const updated = { ...post };
      if (action === 'like' && !post.hasLiked) { updated.likes++; updated.hasLiked = true; }
      else if (action === 'dislike' && !post.hasDisliked) { updated.dislikes++; updated.hasDisliked = true; }
      else if (action === 'repost' && !post.hasReposted) { updated.reposts++; updated.hasReposted = true; }
      return updated;
    }));
    // Deduct 1 point for interaction (like/dislike)
    setCurrentUser(prev => ({ ...prev, actionsToday: prev.actionsToday + 1, points: Math.max(0, prev.points - 1) }));
  };

  return (
    <AppContext.Provider value={{ 
        currentUser, posts, shareWallPosts, trendingTopics, notifications, currentView, contacts, messages, activeChatUser, isAuthenticated, themeMode, browserUrl, shareWallFilter, sparkLevel, chatBackground, forwardingContent, friendRequests,
        addPost, addComment, interactWithPost, addNotification, navigateTo, updateUser, verifyIdentity,
        followUser, updateContactNote, openChat, sendMessage, blockUser, reportPost, login, logout, setThemeMode,
        openBrowser, closeBrowser, inviteFriend, setShareWallFilter, transferPoints, setChatBackground, setForwardingContent, sharePost, forwardMessage, buyPoints, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, deletePost
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};