// src/navigation/AppNavigator.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useApp } from '../context/AppContext';
import { Colors } from '../utils/theme';

// Screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import GroupsScreen, { GroupChatScreen } from '../screens/GroupsScreen';
import CBTScreen, { TestScreen } from '../screens/CBTScreen';
import FlashcardsScreen, { DeckDetailScreen } from '../screens/FlashcardsScreen';
import VideosScreen, { NewsScreen, NewsDetailScreen } from '../screens/VideosScreen';
import ProfileScreen, {
  NotificationsScreen,
  LeaderboardScreen,
  PaywallScreen,
  AdminScreen,
} from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const noHeader = { headerShown: false };

function TabIcon({ icon, label, focused, t, badge }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <View style={{ position: 'relative' }}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
        {badge > 0 && (
          <View style={{ position: 'absolute', top: -4, right: -6, backgroundColor: '#FB7185', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={{ fontSize: 10, fontWeight: focused ? '800' : '500', color: focused ? t.accent : t.muted, marginTop: 2 }}>{label}</Text>
      {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: t.accent, marginTop: 2 }} />}
    </View>
  );
}

function MainTabs() {
  const app = useApp();
  const t = app.darkMode ? Colors.dark : Colors.light;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.bg1,
          borderTopColor: t.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 6,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} t={t} /> }} />
      <Tab.Screen name="Groups" component={GroupsStack} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👥" label="Groups" focused={focused} t={t} badge={0} /> }} />
      <Tab.Screen name="CBT" component={CBTStack} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📝" label="CBT" focused={focused} t={t} /> }} />
      <Tab.Screen name="Videos" component={VideosStack} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="▶️" label="Videos" focused={focused} t={t} /> }} />
      <Tab.Screen name="Cards" component={FlashcardsStack} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🃏" label="Cards" focused={focused} t={t} /> }} />
      <Tab.Screen name="News" component={NewsStack} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📰" label="News" focused={focused} t={t} /> }} />
      <Tab.Screen name="Me" component={ProfileStack} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} t={t} badge={app.unreadNotifCount()} /> }} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
    </Stack.Navigator>
  );
}

function GroupsStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="GroupsList" component={GroupsScreen} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}

function CBTStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="CBTMain" component={CBTScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}

function FlashcardsStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="FlashcardsMain" component={FlashcardsScreen} />
      <Stack.Screen name="DeckDetail" component={DeckDetailScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}

function VideosStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="VideosMain" component={VideosScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}

function NewsStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="NewsList" component={NewsScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
    </Stack.Navigator>
  );
}

// ── ROOT NAVIGATOR ────────────────────────────────
export default function AppNavigator() {
  const app = useApp();

  if (!app.loaded) {
    const t = Colors.dark;
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 64, height: 64, backgroundColor: t.accent, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Text style={{ color: '#000', fontSize: 32, fontWeight: '900' }}>L</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '900', color: t.text, letterSpacing: -1 }}>Lumen</Text>
        <Text style={{ fontSize: 13, color: t.muted, marginTop: 6 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={noHeader}>
        {app.currentUser ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
