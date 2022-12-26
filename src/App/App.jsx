import { useEffect, useState, useLayoutEffect } from 'react';
import { Map, BottomPanel, Header, InfoModal, CountryDetails, RasterLayer, PopupInfo } from '../components';
import { getPreloadedState } from '../utils/preloadedState';
import useEutrophicationData from '../hooks/useEutrophicationData';
import { CalciteLoader } from '@esri/calcite-components-react';

const preloadedState = getPreloadedState();

export const App = () => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(preloadedState.isInfoModelOpen);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [identifyPoint, setIdentifyPoint] = useState(null);
  const [monthlyMode, setMonthlyMode] = useState(preloadedState.monthlyMode);
  const [monthlyTimeSlice, setMonthlyTimeSlice] = useState(0);
  const [yearlyTimeSlice, setYearlyTimeSlice] = useState(203);
  const [paddingBottom, setPaddingBottom] = useState(80);
  const [isMobile, setIsMobile] = useState();
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(0);
  const [identifyInfo, setIdentifyInfo] = useState(null);

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
          setIdentifyInfo={setIdentifyInfo}
        ></RasterLayer>
      </Map>
      <PopupInfo
        identifyInfo={identifyInfo}
        selectedCountry={selectedCountry}
        setIdentifyPoint={setIdentifyPoint}
        identifyPoint={identifyPoint}
      ></PopupInfo>
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
