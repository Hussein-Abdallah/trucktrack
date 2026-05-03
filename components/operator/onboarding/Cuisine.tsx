import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';
import { COMMON_CUISINES, type CuisineSlug } from '@/lib/cuisines';

interface CuisineStepProps {
  /** Selected cuisine slugs. Order is preserved as the operator taps
   *  them, mirroring how `trucks.cuisine_tags` is stored as `text[]`. */
  value: CuisineSlug[];
  onChange: (next: CuisineSlug[]) => void;
  onNext: () => void;
  onSkip: () => void;
}

export function CuisineStep({ value, onChange, onNext, onSkip }: CuisineStepProps) {
  const { t } = useTranslation();
  const selected = new Set(value);

  const toggle = (slug: CuisineSlug) => {
    if (selected.has(slug)) {
      onChange(value.filter((s) => s !== slug));
    } else {
      onChange([...value, slug]);
    }
  };

  return (
    <View className="flex-1 justify-between px-6 py-8">
      <View className="flex-1 gap-6">
        <View className="gap-2">
          <Text
            accessibilityRole="header"
            className="font-heading text-4xl tracking-wider text-typography-950"
          >
            {t('routes.onboarding.operatorScreen.cuisine.title')}
          </Text>
          <Text className="font-body text-base text-typography-500">
            {t('routes.onboarding.operatorScreen.cuisine.subtitle')}
          </Text>
        </View>

        <ScrollView contentContainerClassName="flex-row flex-wrap gap-2 pb-4">
          {COMMON_CUISINES.map((slug) => {
            const active = selected.has(slug);
            const containerCls = active
              ? 'rounded-none bg-primary-400 px-4 py-2 active:opacity-80'
              : 'rounded-none border border-outline-200 bg-secondary-50 px-4 py-2 active:bg-secondary-100';
            const textCls = active
              ? 'font-mono-medium text-[11px] uppercase tracking-[1.5px] text-typography-white'
              : 'font-mono-medium text-[11px] uppercase tracking-[1.5px] text-typography-950';
            return (
              <Pressable
                key={slug}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => toggle(slug)}
                className={containerCls}
              >
                <Text className={textCls}>{t(`cuisines.${slug}`)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View className="gap-3">
        <Button action="primary" size="lg" onPress={onNext}>
          <ButtonText>{t('routes.onboarding.operatorScreen.nav.continue')}</ButtonText>
        </Button>
        <Button action="ghost" size="md" onPress={onSkip}>
          <ButtonText>{t('routes.onboarding.operatorScreen.cuisine.skip')}</ButtonText>
        </Button>
      </View>
    </View>
  );
}
