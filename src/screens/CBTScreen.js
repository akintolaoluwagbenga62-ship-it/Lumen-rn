// src/screens/CBTScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors, subjectColors, subjectIcons } from '../utils/theme';
import { Card, Row, Button } from '../components/UI';
import { JAMB_QUESTIONS, SUBJECTS } from '../data/constants';

export default function CBTScreen({ navigation }) {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const board = app.leaderboard().slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 22, fontWeight: '900', color: t.text, letterSpacing: -0.5, marginBottom: 4 }}>CBT Practice</Text>
        <Text style={{ fontSize: 13, color: t.muted, marginBottom: 20 }}>JAMB-style questions with timer</Text>

        {/* Subject Grid */}
        <Text style={{ fontSize: 14, fontWeight: '800', color: t.text, marginBottom: 10 }}>Choose Subject</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {SUBJECTS.map(sub => (
            <TouchableOpacity key={sub} onPress={() => {
              if (!app.isActivated() && app.trialDaysLeft() === 0) { navigation.navigate('Paywall'); return; }
              navigation.navigate('Test', { subject: sub });
            }}
              style={{ width: '47%', backgroundColor: subjectColors[sub] + '10', borderRadius: 16, borderWidth: 1, borderColor: subjectColors[sub] + '25', padding: 16, gap: 8 }}>
              <Text style={{ fontSize: 28, fontWeight: '800', color: subjectColors[sub] }}>{subjectIcons[sub]}</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: t.text }}>{sub}</Text>
              <Text style={{ fontSize: 11, color: t.muted }}>{JAMB_QUESTIONS[sub]?.length || 0} questions</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips Card */}
        <Card t={t} style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: t.text, marginBottom: 10 }}>📌 CBT Tips</Text>
          {['Read every question twice before answering', 'Eliminate obviously wrong options first', 'Do not spend more than 90 seconds per question', 'Flag difficult questions and return to them'].map((tip, i) => (
            <Row key={i} style={{ gap: 8, marginBottom: 6 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: t.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: t.accent }}>{i + 1}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 12, color: t.secondary, lineHeight: 18 }}>{tip}</Text>
            </Row>
          ))}
        </Card>

        {/* Leaderboard */}
        <Text style={{ fontSize: 14, fontWeight: '800', color: t.text, marginBottom: 10 }}>🏆 Top Students</Text>
        {board.map((u, i) => {
          const isMe = u.email === app.currentUser?.email;
          return (
            <Card key={u.email} t={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: isMe ? t.accentDim : t.bg1, borderColor: isMe ? t.accent : t.border }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: ['#FBBF24','#9CA3AF','#CA8A04'][i] ? `${['#FBBF24','#9CA3AF','#CA8A04'][i]}25` : t.bg3, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '800', fontSize: 13, color: ['#FBBF24','#9CA3AF','#CA8A04'][i] || t.muted }}>{i + 1}</Text>
              </View>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>{u.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: t.text }}>{u.name}{isMe ? ' (You)' : ''}</Text>
                <Text style={{ fontSize: 11, color: t.muted }}>{u.testsTaken} tests · Lv.{app.getLevel(u)}</Text>
              </View>
              <Text style={{ fontWeight: '800', fontSize: 14, color: t.accent }}>{app.getXP(u)} XP</Text>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── TEST SCREEN ──────────────────────────────────
export function TestScreen({ route, navigation }) {
  const { subject } = route.params;
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;

  const [questions] = useState(() => {
    const qs = [...(JAMB_QUESTIONS[subject] || [])].sort(() => Math.random() - 0.5).slice(0, 20);
    return qs;
  });
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(20 * 60);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => setSeconds(s => { if (s <= 1) { clearInterval(timer.current); finish(); return 0; } return s - 1; }), 1000);
    return () => clearInterval(timer.current);
  }, []);

  const finish = () => {
    clearInterval(timer.current);
    let sc = 0;
    const ans = { ...answers };
    if (selected !== null) ans[current] = selected;
    questions.forEach((q, i) => { if (ans[i] === q.answer) sc++; });
    setScore(sc);
    setDone(true);
    app.recordTest(sc, questions.length, subject);
  };

  const selectOption = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    setAnswers(p => ({ ...p, [current]: idx }));
  };

  const next = () => {
    if (current < questions.length - 1) {
      const nextQ = current + 1;
      setCurrent(nextQ);
      setSelected(answers[nextQ] ?? null);
      setAnswered(answers[nextQ] !== undefined);
    } else finish();
  };

  const prev = () => {
    if (current > 0) {
      const prevQ = current - 1;
      setCurrent(prevQ);
      setSelected(answers[prevQ] ?? null);
      setAnswered(answers[prevQ] !== undefined);
    }
  };

  const timeLeft = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const warn = seconds < 120;

  if (done) return <ResultScreen score={score} total={questions.length} subject={subject} navigation={navigation} t={t} app={app} />;

  const q = questions[current];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header */}
      <View style={{ backgroundColor: t.bg1, borderBottomWidth: 1, borderColor: t.border, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={() => Alert.alert('Exit Test?', 'Your progress will be lost.', [{ text: 'Cancel' }, { text: 'Exit', onPress: () => navigation.goBack() }])}>
          <Text style={{ fontSize: 20, color: t.text }}>✕</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontWeight: '800', color: t.text, fontSize: 15 }}>{subject} CBT</Text>
        <View style={{ backgroundColor: warn ? t.danger + '20' : t.bg2, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: warn ? t.danger + '40' : t.border }}>
          <Text style={{ fontWeight: '800', fontSize: 14, color: warn ? t.danger : t.text }}>⏱ {timeLeft}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ backgroundColor: t.bg3, height: 4 }}>
        <View style={{ backgroundColor: t.accent, height: 4, width: `${((current + 1) / questions.length) * 100}%` }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: t.muted, marginBottom: 12 }}>Question {current + 1} of {questions.length}</Text>

        {/* Question */}
        <Card t={t} style={{ marginBottom: 16, padding: 18 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: t.text, lineHeight: 24 }}>{q.q}</Text>
        </Card>

        {/* Options */}
        {q.options.map((opt, i) => {
          const isSel = selected === i;
          const isCorr = answered && i === q.answer;
          const isWrong = answered && isSel && i !== q.answer;
          return (
            <TouchableOpacity key={i} onPress={() => selectOption(i)} disabled={answered} style={{
              backgroundColor: isCorr ? t.success + '12' : isWrong ? t.danger + '0A' : isSel ? t.accentDim : t.bg1,
              borderRadius: 14, borderWidth: isCorr || isWrong ? 1.5 : 1,
              borderColor: isCorr ? t.success : isWrong ? t.danger : isSel ? t.accent : t.border,
              padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12,
            }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: isCorr ? t.success : isWrong ? t.danger : isSel ? t.accent : t.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '800', fontSize: 11, color: isCorr ? t.success : isWrong ? t.danger : t.text }}>
                  {['A', 'B', 'C', 'D'][i]}
                </Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: t.text, lineHeight: 20 }}>{opt}</Text>
              {isCorr && <Text style={{ color: t.success, fontSize: 16 }}>✓</Text>}
              {isWrong && <Text style={{ color: t.danger, fontSize: 16 }}>✗</Text>}
            </TouchableOpacity>
          );
        })}

        {/* Explanation */}
        {answered && (
          <View style={{ backgroundColor: t.accentDim, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: 12, flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <Text style={{ fontSize: 14 }}>💡</Text>
            <Text style={{ flex: 1, fontSize: 13, color: t.secondary, lineHeight: 19 }}>{q.explain}</Text>
          </View>
        )}
      </ScrollView>

      {/* Nav buttons */}
      <View style={{ backgroundColor: t.bg1, borderTopWidth: 1, borderColor: t.border, padding: 14, flexDirection: 'row', gap: 10 }}>
        {current > 0 && (
          <TouchableOpacity onPress={prev} style={{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: t.border, paddingVertical: 13, alignItems: 'center' }}>
            <Text style={{ fontWeight: '700', color: t.text }}>← Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={answered ? next : undefined} disabled={!answered} style={{ flex: 2, borderRadius: 12, backgroundColor: answered ? t.accent : t.bg3, paddingVertical: 13, alignItems: 'center' }}>
          <Text style={{ fontWeight: '800', color: answered ? (app.darkMode ? '#000' : '#fff') : t.muted }}>
            {current < questions.length - 1 ? 'Next →' : 'Finish'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ResultScreen({ score, total, subject, navigation, t, app }) {
  const pct = Math.round((score / total) * 100);
  const isGood = pct >= 60;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, alignItems: 'center' }}>
        <View style={{ marginTop: 20, marginBottom: 16, width: 80, height: 80, borderRadius: 40, backgroundColor: (isGood ? t.success : t.danger) + '18', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 36 }}>{isGood ? '🎉' : '📚'}</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: '900', color: t.text, letterSpacing: -0.5, marginBottom: 4 }}>{isGood ? 'Well Done!' : 'Keep Studying!'}</Text>
        <Text style={{ fontSize: 14, color: t.muted, marginBottom: 24 }}>{score} of {total} correct</Text>

        <Card t={t} style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
          <Row>
            <Text style={{ fontSize: 52, fontWeight: '900', color: isGood ? t.success : t.danger, letterSpacing: -2 }}>{pct}</Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: t.muted, marginTop: 12 }}>%</Text>
          </Row>
          <View style={{ width: '100%', backgroundColor: t.bg3, borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 16 }}>
            <View style={{ backgroundColor: isGood ? t.success : t.danger, height: 6, width: `${pct}%`, borderRadius: 4 }} />
          </View>
          <Row style={{ justifyContent: 'space-around', width: '100%' }}>
            {[['✅', score, 'Correct'], ['❌', total - score, 'Wrong'], ['⚡', `+${score * 50} XP`, 'Earned']].map(([ic, v, l]) => (
              <View key={l} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 22 }}>{ic}</Text>
                <Text style={{ fontWeight: '800', fontSize: 16, color: t.text }}>{v}</Text>
                <Text style={{ fontSize: 11, color: t.muted }}>{l}</Text>
              </View>
            ))}
          </Row>
        </Card>

        <Button label="Back to Practice" onPress={() => navigation.popToTop()} t={t} style={{ width: '100%', marginBottom: 10 }} />
        <Button label="Try Again" variant="outline" onPress={() => navigation.replace('Test', { subject })} t={t} style={{ width: '100%' }} />
      </ScrollView>
    </SafeAreaView>
  );
}
