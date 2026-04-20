import { Feather } from '@expo/vector-icons';
import { Redirect, Tabs, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { useAuthStore } from '@/stores/authStore';
import { APP_BLACK, CHARCOAL, FIRE_ORANGE, MID, MUTED, WARM_CREAM } from '@/theme/colors';

function AvatarHeaderButton() {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => router.push('/profile')}
      accessibilityRole="button"
      accessibilityLabel={t('routes.consumer.profile')}
      className="mr-4 h-9 w-9 items-center justify-center rounded-full border active:opacity-60"
      style={{ borderColor: MID }}
    >
      <Feather name="user" size={18} color={WARM_CREAM} />
    </Pressable>
  );
}

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface TabBarIconProps {
  color: string;
  size: number;
}

function tabIcon(name: FeatherIconName) {
  return function TabBarIcon({ color, size }: TabBarIconProps) {
    return <Feather name={name} size={size} color={color} />;
  };
}

export default function ConsumerLayout() {
  const session = useAuthStore((state) => state.session);
  const { t } = useTranslation();

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  if (!session.roles.includes('consumer')) {
    return <Redirect href="/(operator)/today" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerTitle: '',
        headerStyle: { backgroundColor: APP_BLACK },
        headerTintColor: WARM_CREAM,
        headerShadowVisible: false,
        headerRight: () => <AvatarHeaderButton />,
        tabBarActiveTintColor: FIRE_ORANGE,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: {
          backgroundColor: CHARCOAL,
          borderTopColor: MID,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMMono',
          fontSize: 11,
          marginTop: 2,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: t('routes.consumer.map'),
          tabBarAccessibilityLabel: t('routes.consumer.map'),
          tabBarIcon: tabIcon('map'),
        }}
      />
      <Tabs.Screen
        name="following"
        options={{
          tabBarLabel: t('routes.consumer.following'),
          tabBarAccessibilityLabel: t('routes.consumer.following'),
          tabBarIcon: tabIcon('heart'),
        }}
      />
      <Tabs.Screen
        name="stamps"
        options={{
          tabBarLabel: t('routes.consumer.stamps'),
          tabBarAccessibilityLabel: t('routes.consumer.stamps'),
          tabBarIcon: tabIcon('award'),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarLabel: t('routes.consumer.alerts'),
          tabBarAccessibilityLabel: t('routes.consumer.alerts'),
          tabBarIcon: tabIcon('bell'),
        }}
      />
    </Tabs>
  );
}
