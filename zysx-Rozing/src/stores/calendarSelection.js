// stores/calendarSelection.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCalendarSelectionStore = defineStore('calendarSelection', () => {
  const selectedDate = ref(null);
  const selectedWeek = ref(null); // {startDate: Date, endDate: Date}
  const selectedMonth = ref(null); // {year: Number, month: Number}
  const selectedYear = ref(null); // Number

  const setSelectedDate = (date) => {
    selectedDate.value = date;
    selectedWeek.value = null;
    selectedMonth.value = null;
    selectedYear.value = null;
  };

  const setSelectedWeek = (week) => {
    selectedWeek.value = week;
    selectedDate.value = null;
    selectedMonth.value = null;
    selectedYear.value = null;
  };

  const setSelectedMonth = (month) => {
    selectedMonth.value = month;
    selectedDate.value = null;
    selectedWeek.value = null;
    selectedYear.value = null;
  };

  const setSelectedYear = (year) => {
    selectedYear.value = year;
    selectedDate.value = null;
    selectedWeek.value = null;
    selectedMonth.value = null;
  };

  const clearAllSelections = () => {
    selectedDate.value = null;
    selectedWeek.value = null;
    selectedMonth.value = null;
    selectedYear.value = null;
  };

  const currentViewType = computed(() => {
    if (selectedDate.value) return 'day';
    if (selectedWeek.value) return 'week';
    if (selectedMonth.value) return 'month';
    if (selectedYear.value) return 'year';
    return null;
  });

  return {
    selectedDate,
    selectedWeek,
    selectedMonth,
    selectedYear,
    setSelectedDate,
    setSelectedWeek,
    setSelectedMonth,
    setSelectedYear,
    clearAllSelections,
    currentViewType,
  };
});