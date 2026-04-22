import { Feather } from '@expo/vector-icons';
import { Redirect, Tabs, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/authStore';
import { APP_BLACK, CHARCOAL, FIRE_ORANGE, MID, MUTED, WARM_CREAM } from '@/theme/colors';

function SettingsHeaderButton() {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => router.push('/settings')}
      accessibilityRole="button"
      accessibilityLabel={t('routes.operator.settings')}
      className="mr-4 h-9 w-9 items-center justify-center rounded-full border active:opacity-60"
      style={{ borderColor: MID }}
    >
      <Feather name="settings" size={18} color={WARM_CREAM} />
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

// Tab-bar height when no system inset. Mirrors the consumer layout.
const TAB_BAR_BASE_HEIGHT = 56;

export default function OperatorLayout() {
  const session = useAuthStore((state) => state.session);
  const { t } = useTranslation();
  // Custom tabBarStyle clobbers react-navigation's auto safe-area
  // padding, so we fold the inset back in manually. See consumer layout
  // for the full reasoning.
  const insets = useSafeAreaInsets();

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  if (!session.roles.includes('operator')) {
    return <Redirect href="/(consumer)" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerTitle: '',
        headerStyle: { backgroundColor: APP_BLACK },
        headerTintColor: WARM_CREAM,
        headerShadowVisible: false,
        headerRight: () => <SettingsHeaderButton />,
        tabBarActiveTintColor: FIRE_ORANGE,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: {
          backgroundColor: CHARCOAL,
          borderTopColor: MID,
          borderTopWidth: 1,
          height: TAB_BAR_BASE_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
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
        name="today"
        options={{
          tabBarLabel: t('routes.operator.today'),
          tabBarAccessibilityLabel: t('routes.operator.today'),
          tabBarIcon: tabIcon('map-pin'),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          tabBarLabel: t('routes.operator.schedule'),
          tabBarAccessibilityLabel: t('routes.operator.schedule'),
          tabBarIcon: tabIcon('calendar'),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarLabel: t('routes.operator.analytics'),
          tabBarAccessibilityLabel: t('routes.operator.analytics'),
          tabBarIcon: tabIcon('bar-chart-2'),
        }}
      />
      <Tabs.Screen
        name="catering"
        options={{
          tabBarLabel: t('routes.operator.catering'),
          tabBarAccessibilityLabel: t('routes.operator.catering'),
          tabBarIcon: tabIcon('briefcase'),
        }}
      />
    </Tabs>
  );
}
