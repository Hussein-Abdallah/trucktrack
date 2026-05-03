import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/ui/input';
import { isValidTimeOfDay, normalizeTimeOfDay } from '@/lib/schedule';

export interface SavedLocationFormValue {
  name: string;
  locationLabel: string;
  lat: string;
  lng: string;
  defaultOpenTime: string;
  defaultCloseTime: string;
}

export interface SavedLocationFormErrors {
  name?: string;
  locationLabel?: string;
  lat?: string;
  lng?: string;
  defaultOpenTime?: string;
  defaultCloseTime?: string;
}

export const EMPTY_SAVED_LOCATION_FORM: SavedLocationFormValue = {
  name: '',
  locationLabel: '',
  lat: '',
  lng: '',
  defaultOpenTime: '',
  defaultCloseTime: '',
};

export interface ValidatedSavedLocation {
  name: string;
  locationLabel: string;
  lat: number;
  lng: number;
  defaultOpenTime: string;
  defaultCloseTime: string;
}

/**
 * Validates a SavedLocationFormValue against the same bounds the DB
 * CHECK constraints enforce on `operator_saved_locations`:
 * lat ∈ [-90, 90], lng ∈ [-180, 180], times in HH:mm or HH:mm:ss with
 * open < close.
 *
 * Empty / whitespace lat/lng input is rejected first (Number('') is
 * `0`, which would otherwise silently pass the range check and
 * publish a 0,0 location off the coast of Africa — same defense
 * applied via PR #46 review feedback).
 *
 * Returns `{ ok: true, values }` with parsed numbers + normalized
 * HH:mm:ss times ready for the service layer, or
 * `{ ok: false, errors }` with i18n keys for inline display.
 */
export function validateSavedLocationForm(
  form: SavedLocationFormValue,
  t: (key: string) => string,
): { ok: true; values: ValidatedSavedLocation } | { ok: false; errors: SavedLocationFormErrors } {
  const errors: SavedLocationFormErrors = {};

  const name = form.name.trim();
  if (!name) errors.name = t('routes.operator.todayScreen.modal.errors.required');

  const locationLabel = form.locationLabel.trim();
  if (!locationLabel) errors.locationLabel = t('routes.operator.todayScreen.modal.errors.required');

  const latRaw = form.lat.trim();
  const latNum = Number(latRaw);
  if (!latRaw || !Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
    errors.lat = t('routes.operator.todayScreen.modal.errors.invalidLat');
  }

  const lngRaw = form.lng.trim();
  const lngNum = Number(lngRaw);
  if (!lngRaw || !Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
    errors.lng = t('routes.operator.todayScreen.modal.errors.invalidLng');
  }

  const openValid = isValidTimeOfDay(form.defaultOpenTime);
  const closeValid = isValidTimeOfDay(form.defaultCloseTime);
  if (!openValid)
    errors.defaultOpenTime = t('routes.operator.todayScreen.modal.errors.invalidTime');
  if (!closeValid)
    errors.defaultCloseTime = t('routes.operator.todayScreen.modal.errors.invalidTime');

  if (openValid && closeValid) {
    const openNorm = normalizeTimeOfDay(form.defaultOpenTime);
    const closeNorm = normalizeTimeOfDay(form.defaultCloseTime);
    // String compare is correct for HH:mm:ss — lex order matches
    // chronological order. The DB CHECK enforces the same rule.
    if (openNorm >= closeNorm) {
      errors.defaultCloseTime = t('routes.operator.todayScreen.modal.errors.openAfterClose');
    }
  }

  if (Object.values(errors).some(Boolean)) return { ok: false, errors };

  return {
    ok: true,
    values: {
      name,
      locationLabel,
      lat: latNum,
      lng: lngNum,
      defaultOpenTime: normalizeTimeOfDay(form.defaultOpenTime),
      defaultCloseTime: normalizeTimeOfDay(form.defaultCloseTime),
    },
  };
}

interface SavedLocationFormProps {
  value: SavedLocationFormValue;
  errors: SavedLocationFormErrors;
  onChange: (next: SavedLocationFormValue) => void;
}

/**
 * Form body shared by the AddSavedLocationModal (TT-56) and the
 * onboarding wizard's first-saved-location step (TT-9). No submit
 * button — the parent surface owns the CTA and decides when to call
 * `validateSavedLocationForm`.
 */
export function SavedLocationForm({ value, errors, onChange }: SavedLocationFormProps) {
  const { t } = useTranslation();

  const setField = <K extends keyof SavedLocationFormValue>(
    key: K,
    next: SavedLocationFormValue[K],
  ) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <View style={styles.root}>
      <Input
        label={t('routes.operator.todayScreen.modal.nameLabel')}
        value={value.name}
        onChangeText={(v) => setField('name', v)}
        placeholder="ByWard Market"
        autoCapitalize="words"
        error={errors.name}
      />
      <Input
        label={t('routes.operator.todayScreen.modal.labelLabel')}
        value={value.locationLabel}
        onChangeText={(v) => setField('locationLabel', v)}
        placeholder="55 ByWard Market Square"
        error={errors.locationLabel}
      />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Input
            label={t('routes.operator.todayScreen.modal.latLabel')}
            value={value.lat}
            onChangeText={(v) => setField('lat', v)}
            placeholder="45.4275"
            keyboardType="numbers-and-punctuation"
            error={errors.lat}
          />
        </View>
        <View className="flex-1">
          <Input
            label={t('routes.operator.todayScreen.modal.lngLabel')}
            value={value.lng}
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
            value={value.defaultOpenTime}
            onChangeText={(v) => setField('defaultOpenTime', v)}
            placeholder="11:30"
            keyboardType="numbers-and-punctuation"
            error={errors.defaultOpenTime}
          />
        </View>
        <View className="flex-1">
          <Input
            label={t('routes.operator.todayScreen.modal.closeLabel')}
            value={value.defaultCloseTime}
            onChangeText={(v) => setField('defaultCloseTime', v)}
            placeholder="20:00"
            keyboardType="numbers-and-punctuation"
            error={errors.defaultCloseTime}
          />
        </View>
      </View>

      <Text className="text-[12px] font-body text-typography-500">
        {t('routes.operator.todayScreen.modal.hint')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 16 },
});
