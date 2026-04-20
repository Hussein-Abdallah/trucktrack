import type { ReactNode } from 'react';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Input } from '@/components/ui/input';
import { MUTED } from '@/theme/colors';

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

interface BlockProps {
  children: ReactNode;
}

function Block({ children }: BlockProps) {
  return <View className="mb-6">{children}</View>;
}

export default function InputDev() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('Jean Dupont');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lgValue, setLgValue] = useState('');

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background-0">
      <ScrollView contentContainerClassName="px-4 py-8" keyboardShouldPersistTaps="handled">
        <Text className="mb-2 font-heading text-[32px] tracking-[2px] text-typography-950">
          INPUT
        </Text>
        <Text className="mb-8 font-body text-sm text-typography-500">
          All states — idle / focused (tap) / filled / error / disabled + icon and slot variants.
        </Text>

        <Block>
          <SectionHeading>Idle — placeholder only</SectionHeading>
          <Input placeholder="Placeholder text" />
        </Block>

        <Block>
          <SectionHeading>With label</SectionHeading>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />
        </Block>

        <Block>
          <SectionHeading>Filled (tap to edit)</SectionHeading>
          <Input
            label="Nom complet"
            value={name}
            onChangeText={setName}
            placeholder="Jean Dupont"
            textContentType="name"
          />
        </Block>

        <Block>
          <SectionHeading>Left icon</SectionHeading>
          <Input
            label="Adresse e-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            leftIcon={<Feather name="mail" size={16} color={MUTED} />}
          />
        </Block>

        <Block>
          <SectionHeading>Right slot — password toggle</SectionHeading>
          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            textContentType="password"
            leftIcon={<Feather name="lock" size={16} color={MUTED} />}
            rightSlot={
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color={MUTED} />
              </TouchableOpacity>
            }
          />
        </Block>

        <Block>
          <SectionHeading>Error state (French)</SectionHeading>
          <Input
            label="Email"
            value=""
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error="Ce champ est obligatoire"
          />
        </Block>

        <Block>
          <SectionHeading>Error with icon</SectionHeading>
          <Input
            label="Email"
            value="notanemail"
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Feather name="mail" size={16} color={MUTED} />}
            error="Adresse e-mail non valide — veuillez vérifier et réessayer"
          />
        </Block>

        <Block>
          <SectionHeading>Disabled</SectionHeading>
          <Input label="Email" value="sam@example.com" placeholder="email@example.com" isDisabled />
        </Block>

        <Block>
          <SectionHeading>Size lg</SectionHeading>
          <Input
            label="Rechercher"
            value={lgValue}
            onChangeText={setLgValue}
            placeholder="Nom du camion ou cuisine…"
            size="lg"
            leftIcon={<Feather name="search" size={18} color={MUTED} />}
          />
        </Block>
      </ScrollView>
    </SafeAreaView>
  );
}
