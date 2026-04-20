import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import type { ButtonAction, ButtonSize } from '@/components/ui/Button';

const ACTIONS: ButtonAction[] = ['primary', 'secondary', 'ghost', 'danger', 'success'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

function SectionHeading({ children }: { children: string }) {
  return (
    <Text className="mb-3 font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
      {children}
    </Text>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View className="mb-6 flex-row flex-wrap gap-3">{children}</View>;
}

export default function ButtonsDev() {
  return (
    <ScrollView className="flex-1 bg-background-0" contentContainerClassName="px-4 py-8">
      <Text className="mb-2 font-heading text-[32px] tracking-[2px] text-typography-950">
        BUTTON
      </Text>
      <Text className="mb-8 font-body text-sm text-typography-500">
        All five variants × three sizes × idle / pressed (tap + hold) / disabled / loading.
      </Text>

      {ACTIONS.map((action) => (
        <View key={action} className="mb-8">
          <SectionHeading>{action}</SectionHeading>
          <Row>
            {SIZES.map((size) => (
              <Button key={size} action={action} size={size}>
                {action} {size}
              </Button>
            ))}
          </Row>
          <Row>
            {SIZES.map((size) => (
              <Button key={size} action={action} size={size} isDisabled>
                disabled
              </Button>
            ))}
          </Row>
          <Row>
            {SIZES.map((size) => (
              <Button key={size} action={action} size={size} isLoading>
                loading state
              </Button>
            ))}
          </Row>
        </View>
      ))}

      <View className="mb-8 bg-background-50 p-4">
        <SectionHeading>Charcoal surface</SectionHeading>
        <Row>
          {ACTIONS.map((action) => (
            <Button key={action} action={action}>
              {action}
            </Button>
          ))}
        </Row>
      </View>

      <View className="mb-8">
        <SectionHeading>French label overflow (md)</SectionHeading>
        <Row>
          <Button action="primary">Confirmer la commande</Button>
          <Button action="secondary">Publier maintenant</Button>
          <Button action="ghost">Annuler</Button>
        </Row>
      </View>
    </ScrollView>
  );
}
