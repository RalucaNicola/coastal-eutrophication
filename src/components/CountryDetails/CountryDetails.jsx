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
  monthlyTimeSlice,
  setMonthlyTimeSlice,
  yearlyTimeSlice,
  setYearlyTimeSlice,
  selectedRegionIndex,
  setSelectedRegionIndex,
  isMobile
}) => {
  const [selectedFeature, setSelectedFeature] = useState();

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
      <div style={{ paddingTop: '20px' }}>
        <CalciteRadioButtonGroup
          name='region-group'
          layout='vertical'
          style={{ paddingLeft: '4px' }}
          onCalciteRadioButtonChange={(event) => {
            setSelectedRegionIndex(event.target.value);
          }}
        >
          {regions.map((region, index) => {
            const checked = selectedRegionIndex === index ? { checked: true } : undefined;
            return (
              <CalciteLabel key={index} layout='inline' className={styles.label} style={{ marginBottom: '10px' }}>
                <CalciteRadioButton value={index} {...checked}></CalciteRadioButton>
                {index === 0
                  ? `Show only ${region}`
                  : index > 1
                  ? `Group with level ${index - 1}: ${region.replaceAll(' (M49)', '').replaceAll(' (MDG=M49)', '')}`
                  : `Group with ${region.replaceAll(' (M49)', '').replaceAll(' (MDG=M49)', '')}`}
              </CalciteLabel>
            );
          })}
        </CalciteRadioButtonGroup>
      </div>
    );
  };
  return (
    <div className={styles.container}>
      <div className={styles.countrySelection}>
        <CalciteSelect
          scale={isMobile ? 's' : 'm'}
          style={{ paddingLeft: '4px' }}
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
        {isMobile ? null : showRegionSelection()}
      </div>
      <div className={styles.countryChart}>
        <SVGChart
          data={data}
          selectedFeature={selectedFeature}
          regionIndex={selectedRegionIndex}
          timeSlice={monthlyMode ? monthlyTimeSlice : yearlyTimeSlice}
          setTimeSlice={monthlyMode ? setMonthlyTimeSlice : setYearlyTimeSlice}
          setCountry={setCountry}
          monthlyMode={monthlyMode}
          isMobile={isMobile}
        ></SVGChart>
      </div>
    </div>
  );
};

export default CountryDetails;
