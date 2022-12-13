import * as styles from './CountryDetails.module.css';
import '@esri/calcite-components/dist/components/calcite-select';
import '@esri/calcite-components/dist/components/calcite-option';
import '@esri/calcite-components/dist/components/calcite-label';
import '@esri/calcite-components/dist/components/calcite-radio-button-group';
import '@esri/calcite-components/dist/components/calcite-radio-button';
import '@esri/calcite-components/dist/components/calcite-switch';
import {
  CalciteSelect,
  CalciteOption,
  CalciteLabel,
  CalciteRadioButtonGroup,
  CalciteRadioButton,
  CalciteSwitch
} from '@esri/calcite-components-react';
import { SVGChart } from '../index';
import { useEffect, useState } from 'react';
import { regionNames } from '../../config';

const CountryDetails = ({
  data,
  setCountry,
  selectedCountry,
  monthlyMode,
  setMonthlyMode,
  monthlyTimeSlice,
  setMonthlyTimeSlice,
  yearlyTimeSlice,
  setYearlyTimeSlice,
  selectedRegionIndex,
  setSelectedRegionIndex,
  isMobile
}) => {
  const [selectedFeature, setSelectedFeature] = useState();
  const toggleMode = (event) => {
    setMonthlyMode(event.target.checked);
  };

  useEffect(() => {
    if (!selectedCountry) {
      setSelectedFeature(null);
    } else {
      const feature = data.countryData.filter((feature) => {
        return feature.country === selectedCountry.name;
      })[0];
      setSelectedFeature(feature);
    }
  }, [selectedCountry]);

  const showRegionSelection = () => {
    if (!selectedFeature) {
      return null;
    }

    const regions = regionNames.map((region) => selectedFeature[region.name]);

    return (
      <CalciteLabel>
        Group with:
        <CalciteRadioButtonGroup
          name='region-group'
          layout='vertical'
          onCalciteRadioButtonChange={(event) => {
            setSelectedRegionIndex(event.target.value);
          }}
        >
          {regions.map((region, index) => {
            const checked = selectedRegionIndex === index ? { checked: true } : undefined;
            return (
              <CalciteLabel key={index} layout='inline' className={styles.label}>
                <CalciteRadioButton value={index} {...checked}></CalciteRadioButton>
                {index === 0
                  ? `None, show only ${region}`
                  : index > 1
                  ? `Level ${index - 1}: ${region.replace(' (M49)', '').replace(' (MDG=M49)', '')}`
                  : `${region.replace(' (M49)', '').replace(' (MDG=M49)', '')}`}
              </CalciteLabel>
            );
          })}
        </CalciteRadioButtonGroup>
      </CalciteLabel>
    );
  };
  return (
    <div className={styles.container}>
      <div className={styles.countrySelection}>
        <CalciteLabel scale={isMobile ? 's' : 'm'}>
          {' '}
          Select a zone:
          <CalciteSelect
            scale={isMobile ? 's' : 'm'}
            onCalciteSelectChange={(event) => {
              const country = event.target.selectedOption.value;
              if (country === 'None') {
                setCountry(null);
              } else {
                setCountry({ name: country, selectedFromMap: false });
              }
            }}
          >
            {data.countryData
              .sort((a, b) => {
                return a.country.localeCompare(b.country, 'en', { sensitivity: 'base' });
              })
              .map((feature, index) => (
                <CalciteOption
                  key={index}
                  selected={selectedCountry && selectedCountry.name === feature.country ? true : null}
                >
                  {feature.country}
                </CalciteOption>
              ))}
            <CalciteOption selected={selectedCountry ? null : true}>None</CalciteOption>
          </CalciteSelect>
        </CalciteLabel>
        {isMobile ? null : showRegionSelection()}
      </div>
      <div className={styles.countryChart}>
        <div className={styles.headerChart}>
          <div className={styles.legendInfo}>
            {selectedFeature ? (
              <span>
                This chart shows the <b>percentage</b> of {selectedFeature.country}'s EEZ area impacted by
                eutrophication, through time. Regional neighbors values are optionally shown, for comparison.
              </span>
            ) : (
              <span>Select a zone to see the evolution of eutrophication impacted areas.</span>
            )}
          </div>
          <CalciteLabel layout='inline' alignment='start'>
            <CalciteSwitch onCalciteSwitchChange={toggleMode}></CalciteSwitch>
            Monthly average view
          </CalciteLabel>
        </div>
        <SVGChart
          data={data}
          selectedFeature={selectedFeature}
          regionIndex={selectedRegionIndex}
          timeSlice={monthlyMode ? monthlyTimeSlice : yearlyTimeSlice}
          setTimeSlice={monthlyMode ? setMonthlyTimeSlice : setYearlyTimeSlice}
          setCountry={setCountry}
          monthlyMode={monthlyMode}
        ></SVGChart>
      </div>
    </div>
  );
};

export default CountryDetails;
