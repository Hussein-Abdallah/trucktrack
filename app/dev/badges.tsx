import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, BadgeText } from '@/components/ui/badge';

type BadgeAction = 'open' | 'closed' | 'accent' | 'muted' | 'moving';

const BADGE_ACTIONS: BadgeAction[] = ['open', 'closed', 'accent', 'muted', 'moving'];
const BADGE_SAMPLE_LABELS: Record<BadgeAction, string> = {
  open: 'Open Now',
  closed: 'Closed',
  accent: 'Pro',
  muted: 'N/A',
  moving: 'En Route',
};

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

export default function BadgesDev() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background-0">
      <ScrollView contentContainerClassName="px-4 py-8">
        <Text className="mb-2 font-heading text-[32px] tracking-[2px] text-typography-950">
          BADGE
        </Text>
        <Text className="mb-8 font-body text-sm text-typography-500">
          All five status variants. Pill shape + DM Mono uppercase.
        </Text>

        <View className="mb-8">
          <SectionHeading>All variants</SectionHeading>
          <Row>
            {BADGE_ACTIONS.map((action) => (
              <Badge key={action} action={action}>
                <BadgeText>{BADGE_SAMPLE_LABELS[action]}</BadgeText>
              </Badge>
            ))}
          </Row>
        </View>

        <View className="mb-8 bg-background-50 p-4">
          <SectionHeading>Charcoal surface</SectionHeading>
          <Row>
            {BADGE_ACTIONS.map((action) => (
              <Badge key={action} action={action}>
                <BadgeText>{BADGE_SAMPLE_LABELS[action]}</BadgeText>
              </Badge>
            ))}
          </Row>
        </View>

        <View className="mb-8">
          <SectionHeading>French labels</SectionHeading>
          <Row>
            <Badge action="open">
              <BadgeText>Ouvert</BadgeText>
            </Badge>
            <Badge action="closed">
              <BadgeText>Fermé</BadgeText>
            </Badge>
            <Badge action="accent">
              <BadgeText>Premium</BadgeText>
            </Badge>
            <Badge action="muted">
              <BadgeText>Indisponible</BadgeText>
            </Badge>
            <Badge action="moving">
              <BadgeText>En route</BadgeText>
            </Badge>
          </Row>
        </View>

        <View className="mb-8">
          <SectionHeading>Size variants (sm / md / lg)</SectionHeading>
          <Row>
            <Badge action="accent" size="sm">
              <BadgeText>Small</BadgeText>
            </Badge>
            <Badge action="accent" size="md">
              <BadgeText>Medium</BadgeText>
            </Badge>
            <Badge action="accent" size="lg">
              <BadgeText>Large</BadgeText>
            </Badge>
          </Row>
        </View>

        <View className="mb-8">
          <SectionHeading>Long label wrapping (constrained width)</SectionHeading>
          <Row>
            <View className="w-24">
              <Badge action="accent">
                <BadgeText>This is way too long for a badge</BadgeText>
              </Badge>
            </View>
          </Row>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
