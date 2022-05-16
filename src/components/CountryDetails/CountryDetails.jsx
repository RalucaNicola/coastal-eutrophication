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
import { useState } from 'react';

const CountryDetails = ({ data, setCountry, selectedCountry, setMonthlyMode, children }) => {
  const [selectedRegion, setSelectedRegion] = useState(0);
  const toggleMode = (event) => {
    setMonthlyMode(event.target.checked);
  };
  const showRegionSelection = () => {
    if (!selectedCountry) {
      return null;
    }

    const selectedFeature = data.filter((feature) => {
      return feature.country === selectedCountry;
    })[0];

    const regions = [selectedFeature.country, selectedFeature.region, selectedFeature.level1, selectedFeature.level2];

    return (
      <CalciteLabel>
        Group with:
        <CalciteRadioButtonGroup
          name='region-group'
          layout='vertical'
          onCalciteRadioButtonChange={(event) => {
            setSelectedRegion(event.target.value);
          }}
        >
          {regions.map((region, index) => {
            const checked = selectedRegion === index ? { checked: true } : undefined;
            return (
              <CalciteLabel key={index} layout='inline'>
                <CalciteRadioButton value={index} {...checked}></CalciteRadioButton>
                {index === 0 ? `None, show only ${region}` : region}
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
        <CalciteLabel>
          {' '}
          Select a country:
          <CalciteSelect
            onCalciteSelectChange={(event) => {
              const country = event.target.selectedOption.value;
              if (country === 'None') {
                setCountry(null);
              } else {
                setCountry(country);
              }
            }}
          >
            {data.map((feature, index) => (
              <CalciteOption key={index} selected={selectedCountry === feature.country ? true : null}>
                {feature.country}
              </CalciteOption>
            ))}
            <CalciteOption selected={selectedCountry ? null : true}>None</CalciteOption>
          </CalciteSelect>
        </CalciteLabel>
        {showRegionSelection()}
      </div>
      <div className={styles.countryChart}>
        <div className={styles.headerChart}>
          <CalciteLabel layout='inline' alignment='start'>
            <CalciteSwitch onCalciteSwitchChange={toggleMode}></CalciteSwitch>
            Monthly average view
          </CalciteLabel>
        </div>
        {children}
      </div>
    </div>
  );
};

export default CountryDetails;
