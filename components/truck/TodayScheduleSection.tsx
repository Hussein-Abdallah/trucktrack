import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { deriveIsOpen, formatTimeRange } from '@/lib/schedule';
import type { TruckSchedule } from '@/lib/types';

interface TodayScheduleSectionProps {
  schedules: TruckSchedule[];
}

export function TodayScheduleSection({ schedules }: TodayScheduleSectionProps) {
  const { t } = useTranslation();

  return (
    <View className="px-4 py-6">
      <Text className="mb-4 border-b border-outline-100 pb-2 font-heading text-2xl tracking-wider text-typography-950">
        {t('truck.profile.schedule.heading')}
      </Text>
      {schedules.length === 0 ? (
        <EmptyState icon="calendar" title={t('truck.profile.schedule.empty')} message="" />
      ) : (
        <View className="gap-3">
          {schedules.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} />
          ))}
        </View>
      )}
    </View>
  );
}

interface ShiftCardProps {
  shift: TruckSchedule;
}

function ShiftCard({ shift }: ShiftCardProps) {
  const { t } = useTranslation();
  const live = deriveIsOpen(shift);
  // Live shift gets the fire-orange treatment with App-Black text.
  // Other shifts (scheduled / not-yet-live) use the charcoal surface
  // pattern that matches the rest of the dark UI.
  const wrapperClass = live
    ? 'bg-primary-400 p-4'
    : 'border border-outline-100 bg-background-50 p-4';
  const labelClass = live
    ? 'mb-2 font-mono text-[10px] uppercase tracking-[1.5px] text-typography-black'
    : 'mb-2 font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500';
  const headingClass = live
    ? 'mb-1 font-heading text-lg tracking-wider text-typography-black'
    : 'mb-1 font-heading text-lg tracking-wider text-typography-950';
  const hoursClass = live
    ? 'font-mono text-[11px] uppercase tracking-[1.5px] text-typography-black'
    : 'font-mono text-[11px] uppercase tracking-[1.5px] text-typography-500';

  return (
    <View className={wrapperClass}>
      {live ? <Text className={labelClass}>{t('truckCard.openNow')}</Text> : null}
      <Text className={headingClass}>{shift.location_label}</Text>
      <Text className={hoursClass}>{formatTimeRange(shift.open_time, shift.close_time)}</Text>
    </View>
  );
}
