import { useEffect, useRef, useContext } from 'react';
import { getTimeDefinition } from '../../utils';
import { mapConfig } from '../../config';
import ImageryTileLayer from '@arcgis/core/layers/ImageryTileLayer';
import RasterStretchRenderer from '@arcgis/core/renderers/RasterStretchRenderer';
import DimensionalDefinition from '@arcgis/core/layers/support/DimensionalDefinition';

import { AppContext } from '../../contexts/AppContextProvider';

const symbol = {
  type: 'simple-marker',
  style: 'circle',
  color: [0, 0, 0, 0],
  size: 10,
  outline: {
    color: '#00f79d',
    width: 2
  }
};

const renderer = new RasterStretchRenderer({
  stretchType: 'min-max',
  gamma: 3,
  useGamma: true,
  colorRamp: {
    type: 'multipart',
    colorRamps: [
      {
        fromColor: [0, 89, 178, 1],
        toColor: [96, 172, 89, 1]
      },
      {
        fromColor: [96, 172, 89, 1],
        toColor: [191, 255, 0, 1]
      }
    ]
  }
});

const initImageryTileLayer = async ({ url, visible }) => {
  const multidimensionalDefinition = await getTimeDefinition(url);
  return new ImageryTileLayer({
    url,
    title: 'Local eutrophication rates',
    visible,
    useViewTime: false,
    multidimensionalDefinition,
    renderer,
    //effect: 'bloom(50%, 0.5px, 0.1)'
    effect: 'saturate(300%)'
  });
};

const setTimeDefinition = (layer, timeDef, timeSlice) => {
  if (timeDef && layer) {
    layer.multidimensionalDefinition = [
      new DimensionalDefinition({
        ...timeDef[0],
        values: [timeDef[0].values[timeSlice]],
        isSlice: true
      })
    ];
  }
};

const RasterLayer = ({ identifyPoint, monthlyMode, monthlyTimeSlice, yearlyTimeSlice, mapView = null }) => {
  const yearlyLayerRef = useRef();
  const monthlyLayerRef = useRef();
  const { yearlyTimeDefinition, monthlyTimeDefinition } = useContext(AppContext);

  useEffect(() => {
    setTimeDefinition(monthlyLayerRef.current, monthlyTimeDefinition, monthlyTimeSlice);
  }, [monthlyTimeSlice, monthlyTimeDefinition, monthlyLayerRef]);

  useEffect(() => {
    setTimeDefinition(yearlyLayerRef.current, yearlyTimeDefinition, yearlyTimeSlice);
  }, [yearlyTimeSlice, yearlyTimeDefinition, yearlyLayerRef]);

  useEffect(() => {
    const initLayers = async () => {
      const yearlyLayer = await initImageryTileLayer({ url: mapConfig['yearly-layer'], visible: true });
      yearlyLayerRef.current = yearlyLayer;
      const monthlyLayer = await initImageryTileLayer({ url: mapConfig['monthly-layer'], visible: false });
      monthlyLayerRef.current = monthlyLayer;
      mapView.map.addMany([yearlyLayer, monthlyLayer], 0);
    };
    if (mapView) {
      initLayers();
      mapView.popup.watch('visible', (value) => {
        if (!value) {
          mapView.graphics.removeAll();
        }
      });
    }
  }, [mapView]);

  // on mode change
  useEffect(() => {
    if (yearlyLayerRef.current && monthlyLayerRef.current) {
      yearlyLayerRef.current.visible = !monthlyMode;
      monthlyLayerRef.current.visible = monthlyMode;
    }
  }, [monthlyMode]);

  // on click
  useEffect(() => {
    const showPixelValue = async () => {
      mapView.graphics.removeAll();
      mapView.popup.close();
      const layer = monthlyMode ? monthlyLayerRef.current : yearlyLayerRef.current;
      const pixelResult = await layer.identify(identifyPoint);
      mapView.graphics.add({ symbol, geometry: pixelResult.location });
      const value = pixelResult.value ? `Value: ${pixelResult.value[0]}` : 'No value found.';
      mapView.popup.open({ title: value, location: identifyPoint });
    };

    if (mapView) {
      if (identifyPoint) {
        showPixelValue();
      } else {
        mapView.popup.close();
        mapView.graphics.removeAll();
      }
    }
  }, [identifyPoint]);

  return null;
};

export default RasterLayer;
