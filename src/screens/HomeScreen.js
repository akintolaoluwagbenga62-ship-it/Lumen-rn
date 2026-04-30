// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors, subjectColors, subjectIcons } from '../utils/theme';
import { Card, Row, InfoBanner } from '../components/UI';
import { SUBJECTS } from '../data/constants';

export default function HomeScreen({ navigation }) {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const u = app.currentUser;
  const xp = app.getXP(u);
  const level = app.getLevel(u);
  const nextXp = level * level * 100;
  const board = app.leaderboard().slice(0, 3);
  const recentNews = app.news.slice(0, 2);
  const urgentNews = app.news.find(n => n.urgent);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Row style={{ justifyContent: 'space-between', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 13, color: t.muted }}>{greeting()},</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: t.text, letterSpacing: -0.5 }}>{u?.name?.split(' ')[0]} 👋</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ position: 'relative' }}>
            <View style={{ width: 42, height: 42, backgroundColor: t.bg2, borderRadius: 12, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
            </View>
            {app.unreadNotifCount() > 0 && (
              <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: t.danger, borderRadius: 10, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{app.unreadNotifCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Row>

        {/* Urgent news */}
        {urgentNews && (
          <TouchableOpacity onPress={() => navigation.navigate('NewsDetail', { item: urgentNews })} style={{ backgroundColor: t.danger + '15', borderRadius: 14, borderWidth: 1, borderColor: t.danger + '30', padding: 14, marginBottom: 16, flexDirection: 'row', gap: 10 }}>
            <Text style={{ fontSize: 20 }}>🚨</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: t.danger, marginBottom: 2 }}>URGENT</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: t.text, lineHeight: 18 }}>{urgentNews.title}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Trial banner */}
        {app.isOnTrial() && (
          <InfoBanner text={`🎁 Free trial: ${app.trialDaysLeft()} days left. Upgrade for full access.`} icon="⏱️" t={t} />
        )}

        {/* XP / Level Card */}
        <Card t={t} style={{ marginBottom: 16 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 12, color: t.muted, fontWeight: '600' }}>Your Progress</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: t.text }}>Level {level} · {xp} XP</Text>
            </View>
            <View style={{ backgroundColor: t.accentDim, borderRadius: 12, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 22 }}>🏆</Text>
            </View>
          </Row>
          <View style={{ backgroundColor: t.bg3, borderRadius: 4, height: 6, overflow: 'hidden' }}>
            <View style={{ backgroundColor: t.accent, height: 6, width: `${Math.min((xp / nextXp) * 100, 100)}%`, borderRadius: 4 }} />
          </View>
          <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ fontSize: 11, color: t.muted }}>Lv.{level}</Text>
            <Text style={{ fontSize: 11, color: t.muted }}>{xp}/{nextXp} XP to Lv.{level + 1}</Text>
          </Row>
          {/* Streak */}
          {(u?.streak > 0) && (
            <View style={{ marginTop: 12, backgroundColor: t.gold + '15', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: t.gold + '25', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 18 }}>🔥</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: t.text }}>{u.streak}-day study streak!</Text>
              <Text style={{ fontSize: 12, color: t.muted }}>Keep it going!</Text>
            </View>
          )}
        </Card>

        {/* Quick Actions */}
        <Text style={{ fontSize: 16, fontWeight: '800', color: t.text, marginBottom: 10 }}>Quick Start</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {[
            { icon: '📝', label: 'CBT Practice', screen: 'CBT', color: t.accent },
            { icon: '👥', label: 'Study Groups', screen: 'Groups', color: '#7C3AED' },
            { icon: '🃏', label: 'Flashcards', screen: 'Flashcards', color: '#0891B2' },
            { icon: '▶️', label: 'Video Lessons', screen: 'Videos', color: '#DC2626' },
            { icon: '📰', label: 'JAMB News', screen: 'News', color: '#059669' },
            { icon: '📊', label: 'Leaderboard', screen: 'Leaderboard', color: t.gold },
          ].map(item => (
            <TouchableOpacity key={item.label} onPress={() => navigation.navigate(item.screen)} style={{ width: '30%', backgroundColor: item.color + '12', borderRadius: 14, borderWidth: 1, borderColor: item.color + '25', padding: 14, alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: t.text, textAlign: 'center' }}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subject Quick Practice */}
        <Text style={{ fontSize: 16, fontWeight: '800', color: t.text, marginBottom: 10 }}>Practice by Subject</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <Row style={{ gap: 10, paddingRight: 16 }}>
            {SUBJECTS.map(sub => (
              <TouchableOpacity key={sub} onPress={() => navigation.navigate('Test', { subject: sub })} style={{ backgroundColor: subjectColors[sub] + '12', borderRadius: 14, borderWidth: 1, borderColor: subjectColors[sub] + '25', padding: 14, width: 110, gap: 6 }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: subjectColors[sub] }}>{subjectIcons[sub]}</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: t.text }}>{sub}</Text>
                <Text style={{ fontSize: 10, color: t.muted }}>20 questions</Text>
              </TouchableOpacity>
            ))}
          </Row>
        </ScrollView>

        {/* Stats summary */}
        <Card t={t} style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: t.text, marginBottom: 12 }}>Your Stats</Text>
          <View style={{ flexDirection: 'row' }}>
            {[
              [u?.testsTaken || 0, 'Tests'],
              [u?.scores?.length ? Math.round(u.scores.reduce((a, b) => a + b, 0) / u.scores.length) + '%' : '0%', 'Avg Score'],
              [u?.streak || 0, 'Day Streak'],
            ].map(([v, l], i) => (
              <View key={l} style={{ flex: 1, alignItems: 'center', borderRightWidth: i < 2 ? 1 : 0, borderColor: t.border }}>
                <Text style={{ fontWeight: '900', fontSize: 22, color: t.text }}>{v}</Text>
                <Text style={{ fontSize: 10, color: t.muted, fontWeight: '600' }}>{l}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Top 3 leaderboard */}
        <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: t.text }}>Top Students</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
            <Text style={{ fontSize: 13, color: t.accent, fontWeight: '700' }}>See all →</Text>
          </TouchableOpacity>
        </Row>
        {board.map((usr, i) => (
          <Card key={usr.email} t={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 18, width: 28 }}>{['🥇', '🥈', '🥉'][i]}</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: t.text, flex: 1 }}>{usr.name}</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: t.accent }}>{app.getXP(usr)} XP</Text>
          </Card>
        ))}

        {/* Latest news */}
        <Row style={{ justifyContent: 'space-between', marginTop: 4, marginBottom: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: t.text }}>Latest News</Text>
          <TouchableOpacity onPress={() => navigation.navigate('News')}>
            <Text style={{ fontSize: 13, color: t.accent, fontWeight: '700' }}>See all →</Text>
          </TouchableOpacity>
        </Row>
        {recentNews.map(n => (
          <TouchableOpacity key={n.id} onPress={() => navigation.navigate('NewsDetail', { item: n })} style={{ backgroundColor: t.bg1, borderRadius: 14, borderWidth: 1, borderColor: t.border, padding: 14, marginBottom: 8 }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ backgroundColor: t.accentDim, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: t.accent }}>{n.category}</Text>
              </View>
              <Text style={{ fontSize: 11, color: t.muted }}>{n.date}</Text>
            </Row>
            <Text style={{ fontSize: 14, fontWeight: '700', color: t.text, lineHeight: 20, marginBottom: 4 }}>{n.title}</Text>
            <Text style={{ fontSize: 12, color: t.muted, lineHeight: 18 }} numberOfLines={2}>{n.summary}</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}
