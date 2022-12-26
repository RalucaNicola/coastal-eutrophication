import { getModeFromHashParameters } from './URLHashParams';
const monthlyMode = getModeFromHashParameters();

export const getPreloadedState = () => {
  return {
    isInfoModalOpen: false,
    monthlyMode
  };
};
