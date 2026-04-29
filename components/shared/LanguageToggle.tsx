import { Pressable, Text, View } from 'react-native';

import type { AppLanguage } from '@/lib/i18n';

interface LanguageToggleProps {
  value: AppLanguage;
  onChange: (next: AppLanguage) => void;
}

const OPTIONS: AppLanguage[] = ['en', 'fr'];
const LABELS: Record<AppLanguage, string> = {
  en: 'EN',
  fr: 'FR',
};

/**
 * Sharp-corner two-button row used by the consumer onboarding screen
 * to pick between English and French. Active variant uses fire-orange
 * (primary-400) with App-Black text; inactive uses background-50 with
 * Warm-Cream text. Per CLAUDE.md the corner radius stays at 0.
 */
export function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  return (
    <View className="flex-row gap-3">
      {OPTIONS.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={LABELS[option]}
            onPress={() => onChange(option)}
            className={`flex-1 items-center justify-center py-4 ${
              active
                ? 'bg-primary-400 active:bg-primary-200'
                : 'border border-outline-100 bg-background-50 active:bg-background-100'
            }`}
          >
            <Text
              className={`font-mono-medium text-base uppercase tracking-[2px] ${
                active ? 'text-typography-black' : 'text-typography-950'
              }`}
            >
              {LABELS[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
