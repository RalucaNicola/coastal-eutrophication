import { useEffect, useRef, useContext } from 'react';
import { getTimeDefinition } from '../../utils';
import { mapConfig } from '../../config';
import ImageryTileLayer from '@arcgis/core/layers/ImageryTileLayer';
import RasterStretchRenderer from '@arcgis/core/renderers/RasterStretchRenderer';
import DimensionalDefinition from '@arcgis/core/layers/support/DimensionalDefinition';

import { AppContext } from '../../contexts/AppContextProvider';

const symbol = {
  type: 'simple-marker',
  style: 'square',
  color: [0, 0, 0, 0],
  size: 10,
  outline: {
    color: '#00f79d',
    width: 2
  }
};

const renderer = new RasterStretchRenderer({
  computeGamma: true,
  stretchType: 'min-max',
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
    effect: 'saturate(300%)'
  });
};

const RasterLayer = ({ identifyPoint, monthlyMode, timeSlice, mapView = null }) => {
  const totalLayerRef = useRef();
  const monthlyLayerRef = useRef();
  const { timeDefinition } = useContext(AppContext);

  useEffect(() => {
    if (timeDefinition && totalLayerRef.current) {
      totalLayerRef.current.multidimensionalDefinition = [
        new DimensionalDefinition({
          ...timeDefinition[0],
          values: [timeDefinition[0].values[timeSlice]],
          isSlice: true
        })
      ];
    }
  }, [timeSlice, timeDefinition, totalLayerRef]);

  useEffect(() => {
    const initLayers = async () => {
      const totalLayer = await initImageryTileLayer({ url: mapConfig['total-layer'], visible: true });
      totalLayerRef.current = totalLayer;
      const monthlyLayer = await initImageryTileLayer({ url: mapConfig['monthly-layer'], visible: false });
      monthlyLayerRef.current = monthlyLayer;
      mapView.map.addMany([totalLayer, monthlyLayer], 0);
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
    if (totalLayerRef.current && monthlyLayerRef) {
      totalLayerRef.current.visible = !monthlyMode;
      monthlyLayerRef.current.visible = monthlyMode;
    }
  }, [monthlyMode]);

  // on click
  useEffect(() => {
    const showPixelValue = async () => {
      mapView.graphics.removeAll();
      mapView.popup.close();
      const layer = monthlyMode ? monthlyLayerRef.current : totalLayerRef.current;
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
