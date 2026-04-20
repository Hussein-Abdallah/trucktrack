import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';

type ButtonAction = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

const ACTIONS: ButtonAction[] = ['primary', 'secondary', 'ghost', 'danger', 'success'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

interface SectionHeadingProps {
  children: string;
}

function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <Text className="mb-3 font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
      {children}
    </Text>
  );
}

interface RowProps {
  children: ReactNode;
}

function Row({ children }: RowProps) {
  return <View className="mb-6 flex-row flex-wrap gap-3">{children}</View>;
}

export default function ButtonsDev() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background-0">
      <ScrollView contentContainerClassName="px-4 py-8">
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
                  <ButtonText>
                    {action} {size}
                  </ButtonText>
                </Button>
              ))}
            </Row>
            <Row>
              {SIZES.map((size) => (
                <Button key={size} action={action} size={size} isDisabled>
                  <ButtonText>disabled</ButtonText>
                </Button>
              ))}
            </Row>
            <Row>
              {SIZES.map((size) => (
                <Button key={size} action={action} size={size} isDisabled>
                  <ButtonSpinner />
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
                <ButtonText>{action}</ButtonText>
              </Button>
            ))}
          </Row>
        </View>

        <View className="mb-8">
          <SectionHeading>French label overflow (md)</SectionHeading>
          <Row>
            <Button action="primary">
              <ButtonText>Confirmer la commande</ButtonText>
            </Button>
            <Button action="secondary">
              <ButtonText>Publier maintenant</ButtonText>
            </Button>
            <Button action="ghost">
              <ButtonText>Annuler</ButtonText>
            </Button>
          </Row>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
