import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ButtonText } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isValidTimeOfDay, normalizeTimeOfDay } from '@/lib/schedule';
import { useAddSavedLocation } from '@/hooks/useAddSavedLocation';
import { APP_BLACK, MUTED, WARM_CREAM } from '@/theme/colors';

interface AddSavedLocationModalProps {
  visible: boolean;
  /** Required at submit time. Undefined when the session is mid-resolve
   *  or has been lost (token refresh failure, sign-out from another
   *  tab); the modal short-circuits the submit in that case. */
  operatorId: string | undefined;
  onClose: () => void;
  onAdded?: () => void;
}

interface FormErrors {
  name?: string;
  locationLabel?: string;
  lat?: string;
  lng?: string;
  defaultOpenTime?: string;
  defaultCloseTime?: string;
  submit?: string;
}

const EMPTY_FORM = {
  name: '',
  locationLabel: '',
  lat: '',
  lng: '',
  defaultOpenTime: '',
  defaultCloseTime: '',
};

/**
 * Modal-with-form for creating a new saved location. Manual lat/lng
 * input — map-picker integration is intentionally out of scope for the
 * MVP. Validates against the same bounds the DB CHECK constraints
 * enforce (lat ∈ [-90,90], lng ∈ [-180,180], open < close, no overnight)
 * so the round-trip can't produce a server-side rejection except for
 * RLS or network failures.
 */
