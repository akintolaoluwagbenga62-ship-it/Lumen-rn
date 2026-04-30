// src/components/UI.js
import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Image, StyleSheet } from 'react-native';

export const Card = ({ children, style, onPress, t }) => {
  const base = { backgroundColor: t.bg1, borderRadius: 14, borderWidth: 1, borderColor: t.border, padding: 14, marginBottom: 8 };
  if (onPress) return <TouchableOpacity style={[base, style]} onPress={onPress} activeOpacity={0.75}>{children}</TouchableOpacity>;
  return <View style={[base, style]}>{children}</View>;
};

export const Button = ({ label, onPress, variant = 'primary', icon, loading, disabled, t, style }) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';
  const isGold = variant === 'gold';

  const bg = isDanger ? t.danger : isGold ? t.gold : isPrimary ? t.accent : 'transparent';
  const fg = isOutline ? t.text : isDanger || isGold ? '#fff' : t.darkMode ? '#000' : '#fff';
  const border = isOutline ? t.border : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[{
        backgroundColor: bg, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 20,
        borderWidth: 1, borderColor: border, alignItems: 'center', justifyContent: 'center',
        flexDirection: 'row', gap: 6, opacity: disabled ? 0.5 : 1,
      }, style]}
    >
      {loading ? <ActivityIndicator color={fg} size="small" /> : (
        <>
          {icon && <Text style={{ fontSize: 16 }}>{icon}</Text>}
          <Text style={{ color: fg, fontWeight: '800', fontSize: 14 }}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export const Input = ({ placeholder, value, onChangeText, secureTextEntry, keyboardType, multiline, t, style, icon, autoCapitalize }) => (
  <View style={{ position: 'relative' }}>
    {icon && <Text style={{ position: 'absolute', left: 14, top: 13, fontSize: 16, zIndex: 1 }}>{icon}</Text>}
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={t.muted}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      autoCapitalize={autoCapitalize || 'none'}
      style={[{
        backgroundColor: t.bg2, borderRadius: 11, borderWidth: 1, borderColor: t.border,
        paddingHorizontal: icon ? 42 : 14, paddingVertical: 12, color: t.text, fontSize: 14,
      }, style]}
    />
  </View>
);

export const Badge = ({ label, color, t }) => (
  <View style={{ backgroundColor: color + '18', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: color + '30' }}>
    <Text style={{ color, fontSize: 10, fontWeight: '800' }}>{label}</Text>
  </View>
);

export const Avatar = ({ user, avatarUrl, size = 40 }) => {
  const url = avatarUrl(user, size);
  return (
    <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#7C3AED' }} />
  );
};

export const Row = ({ children, style }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>
);

export const SectionHeader = ({ title, t }) => (
  <Text style={{ fontSize: 11, fontWeight: '700', color: t.muted, letterSpacing: 0.5, marginBottom: 8, marginTop: 4 }}>{title.toUpperCase()}</Text>
);

export const EmptyState = ({ icon, text, t }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
    <Text style={{ fontSize: 40, marginBottom: 12 }}>{icon}</Text>
    <Text style={{ fontSize: 14, color: t.muted, textAlign: 'center' }}>{text}</Text>
  </View>
);

export const Divider = ({ t }) => <View style={{ height: 1, backgroundColor: t.border, marginVertical: 8 }} />;

export const InfoBanner = ({ text, icon = '✨', t }) => (
  <View style={{ backgroundColor: t.accentDim, borderRadius: 12, borderWidth: 1, borderColor: t.border, padding: 12, flexDirection: 'row', gap: 8, marginBottom: 12 }}>
    <Text style={{ fontSize: 14 }}>{icon}</Text>
    <Text style={{ flex: 1, fontSize: 12, color: t.secondary, lineHeight: 18 }}>{text}</Text>
  </View>
);

export const StatBox = ({ value, label, t }) => (
  <View style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: 1, borderColor: t.border }}>
    <Text style={{ fontWeight: '900', fontSize: 20, color: t.text }}>{value}</Text>
    <Text style={{ fontSize: 10, fontWeight: '600', color: t.muted, marginTop: 2 }}>{label}</Text>
  </View>
);
