import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export default function App() {
  return (
    <GluestackUIProvider mode="dark">
      <View className="flex-1 items-center justify-center bg-background-0 gap-6">
        <Text className="text-typography-950 text-lg">TruckTrack</Text>
        <Pressable className="bg-primary-400 px-8 py-4 rounded-none active:bg-primary-200">
          <Text className="text-black font-mono text-sm uppercase tracking-widest">
            Follow Truck
          </Text>
        </Pressable>
      </View>
      <StatusBar style="light" />
    </GluestackUIProvider>
  );
}
