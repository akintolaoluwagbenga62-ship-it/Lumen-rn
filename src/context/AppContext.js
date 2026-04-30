// src/context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ADMIN_EMAIL, FREE_TRIAL_DAYS, DEFAULT_GROUPS, SEED_VIDEOS, SEED_NEWS, PLANS, BANNED_WORDS } from '../data/constants';

const AppContext = createContext(null);

const initialState = {
  currentUser: null,
  allUsers: [],
  groups: [],
  groupMessages: {},
  decks: [],
  notifications: [],
  videos: [],
  news: [],
  darkMode: true,
  loaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD': return { ...state, ...action.payload, loaded: true };
    case 'SET_USER': return { ...state, currentUser: action.payload };
    case 'SET_USERS': return { ...state, allUsers: action.payload };
    case 'SET_GROUPS': return { ...state, groups: action.payload };
    case 'SET_MSGS': return { ...state, groupMessages: action.payload };
    case 'SET_DECKS': return { ...state, decks: action.payload };
    case 'SET_NOTIFS': return { ...state, notifications: action.payload };
    case 'SET_VIDEOS': return { ...state, videos: action.payload };
    case 'SET_NEWS': return { ...state, news: action.payload };
    case 'TOGGLE_DARK': return { ...state, darkMode: !state.darkMode };
    case 'LOGOUT': return { ...initialState, loaded: true, darkMode: state.darkMode, allUsers: state.allUsers, groups: state.groups, groupMessages: state.groupMessages, news: state.news, videos: state.videos };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── LOAD ──
  useEffect(() => {
    (async () => {
      try {
        const keys = ['lumenDark','lumenUser','lumenAllUsers','lumenGroups','lumenGMsgs','lumenDecks','lumenNotifs','lumenVideos','lumenNews'];
        const results = await AsyncStorage.multiGet(keys);
        const data = {};
        results.forEach(([k, v]) => { if (v) data[k] = JSON.parse(v); });

        const allUsers = data.lumenAllUsers || [];
        const rawUser = data.lumenUser;
        const currentUser = rawUser ? (allUsers.find(u => u.email === rawUser.email) || rawUser) : null;

        // Seed default groups if empty
        let groups = data.lumenGroups || [];
        DEFAULT_GROUPS.forEach(dg => {
          if (!groups.find(g => g.id === dg.id)) {
            groups.push({ ...dg, members: [], admins: [ADMIN_EMAIL], moderators: [], banned: [], pinned: [], isDefault: true, createdAt: Date.now(), createdBy: ADMIN_EMAIL });
          }
        });

        // Seed videos if empty
        const videos = (data.lumenVideos && data.lumenVideos.length > 0) ? data.lumenVideos : SEED_VIDEOS;

        // Seed news if empty
        const news = (data.lumenNews && data.lumenNews.length > 0) ? data.lumenNews : SEED_NEWS;

        dispatch({ type: 'LOAD', payload: {
          darkMode: data.lumenDark ?? true,
          currentUser,
          allUsers,
          groups,
          groupMessages: data.lumenGMsgs || {},
          decks: data.lumenDecks || [],
          notifications: data.lumenNotifs || [],
          videos,
          news,
        }});

        await AsyncStorage.setItem('lumenGroups', JSON.stringify(groups));
        await AsyncStorage.setItem('lumenVideos', JSON.stringify(videos));
        await AsyncStorage.setItem('lumenNews', JSON.stringify(news));
      } catch (e) {
        dispatch({ type: 'LOAD', payload: { groups: DEFAULT_GROUPS.map(dg => ({ ...dg, members: [], admins: [ADMIN_EMAIL], moderators: [], banned: [], pinned: [], isDefault: true, createdAt: Date.now(), createdBy: ADMIN_EMAIL })), videos: SEED_VIDEOS, news: SEED_NEWS } });
      }
    })();
  }, []);

  const save = async (key, value) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  };

  // ── AUTH ──
  const register = (name, email, pass, course, uni) => {
    if (!name || !email || !pass) return 'Fill all fields';
    if (pass.length < 6) return 'Password min 6 chars';
    if (state.allUsers.find(u => u.email === email.toLowerCase())) return 'Email already registered';
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
    const user = {
      name, email: email.toLowerCase(), pass, course1: course || 'Mathematics',
      choice1: uni || 'University', bio: '', avatar: '', level: 1,
      testsTaken: 0, scores: [], streak: 0, lastStudyDay: null,
      isAdmin, verified: isAdmin,
      createdAt: Date.now(), lastActive: Date.now(),
      subscriptionExpiry: null, paymentPending: null,
    };
    const users = [...state.allUsers, user];
    dispatch({ type: 'SET_USERS', payload: users });
    dispatch({ type: 'SET_USER', payload: user });
    save('lumenAllUsers', users);
    save('lumenUser', user);
    return null;
  };

  const login = (email, pass) => {
    const user = state.allUsers.find(u => u.email === email.toLowerCase() && u.pass === pass);
    if (!user) return 'Invalid email or password';
    const updated = { ...user, lastActive: Date.now() };
    const users = state.allUsers.map(u => u.email === updated.email ? updated : u);
    dispatch({ type: 'SET_USER', payload: updated });
    dispatch({ type: 'SET_USERS', payload: users });
    save('lumenUser', updated);
    save('lumenAllUsers', users);
    return null;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('lumenUser');
    dispatch({ type: 'LOGOUT' });
  };

  // ── SUBSCRIPTION ──
  const isActivated = () => {
    const u = state.currentUser;
    if (!u) return false;
    if (u.isAdmin) return true;
    if (u.subscriptionExpiry && u.subscriptionExpiry > Date.now()) return true;
    return trialDaysLeft() > 0;
  };

  const trialDaysLeft = () => {
    const u = state.currentUser;
    if (!u) return 0;
    const trialEnd = u.createdAt + (FREE_TRIAL_DAYS * 86400000);
    const ms = trialEnd - Date.now();
    return ms > 0 ? Math.ceil(ms / 86400000) : 0;
  };

  const isOnTrial = () => {
    const u = state.currentUser;
    if (!u) return false;
    if (u.subscriptionExpiry && u.subscriptionExpiry > Date.now()) return false;
    return trialDaysLeft() > 0;
  };

  const subscriptionLabel = () => {
    const u = state.currentUser;
    if (!u) return '';
    if (u.isAdmin) return 'Admin';
    if (u.subscriptionExpiry && u.subscriptionExpiry > Date.now()) {
      const days = Math.ceil((u.subscriptionExpiry - Date.now()) / 86400000);
      return `Active · ${days}d left`;
    }
    if (isOnTrial()) return `Free Trial · ${trialDaysLeft()}d left`;
    return 'Expired — Upgrade';
  };

  const activateUser = (email, planId) => {
    const plan = PLANS.find(p => p.id === planId) || PLANS[1];
    const users = state.allUsers.map(u => u.email === email ? { ...u, subscriptionExpiry: Date.now() + plan.days * 86400000, paymentPending: null } : u);
    dispatch({ type: 'SET_USERS', payload: users });
    const updatedUser = users.find(u => u.email === email);
    if (state.currentUser?.email === email) {
      dispatch({ type: 'SET_USER', payload: updatedUser });
      save('lumenUser', updatedUser);
    }
    save('lumenAllUsers', users);
  };

  const submitPayment = (planId, ref) => {
    const plan = PLANS.find(p => p.id === planId) || PLANS[1];
    const updated = { ...state.currentUser, paymentPending: { plan: planId, ref, submittedAt: Date.now() } };
    const users = state.allUsers.map(u => u.email === updated.email ? updated : u);
    dispatch({ type: 'SET_USER', payload: updated });
    dispatch({ type: 'SET_USERS', payload: users });
    save('lumenUser', updated);
    save('lumenAllUsers', users);
    addNotification(`[PAYMENT] ${updated.name} (${updated.email}) — ${plan.name} ₦${plan.price} — Ref: ${ref}`, ADMIN_EMAIL);
  };

  // ── THEME ──
  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_DARK' });
    save('lumenDark', !state.darkMode);
  };

  // ── GROUPS ──
  const createGroup = (name, desc, icon, color) => {
    const g = {
      id: `grp_${Date.now()}`,
      name, description: desc, icon, color,
      members: [state.currentUser.email],
      admins: [state.currentUser.email],
      moderators: [], banned: [], pinned: [],
      isDefault: false, createdAt: Date.now(),
      createdBy: state.currentUser.email,
    };
    const groups = [...state.groups, g];
    dispatch({ type: 'SET_GROUPS', payload: groups });
    save('lumenGroups', groups);
  };

  const joinGroup = (gid) => {
    const groups = state.groups.map(g => {
      if (g.id !== gid) return g;
      if (g.members.includes(state.currentUser.email)) return g;
      return { ...g, members: [...g.members, state.currentUser.email] };
    });
    dispatch({ type: 'SET_GROUPS', payload: groups });
    save('lumenGroups', groups);
    addGroupMessage(gid, { id: `sys_${Date.now()}`, from: 'system', text: `${state.currentUser.name} joined the group`, timestamp: Date.now(), type: 'system', readBy: [] });
  };

  const leaveGroup = (gid) => {
    const groups = state.groups.map(g => {
      if (g.id !== gid) return g;
      return { ...g, members: g.members.filter(m => m !== state.currentUser.email), admins: g.admins.filter(a => a !== state.currentUser.email) };
    });
    dispatch({ type: 'SET_GROUPS', payload: groups });
    save('lumenGroups', groups);
  };

  const sendGroupMessage = (gid, text, replyTo = null) => {
    if (!text.trim()) return false;
    if (BANNED_WORDS.some(w => text.toLowerCase().includes(w))) return 'blocked';
    const msg = { id: `gm_${Date.now()}_${Math.random().toString(36).substr(2,4)}`, from: state.currentUser.email, text: text.trim(), timestamp: Date.now(), readBy: [state.currentUser.email], replyTo, type: 'message' };
    addGroupMessage(gid, msg);
    return true;
  };

  const addGroupMessage = (gid, msg) => {
    const msgs = { ...state.groupMessages, [gid]: [...(state.groupMessages[gid] || []), msg] };
    dispatch({ type: 'SET_MSGS', payload: msgs });
    save('lumenGMsgs', msgs);
  };

  const deleteGroupMessage = (gid, msgId) => {
    const msgs = { ...state.groupMessages, [gid]: (state.groupMessages[gid] || []).filter(m => m.id !== msgId) };
    dispatch({ type: 'SET_MSGS', payload: msgs });
    save('lumenGMsgs', msgs);
  };

  const pinMessage = (gid, msgId) => {
    const groups = state.groups.map(g => {
      if (g.id !== gid) return g;
      const pinned = g.pinned.includes(msgId) ? g.pinned.filter(p => p !== msgId) : [...g.pinned, msgId];
      return { ...g, pinned };
    });
    dispatch({ type: 'SET_GROUPS', payload: groups });
    save('lumenGroups', groups);
  };

  const unreadCount = (gid) => (state.groupMessages[gid] || []).filter(m => !m.readBy?.includes(state.currentUser?.email) && m.from !== state.currentUser?.email).length;

  // ── STUDY STREAK ──
  const updateStreak = () => {
    const u = state.currentUser;
    if (!u) return;
    const today = new Date().toDateString();
    if (u.lastStudyDay === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const streak = u.lastStudyDay === yesterday ? (u.streak || 0) + 1 : 1;
    const updated = { ...u, streak, lastStudyDay: today };
    const users = state.allUsers.map(usr => usr.email === updated.email ? updated : usr);
    dispatch({ type: 'SET_USER', payload: updated });
    dispatch({ type: 'SET_USERS', payload: users });
    save('lumenUser', updated);
    save('lumenAllUsers', users);
  };

  // ── TEST RESULT ──
  const recordTest = (score, total, subject) => {
    updateStreak();
    const updated = { ...state.currentUser, testsTaken: (state.currentUser.testsTaken || 0) + 1, scores: [...(state.currentUser.scores || []), score] };
    const users = state.allUsers.map(u => u.email === updated.email ? updated : u);
    dispatch({ type: 'SET_USER', payload: updated });
    dispatch({ type: 'SET_USERS', payload: users });
    save('lumenUser', updated);
    save('lumenAllUsers', users);
  };

  // ── PROFILE ──
  const updateProfile = (changes) => {
    const updated = { ...state.currentUser, ...changes };
    const users = state.allUsers.map(u => u.email === updated.email ? updated : u);
    dispatch({ type: 'SET_USER', payload: updated });
    dispatch({ type: 'SET_USERS', payload: users });
    save('lumenUser', updated);
    save('lumenAllUsers', users);
  };

  // ── FLASHCARDS ──
  const createDeck = (name, subject, color) => {
    const deck = { id: `deck_${Date.now()}`, name, subject, color, cards: [], ownerId: state.currentUser.email, createdAt: Date.now() };
    const decks = [...state.decks, deck];
    dispatch({ type: 'SET_DECKS', payload: decks });
    save('lumenDecks', decks);
  };

  const addCard = (deckId, front, back) => {
    const decks = state.decks.map(d => d.id === deckId ? { ...d, cards: [...d.cards, { id: `card_${Date.now()}`, front, back }] } : d);
    dispatch({ type: 'SET_DECKS', payload: decks });
    save('lumenDecks', decks);
  };

  const deleteDeck = (deckId) => {
    const decks = state.decks.filter(d => d.id !== deckId);
    dispatch({ type: 'SET_DECKS', payload: decks });
    save('lumenDecks', decks);
  };

  // ── VIDEOS ──
  const addVideo = (url, title, subject, note) => {
    const video = { id: `v_${Date.now()}`, url, title, subject, note, postedAt: Date.now(), postedBy: state.currentUser.email };
    const videos = [video, ...state.videos];
    dispatch({ type: 'SET_VIDEOS', payload: videos });
    save('lumenVideos', videos);
  };

  const deleteVideo = (id) => {
    const videos = state.videos.filter(v => v.id !== id);
    dispatch({ type: 'SET_VIDEOS', payload: videos });
    save('lumenVideos', videos);
  };

  // ── NEWS ──
  const addNews = (item) => {
    const news = [{ ...item, id: `n_${Date.now()}`, date: new Date().toISOString().slice(0,10) }, ...state.news];
    dispatch({ type: 'SET_NEWS', payload: news });
    save('lumenNews', news);
  };

  const deleteNews = (id) => {
    const news = state.news.filter(n => n.id !== id);
    dispatch({ type: 'SET_NEWS', payload: news });
    save('lumenNews', news);
  };

  // ── NOTIFICATIONS ──
  const addNotification = (msg, userEmail) => {
    const n = { id: `notif_${Date.now()}`, msg, user: userEmail || state.currentUser?.email, time: new Date().toLocaleString(), read: false };
    const notifs = [n, ...state.notifications].slice(0, 100);
    dispatch({ type: 'SET_NOTIFS', payload: notifs });
    save('lumenNotifs', notifs);
  };

  const markNotifsRead = () => {
    const notifs = state.notifications.map(n => ({ ...n, read: true }));
    dispatch({ type: 'SET_NOTIFS', payload: notifs });
    save('lumenNotifs', notifs);
  };

  const unreadNotifCount = () => state.notifications.filter(n => (!n.read && (n.user === state.currentUser?.email || state.currentUser?.isAdmin))).length;

  // ── ADMIN ──
  const verifyUser = (email) => {
    const users = state.allUsers.map(u => u.email === email ? { ...u, verified: true } : u);
    dispatch({ type: 'SET_USERS', payload: users });
    save('lumenAllUsers', users);
  };

  const deleteUser = (email) => {
    const users = state.allUsers.filter(u => u.email !== email);
    dispatch({ type: 'SET_USERS', payload: users });
    save('lumenAllUsers', users);
  };

  // ── HELPERS ──
  const getUserByEmail = (email) => state.allUsers.find(u => u.email === email);

  const avatarUrl = (user, size = 40) => {
    if (!user) return `https://ui-avatars.com/api/?name=U&background=7c3aed&color=fff&size=${size * 2}`;
    if (user.avatar) return user.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=7c3aed&color=fff&size=${size * 2}`;
  };

  const formatTime = (ts) => {
    const d = Date.now() - ts;
    if (d < 60000) return 'Just now';
    if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
    if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
    return `${Math.floor(d / 86400000)}d ago`;
  };

  const getXP = (user) => (user?.testsTaken || 0) * 50 + (user?.scores || []).reduce((a, b) => a + b, 0);
  const getLevel = (user) => { const xp = getXP(user); return xp === 0 ? 1 : Math.floor(Math.sqrt(xp / 100)) + 1; };

  const leaderboard = () => [...state.allUsers].sort((a, b) => getXP(b) - getXP(a)).slice(0, 20);

  const value = {
    ...state,
    register, login, logout,
    isActivated, trialDaysLeft, isOnTrial, subscriptionLabel,
    activateUser, submitPayment,
    toggleTheme,
    createGroup, joinGroup, leaveGroup,
    sendGroupMessage, deleteGroupMessage, pinMessage,
    unreadCount,
    recordTest, updateStreak,
    updateProfile,
    createDeck, addCard, deleteDeck,
    addVideo, deleteVideo,
    addNews, deleteNews,
    addNotification, markNotifsRead, unreadNotifCount,
    verifyUser, deleteUser,
    getUserByEmail, avatarUrl, formatTime,
    getXP, getLevel, leaderboard,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
