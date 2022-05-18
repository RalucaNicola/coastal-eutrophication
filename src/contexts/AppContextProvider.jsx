import { mapConfig } from '../config';
import { getTimeDefinition } from '../utils';
import { createContext, useEffect, useState } from 'react';

export const AppContext = createContext(null);

const AppContextProvider = ({ children }) => {
  const [timeDefinition, setTimeDefinition] = useState();

  const init = async () => {
    const timeDefinition = await getTimeDefinition(mapConfig['total-layer']);
    setTimeDefinition(timeDefinition);
  };

  const value = {
    timeDefinition
  };

  useEffect(() => {
    init();
  }, []);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
