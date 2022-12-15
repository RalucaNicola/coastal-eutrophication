import { useEffect, useState, useLayoutEffect } from 'react';
import { Map, BottomPanel, Header, InfoModal, CountryDetails, RasterLayer } from '../components';

import useEutrophicationData from '../hooks/useEutrophicationData';
import { CalciteLoader } from '@esri/calcite-components-react';

export const App = () => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [identifyPoint, setIdentifyPoint] = useState(null);
  const [monthlyMode, setMonthlyMode] = useState(false);
  const [monthlyTimeSlice, setMonthlyTimeSlice] = useState(0);
  const [yearlyTimeSlice, setYearlyTimeSlice] = useState(203);
  const [paddingBottom, setPaddingBottom] = useState(80);
  const [isMobile, setIsMobile] = useState();
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(0);

  const { dataResponse, isLoading, isFailed } = useEutrophicationData();

  useLayoutEffect(() => {
    const updateMobile = () => {
      if (window.innerWidth < 701) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    setIdentifyPoint(null);
  }, [selectedCountry, monthlyTimeSlice, yearlyTimeSlice, monthlyMode]);

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
          monthlyMode={monthlyMode}
          monthlyTimeSlice={monthlyTimeSlice}
          setMonthlyTimeSlice={setMonthlyTimeSlice}
          yearlyTimeSlice={yearlyTimeSlice}
          setYearlyTimeSlice={setYearlyTimeSlice}
          isMobile={isMobile}
          selectedRegionIndex={selectedRegionIndex}
          setSelectedRegionIndex={setSelectedRegionIndex}
        ></CountryDetails>
      );
    }
  };
  return (
    <>
      <Map
        data={dataResponse}
        setCountry={setSelectedCountry}
        selectedCountry={selectedCountry}
        setIdentifyPoint={setIdentifyPoint}
        paddingBottom={paddingBottom}
        selectedRegionIndex={selectedRegionIndex}
      >
        <RasterLayer
          identifyPoint={identifyPoint}
          monthlyMode={monthlyMode}
          monthlyTimeSlice={monthlyTimeSlice}
          yearlyTimeSlice={yearlyTimeSlice}
        ></RasterLayer>
      </Map>
      <BottomPanel
        setPaddingBottom={setPaddingBottom}
        setModal={() => setIsInfoModalOpen(true)}
        isMobile={isMobile}
        selectedCountry={selectedCountry}
        selectedRegionIndex={selectedRegionIndex}
        monthlyMode={monthlyMode}
        setMonthlyMode={setMonthlyMode}
      >
        {showCountryDetails()}
      </BottomPanel>
      <Header setModal={() => setIsInfoModalOpen(true)} isMobile={isMobile}></Header>
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </>
  );
};
