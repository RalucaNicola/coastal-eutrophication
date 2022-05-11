import * as styles from './App.module.css';
import { useState } from 'react';
import { Map, BottomPanel, InfoModal, CountryDetails, EEZLayer } from '../components';

import useEutrophicationData from '../hooks/useEutrophicationData';
import { CalciteLoader } from '@esri/calcite-components-react';

export const App = () => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const { dataResponse, isLoading, isFailed } = useEutrophicationData();
  const showCountryDetails = () => {
    if (isLoading) {
      return <CalciteLoader active type='indeterminate'></CalciteLoader>;
    }
    if (dataResponse) {
      return (
        <CountryDetails
          data={dataResponse.countryData}
          setCountry={setSelectedCountry}
          selectedCountry={selectedCountry}
        ></CountryDetails>
      );
    }
    return null;
  };
  return (
    <>
      <Map>
        <EEZLayer selectedCountry={selectedCountry} setCountry={setSelectedCountry}></EEZLayer>
      </Map>
      <BottomPanel setModal={() => setIsInfoModalOpen(true)}>{showCountryDetails()}</BottomPanel>
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </>
  );
};
