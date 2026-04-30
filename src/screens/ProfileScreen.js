// src/screens/ProfileScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors } from '../utils/theme';
import { Card, Row, Button, Input, StatBox } from '../components/UI';
import { PLANS } from '../data/constants';

export default function ProfileScreen({ navigation }) {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const u = app.currentUser;
  const xp = app.getXP(u);
  const level = app.getLevel(u);
  const nextXp = level * level * 100;
  const avgScore = u?.scores?.length ? Math.round(u.scores.reduce((a, b) => a + b, 0) / u.scores.length) : 0;

  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState(u?.bio || '');

  const saveProfile = () => {
    app.updateProfile({ bio });
    setEditMode(false);
  };

  const menuItems = [
    { icon: '⚡', label: 'Upgrade Plan', sub: 'Unlock full access', color: t.gold, onPress: () => navigation.navigate('Paywall') },
    { icon: app.darkMode ? '☀️' : '🌙', label: app.darkMode ? 'Light Mode' : 'Dark Mode', sub: 'Switch theme', color: t.accent, onPress: app.toggleTheme },
    { icon: '🔔', label: 'Notifications', sub: `${app.unreadNotifCount()} unread`, color: t.blue, onPress: () => navigation.navigate('Notifications') },
    { icon: '🏆', label: 'Leaderboard', sub: 'See top students', color: t.gold, onPress: () => navigation.navigate('Leaderboard') },
    ...(u?.isAdmin ? [{ icon: '🛡️', label: 'Admin Panel', sub: 'Manage users & content', color: '#F59E0B', onPress: () => navigation.navigate('Admin') }] : []),
    { icon: 'ℹ️', label: 'About Lumen', sub: 'Study. Focus. Pass JAMB.', color: t.muted, onPress: () => Alert.alert('Lumen v1.0', 'Study together. Pass JAMB.\n\nBuilt with React Native.') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: t.text, letterSpacing: -0.5 }}>Profile</Text>
        <TouchableOpacity onPress={() => Alert.alert('Sign Out?', 'Are you sure you want to sign out?', [{ text: 'Cancel' }, { text: 'Sign Out', style: 'destructive', onPress: app.logout }])}>
          <Text style={{ fontSize: 13, color: t.danger, fontWeight: '700' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile header */}
        <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 20, alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>{u?.name?.slice(0, 2).toUpperCase()}</Text>
          </View>
          <Row style={{ gap: 6, marginBottom: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: t.text, letterSpacing: -0.5 }}>{u?.name}</Text>
            {u?.isAdmin && <Text style={{ fontSize: 16 }}>⭐</Text>}
            {u?.verified && !u?.isAdmin && <Text style={{ fontSize: 16 }}>✅</Text>}
          </Row>
          <Text style={{ fontSize: 13, color: t.muted, marginBottom: 10 }}>{u?.email}</Text>
          <View style={{ backgroundColor: app.isActivated() ? t.success + '15' : t.danger + '12', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: app.isActivated() ? t.success + '25' : t.danger + '20' }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: app.isActivated() ? t.success : t.danger }}>{app.subscriptionLabel()}</Text>
          </View>

          {/* Bio */}
          {editMode ? (
            <View style={{ width: '100%', marginTop: 14, gap: 8 }}>
              <Input placeholder="Write a short bio..." value={bio} onChangeText={setBio} t={t} multiline autoCapitalize="sentences" style={{ minHeight: 60 }} />
              <Row style={{ gap: 8 }}>
                <Button label="Cancel" variant="outline" onPress={() => setEditMode(false)} t={t} style={{ flex: 1 }} />
                <Button label="Save" onPress={saveProfile} t={t} style={{ flex: 1 }} />
              </Row>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditMode(true)} style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, color: t.secondary, textAlign: 'center', lineHeight: 19 }}>{u?.bio || 'Tap to add a bio...'}</Text>
              <Text style={{ fontSize: 11, color: t.accent, textAlign: 'center', marginTop: 4, fontWeight: '700' }}>✏️ Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, flexDirection: 'row', marginTop: 8 }}>
          <StatBox value={u?.testsTaken || 0} label="Tests" t={t} />
          <StatBox value={`${avgScore}%`} label="Avg Score" t={t} />
          <StatBox value={level} label="Level" t={t} />
          <StatBox value={xp} label="XP" t={t} />
        </View>

        {/* XP Bar */}
        <View style={{ backgroundColor: t.bg1, padding: 16, borderBottomWidth: 1, borderColor: t.border }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: t.muted }}>Level {level}</Text>
            <Text style={{ fontSize: 12, color: t.muted }}>{xp} / {nextXp} XP</Text>
          </Row>
          <View style={{ backgroundColor: t.bg3, borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <View style={{ backgroundColor: t.accent, height: 8, width: `${Math.min((xp / nextXp) * 100, 100)}%`, borderRadius: 4 }} />
          </View>
          {(u?.streak > 0) && (
            <Row style={{ marginTop: 10, gap: 6 }}>
              <Text style={{ fontSize: 16 }}>🔥</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: t.gold }}>{u.streak}-day streak</Text>
            </Row>
          )}
        </View>

        {/* Info */}
        <View style={{ marginTop: 8 }}>
          {[
            { icon: '📚', label: 'Primary Subject', value: u?.course1 },
            { icon: '🏛️', label: 'Target University', value: u?.choice1 },
          ].map(item => (
            <View key={item.label} style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              <View>
                <Text style={{ fontSize: 11, color: t.muted, fontWeight: '600' }}>{item.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: t.text }}>{item.value || '-'}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={{ marginTop: 8 }}>
          {menuItems.map(item => (
            <TouchableOpacity key={item.label} onPress={item.onPress} style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: item.color + '15', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: t.text }}>{item.label}</Text>
                <Text style={{ fontSize: 12, color: t.muted }}>{item.sub}</Text>
              </View>
              <Text style={{ color: t.muted, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── NOTIFICATIONS SCREEN ──────────────────────────
export function NotificationsScreen({ navigation }) {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const u = app.currentUser;
  const notifs = app.notifications.filter(n => n.user === u?.email || u?.isAdmin);

  React.useEffect(() => { app.markNotifsRead(); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 22, color: t.text }}>←</Text></TouchableOpacity>
        <Text style={{ fontWeight: '800', fontSize: 18, color: t.text, flex: 1 }}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {notifs.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔔</Text>
            <Text style={{ fontSize: 14, color: t.muted }}>No notifications yet.</Text>
          </View>
        ) : (
          [...notifs].reverse().map(n => (
            <View key={n.id} style={{ backgroundColor: n.read ? t.bg1 : t.accentDim, borderRadius: 14, borderWidth: 1, borderColor: n.read ? t.border : t.accent, padding: 14, marginBottom: 8, flexDirection: 'row', gap: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.bg3, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18 }}>🔔</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: t.text, fontWeight: n.read ? '500' : '700', lineHeight: 19 }}>{n.msg}</Text>
                <Text style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>{n.time}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── LEADERBOARD ───────────────────────────────────
export function LeaderboardScreen({ navigation }) {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const board = app.leaderboard();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 22, color: t.text }}>←</Text></TouchableOpacity>
        <Text style={{ fontWeight: '800', fontSize: 18, color: t.text, flex: 1 }}>Leaderboard 🏆</Text>
      </View>

      {/* Top 3 */}
      <View style={{ backgroundColor: t.bg1, padding: 20, borderBottomWidth: 1, borderColor: t.border, flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
        {[1, 0, 2].map(i => {
          const u2 = board[i];
          if (!u2) return <View key={i} style={{ width: 90 }} />;
          const isTop = i === 0;
          return (
            <View key={i} style={{ alignItems: 'center', width: 90 }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>{['🥇', '🥈', '🥉'][i]}</Text>
              <View style={{ width: isTop ? 64 : 52, height: isTop ? 64 : 52, borderRadius: isTop ? 32 : 26, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: isTop ? 18 : 14 }}>{u2.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: t.text, textAlign: 'center' }} numberOfLines={1}>{u2.name.split(' ')[0]}</Text>
              <Text style={{ fontSize: 11, color: t.accent, fontWeight: '700' }}>{app.getXP(u2)} XP</Text>
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {board.map((usr, i) => {
          const isMe = usr.email === app.currentUser?.email;
          return (
            <View key={usr.email} style={{ backgroundColor: isMe ? t.accentDim : t.bg1, borderRadius: 14, borderWidth: 1, borderColor: isMe ? t.accent : t.border, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: t.bg3, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '900', fontSize: 13, color: t.text }}>#{i + 1}</Text>
              </View>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{usr.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: t.text }}>{usr.name}{isMe ? ' (You)' : ''}</Text>
                <Text style={{ fontSize: 11, color: t.muted }}>{usr.testsTaken} tests · Lv.{app.getLevel(usr)} · 🔥{usr.streak || 0}</Text>
              </View>
              <Text style={{ fontWeight: '900', fontSize: 15, color: t.accent }}>{app.getXP(usr)} XP</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── PAYWALL SCREEN ────────────────────────────────
export function PaywallScreen({ navigation }) {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const [selected, setSelected] = useState('term');
  const [showPayment, setShowPayment] = useState(false);
  const [ref, setRef] = useState('');

  const plan = PLANS.find(p => p.id === selected);

  const submitPayment = () => {
    if (!ref.trim()) { Alert.alert('Error', 'Enter your transfer reference'); return; }
    app.submitPayment(selected, ref.trim());
    setShowPayment(false);
    Alert.alert('Payment Submitted!', "Admin will activate your account shortly. You'll be notified.");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 22, color: t.text }}>✕</Text></TouchableOpacity>
        <Text style={{ fontWeight: '800', fontSize: 18, color: t.text, flex: 1 }}>Activate Lumen</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {app.isOnTrial() && (
          <View style={{ backgroundColor: t.accentDim, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: 14, marginBottom: 16, flexDirection: 'row', gap: 10 }}>
            <Text style={{ fontSize: 16 }}>⏱️</Text>
            <Text style={{ flex: 1, fontSize: 13, color: t.secondary, lineHeight: 19 }}>
              Your free trial ends in <Text style={{ fontWeight: '800', color: t.text }}>{app.trialDaysLeft()} days</Text>. Activate to keep full access.
            </Text>
          </View>
        )}

        <Text style={{ fontSize: 14, fontWeight: '800', color: t.text, marginBottom: 12 }}>Choose a Plan</Text>

        {PLANS.map(p => (
          <TouchableOpacity key={p.id} onPress={() => setSelected(p.id)} style={{ backgroundColor: selected === p.id ? t.accentDim : t.bg1, borderRadius: 16, borderWidth: selected === p.id ? 1.5 : 1, borderColor: selected === p.id ? t.accent : p.popular ? t.gold + '60' : t.border, padding: 16, marginBottom: 10 }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: t.text }}>{p.name}</Text>
              {p.popular && (
                <View style={{ backgroundColor: t.gold, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 2 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>BEST VALUE</Text>
                </View>
              )}
            </Row>
            <Row style={{ alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
              <Text style={{ fontSize: 26, fontWeight: '900', color: t.accent }}>₦{p.price.toLocaleString()}</Text>
              <Text style={{ fontSize: 13, color: t.muted }}>/ {p.days <= 30 ? 'month' : p.days <= 90 ? 'term' : 'year'}</Text>
            </Row>
            {p.perks.map(perk => (
              <Row key={perk} style={{ gap: 8, marginBottom: 4 }}>
                <Text style={{ color: t.success, fontSize: 12 }}>✓</Text>
                <Text style={{ fontSize: 12, color: t.secondary }}>{perk}</Text>
              </Row>
            ))}
          </TouchableOpacity>
        ))}

        <Button label="Continue to Payment →" variant="gold" onPress={() => setShowPayment(true)} t={t} style={{ marginTop: 8 }} />
        <Text style={{ textAlign: 'center', fontSize: 11, color: t.muted, marginTop: 10, lineHeight: 17 }}>After bank transfer, submit your reference and admin will activate you.</Text>
      </ScrollView>

      {/* Payment Modal */}
      <Modal visible={showPayment} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <ScrollView style={{ backgroundColor: t.bg1, borderTopLeftRadius: 24, borderTopRightRadius: 24 }} contentContainerStyle={{ padding: 20 }}>
            <View style={{ width: 40, height: 4, backgroundColor: t.bg4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: t.text, marginBottom: 16 }}>Payment Details</Text>
            <View style={{ backgroundColor: t.accentDim, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: t.border, marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted, marginBottom: 4 }}>SELECTED PLAN</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: t.text }}>{plan?.name} — ₦{plan?.price.toLocaleString()}</Text>
            </View>
            <View style={{ backgroundColor: t.gold + '12', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: t.gold + '25', marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: t.gold, marginBottom: 12, letterSpacing: 0.5 }}>BANK TRANSFER DETAILS</Text>
              {[['Bank', 'Access Bank'], ['Account Name', 'Lumen Education Ltd'], ['Account No.', '0123456789'], ['Amount', `₦${plan?.price.toLocaleString()}`]].map(([l, v]) => (
                <Row key={l} style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: t.muted }}>{l}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: l === 'Amount' ? t.gold : t.text }}>{v}</Text>
                </Row>
              ))}
            </View>
            <Text style={{ fontSize: 13, color: t.secondary, lineHeight: 21, marginBottom: 14 }}>
              ① Transfer ₦{plan?.price.toLocaleString()} to the account above{'\n'}
              ② Take a screenshot of your receipt{'\n'}
              ③ Enter your transfer reference below
            </Text>
            <Input placeholder="Transfer reference / narration" value={ref} onChangeText={setRef} t={t} />
            <Row style={{ gap: 10, marginTop: 14 }}>
              <Button label="Cancel" variant="outline" onPress={() => setShowPayment(false)} t={t} style={{ flex: 1 }} />
              <Button label="Notify Admin" variant="gold" onPress={submitPayment} t={t} style={{ flex: 1 }} />
            </Row>
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── ADMIN SCREEN ──────────────────────────────────
export function AdminScreen({ navigation }) {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const pending = app.allUsers.filter(u => u.paymentPending);
  const [activatePlan, setActivatePlan] = useState('monthly');
  const [activateTarget, setActivateTarget] = useState(null);

  const doActivate = () => {
    if (!activateTarget) return;
    app.activateUser(activateTarget.email, activatePlan);
    const updated = { ...activateTarget, paymentPending: null };
    app.updateProfile(updated);
    app.addNotification(`Your ${PLANS.find(p => p.id === activatePlan)?.name} plan has been activated!`, activateTarget.email);
    setActivateTarget(null);
    Alert.alert('Activated!', `${activateTarget.name} has been activated.`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 22, color: t.text }}>←</Text></TouchableOpacity>
        <Text style={{ fontWeight: '800', fontSize: 18, color: t.text, flex: 1 }}>⚙️ Admin Panel</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Stats */}
        <Row style={{ gap: 10, marginBottom: 20 }}>
          {[['👥', app.allUsers.length, 'Users', t.blue], ['👥', app.groups.length, 'Groups', '#7C3AED'], ['⏳', pending.length, 'Pending', t.gold]].map(([ic, v, l, c]) => (
            <View key={l} style={{ flex: 1, backgroundColor: c + '12', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: c + '20' }}>
              <Text style={{ fontSize: 22 }}>{ic}</Text>
              <Text style={{ fontSize: 24, fontWeight: '900', color: t.text, marginTop: 6 }}>{v}</Text>
              <Text style={{ fontSize: 10, color: t.muted, fontWeight: '600' }}>{l}</Text>
            </View>
          ))}
        </Row>

        {/* Pending Payments */}
        {pending.length > 0 && (
          <>
            <Text style={{ fontSize: 14, fontWeight: '800', color: t.text, marginBottom: 10 }}>⏳ Pending Payments</Text>
            {pending.map(u2 => {
              const plan = PLANS.find(p => p.id === u2.paymentPending?.plan) || PLANS[0];
              return (
                <View key={u2.email} style={{ backgroundColor: t.bg1, borderRadius: 14, borderWidth: 1.5, borderColor: t.gold + '40', padding: 14, marginBottom: 10 }}>
                  <Row style={{ gap: 10, marginBottom: 10 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontWeight: '800' }}>{u2.name.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '800', fontSize: 14, color: t.text }}>{u2.name}</Text>
                      <Text style={{ fontSize: 12, color: t.muted }}>{u2.email}</Text>
                      <Text style={{ fontSize: 12, color: t.secondary }}>{plan.name} — ₦{plan.price.toLocaleString()}</Text>
                      <Text style={{ fontSize: 11, color: t.muted, fontStyle: 'italic' }}>Ref: {u2.paymentPending?.ref}</Text>
                    </View>
                  </Row>
                  <Row style={{ gap: 8 }}>
                    <Button label="✓ Activate" onPress={() => { setActivateTarget(u2); setActivatePlan(u2.paymentPending?.plan || 'monthly'); }} t={t} style={{ flex: 1, backgroundColor: t.success }} />
                    <Button label="✗ Reject" variant="danger" onPress={() => { app.updateProfile({ ...u2, paymentPending: null }); }} t={t} style={{ flex: 1 }} />
                  </Row>
                </View>
              );
            })}
            <View style={{ height: 8 }} />
          </>
        )}

        {/* All Users */}
        <Text style={{ fontSize: 14, fontWeight: '800', color: t.text, marginBottom: 10 }}>All Users ({app.allUsers.length})</Text>
        {app.allUsers.map(u2 => {
          const isActive = u2.subscriptionExpiry && u2.subscriptionExpiry > Date.now();
          const label = u2.isAdmin ? 'Admin' : isActive ? 'Active' : 'Free';
          const labelColor = u2.isAdmin ? t.gold : isActive ? t.success : t.muted;
          return (
            <View key={u2.email} style={{ backgroundColor: t.bg1, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{u2.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Row style={{ gap: 4 }}>
                  <Text style={{ fontWeight: '700', fontSize: 13, color: t.text }}>{u2.name}</Text>
                  {u2.isAdmin && <Text style={{ fontSize: 12 }}>⭐</Text>}
                  {u2.verified && !u2.isAdmin && <Text style={{ fontSize: 12 }}>✅</Text>}
                </Row>
                <Text style={{ fontSize: 11, color: t.muted }}>{u2.email}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <View style={{ backgroundColor: labelColor + '15', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: labelColor + '25' }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: labelColor }}>{label}</Text>
                </View>
                {!u2.isAdmin && (
                  <TouchableOpacity onPress={() => { setActivateTarget(u2); setActivatePlan('monthly'); }}>
                    <Text style={{ fontSize: 11, color: t.accent, fontWeight: '700' }}>Activate</Text>
                  </TouchableOpacity>
                )}
                {!u2.verified && !u2.isAdmin && (
                  <TouchableOpacity onPress={() => app.verifyUser(u2.email)}>
                    <Text style={{ fontSize: 11, color: t.blue, fontWeight: '700' }}>Verify</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Activate Modal */}
      <Modal visible={!!activateTarget} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: t.bg1, borderRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: t.text, marginBottom: 14 }}>Activate {activateTarget?.name}</Text>
            {PLANS.map(p => (
              <TouchableOpacity key={p.id} onPress={() => setActivatePlan(p.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: activatePlan === p.id ? t.accentDim : t.bg2, borderWidth: 1, borderColor: activatePlan === p.id ? t.accent : t.border, marginBottom: 8 }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: activatePlan === p.id ? t.accent : t.muted, backgroundColor: activatePlan === p.id ? t.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {activatePlan === p.id && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: app.darkMode ? '#000' : '#fff' }} />}
                </View>
                <Text style={{ flex: 1, fontWeight: '700', color: t.text }}>{p.name} ({p.days}d)</Text>
                <Text style={{ color: t.muted }}>₦{p.price.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
            <Row style={{ gap: 10, marginTop: 8 }}>
              <Button label="Cancel" variant="outline" onPress={() => setActivateTarget(null)} t={t} style={{ flex: 1 }} />
              <Button label="Activate" onPress={doActivate} t={t} style={{ flex: 1 }} />
            </Row>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
