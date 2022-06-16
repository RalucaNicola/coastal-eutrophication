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
import { YearlySVGChart, MonthlySVGChart } from '../index';
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
            {data.countryData.map((feature, index) => (
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
          <CalciteLabel layout='inline' alignment='start'>
            <CalciteSwitch onCalciteSwitchChange={toggleMode}></CalciteSwitch>
            Monthly average view
          </CalciteLabel>
        </div>
        {monthlyMode ? (
          <MonthlySVGChart
            data={data}
            selectedFeature={selectedFeature}
            regionIndex={selectedRegionIndex}
            timeSlice={monthlyTimeSlice}
            setTimeSlice={setMonthlyTimeSlice}
            setCountry={setCountry}
          ></MonthlySVGChart>
        ) : (
          <YearlySVGChart
            data={data}
            selectedFeature={selectedFeature}
            regionIndex={selectedRegionIndex}
            timeSlice={yearlyTimeSlice}
            setTimeSlice={setYearlyTimeSlice}
            setCountry={setCountry}
          ></YearlySVGChart>
        )}
      </div>
    </div>
  );
};

export default CountryDetails;
