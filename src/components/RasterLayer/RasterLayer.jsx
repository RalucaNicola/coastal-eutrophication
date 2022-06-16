import { useEffect, useRef, useContext, useState } from 'react';
import { mapConfig, queryLayersInfo } from '../../config';
import ImageryTileLayer from '@arcgis/core/layers/ImageryTileLayer';
import RasterStretchRenderer from '@arcgis/core/renderers/RasterStretchRenderer';
import DimensionalDefinition from '@arcgis/core/layers/support/DimensionalDefinition';

import { AppContext } from '../../contexts/AppContextProvider';
import { getSelectionRenderer } from '../../utils';

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

const getRenderer = (statistics) => {
  return new RasterStretchRenderer({
    stretchType: 'min-max',
    useGamma: false,
    statistics,
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
};

const initImageryTileLayer = ({ url, visible, multidimensionalDefinition, title }) => {
  return new ImageryTileLayer({
    url,
    title,
    visible,
    useViewTime: false,
    multidimensionalDefinition,
    effect: 'saturate(300%)'
  });
};

const setTimeDefinition = (layer, timeDef, timeSlice) => {
  if (timeDef && layer) {
    layer.multidimensionalDefinition = [
      new DimensionalDefinition({
        dimensionName: layer.multidimensionalDefinition[0].dimensionName,
        variableName: layer.multidimensionalDefinition[0].variableName,
        values: [timeDef[0].values[timeSlice]],
        isSlice: true
      })
    ];
  }
};

const RasterLayer = ({ identifyPoint, monthlyMode, monthlyTimeSlice, yearlyTimeSlice, mapView = null }) => {
  const yearlyLayerRef = useRef();
  const monthlyLayerRef = useRef();
  const [queryLayers, setQueryLayers] = useState(null);
  const { yearlyTimeDefinition, monthlyTimeDefinition } = useContext(AppContext);

  useEffect(() => {
    const initLayers = async () => {
      const yearlyLayer = initImageryTileLayer({
        url: mapConfig['yearly-layer'],
        visible: true,
        multidimensionalDefinition: yearlyTimeDefinition,
        title: 'Chlorophyll-a Concentration (mg/m3)'
      });
      yearlyLayer.load().then(() => {
        const statistics = yearlyLayer.rasterInfo.statistics;
        statistics[0].max = 10;
        yearlyLayer.renderer = getRenderer(statistics);
      });
      yearlyLayerRef.current = yearlyLayer;
      const monthlyLayer = initImageryTileLayer({
        url: mapConfig['monthly-layer'],
        visible: false,
        multidimensionalDefinition: monthlyTimeDefinition,
        title: 'Monthly anomaly pixel frequency (%)'
      });
      monthlyLayer.load().then(() => {
        monthlyLayer.renderer = getRenderer(monthlyLayer.rasterInfo.statistics);
      });
      monthlyLayerRef.current = monthlyLayer;
      mapView.map.addMany([yearlyLayer, monthlyLayer], 0);

      const queryLayers = queryLayersInfo.map((layerInfo) => {
        return initImageryTileLayer({
          url: layerInfo.url,
          visible: false,
          multidimensionalDefinition: [{ ...yearlyTimeDefinition[0], variableName: layerInfo.variableName }],
          title: layerInfo.title
        });
      });
      mapView.map.addMany(queryLayers);
      setQueryLayers(queryLayers);
    };
    if (mapView && yearlyTimeDefinition && monthlyTimeDefinition) {
      initLayers();
      mapView.popup.watch('visible', (value) => {
        if (!value) {
          mapView.graphics.removeAll();
        }
      });
    }
  }, [mapView, yearlyTimeDefinition, monthlyTimeDefinition]);

  useEffect(() => {
    setTimeDefinition(monthlyLayerRef.current, monthlyTimeDefinition, monthlyTimeSlice);
  }, [monthlyTimeSlice, monthlyTimeDefinition, monthlyLayerRef]);

  useEffect(() => {
    setTimeDefinition(yearlyLayerRef.current, yearlyTimeDefinition, yearlyTimeSlice);
    if (queryLayers) {
      queryLayers.forEach((layer) => setTimeDefinition(layer, yearlyTimeDefinition, yearlyTimeSlice));
    }
  }, [yearlyTimeSlice, yearlyLayerRef, yearlyTimeDefinition, queryLayers]);

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

      let content = '';
      let title = 'Eutrophication values';

      if (monthlyMode) {
        const pixelResult = await monthlyLayerRef.current.identify(identifyPoint);
        content = pixelResult.value ? `${pixelResult.value[0].toFixed(2)}` : 'No value found.';
        title = 'Monthly anomaly pixel frequency (%)';
      } else {
        const queryLayerPromises = queryLayers.map((layer) => {
          return layer.identify(identifyPoint);
        });
        const results = await Promise.all(queryLayerPromises);
        results.forEach((result, index) => {
          content += `<p>${queryLayersInfo[index].title}: ${
            result.value ? result.value[0].toFixed(2) : 'no value found.'
          }</p>`;
        });
      }
      mapView.graphics.add({ symbol, geometry: identifyPoint });
      mapView.popup.open({ title, content, location: identifyPoint });
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
