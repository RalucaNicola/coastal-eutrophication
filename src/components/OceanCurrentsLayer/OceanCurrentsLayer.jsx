import { useEffect, useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContextProvider';
import DimensionalDefinition from '@arcgis/core/layers/support/DimensionalDefinition';

const OceanCurrentsLayer = ({ monthlyMode, yearlyTimeSlice, showOceanCurrents, mapView }) => {
  const { yearlyTimeDefinition } = useContext(AppContext);
  const [layer, setLayer] = useState(null);

  // on mode change
  useEffect(() => {
    if (layer) {
      if (monthlyMode) {
        layer.visible = false;
      } else {
        layer.visible = showOceanCurrents;
      }
    }
  }, [monthlyMode, showOceanCurrents]);

  useEffect(() => {
    if (yearlyTimeDefinition && layer) {
      layer.multidimensionalDefinition = [
        new DimensionalDefinition({
          dimensionName: layer.multidimensionalDefinition[0].dimensionName,
          variableName: layer.multidimensionalDefinition[0].variableName,
          values: [yearlyTimeDefinition[0].values[yearlyTimeSlice]],
          isSlice: true
        })
      ];
    }
  }, [yearlyTimeSlice, layer, yearlyTimeDefinition]);

  useEffect(() => {
    if (mapView) {
      const currentsLayer = mapView.map.layers.find((layer) => layer.title === 'Global Ocean Currents');
      if (currentsLayer) {
        setLayer(currentsLayer);
      }
    }
  }, [mapView]);
  return null;
};

export default OceanCurrentsLayer;
