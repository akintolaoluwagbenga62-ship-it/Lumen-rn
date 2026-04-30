// src/screens/AuthScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors } from '../utils/theme';
import { Input, Button } from '../components/UI';
import { SUBJECTS, FREE_TRIAL_DAYS } from '../data/constants';

export default function AuthScreen() {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [uni, setUni] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [showPass, setShowPass] = useState(false);

  const submit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const err = isLogin ? app.login(email.trim(), pass) : app.register(name.trim(), email.trim(), pass, subject, uni.trim());
    setLoading(false);
    if (err) Alert.alert('Error', err);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <View style={{ width: 64, height: 64, backgroundColor: t.accent, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ color: app.darkMode ? '#000' : '#fff', fontSize: 32, fontWeight: '900' }}>L</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: '900', color: t.text, letterSpacing: -1 }}>Lumen</Text>
            <Text style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>Study together. Pass JAMB.</Text>
          </View>

          {/* Tabs */}
          <View style={{ flexDirection: 'row', backgroundColor: t.bg2, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: 3, marginBottom: 20 }}>
            {['Sign In', 'Register'].map((label, i) => {
              const active = i === 0 ? isLogin : !isLogin;
              return (
                <TouchableOpacity key={label} onPress={() => setIsLogin(i === 0)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: active ? t.accent : 'transparent' }}>
                  <Text style={{ fontWeight: '800', fontSize: 14, color: active ? (app.darkMode ? '#000' : '#fff') : t.muted }}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Fields */}
          <View style={{ gap: 10 }}>
            {!isLogin && <Input placeholder="Full name" value={name} onChangeText={setName} t={t} icon="👤" autoCapitalize="words" />}
            <Input placeholder="Email address" value={email} onChangeText={setEmail} t={t} icon="✉️" keyboardType="email-address" />
            <Input placeholder="Password" value={pass} onChangeText={setPass} t={t} icon="🔒" secureTextEntry={!showPass} />

            {!isLogin && (
              <>
                {/* Subject picker */}
                <View style={{ backgroundColor: t.bg2, borderRadius: 11, borderWidth: 1, borderColor: t.border, padding: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted, marginBottom: 8 }}>PRIMARY SUBJECT</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {SUBJECTS.map(s => (
                      <TouchableOpacity key={s} onPress={() => setSubject(s)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: subject === s ? t.accent : t.bg3, borderWidth: 1, borderColor: subject === s ? t.accent : t.border }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: subject === s ? (app.darkMode ? '#000' : '#fff') : t.text }}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <Input placeholder="Target University (e.g. UNILAG)" value={uni} onChangeText={setUni} t={t} icon="🏛️" autoCapitalize="words" />
                <View style={{ backgroundColor: t.accentDim, borderRadius: 10, borderWidth: 1, borderColor: t.border, padding: 12, flexDirection: 'row', gap: 8 }}>
                  <Text style={{ fontSize: 16 }}>⭐</Text>
                  <Text style={{ flex: 1, fontSize: 12, color: t.secondary, lineHeight: 18 }}>
                    <Text style={{ fontWeight: '800', color: t.text }}>{FREE_TRIAL_DAYS}-day free trial</Text> included. No payment needed to start.
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={{ marginTop: 20 }}>
            <Button label={isLogin ? 'Sign In' : 'Create Account'} onPress={submit} loading={loading} t={t} />
          </View>

          <Text style={{ textAlign: 'center', fontSize: 11, color: t.muted, marginTop: 24 }}>
            By continuing you agree to Lumen's Terms of Service.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
