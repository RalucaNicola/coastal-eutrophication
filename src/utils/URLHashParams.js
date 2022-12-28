/**********************
 * URL hash param keys
 *
 * mapCenter: longitude, latitude
 * zoom: number
 * mode: 'monthly'/'yearly'
 * timeSlice: number
 * country: string
 * regionIndex: number
 **********************/
const keys = {
  center: 'mapCenter',
  mode: 'mode',
  time: 'timeSlice',
  country: 'country',
  region: 'regionIndex'
};

const hashParams = new URLSearchParams(window.location.hash.slice(1));

const updateHashParams = (key, value) => {
  if (value === undefined || value === null) {
    hashParams.delete(key);
    if (key === keys.country) {
      hashParams.delete(keys.region);
    }
  } else {
    hashParams.set(key, value);
  }
  window.location.hash = hashParams.toString();
};

const getHashParamValueByKey = (key) => {
  if (!hashParams.has(key)) {
    return null;
  }

  return hashParams.get(key);
};

export const setMapCenterToHashParams = (center, zoom) => {
  const { lon, lat } = center;
  const value = `${lon},${lat},${zoom}`;

  updateHashParams(keys.center, value);
};

export const getMapCenterFromHashParams = () => {
  const value = getHashParamValueByKey(keys.center);

  if (!value) {
    return null;
  }

  const [lon, lat, zoom] = value.split(',').map((d) => parseFloat(d));

  return {
    center: {
      lon,
      lat
    },
    zoom
  };
};

export const setModeToHashParameters = (value) => {
  if (value) {
    updateHashParams(keys.mode, 'monthly');
  } else {
    updateHashParams(keys.mode, null);
  }
};

export const getModeFromHashParameters = () => {
  const value = getHashParamValueByKey(keys.mode);
  if (!value) {
    return false;
  }
  return value === 'monthly';
};

export const setTimeSliceToHashParameters = (value) => {
  if (value) {
    updateHashParams(keys.time, value);
  } else {
    updateHashParams(keys.time, null);
  }
};

export const getTimeSliceFromHashParameters = () => {
  const value = getHashParamValueByKey(keys.time);
  if (!value) {
    return null;
  }
  return +value;
};

export const setCountryToHashParameters = (value) => {
  updateHashParams(keys.country, value);
};

export const getCountryFromHashParameters = () => {
  const value = getHashParamValueByKey(keys.country);
  if (!value) {
    return null;
  }
  return {
    name: value,
    selectedFromMap: true
  };
};

export const setRegionToHashParameters = (value) => {
  if (!value) {
    updateHashParams(keys.region, null);
  } else {
    updateHashParams(keys.region, value);
  }
};

export const getRegionFromHashParameters = () => {
  const value = getHashParamValueByKey(keys.region);
  if (!value) {
    return 0;
  }
  return parseInt(value);
};
