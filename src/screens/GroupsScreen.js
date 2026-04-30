// src/screens/GroupsScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  TextInput, FlatList, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors } from '../utils/theme';
import { Card, Row, Button, Input, EmptyState } from '../components/UI';

// ── GROUPS LIST ──────────────────────────────────
export default function GroupsScreen({ navigation }) {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const u = app.currentUser;
  const [showCreate, setShowCreate] = useState(false);
  const [gName, setGName] = useState('');
  const [gDesc, setGDesc] = useState('');
  const [gIcon, setGIcon] = useState('📚');
  const [gColor, setGColor] = useState('#7C3AED');

  const myGroups = app.groups.filter(g => g.isDefault || g.members?.includes(u.email) || g.admins?.includes(u.email));
  const otherGroups = app.groups.filter(g => !g.isDefault && !g.members?.includes(u.email) && !g.admins?.includes(u.email));

  const ICONS = ['📚','🎯','⚗','∑','⚔','🔬','📝','💡','🌍','📐','🧠','🔭'];
  const COLORS = ['#7C3AED','#2563EB','#059669','#DC2626','#D97706','#0891B2'];

  const createGroup = () => {
    if (!gName.trim()) return;
    app.createGroup(gName.trim(), gDesc.trim(), gIcon, gColor);
    setGName(''); setGDesc('');
    setShowCreate(false);
  };

  const GroupCard = ({ g, isMember }) => {
    const msgCount = (app.groupMessages[g.id] || []).length;
    const memberCount = g.isDefault ? app.allUsers.length : (g.members?.length || 0);
    const unread = app.unreadCount(g.id);
    const isAdmin = g.admins?.includes(u.email) || u.isAdmin;

    return (
      <TouchableOpacity
        onPress={() => {
          if (!app.isActivated() && app.trialDaysLeft() === 0) { navigation.navigate('Paywall'); return; }
          if (g.banned?.includes(u.email)) { Alert.alert('Banned', 'You are banned from this group'); return; }
          navigation.navigate('GroupChat', { groupId: g.id });
        }}
        style={{ backgroundColor: t.bg1, borderRadius: 14, borderWidth: 1, borderColor: t.border, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        activeOpacity={0.75}
      >
        <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: g.color + '18', borderWidth: 1, borderColor: g.color + '30', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18 }}>{g.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Row style={{ gap: 4, marginBottom: 2 }}>
            <Text style={{ fontWeight: '800', fontSize: 14, color: t.text }}>{g.name}</Text>
            {isAdmin && <Text style={{ fontSize: 12 }}>⭐</Text>}
          </Row>
          <Text style={{ fontSize: 12, color: t.muted }}>{msgCount} messages · {memberCount} members</Text>
        </View>
        {unread > 0 ? (
          <View style={{ backgroundColor: t.accent, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ color: app.darkMode ? '#000' : '#fff', fontSize: 10, fontWeight: '800' }}>{unread}</Text>
          </View>
        ) : !isMember ? (
          <TouchableOpacity onPress={() => app.joinGroup(g.id)} style={{ backgroundColor: t.accentDim, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: t.border }}>
            <Text style={{ color: t.accent, fontWeight: '800', fontSize: 12 }}>Join</Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ color: t.muted, fontSize: 18 }}>›</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: t.text, letterSpacing: -0.5 }}>Study Groups</Text>
          <Text style={{ fontSize: 12, color: t.muted }}>Learn together, pass together</Text>
        </View>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={{ backgroundColor: t.accentDim, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: t.border }}>
          <Text style={{ fontSize: 20, color: t.accent }}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Banner */}
        <View style={{ backgroundColor: t.accentDim, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: 12, flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 14 }}>✨</Text>
          <Text style={{ flex: 1, fontSize: 12, color: t.secondary, lineHeight: 18 }}>Groups are study-only. Off-topic posts will be removed.</Text>
        </View>

        {myGroups.length > 0 && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted, letterSpacing: 0.5, marginBottom: 8 }}>YOUR GROUPS</Text>
            {myGroups.map(g => <GroupCard key={g.id} g={g} isMember />)}
          </>
        )}

        {otherGroups.length > 0 && (
          <>
            <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted, letterSpacing: 0.5, marginTop: 12, marginBottom: 8 }}>DISCOVER</Text>
            {otherGroups.map(g => <GroupCard key={g.id} g={g} isMember={false} />)}
          </>
        )}
      </ScrollView>

      {/* Create Group Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{ backgroundColor: t.bg1, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
              <View style={{ width: 40, height: 4, backgroundColor: t.bg4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
              <Text style={{ fontSize: 18, fontWeight: '800', color: t.text, marginBottom: 16 }}>Create Study Group</Text>
              <View style={{ gap: 10 }}>
                <Input placeholder="Group name" value={gName} onChangeText={setGName} t={t} autoCapitalize="sentences" />
                <Input placeholder="Description (optional)" value={gDesc} onChangeText={setGDesc} t={t} autoCapitalize="sentences" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted }}>ICON</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {ICONS.map(ic => (
                    <TouchableOpacity key={ic} onPress={() => setGIcon(ic)} style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: gIcon === ic ? t.accentDim : t.bg2, borderWidth: 1.5, borderColor: gIcon === ic ? t.accent : t.border, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 20 }}>{ic}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted, marginTop: 4 }}>COLOR</Text>
                <Row style={{ gap: 10 }}>
                  {COLORS.map(c => (
                    <TouchableOpacity key={c} onPress={() => setGColor(c)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, borderWidth: gColor === c ? 3 : 1, borderColor: gColor === c ? t.text : 'transparent' }} />
                  ))}
                </Row>
              </View>
              <Row style={{ gap: 10, marginTop: 16 }}>
                <Button label="Cancel" variant="outline" onPress={() => setShowCreate(false)} t={t} style={{ flex: 1 }} />
                <Button label="Create Group" onPress={createGroup} t={t} style={{ flex: 1 }} />
              </Row>
              <View style={{ height: 20 }} />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── GROUP CHAT ────────────────────────────────────
export function GroupChatScreen({ route, navigation }) {
  const { groupId } = route.params;
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const u = app.currentUser;
  const flatRef = useRef(null);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const group = app.groups.find(g => g.id === groupId);
  const messages = app.groupMessages[groupId] || [];
  const isAdmin = group?.admins?.includes(u.email) || u.isAdmin;
  const isMod = isAdmin || group?.moderators?.includes(u.email);
  const isMember = group?.isDefault || group?.members?.includes(u.email) || group?.admins?.includes(u.email);
  const memberCount = group?.isDefault ? app.allUsers.length : (group?.members?.length || 0);

  useEffect(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 100);
  }, [messages.length]);

  const send = () => {
    if (!text.trim()) return;
    const result = app.sendGroupMessage(groupId, text, replyTo?.id || null);
    if (result === 'blocked') { Alert.alert('Blocked', 'Message contains off-topic content'); return; }
    setText('');
    setReplyTo(null);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const onLongPress = (msg) => {
    const isMine = msg.from === u.email;
    const options = ['Reply'];
    if (isAdmin) options.push('Pin / Unpin');
    if (isMine || isMod) options.push('Delete');
    options.push('Cancel');

    Alert.alert('Message Options', msg.text.slice(0, 60), options.map(opt => ({
      text: opt,
      style: opt === 'Delete' ? 'destructive' : opt === 'Cancel' ? 'cancel' : 'default',
      onPress: () => {
        if (opt === 'Reply') { const sender = app.getUserByEmail(msg.from); setReplyTo({ id: msg.id, name: sender?.name || 'User', text: msg.text }); }
        if (opt === 'Delete') app.deleteGroupMessage(groupId, msg.id);
        if (opt === 'Pin / Unpin') app.pinMessage(groupId, msg.id);
      },
    })));
  };

  const renderMsg = ({ item: msg }) => {
    if (msg.type === 'system') return (
      <View style={{ alignItems: 'center', marginVertical: 6 }}>
        <View style={{ backgroundColor: t.bg2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderColor: t.border }}>
          <Text style={{ fontSize: 11, color: t.muted, fontWeight: '600' }}>{msg.text}</Text>
        </View>
      </View>
    );

    const isMine = msg.from === u.email;
    const sender = app.getUserByEmail(msg.from);
    const isPinned = group?.pinned?.includes(msg.id);
    const replyMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;

    return (
      <TouchableOpacity onLongPress={() => onLongPress(msg)} activeOpacity={0.85}
        style={{ flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 7, marginBottom: 4, paddingHorizontal: 12 }}>
        {!isMine && (
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 10 }}>{(sender?.name || '?').slice(0, 2).toUpperCase()}</Text>
          </View>
        )}
        <View style={{ maxWidth: '75%', backgroundColor: isMine ? t.accent : t.bg1, borderRadius: 16, borderBottomRightRadius: isMine ? 4 : 16, borderBottomLeftRadius: isMine ? 16 : 4, padding: 10, paddingHorizontal: 13, borderWidth: isMine ? 0 : 1, borderColor: t.border }}>
          {isPinned && <Text style={{ fontSize: 9, color: isMine ? 'rgba(255,255,255,0.6)' : t.accent, marginBottom: 2 }}>📌 PINNED</Text>}
          {!isMine && sender && <Text style={{ fontSize: 11, fontWeight: '800', color: '#A78BFA', marginBottom: 3 }}>{sender.name}</Text>}
          {replyMsg && (
            <View style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 6, padding: 6, marginBottom: 6, borderLeftWidth: 2.5, borderLeftColor: isMine ? 'rgba(255,255,255,0.5)' : t.accent }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: isMine ? 'rgba(255,255,255,0.7)' : t.accent }}>
                {app.getUserByEmail(replyMsg.from)?.name || 'User'}
              </Text>
              <Text style={{ fontSize: 11, color: isMine ? 'rgba(255,255,255,0.65)' : t.muted }} numberOfLines={1}>{replyMsg.text}</Text>
            </View>
          )}
          <Text style={{ fontSize: 14, color: isMine ? (app.darkMode ? '#000' : '#fff') : t.text, lineHeight: 20 }}>{msg.text}</Text>
          <Text style={{ fontSize: 9, color: isMine ? (app.darkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)') : t.muted, marginTop: 3, textAlign: isMine ? 'right' : 'left' }}>
            {app.formatTime(msg.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!group) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header */}
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: t.text }}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowInfo(true)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: group.color + '18', borderWidth: 1, borderColor: group.color + '30', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16 }}>{group.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', fontSize: 15, color: t.text }}>{group.name}</Text>
            <Text style={{ fontSize: 11, color: t.muted }}>{memberCount} members</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowInfo(true)}>
          <Text style={{ fontSize: 18, color: t.muted }}>ⓘ</Text>
        </TouchableOpacity>
      </View>

      {/* Pinned bar */}
      {group.pinned?.length > 0 && (() => {
        const pinnedMsg = messages.find(m => m.id === group.pinned[group.pinned.length - 1]);
        if (!pinnedMsg) return null;
        return (
          <View style={{ backgroundColor: t.accentDim, borderBottomWidth: 1, borderColor: t.border, padding: 10, paddingHorizontal: 16, flexDirection: 'row', gap: 8 }}>
            <Text style={{ fontSize: 12 }}>📌</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: t.accent }}>PINNED</Text>
              <Text style={{ fontSize: 12, color: t.secondary }} numberOfLines={1}>{pinnedMsg.text}</Text>
            </View>
          </View>
        );
      })()}

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderMsg}
        contentContainerStyle={{ paddingVertical: 12 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>💬</Text>
            <Text style={{ fontSize: 14, color: t.muted }}>No messages yet. Start the conversation!</Text>
          </View>
        }
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Reply preview */}
      {replyTo && (
        <View style={{ backgroundColor: t.bg1, borderTopWidth: 1, borderColor: t.border, padding: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 3, height: 36, backgroundColor: t.accent, borderRadius: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: t.accent }}>Replying to {replyTo.name}</Text>
            <Text style={{ fontSize: 12, color: t.muted }} numberOfLines={1}>{replyTo.text}</Text>
          </View>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Text style={{ fontSize: 18, color: t.muted }}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input */}
      {isMember ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ backgroundColor: t.bg1, borderTopWidth: 1, borderColor: t.border, padding: 10, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor={t.muted}
              multiline
              style={{ flex: 1, backgroundColor: t.bg2, borderRadius: 22, borderWidth: 1, borderColor: t.border, paddingHorizontal: 16, paddingVertical: 10, color: t.text, fontSize: 14, maxHeight: 100 }}
              onSubmitEditing={send}
            />
            <TouchableOpacity onPress={send} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: app.darkMode ? '#000' : '#fff', fontSize: 18 }}>↗</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View style={{ padding: 14, backgroundColor: t.bg1, borderTopWidth: 1, borderColor: t.border }}>
          <Button label="Join to participate" onPress={() => app.joinGroup(groupId)} t={t} />
        </View>
      )}

      {/* Group info modal */}
      <Modal visible={showInfo} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: t.bg1, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' }}>
            <View style={{ padding: 20 }}>
              <View style={{ width: 40, height: 4, backgroundColor: t.bg4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
              <Row style={{ gap: 12, marginBottom: 16 }}>
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: group.color + '18', borderWidth: 1, borderColor: group.color + '30', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24 }}>{group.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: t.text }}>{group.name}</Text>
                  <Text style={{ fontSize: 12, color: t.muted }}>{memberCount} members</Text>
                </View>
              </Row>
              <View style={{ backgroundColor: t.bg2, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: t.border }}>
                <Text style={{ fontSize: 13, color: t.secondary, lineHeight: 20 }}>{group.description || 'No description'}</Text>
              </View>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted, marginBottom: 10 }}>MEMBERS</Text>
              {app.allUsers.filter(usr => group.isDefault || group.members?.includes(usr.email)).slice(0, 20).map(usr => {
                const role = group.admins?.includes(usr.email) ? 'Admin' : group.moderators?.includes(usr.email) ? 'Mod' : 'Member';
                return (
                  <Row key={usr.email} style={{ marginBottom: 10, gap: 10 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>{usr.name.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', fontSize: 13, color: t.text }}>{usr.name}</Text>
                      <Text style={{ fontSize: 11, color: t.muted }}>{usr.course1}</Text>
                    </View>
                    <View style={{ backgroundColor: role === 'Admin' ? '#F59E0B18' : t.bg2, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: role === 'Admin' ? '#F59E0B30' : t.border }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: role === 'Admin' ? '#F59E0B' : t.muted }}>{role}</Text>
                    </View>
                  </Row>
                );
              })}
              {!group.isDefault && group.members?.includes(u.email) && (
                <TouchableOpacity onPress={() => { app.leaveGroup(groupId); setShowInfo(false); navigation.goBack(); }} style={{ marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: t.danger + '40', padding: 13, alignItems: 'center' }}>
                  <Text style={{ color: t.danger, fontWeight: '700' }}>Leave Group</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
