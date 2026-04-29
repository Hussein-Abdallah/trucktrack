import { Pressable, Text, View } from 'react-native';

import type { AppLanguage } from '@/lib/i18n';

interface LanguageToggleProps {
  value: AppLanguage;
  onChange: (next: AppLanguage) => void;
  /** Disables both buttons (e.g. while a persist-language request is in
   *  flight). Disabled state dims opacity and blocks press to prevent
   *  spam-tap from queuing contradictory requests. */
  disabled?: boolean;
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
export function LanguageToggle({ value, onChange, disabled = false }: LanguageToggleProps) {
  return (
    <View className={`flex-row gap-3 ${disabled ? 'opacity-50' : ''}`}>
      {OPTIONS.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled }}
            accessibilityLabel={LABELS[option]}
            disabled={disabled}
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
