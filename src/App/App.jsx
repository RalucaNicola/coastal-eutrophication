import * as styles from './App.module.css';
import { useState } from 'react';
import { Map, BottomPanel, InfoModal, CountryDetails, RasterLayer, SVGChart } from '../components';

import useEutrophicationData from '../hooks/useEutrophicationData';
import { CalciteLoader } from '@esri/calcite-components-react';

export const App = () => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [identifyPoint, setIdentifyPoint] = useState(null);
  const [monthlyMode, setMonthlyMode] = useState(false);

  const { dataResponse, isLoading, isFailed } = useEutrophicationData();

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
          data={dataResponse.countryData}
          setCountry={setSelectedCountry}
          selectedCountry={selectedCountry}
          setMonthlyMode={setMonthlyMode}
        >
          <SVGChart data={dataResponse.eutrophicationData}></SVGChart>
        </CountryDetails>
      );
    }
  };
  return (
    <>
      <Map
        setCountry={setSelectedCountry}
        selectedCountry={selectedCountry}
        setIdentifyPoint={setIdentifyPoint}
        paddingBottom={350}
      >
        <RasterLayer identifyPoint={identifyPoint} monthlyMode={monthlyMode}></RasterLayer>
      </Map>
      <BottomPanel setModal={() => setIsInfoModalOpen(true)}>{showCountryDetails()}</BottomPanel>
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </>
  );
};
