import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const colors = {
  backgroundDark: '#0F0F0F',
} as const;

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
