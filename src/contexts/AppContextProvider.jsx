import { mapConfig } from '../config';
import { getTimeDefinition } from '../utils';
import { createContext, useEffect, useState } from 'react';

export const AppContext = createContext(null);

const AppContextProvider = ({ children }) => {
  const [timeDefinition, setTimeDefinition] = useState({
    yearlyTimeDefinition: null,
    monthlyTimeDefinition: null
  });

  const init = async () => {
    const yearlyTimeDefinition = await getTimeDefinition(mapConfig['yearly-layer']);
    const monthlyTimeDefinition = await getTimeDefinition(mapConfig['monthly-layer']);
    setTimeDefinition({ yearlyTimeDefinition, monthlyTimeDefinition });
  };

  useEffect(() => {
    init();
  }, []);

  return <AppContext.Provider value={timeDefinition}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
