import { useEffect, useRef, useContext, useState } from 'react';
import { mapConfig, queryLayersInfo } from '../../config';
import ImageryTileLayer from '@arcgis/core/layers/ImageryTileLayer';
import RasterStretchRenderer from '@arcgis/core/renderers/RasterStretchRenderer';
import DimensionalDefinition from '@arcgis/core/layers/support/DimensionalDefinition';

import { AppContext } from '../../contexts/AppContextProvider';
import { months } from '../../utils/utils';
import { setTimeSliceToHashParameters } from '../../utils/URLHashParams';

const symbol = {
  type: 'simple-marker',
  style: 'circle',
  color: [0, 0, 0, 0],
  size: 10,
  outline: {
    color: [255, 115, 0],
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
    effect: 'saturate(300%) drop-shadow(0 0 5px #000000) drop-shadow(0 0 15px #000000)'
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

const RasterLayer = ({
  identifyPoint,
  monthlyMode,
  monthlyTimeSlice,
  yearlyTimeSlice,
  mapView = null,
  setIdentifyInfo
}) => {
  const yearlyLayerRef = useRef();
  const monthlyLayerRef = useRef();
  const [queryLayers, setQueryLayers] = useState(null);
  const { yearlyTimeDefinition, monthlyTimeDefinition } = useContext(AppContext);

  useEffect(() => {
    const initLayers = async () => {
      const yearlyLayer = initImageryTileLayer({
        url: mapConfig['yearly-layer'],
        visible: !monthlyMode,
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
        visible: monthlyMode,
        multidimensionalDefinition: monthlyTimeDefinition,
        title: 'Monthly anomaly pixel frequency (%)'
      });
      monthlyLayer.load().then(() => {
        const statistics = monthlyLayer.rasterInfo.statistics;
        statistics[0].max = 50;
        monthlyLayer.renderer = getRenderer(statistics);
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
  }, [monthlyTimeSlice, monthlyTimeDefinition, monthlyLayerRef.current]);

  useEffect(() => {
    setTimeDefinition(yearlyLayerRef.current, yearlyTimeDefinition, yearlyTimeSlice);
    if (queryLayers) {
      queryLayers.forEach((layer) => setTimeDefinition(layer, yearlyTimeDefinition, yearlyTimeSlice));
    }
  }, [yearlyTimeSlice, yearlyLayerRef, yearlyTimeDefinition, queryLayers]);

  useEffect(() => {
    const timeSlice = monthlyMode ? monthlyTimeSlice : yearlyTimeSlice;
    setTimeSliceToHashParameters(timeSlice);
  }, [monthlyMode, monthlyTimeSlice, yearlyTimeSlice]);

  // on mode change
  useEffect(() => {
    if (yearlyLayerRef.current && monthlyLayerRef.current) {
      yearlyLayerRef.current.visible = !monthlyMode;
      monthlyLayerRef.current.visible = monthlyMode;
    }
    setIdentifyInfo(null);
  }, [monthlyMode]);

  // on click
  useEffect(() => {
    const showPixelValue = async () => {
      mapView.graphics.removeAll();

      let identifyInfo = {
        type: 'no-info',
        content: 'This pixel never experienced an anomalously high chlorophyll-a concentration.'
      };

      if (monthlyMode) {
        const pixelResult = await monthlyLayerRef.current.identify(identifyPoint);
        if (pixelResult.value) {
          identifyInfo = {
            type: 'monthly',
            chlorophyllValue: pixelResult.value[0].toFixed(2),
            month: months[monthlyTimeSlice]
          };
        }
      } else {
        const date = new Date(yearlyTimeDefinition[0].values[yearlyTimeSlice]);
        const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(date);
        const year = date.getUTCFullYear();
        const queryLayerPromises = queryLayers.map((layer) => {
          return layer.identify(identifyPoint);
        });
        const results = await Promise.all(queryLayerPromises);
        if (results[0].value) {
          identifyInfo = {
            type: 'yearly',
            month,
            year,
            chlorophyllValue: results[0].value[0].toFixed(2),
            monthlyValue: results[2].value[0].toFixed(2),
            higherValue: Math.ceil(results[3].value[0]),
            ninetiethPercentile: Math.ceil(results[1].value[0])
          };
        }
      }
      mapView.graphics.add({ symbol, geometry: identifyPoint });
      setIdentifyInfo(identifyInfo);
    };

    if (mapView) {
      if (identifyPoint) {
        showPixelValue();
      } else {
        setIdentifyInfo(null);
        mapView.graphics.removeAll();
      }
    }
  }, [identifyPoint]);

  return null;
};

export default RasterLayer;
