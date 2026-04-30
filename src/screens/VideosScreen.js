// src/screens/VideosScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert, Linking, TextInput, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors, subjectColors } from '../utils/theme';
import { Card, Row, Button, Input, Badge } from '../components/UI';
import { SUBJECTS } from '../data/constants';

export default function VideosScreen({ navigation }) {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [note, setNote] = useState('');

  const filtered = filter === 'All' ? app.videos : app.videos.filter(v => v.subject === filter);

  const getYoutubeId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const getThumbnail = (url) => {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  };

  const openVideo = (url) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Cannot open this link'));
  };

  const addVideo = () => {
    if (!url.trim() || !title.trim()) { Alert.alert('Error', 'Title and URL are required'); return; }
    app.addVideo(url.trim(), title.trim(), subject, note.trim() || null);
    setUrl(''); setTitle(''); setNote('');
    setShowAdd(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header */}
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: t.text, letterSpacing: -0.5 }}>Video Lessons</Text>
          <Text style={{ fontSize: 12, color: t.muted }}>Watch & learn at your pace</Text>
        </View>
        {(app.currentUser?.isAdmin) && (
          <TouchableOpacity onPress={() => setShowAdd(true)} style={{ backgroundColor: t.accentDim, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: t.border }}>
            <Text style={{ fontSize: 20, color: t.accent }}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border }}>
        <Row style={{ padding: 10, paddingHorizontal: 16, gap: 8 }}>
          {['All', ...SUBJECTS].map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: filter === f ? t.accent : t.bg2, borderWidth: 1, borderColor: filter === f ? t.accent : t.border }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: filter === f ? (app.darkMode ? '#000' : '#fff') : t.text }}>{f}</Text>
            </TouchableOpacity>
          ))}
        </Row>
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>▶️</Text>
            <Text style={{ fontSize: 14, color: t.muted }}>No videos yet for this subject.</Text>
          </View>
        ) : (
          filtered.map(video => {
            const thumb = getThumbnail(video.url);
            const isAdmin = app.currentUser?.isAdmin;
            const subColor = subjectColors[video.subject] || t.accent;
            return (
              <Card key={video.id} t={t} style={{ marginBottom: 12 }}>
                {/* Thumbnail */}
                <TouchableOpacity onPress={() => openVideo(video.url)} style={{ backgroundColor: t.bg3, borderRadius: 10, height: 160, overflow: 'hidden', marginBottom: 12, alignItems: 'center', justifyContent: 'center' }}>
                  {thumb ? (
                    <View style={{ width: '100%', height: '100%', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Fallback play button since Image requires react-native */}
                      <View style={{ width: '100%', height: '100%', backgroundColor: subColor + '20', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 24, marginLeft: 4 }}>▶</Text>
                        </View>
                        <Text style={{ color: '#fff', fontSize: 11, marginTop: 10, fontWeight: '700', opacity: 0.8 }}>Tap to watch on YouTube</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 36 }}>▶️</Text>
                      <Text style={{ color: t.muted, fontSize: 12 }}>Open Link</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Info */}
                <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ backgroundColor: subColor + '15', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: subColor + '25' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: subColor }}>{video.subject}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: t.muted }}>{app.formatTime(video.postedAt)}</Text>
                </Row>
                <Text style={{ fontSize: 15, fontWeight: '800', color: t.text, lineHeight: 21, marginBottom: 4 }}>{video.title}</Text>
                {video.note && <Text style={{ fontSize: 12, color: t.secondary, lineHeight: 18, marginBottom: 10 }}>{video.note}</Text>}

                <Row style={{ gap: 8 }}>
                  <Button label="▶ Watch Now" onPress={() => openVideo(video.url)} t={t} style={{ flex: 1 }} />
                  {isAdmin && (
                    <TouchableOpacity onPress={() => Alert.alert('Delete Video?', video.title, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => app.deleteVideo(video.id) }])} style={{ padding: 12, backgroundColor: t.danger + '15', borderRadius: 10, borderWidth: 1, borderColor: t.danger + '25' }}>
                      <Text style={{ fontSize: 14 }}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </Row>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Add Video Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: t.bg1, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
            <View style={{ width: 40, height: 4, backgroundColor: t.bg4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: t.text, marginBottom: 16 }}>Add Video Link</Text>
            <View style={{ gap: 10 }}>
              <Input placeholder="YouTube URL" value={url} onChangeText={setUrl} t={t} />
              <Input placeholder="Video title" value={title} onChangeText={setTitle} t={t} autoCapitalize="sentences" />
              <Input placeholder="Note (optional)" value={note} onChangeText={setNote} t={t} autoCapitalize="sentences" />
              <View style={{ backgroundColor: t.bg2, borderRadius: 11, borderWidth: 1, borderColor: t.border, padding: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted, marginBottom: 8 }}>SUBJECT</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {SUBJECTS.map(s => (
                    <TouchableOpacity key={s} onPress={() => setSubject(s)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: subject === s ? t.accent : t.bg3, borderWidth: 1, borderColor: subject === s ? t.accent : t.border }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: subject === s ? (app.darkMode ? '#000' : '#fff') : t.text }}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <Row style={{ gap: 10, marginTop: 16 }}>
              <Button label="Cancel" variant="outline" onPress={() => setShowAdd(false)} t={t} style={{ flex: 1 }} />
              <Button label="Add Video" onPress={addVideo} t={t} style={{ flex: 1 }} />
            </Row>
            <View style={{ height: 20 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── NEWS SCREEN ──────────────────────────────────
export function NewsScreen({ navigation }) {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsBody, setNewsBody] = useState('');
  const [newsCategory, setNewsCategory] = useState('JAMB Update');
  const [newsUrgent, setNewsUrgent] = useState(false);

  const categories = ['All', 'JAMB Update', 'Study Tips', 'App Update', 'Admissions'];
  const filtered = filter === 'All' ? app.news : app.news.filter(n => n.category === filter);

  const addNewsItem = () => {
    if (!newsTitle.trim() || !newsSummary.trim()) { Alert.alert('Error', 'Title and summary are required'); return; }
    app.addNews({ title: newsTitle.trim(), summary: newsSummary.trim(), body: newsBody.trim(), category: newsCategory, urgent: newsUrgent });
    setNewsTitle(''); setNewsSummary(''); setNewsBody('');
    setShowAdd(false);
  };

  const categoryColor = (cat) => ({ 'JAMB Update': t.accent, 'Study Tips': t.success, 'App Update': t.blue, 'Admissions': t.gold }[cat] || t.muted);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header */}
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: t.text, letterSpacing: -0.5 }}>JAMB News</Text>
          <Text style={{ fontSize: 12, color: t.muted }}>Updates & study resources</Text>
        </View>
        {app.currentUser?.isAdmin && (
          <TouchableOpacity onPress={() => setShowAdd(true)} style={{ backgroundColor: t.accentDim, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: t.border }}>
            <Text style={{ fontSize: 20, color: t.accent }}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border }}>
        <Row style={{ padding: 10, paddingHorizontal: 16, gap: 8 }}>
          {categories.map(cat => (
            <TouchableOpacity key={cat} onPress={() => setFilter(cat)} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: filter === cat ? t.accent : t.bg2, borderWidth: 1, borderColor: filter === cat ? t.accent : t.border }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: filter === cat ? (app.darkMode ? '#000' : '#fff') : t.text }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </Row>
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📰</Text>
            <Text style={{ fontSize: 14, color: t.muted }}>No news in this category yet.</Text>
          </View>
        ) : (
          filtered.map(n => (
            <TouchableOpacity key={n.id} onPress={() => navigation.navigate('NewsDetail', { item: n })} style={{ backgroundColor: t.bg1, borderRadius: 16, borderWidth: 1.5, borderColor: n.urgent ? t.danger + '40' : t.border, padding: 16, marginBottom: 12 }}>
              {n.urgent && (
                <View style={{ backgroundColor: t.danger + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8, borderWidth: 1, borderColor: t.danger + '25' }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: t.danger }}>🚨 URGENT</Text>
                </View>
              )}
              <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ backgroundColor: categoryColor(n.category) + '15', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: categoryColor(n.category) + '25' }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: categoryColor(n.category) }}>{n.category}</Text>
                </View>
                <Text style={{ fontSize: 11, color: t.muted }}>{n.date}</Text>
              </Row>
              <Text style={{ fontSize: 15, fontWeight: '800', color: t.text, lineHeight: 22, marginBottom: 6 }}>{n.title}</Text>
              <Text style={{ fontSize: 12, color: t.secondary, lineHeight: 18 }} numberOfLines={3}>{n.summary}</Text>
              <Row style={{ justifyContent: 'space-between', marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: t.accent, fontWeight: '700' }}>Read more →</Text>
                {app.currentUser?.isAdmin && (
                  <TouchableOpacity onPress={() => Alert.alert('Delete?', n.title, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => app.deleteNews(n.id) }])}>
                    <Text style={{ fontSize: 12, color: t.danger }}>Delete</Text>
                  </TouchableOpacity>
                )}
              </Row>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add News Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <ScrollView style={{ backgroundColor: t.bg1, borderTopLeftRadius: 24, borderTopRightRadius: 24 }} contentContainerStyle={{ padding: 20 }}>
            <View style={{ width: 40, height: 4, backgroundColor: t.bg4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: t.text, marginBottom: 16 }}>Post News Article</Text>
            <View style={{ gap: 10 }}>
              <Input placeholder="Title" value={newsTitle} onChangeText={setNewsTitle} t={t} autoCapitalize="sentences" />
              <Input placeholder="Summary (shown in list)" value={newsSummary} onChangeText={setNewsSummary} t={t} multiline autoCapitalize="sentences" style={{ minHeight: 70 }} />
              <Input placeholder="Full article body" value={newsBody} onChangeText={setNewsBody} t={t} multiline autoCapitalize="sentences" style={{ minHeight: 100 }} />
              <View style={{ backgroundColor: t.bg2, borderRadius: 11, borderWidth: 1, borderColor: t.border, padding: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted, marginBottom: 8 }}>CATEGORY</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {['JAMB Update', 'Study Tips', 'App Update', 'Admissions'].map(cat => (
                    <TouchableOpacity key={cat} onPress={() => setNewsCategory(cat)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: newsCategory === cat ? t.accent : t.bg3, borderWidth: 1, borderColor: newsCategory === cat ? t.accent : t.border }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: newsCategory === cat ? (app.darkMode ? '#000' : '#fff') : t.text }}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity onPress={() => setNewsUrgent(!newsUrgent)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: newsUrgent ? t.danger + '12' : t.bg2, borderRadius: 11, borderWidth: 1, borderColor: newsUrgent ? t.danger + '30' : t.border, padding: 12 }}>
                <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: newsUrgent ? t.danger : t.bg3, alignItems: 'center', justifyContent: 'center' }}>
                  {newsUrgent && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: newsUrgent ? t.danger : t.text }}>Mark as Urgent</Text>
              </TouchableOpacity>
            </View>
            <Row style={{ gap: 10, marginTop: 16 }}>
              <Button label="Cancel" variant="outline" onPress={() => setShowAdd(false)} t={t} style={{ flex: 1 }} />
              <Button label="Post Article" onPress={addNewsItem} t={t} style={{ flex: 1 }} />
            </Row>
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── NEWS DETAIL ──────────────────────────────────
export function NewsDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const categoryColor = ({ 'JAMB Update': t.accent, 'Study Tips': t.success, 'App Update': t.blue, 'Admissions': t.gold }[item.category] || t.muted);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: t.text }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: '800', fontSize: 16, color: t.text, flex: 1 }}>Article</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {item.urgent && (
          <View style={{ backgroundColor: t.danger + '15', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 12, borderWidth: 1, borderColor: t.danger + '25' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: t.danger }}>🚨 URGENT</Text>
          </View>
        )}
        <View style={{ backgroundColor: categoryColor + '15', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 12, borderWidth: 1, borderColor: categoryColor + '25' }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: categoryColor }}>{item.category}</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '900', color: t.text, lineHeight: 30, letterSpacing: -0.5, marginBottom: 12 }}>{item.title}</Text>
        <Text style={{ fontSize: 12, color: t.muted, marginBottom: 20 }}>📅 {item.date}</Text>
        <View style={{ backgroundColor: t.bg1, borderRadius: 14, borderWidth: 1, borderColor: t.border, padding: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 14, color: t.secondary, lineHeight: 22, fontStyle: 'italic' }}>{item.summary}</Text>
        </View>
        <Text style={{ fontSize: 15, color: t.text, lineHeight: 26, whiteSpace: 'pre-line' }}>{item.body || item.summary}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
