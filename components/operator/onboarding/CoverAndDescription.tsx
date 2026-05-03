import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';
import { uploadTruckCover } from '@/services/storage';
import { CHARCOAL, FIRE_ORANGE, MID, MUTED, WARM_CREAM } from '@/theme/colors';

const MAX_DESCRIPTION = 160;

interface CoverAndDescriptionStepProps {
  operatorId: string;
  /** Public URL after a successful upload, or null if no photo picked. */
  coverUrl: string | null;
  description: string;
  onCoverChange: (next: string | null) => void;
  onDescriptionChange: (next: string) => void;
  onNext: () => void;
  onSkip: () => void;
}

export function CoverAndDescriptionStep({
  operatorId,
  coverUrl,
  description,
  onCoverChange,
  onDescriptionChange,
  onNext,
  onSkip,
}: CoverAndDescriptionStepProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tooLongDesc = description.length > MAX_DESCRIPTION;

  const handlePickImage = async () => {
    setError(null);
    // launchImageLibraryAsync requests permission lazily on iOS — if
    // the user denies, it returns canceled=true with no error. We
    // surface a friendly inline message in that case so the user
    // knows SKIP is still available.
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(t('routes.onboarding.operatorScreen.coverAndDescription.photoPermissionDenied'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const url = await uploadTruckCover({
        operatorId,
        fileUri: asset.uri,
        contentType: asset.mimeType,
      });
      onCoverChange(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[onboarding] uploadTruckCover failed:', err);
      setError(t('routes.onboarding.operatorScreen.coverAndDescription.uploadFailed'));
    } finally {
      setUploading(false);
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
            {t('routes.onboarding.operatorScreen.coverAndDescription.title')}
          </Text>
          <Text className="font-body text-base text-typography-500">
            {t('routes.onboarding.operatorScreen.coverAndDescription.subtitle')}
          </Text>
        </View>

        <View className="gap-3">
          <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
            {t('routes.onboarding.operatorScreen.coverAndDescription.coverLabel')}
          </Text>

          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              style={styles.cover}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Feather name="image" size={32} color={MUTED} />
            </View>
          )}

          <Button
            action="secondary"
            size="md"
            onPress={() => void handlePickImage()}
            isDisabled={uploading}
          >
            <ButtonText>{coverButtonLabel(t, uploading, !!coverUrl)}</ButtonText>
          </Button>

          {error ? <Text className="text-[12px] font-body text-error-400">{error}</Text> : null}
        </View>

        <View className="gap-2">
          <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
            {t('routes.onboarding.operatorScreen.coverAndDescription.descriptionLabel')}
          </Text>
          <TextInput
            value={description}
            onChangeText={onDescriptionChange}
            placeholder={t(
              'routes.onboarding.operatorScreen.coverAndDescription.descriptionPlaceholder',
            )}
            placeholderTextColor={MUTED}
            multiline
            numberOfLines={4}
            maxLength={MAX_DESCRIPTION + 20}
            style={styles.description}
          />
          <Text style={styles.charCount}>
            {description.length}/{MAX_DESCRIPTION}
          </Text>
          {tooLongDesc ? (
            <Text className="text-[12px] font-body text-error-400">
              {t('routes.onboarding.operatorScreen.coverAndDescription.descriptionTooLong')}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="gap-3">
        <Button action="primary" size="lg" onPress={onNext} isDisabled={uploading || tooLongDesc}>
          <ButtonText>{t('routes.onboarding.operatorScreen.nav.continue')}</ButtonText>
        </Button>
        <Button action="ghost" size="md" onPress={onSkip} isDisabled={uploading}>
          <ButtonText>{t('routes.onboarding.operatorScreen.coverAndDescription.skip')}</ButtonText>
        </Button>
      </View>
    </View>
  );
}

function coverButtonLabel(
  t: (key: string) => string,
  uploading: boolean,
  hasCover: boolean,
): string {
  if (uploading) return t('routes.onboarding.operatorScreen.coverAndDescription.uploading');
  if (hasCover) return t('routes.onboarding.operatorScreen.coverAndDescription.replacePhoto');
  return t('routes.onboarding.operatorScreen.coverAndDescription.choosePhoto');
}

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    height: 180,
    backgroundColor: CHARCOAL,
  },
  coverPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: CHARCOAL,
    borderColor: MID,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    minHeight: 100,
    backgroundColor: CHARCOAL,
    borderColor: MID,
    borderWidth: 1,
    color: WARM_CREAM,
    fontFamily: 'DMSans',
    fontSize: 14,
    padding: 12,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: 'DMMono',
    fontSize: 11,
    letterSpacing: 1.5,
    color: FIRE_ORANGE,
    textAlign: 'right',
  },
});
