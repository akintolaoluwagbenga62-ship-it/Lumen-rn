// src/screens/FlashcardsScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors, subjectColors } from '../utils/theme';
import { Card, Row, Button, Input, EmptyState } from '../components/UI';
import { SUBJECTS } from '../data/constants';

export default function FlashcardsScreen({ navigation }) {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const myDecks = app.decks.filter(d => d.ownerId === app.currentUser?.email);
  const [showCreate, setShowCreate] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckSubject, setDeckSubject] = useState('Mathematics');
  const [deckColor, setDeckColor] = useState('#7C3AED');

  const COLORS = ['#7C3AED', '#2563EB', '#059669', '#DC2626', '#D97706', '#0891B2'];

  const createDeck = () => {
    if (!deckName.trim()) return;
    app.createDeck(deckName.trim(), deckSubject, deckColor);
    setDeckName('');
    setShowCreate(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: t.text, letterSpacing: -0.5 }}>Flashcards</Text>
          <Text style={{ fontSize: 12, color: t.muted }}>Create and study your decks</Text>
        </View>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={{ backgroundColor: t.accentDim, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: t.border }}>
          <Text style={{ fontSize: 20, color: t.accent }}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {myDecks.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🃏</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: t.text, marginBottom: 8 }}>No flashcard decks yet</Text>
            <Text style={{ fontSize: 13, color: t.muted, marginBottom: 20, textAlign: 'center' }}>Create your first deck to start studying smarter</Text>
            <Button label="Create Deck" onPress={() => setShowCreate(true)} t={t} style={{ paddingHorizontal: 28 }} />
          </View>
        ) : (
          myDecks.map(deck => {
            const color = deck.color || '#7C3AED';
            return (
              <TouchableOpacity key={deck.id} onPress={() => navigation.navigate('DeckDetail', { deckId: deck.id })}
                style={{ backgroundColor: t.bg1, borderRadius: 16, borderWidth: 1, borderColor: t.border, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: color + '15', borderWidth: 1, borderColor: color + '25', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24 }}>🃏</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', fontSize: 15, color: t.text, marginBottom: 3 }}>{deck.name}</Text>
                  <Text style={{ fontSize: 12, color: t.muted }}>{deck.subject} · {deck.cards.length} cards</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 18, color: t.muted }}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Create Deck Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{ backgroundColor: t.bg1, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
              <View style={{ width: 40, height: 4, backgroundColor: t.bg4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
              <Text style={{ fontSize: 18, fontWeight: '800', color: t.text, marginBottom: 16 }}>New Flashcard Deck</Text>
              <View style={{ gap: 12 }}>
                <Input placeholder='Deck name (e.g. "Biology Chapter 3")' value={deckName} onChangeText={setDeckName} t={t} autoCapitalize="sentences" />
                <View style={{ backgroundColor: t.bg2, borderRadius: 11, borderWidth: 1, borderColor: t.border, padding: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted, marginBottom: 8 }}>SUBJECT</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {SUBJECTS.map(s => (
                      <TouchableOpacity key={s} onPress={() => setDeckSubject(s)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: deckSubject === s ? t.accent : t.bg3, borderWidth: 1, borderColor: deckSubject === s ? t.accent : t.border }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: deckSubject === s ? (app.darkMode ? '#000' : '#fff') : t.text }}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted, marginBottom: 8 }}>COLOR</Text>
                  <Row style={{ gap: 10 }}>
                    {COLORS.map(c => (
                      <TouchableOpacity key={c} onPress={() => setDeckColor(c)} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c, borderWidth: deckColor === c ? 3 : 1, borderColor: deckColor === c ? t.text : 'transparent' }} />
                    ))}
                  </Row>
                </View>
              </View>
              <Row style={{ gap: 10, marginTop: 20 }}>
                <Button label="Cancel" variant="outline" onPress={() => setShowCreate(false)} t={t} style={{ flex: 1 }} />
                <Button label="Create Deck" onPress={createDeck} t={t} style={{ flex: 1 }} />
              </Row>
              <View style={{ height: 20 }} />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── DECK DETAIL ───────────────────────────────────
export function DeckDetailScreen({ route, navigation }) {
  const { deckId } = route.params;
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const deck = app.decks.find(d => d.id === deckId);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [studying, setStudying] = useState(false);

  if (!deck) return null;

  const addCard = () => {
    if (!cardFront.trim() || !cardBack.trim()) return;
    app.addCard(deckId, cardFront.trim(), cardBack.trim());
    setCardFront(''); setCardBack('');
    setShowAddCard(false);
  };

  if (studying && deck.cards.length > 0) {
    return <StudyMode deck={deck} onExit={() => setStudying(false)} t={t} app={app} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: t.text }}>←</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontWeight: '800', fontSize: 16, color: t.text }}>{deck.name}</Text>
        <TouchableOpacity onPress={() => Alert.alert('Delete Deck?', 'This cannot be undone.', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { app.deleteDeck(deckId); navigation.goBack(); } }])}>
          <Text style={{ fontSize: 18, color: t.danger }}>🗑️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowAddCard(true)} style={{ marginLeft: 4 }}>
          <Text style={{ fontSize: 22, color: t.accent }}>+</Text>
        </TouchableOpacity>
      </View>

      {deck.cards.length > 0 && (
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <Button label="▶ Study Now" onPress={() => setStudying(true)} t={t} />
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {deck.cards.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🃏</Text>
            <Text style={{ fontSize: 14, color: t.muted, marginBottom: 16 }}>No cards yet. Add your first one!</Text>
            <Button label="Add Card" onPress={() => setShowAddCard(true)} t={t} style={{ paddingHorizontal: 28 }} />
          </View>
        ) : (
          deck.cards.map((card, i) => (
            <Card key={card.id} t={t}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted, marginBottom: 4 }}>Q {i + 1}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: t.text, marginBottom: 8, lineHeight: 20 }}>{card.front}</Text>
              <View style={{ height: 1, backgroundColor: t.border, marginBottom: 8 }} />
              <Text style={{ fontSize: 13, color: t.secondary, lineHeight: 19 }}>{card.back}</Text>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Card Modal */}
      <Modal visible={showAddCard} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{ backgroundColor: t.bg1, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
              <View style={{ width: 40, height: 4, backgroundColor: t.bg4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
              <Text style={{ fontSize: 18, fontWeight: '800', color: t.text, marginBottom: 16 }}>Add Flashcard</Text>
              <View style={{ gap: 10 }}>
                <Input placeholder="Front — Question or term" value={cardFront} onChangeText={setCardFront} t={t} multiline autoCapitalize="sentences" style={{ minHeight: 70 }} />
                <Input placeholder="Back — Answer or definition" value={cardBack} onChangeText={setCardBack} t={t} multiline autoCapitalize="sentences" style={{ minHeight: 70 }} />
              </View>
              <Row style={{ gap: 10, marginTop: 16 }}>
                <Button label="Cancel" variant="outline" onPress={() => setShowAddCard(false)} t={t} style={{ flex: 1 }} />
                <Button label="Add Card" onPress={addCard} t={t} style={{ flex: 1 }} />
              </Row>
              <View style={{ height: 20 }} />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── STUDY MODE ────────────────────────────────────
function StudyMode({ deck, onExit, t, app }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);

  const card = deck.cards[index];
  const total = deck.cards.length;

  const next = (didKnow) => {
    if (didKnow) setKnown(k => k + 1);
    if (index < total - 1) {
      setIndex(i => i + 1);
      setFlipped(false);
    } else {
      Alert.alert('Session Complete! 🎉', `You knew ${known + (didKnow ? 1 : 0)} of ${total} cards.`, [
        { text: 'Study Again', onPress: () => { setIndex(0); setFlipped(false); setKnown(0); } },
        { text: 'Done', onPress: onExit },
      ]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={onExit}><Text style={{ fontSize: 22, color: t.text }}>✕</Text></TouchableOpacity>
        <Text style={{ flex: 1, fontWeight: '800', fontSize: 15, color: t.text }}>{index + 1} / {total}</Text>
        <Text style={{ fontSize: 13, color: t.success, fontWeight: '700' }}>{known} known</Text>
      </View>
      {/* Progress */}
      <View style={{ backgroundColor: t.bg3, height: 4 }}>
        <View style={{ backgroundColor: t.accent, height: 4, width: `${((index + 1) / total) * 100}%` }} />
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        {/* Card */}
        <TouchableOpacity onPress={() => setFlipped(f => !f)} activeOpacity={0.9}
          style={{ flex: 1, backgroundColor: flipped ? t.accentDim : t.bg1, borderRadius: 24, borderWidth: 1.5, borderColor: flipped ? t.accent : t.border, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: t.muted, letterSpacing: 1 }}>{flipped ? 'ANSWER' : 'QUESTION'}</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: t.text, lineHeight: 30, textAlign: 'center' }}>{flipped ? card.back : card.front}</Text>
          <Text style={{ fontSize: 12, color: t.muted, marginTop: 8 }}>Tap to {flipped ? 'hide' : 'reveal'}</Text>
        </TouchableOpacity>

        {/* Buttons */}
        {flipped ? (
          <Row style={{ gap: 12, marginTop: 20 }}>
            <TouchableOpacity onPress={() => next(false)} style={{ flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: t.danger + '50', backgroundColor: t.danger + '10', padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 18 }}>✗</Text>
              <Text style={{ fontWeight: '800', color: t.danger, fontSize: 13, marginTop: 4 }}>Again</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => next(true)} style={{ flex: 1, borderRadius: 14, backgroundColor: t.success, padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 18 }}>✓</Text>
              <Text style={{ fontWeight: '800', color: '#fff', fontSize: 13, marginTop: 4 }}>Got it!</Text>
            </TouchableOpacity>
          </Row>
        ) : (
          <View style={{ marginTop: 20 }}>
            <Button label="Tap card to reveal answer" variant="outline" onPress={() => setFlipped(true)} t={t} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
