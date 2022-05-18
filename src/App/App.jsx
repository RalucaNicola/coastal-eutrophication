import * as styles from './App.module.css';
import { useEffect, useState } from 'react';
import { Map, BottomPanel, InfoModal, CountryDetails, RasterLayer } from '../components';

import useEutrophicationData from '../hooks/useEutrophicationData';
import { CalciteLoader } from '@esri/calcite-components-react';

export const App = () => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [identifyPoint, setIdentifyPoint] = useState(null);
  const [monthlyMode, setMonthlyMode] = useState(false);
  const [timeSlice, setTimeSlice] = useState(0);
  const [paddingBottom, setPaddingBottom] = useState(350);

  const { dataResponse, isLoading, isFailed } = useEutrophicationData();

  useEffect(() => {
    setIdentifyPoint(null);
  }, [selectedCountry, timeSlice]);

  const showCountryDetails = () => {
    if (!isLoading && !dataResponse) {
      return null;
    }

    if (isLoading) {
      return <CalciteLoader active type='indeterminate'></CalciteLoader>;
    }

    if (dataResponse) {
      return (
        <CountryDetails
          data={dataResponse}
          setCountry={setSelectedCountry}
          selectedCountry={selectedCountry}
          setMonthlyMode={setMonthlyMode}
          timeSlice={timeSlice}
          setTimeSlice={setTimeSlice}
        ></CountryDetails>
      );
    }
  };
  return (
    <>
      <Map
        setCountry={setSelectedCountry}
        selectedCountry={selectedCountry}
        setIdentifyPoint={setIdentifyPoint}
        paddingBottom={paddingBottom}
      >
        <RasterLayer identifyPoint={identifyPoint} monthlyMode={monthlyMode} timeSlice={timeSlice}></RasterLayer>
      </Map>
      <BottomPanel setPaddingBottom={setPaddingBottom} setModal={() => setIsInfoModalOpen(true)}>
        {showCountryDetails()}
      </BottomPanel>
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </>
  );
};
