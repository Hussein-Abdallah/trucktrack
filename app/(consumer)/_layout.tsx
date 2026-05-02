import { Feather } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarHeaderButton } from '@/components/shared/AvatarHeaderButton';
import { WordmarkTitle } from '@/components/shared/WordmarkTitle';
import { useAuthStore } from '@/stores/authStore';
import { APP_BLACK, CHARCOAL, FIRE_ORANGE, MID, MUTED, WARM_CREAM } from '@/theme/colors';

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

// Tab-bar height when no system inset (iOS without home indicator,
// Android with hardware buttons). react-navigation's default is ~50;
// we keep our brand height stable across surfaces.
const TAB_BAR_BASE_HEIGHT = 56;

export default function ConsumerLayout() {
  const session = useAuthStore((state) => state.session);
  const { t } = useTranslation();
  // Custom tabBarStyle clobbers react-navigation's auto safe-area
  // padding (it merges shallowly and our custom keys win), so we have
  // to fold the inset back in manually. Without this, the Android
  // system gesture/back bar sits on top of the tab bar when
  // edgeToEdgeEnabled is on.
  const insets = useSafeAreaInsets();

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  if (!session.roles.includes('consumer')) {
    return <Redirect href="/(operator)/today" />;
  }

  return (
    <Tabs
      screenOptions={{
        // Single source of truth for the consumer brand bar — wordmark
        // left, avatar right, identical position on every tab.
        headerTitle: () => <WordmarkTitle />,
        headerTitleAlign: 'left',
        headerStyle: { backgroundColor: APP_BLACK },
        headerTintColor: WARM_CREAM,
        headerShadowVisible: false,
        headerRight: () => <AvatarHeaderButton />,
        headerRightContainerStyle: { paddingRight: 16 },
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
        name="index"
        options={{
          tabBarLabel: t('routes.consumer.map'),
          tabBarAccessibilityLabel: t('routes.consumer.map'),
          tabBarIcon: tabIcon('map'),
          // Map shows through under the wordmark + avatar — same brand
          // bar geometry as the other tabs, just rendered over the map
          // instead of over a solid APP_BLACK fill.
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
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
