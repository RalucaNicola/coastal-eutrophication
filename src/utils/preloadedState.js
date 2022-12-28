import {
  getModeFromHashParameters,
  getTimeSliceFromHashParameters,
  getCountryFromHashParameters,
  getRegionFromHashParameters
} from './URLHashParams';
const monthlyMode = getModeFromHashParameters();
const timeSlice = getTimeSliceFromHashParameters();
const DEFAULT_YEARLY_TIMESLICE = 203;
const DEFAULT_MONTHLY_TIMESLICE = 0;

const yearlyTimeSlice = monthlyMode ? DEFAULT_YEARLY_TIMESLICE : timeSlice ? timeSlice : DEFAULT_YEARLY_TIMESLICE;
const monthlyTimeSlice = monthlyMode && timeSlice ? timeSlice : DEFAULT_MONTHLY_TIMESLICE;

export const getPreloadedState = () => {
  return {
    isInfoModalOpen: false,
    monthlyMode,
    yearlyTimeSlice,
    monthlyTimeSlice,
    country: getCountryFromHashParameters(),
    regionIndex: getRegionFromHashParameters()
  };
};
