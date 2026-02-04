import dayjs from 'dayjs';
import { Value, Pollutant } from '@interfaces/airquality/airquality';
import { PollutantType } from '@interfaces/pollutant/pollutant';

export interface GroupedData {
  [key: string]: {
    value: number;
    observedAt: string;
    name: string;
  }[];
}

export interface FlatDataItem {
  value: number;
  observedAt: string;
  name: string;
}

export interface TableDataItem {
  [key: string]: number | string;
}

const WEEK_DAYS = ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön'];

/**
 * Get Swedish weekday name (Monday-based index)
 */
function getSwedishWeekday(date: dayjs.Dayjs): string {
  const dayIndex = date.day();
  return WEEK_DAYS[dayIndex === 0 ? 6 : dayIndex - 1];
}

/**
 * Generic grouping function for air quality values
 */
export function groupByKey(
  values: Value[],
  keyFn: (date: dayjs.Dayjs) => string,
  pollutantName: string
): GroupedData {
  return values.reduce((group: GroupedData, v) => {
    const date = dayjs(v.observedAt);
    const key = keyFn(date);

    if (!group[key]) {
      group[key] = [];
    }

    group[key].push({
      value: v.value,
      observedAt: v.observedAt,
      name: pollutantName,
    });

    return group;
  }, {});
}

/**
 * Calculate average value for a group
 */
export function calculateGroupAverage(group: { value: number }[]): number {
  return group.reduce((sum, item) => sum + item.value, 0) / group.length;
}

/**
 * Format date as hour label: "HH:mm|YYYY-MM-DD"
 * Contains both time and date separated by | for parsing
 */
export function formatHourLabel(date: dayjs.Dayjs): string {
  return `${date.format('HH:mm')}|${date.format('YYYY-MM-DD')}`;
}

/**
 * Format hour label for axis display (short): "HH:mm"
 */
export function formatAxisLabel(label: string): string {
  return label.split('|')[0];
}

/**
 * Format hour label for tooltip display (full): "YYYY-MM-DD kl HH:mm"
 */
export function formatTooltipLabel(label: string): string {
  const [time, date] = label.split('|');
  if (!date) return label;
  return `${date} kl ${time}`;
}

/**
 * Format date for week/month filter: "MMM DD"
 */
export function formatDateLabel(date: dayjs.Dayjs): string {
  return date.format('MMM DD');
}

/**
 * Format date as month label: "YYYY MMMM"
 */
export function formatMonthLabel(date: dayjs.Dayjs): string {
  return date.format('YYYY MMMM');
}

/**
 * Format date for display based on filter type
 */
export function formatDisplayDate(observedAt: string, filter: string): string {
  const date = dayjs(observedAt);

  switch (filter) {
    case 'fourdays':
    case 'week':
      return `${date.format('DD MMM')} (${getSwedishWeekday(date)})`;
    case 'month':
      return date.format('DD MMM');
    case 'year':
      return date.format('MMMM YYYY');
    default:
      return observedAt;
  }
}

/**
 * Get unique keys from a grouped data object, preserving insertion order
 */
export function getUniqueKeys(values: Value[], keyFn: (date: dayjs.Dayjs) => string): string[] {
  const keys: string[] = [];
  values.forEach((v) => {
    const key = keyFn(dayjs(v.observedAt));
    if (!keys.includes(key)) {
      keys.push(key);
    }
  });
  return keys;
}

/**
 * Get translated pollutant name
 */
export function getPollutantLabel(name: string): string {
  return PollutantType[name as keyof typeof PollutantType] || name;
}

/**
 * Process grouped data into averaged values for graph and table
 */
export function processGroupedData(
  groupedData: GroupedData,
  keys: string[]
): { cleaned: FlatDataItem[]; tableArr: FlatDataItem[] } {
  const cleaned: FlatDataItem[] = [];
  const tableArr: FlatDataItem[] = [];

  keys.forEach((key) => {
    const group = groupedData[key];
    if (group && group.length > 0) {
      const averageValue = calculateGroupAverage(group);
      const firstItem = group[0];

      cleaned.push({
        value: averageValue,
        observedAt: firstItem.observedAt,
        name: firstItem.name,
      });

      tableArr.push({
        value: averageValue,
        observedAt: firstItem.observedAt,
        name: getPollutantLabel(firstItem.name),
      });
    }
  });

  return { cleaned, tableArr };
}

/**
 * Transform flat data to table format, grouping by observedAt date
 */
export function transformToTableData(flatData: FlatDataItem[]): TableDataItem[] {
  const allDates: string[] = [];

  flatData.forEach((f) => {
    if (!allDates.includes(f.observedAt)) {
      allDates.push(f.observedAt);
    }
  });

  return allDates.map((date) => {
    const pollutantValues: { [key: string]: number } = {};

    flatData.forEach((f) => {
      if (f.observedAt === date && typeof f.value === 'number') {
        pollutantValues[f.name] = f.value;
      }
    });

    return {
      observedAt: date,
      ...pollutantValues,
    };
  });
}

/**
 * Process pollutant data for a specific filter type
 */
export function processPollutantData(
  pollutant: Pollutant,
  filter: string
): {
  graphPollutant: Pollutant;
  tableData: FlatDataItem[];
} {
  const { values, name: pollutantName } = pollutant;

  if (filter === 'day') {
    const hourValues: Value[] = values.map((v) => ({
      value: v.value,
      observedAt: formatHourLabel(dayjs(v.observedAt)),
    }));

    const tableData: FlatDataItem[] = hourValues.map((v) => ({
      value: v.value,
      observedAt: v.observedAt,
      name: getPollutantLabel(pollutantName),
    }));

    return {
      graphPollutant: { name: pollutantName, values: hourValues },
      tableData,
    };
  }

  // For week, month, year: group and average
  const keyFn =
    filter === 'year'
      ? formatMonthLabel
      : formatDateLabel;

  const groupedData = groupByKey(values, keyFn, pollutantName);
  const keys = getUniqueKeys(values, keyFn);
  const { cleaned, tableArr } = processGroupedData(groupedData, keys);

  // Format for graph display
  const pollutantValues: Value[] = cleaned
    .filter((c) => c.name === pollutantName)
    .map((c) => ({
      value: c.value,
      observedAt: formatDisplayDate(c.observedAt, filter),
    }))
    .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime());

  return {
    graphPollutant: { name: pollutantName, values: pollutantValues },
    tableData: tableArr,
  };
}
