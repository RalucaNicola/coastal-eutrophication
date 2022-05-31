import { useEffect, useState, useLayoutEffect } from 'react';
import { Map, BottomPanel, InfoModal, CountryDetails, RasterLayer, LegendComponent } from '../components';

import useEutrophicationData from '../hooks/useEutrophicationData';
import { CalciteLoader } from '@esri/calcite-components-react';

export const App = () => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [identifyPoint, setIdentifyPoint] = useState(null);
  const [monthlyMode, setMonthlyMode] = useState(false);
  const [timeSlice, setTimeSlice] = useState(0);
  const [paddingBottom, setPaddingBottom] = useState(80);
  const [isMobile, setIsMobile] = useState();
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [fromMap, setFromMap] = useState(false);

  const { dataResponse, isLoading, isFailed } = useEutrophicationData();

  useLayoutEffect(() => {
    const updateMobile = () => {
      if (window.innerWidth < 551) {
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
          setFromMap={setFromMap}
          selectedCountry={selectedCountry}
          setMonthlyMode={setMonthlyMode}
          timeSlice={timeSlice}
          setTimeSlice={setTimeSlice}
          isMobile={isMobile}
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
        setFromMap={setFromMap}
        fromMap={fromMap}
      >
        <RasterLayer identifyPoint={identifyPoint} monthlyMode={monthlyMode} timeSlice={timeSlice}></RasterLayer>
        <LegendComponent isLegendOpen={isLegendOpen}></LegendComponent>
      </Map>
      <BottomPanel
        setPaddingBottom={setPaddingBottom}
        setModal={() => setIsInfoModalOpen(true)}
        isMobile={isMobile}
        setLegend={() => setIsLegendOpen(!isLegendOpen)}
        selectedCountry={selectedCountry}
      >
        {showCountryDetails()}
      </BottomPanel>
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </>
  );
};
