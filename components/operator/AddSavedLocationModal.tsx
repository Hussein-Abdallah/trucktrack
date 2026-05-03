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

import {
  EMPTY_SAVED_LOCATION_FORM,
  SavedLocationForm,
  validateSavedLocationForm,
  type SavedLocationFormErrors,
  type SavedLocationFormValue,
} from '@/components/operator/SavedLocationForm';
import { Button, ButtonText } from '@/components/ui/button';
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

/**
 * Modal-with-form for creating a new saved location from the Today
 * screen (TT-56). Form body + validation lives in SavedLocationForm so
 * the onboarding wizard's first-saved-location step (TT-9) can reuse
 * it without duplicating the lat/lng/time logic.
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
  const [form, setForm] = useState<SavedLocationFormValue>(EMPTY_SAVED_LOCATION_FORM);
  const [errors, setErrors] = useState<SavedLocationFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form whenever the modal closes so reopening gives a fresh
  // sheet rather than the last-failed-submit state. resetMutation()
  // clears any prior mutation error/data. Depending on the destructured
  // reset (stable across renders) instead of the whole mutation object
  // (new identity each render) avoids re-running the effect on every
  // parent re-render while the modal is hidden.
  useEffect(() => {
    if (!visible) {
      setForm(EMPTY_SAVED_LOCATION_FORM);
      setErrors({});
      setSubmitError(null);
      resetMutation();
    }
  }, [visible, resetMutation]);

  const handleFormChange = (next: SavedLocationFormValue) => {
    setForm(next);
    // Clear errors as the user edits — feels less hostile than holding
    // the red state until next submit.
    setErrors({});
    setSubmitError(null);
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

    const result = validateSavedLocationForm(form, t);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    mutation.mutate(
      {
        operatorId,
        ...result.values,
      },
      {
        onSuccess: () => {
          onAdded?.();
          onClose();
        },
        onError: () => {
          setSubmitError(t('routes.operator.todayScreen.errors.publishFailed'));
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
            <SavedLocationForm value={form} errors={errors} onChange={handleFormChange} />

            {submitError ? (
              <Text className="mt-3 text-[12px] font-body text-error-400">{submitError}</Text>
            ) : null}
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