export function AddSavedLocationModal({
  visible,
  operatorId,
  onClose,
  onAdded,
}: AddSavedLocationModalProps) {
  const { t } = useTranslation();
  const mutation = useAddSavedLocation();
  const { reset: resetMutation } = mutation;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form whenever the modal closes so reopening gives a fresh
  // sheet rather than the last-failed-submit state. resetMutation()
  // clears any prior mutation error/data. Depending on the destructured
  // reset (stable across renders) instead of the whole mutation object
  // (new identity each render) avoids re-running the effect on every
  // parent re-render while the modal is hidden.
  useEffect(() => {
    if (!visible) {
      setForm(EMPTY_FORM);
      setErrors({});
      resetMutation();
    }
  }, [visible, resetMutation]);

  const setField = <K extends keyof typeof EMPTY_FORM>(key: K, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined, submit: undefined }));
  };

  const validate = (): { ok: true; values: { lat: number; lng: number } } | { ok: false } => {
    const next: FormErrors = {};

    const name = form.name.trim();
    if (!name) next.name = t('routes.operator.todayScreen.modal.errors.required');

    const label = form.locationLabel.trim();
    if (!label) next.locationLabel = t('routes.operator.todayScreen.modal.errors.required');

    // Number() returns NaN for empty / non-numeric strings — guard with
    // Number.isFinite so "" and "abc" don't slip through as 0.
    const latNum = Number(form.lat);
    if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
      next.lat = t('routes.operator.todayScreen.modal.errors.invalidLat');
    }
    const lngNum = Number(form.lng);
    if (!Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
      next.lng = t('routes.operator.todayScreen.modal.errors.invalidLng');
    }

    const openValid = isValidTimeOfDay(form.defaultOpenTime);
    const closeValid = isValidTimeOfDay(form.defaultCloseTime);
    if (!openValid)
      next.defaultOpenTime = t('routes.operator.todayScreen.modal.errors.invalidTime');
    if (!closeValid)
      next.defaultCloseTime = t('routes.operator.todayScreen.modal.errors.invalidTime');

    if (openValid && closeValid) {
      const openNorm = normalizeTimeOfDay(form.defaultOpenTime);
      const closeNorm = normalizeTimeOfDay(form.defaultCloseTime);
      // String compare is correct for HH:mm:ss — lex order matches
      // chronological order. The DB CHECK enforces the same rule.
      if (openNorm >= closeNorm) {
        next.defaultCloseTime = t('routes.operator.todayScreen.modal.errors.openAfterClose');
      }
    }

    setErrors(next);
    if (Object.values(next).some(Boolean)) return { ok: false };
    return { ok: true, values: { lat: latNum, lng: lngNum } };
  };

  const handleSubmit = () => {
    // Guard against session loss while the modal is open — operatorId
    // can transition to undefined if the auth store clears mid-form
    // (token refresh failure, sign-out from another tab). Submitting
    // with an undefined id would land an `operator_id: undefined` row
    // through PostgREST and fail RLS without a clear error.
    if (!operatorId) {
      onClose();
      return;
    }
    const result = validate();
    if (!result.ok) return;

    mutation.mutate(
      {
        operatorId,
        name: form.name.trim(),
        locationLabel: form.locationLabel.trim(),
        lat: result.values.lat,
        lng: result.values.lng,
        defaultOpenTime: normalizeTimeOfDay(form.defaultOpenTime),
        defaultCloseTime: normalizeTimeOfDay(form.defaultCloseTime),
      },
      {
        onSuccess: () => {
          onAdded?.();
          onClose();
        },
        onError: () => {
          setErrors((prev) => ({
            ...prev,
            submit: t('routes.operator.todayScreen.errors.publishFailed'),
          }));
        },
      },
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View className="flex-row items-center justify-between border-b border-outline-200 px-4 py-3">
            <Text className="font-heading text-2xl tracking-wider text-typography-950">
              {t('routes.operator.todayScreen.modal.title')}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('routes.operator.todayScreen.modal.cancel')}
              className="h-9 w-9 items-center justify-center"
            >
              <Feather name="x" size={20} color={WARM_CREAM} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Input
              label={t('routes.operator.todayScreen.modal.nameLabel')}
              value={form.name}
              onChangeText={(v) => setField('name', v)}
              placeholder="ByWard Market"
              autoCapitalize="words"
              error={errors.name}
            />
            <Input
              label={t('routes.operator.todayScreen.modal.labelLabel')}
              value={form.locationLabel}
              onChangeText={(v) => setField('locationLabel', v)}
              placeholder="55 ByWard Market Square"
              error={errors.locationLabel}
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label={t('routes.operator.todayScreen.modal.latLabel')}
                  value={form.lat}
                  onChangeText={(v) => setField('lat', v)}
                  placeholder="45.4275"
                  keyboardType="numbers-and-punctuation"
                  error={errors.lat}
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t('routes.operator.todayScreen.modal.lngLabel')}
                  value={form.lng}
                  onChangeText={(v) => setField('lng', v)}
                  placeholder="-75.6919"
                  keyboardType="numbers-and-punctuation"
                  error={errors.lng}
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label={t('routes.operator.todayScreen.modal.openLabel')}
                  value={form.defaultOpenTime}
                  onChangeText={(v) => setField('defaultOpenTime', v)}
                  placeholder="11:30"
                  keyboardType="numbers-and-punctuation"
                  error={errors.defaultOpenTime}
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t('routes.operator.todayScreen.modal.closeLabel')}
                  value={form.defaultCloseTime}
                  onChangeText={(v) => setField('defaultCloseTime', v)}
                  placeholder="20:00"
                  keyboardType="numbers-and-punctuation"
                  error={errors.defaultCloseTime}
                />
              </View>
            </View>

            {errors.submit ? (
              <Text className="text-[12px] font-body text-error-400">{errors.submit}</Text>
            ) : null}

            <Text className="text-[12px] font-body text-typography-500">
              {t('routes.operator.todayScreen.modal.hint')}
            </Text>
          </ScrollView>

          <View className="border-t border-outline-200 px-4 py-3" style={{ borderTopColor: MUTED }}>
            <Button
              action="primary"
              size="lg"
              onPress={handleSubmit}
              isDisabled={mutation.isPending}
            >
              <ButtonText>
                {mutation.isPending
                  ? t('routes.operator.todayScreen.modal.submitting')
                  : t('routes.operator.todayScreen.modal.submit')}
              </ButtonText>
            </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: APP_BLACK },
  flex: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
});
