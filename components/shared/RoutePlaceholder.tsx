import { Text, View } from 'react-native';

interface RoutePlaceholderProps {
  title: string;
  subtitle?: string;
}

export function RoutePlaceholder({ title, subtitle }: RoutePlaceholderProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background-0 px-6">
      <Text className="font-heading text-4xl tracking-wider text-typography-950">{title}</Text>
      {subtitle ? (
        <Text className="text-center font-body text-base text-typography-500">{subtitle}</Text>
      ) : null}
    </View>
  );
}
