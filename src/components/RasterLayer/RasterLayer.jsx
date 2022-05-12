import { useEffect, useRef } from 'react';
import { mapConfig } from '../../config';
import ImageryTileLayer from '@arcgis/core/layers/ImageryTileLayer';
import RasterStretchRenderer from '@arcgis/core/renderers/RasterStretchRenderer';
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
  gamma: [2],
  useGamma: true,
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

const getTimeDefinition = async (url) => {
  const definitionUrl = url + '/multiDimensionalInfo?f=json';
  const response = await fetch(definitionUrl);
  const result = await response.json();
  const data = result.multidimensionalInfo;
  return [
    {
      variableName: data.variables[0].name,
      dimensionName: data.variables[0].dimensions[0].name,
      values: data.variables[0].dimensions[0].values
    }
  ];
};

const initImageryTileLayer = async ({ url, visible }) => {
  const multidimensionalDefinition = await getTimeDefinition(url);
  return new ImageryTileLayer({
    url,
    visible,
    useViewTime: false,
    multidimensionalDefinition,
    renderer,
    effect: 'saturate(300%)'
  });
};

const RasterLayer = ({ identifyPoint, monthlyMode, mapView = null }) => {
  const totalLayerRef = useRef();
  const monthlyLayerRef = useRef();

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
