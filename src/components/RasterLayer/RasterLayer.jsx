import { useEffect, useRef, useContext, useState } from 'react';
import { mapConfig, queryLayersInfo } from '../../config';
import ImageryTileLayer from '@arcgis/core/layers/ImageryTileLayer';
import RasterStretchRenderer from '@arcgis/core/renderers/RasterStretchRenderer';
import DimensionalDefinition from '@arcgis/core/layers/support/DimensionalDefinition';

import { AppContext } from '../../contexts/AppContextProvider';
import { months } from '../../utils';

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

      let content = '<b>This pixel never experienced an anomalously high chlorophyll-a concentration.</b>';

      if (monthlyMode) {
        const pixelResult = await monthlyLayerRef.current.identify(identifyPoint);
        console.log(pixelResult);
        if (pixelResult.value) {
          content = `<p style="color: white"><b>This pixel experienced an anomalously high chlorophyll-a concentration ${pixelResult.value[0].toFixed(
            2
          )}% of all ${months[monthlyTimeSlice]}s since 2005.</b></p>`;
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
          content = `<p style="color: white"><b>This pixel's measured chlorophyll value in ${month} ${year} was ${results[0].value[0].toFixed(
            2
          )} mg/m<sup>3</sup>. The expected value, for the month of ${month}, was ${results[2].value[0].toFixed(
            2
          )} mg/m<sup>3</sup>. This is ${Math.ceil(
            results[3].value[0]
          )}% higher* than expected.</b></p><p><b>*For ${month} ${year}, any pixels greater than ${Math.ceil(
            results[1].value[0]
          )}% (90<sup>th</sup> percentile) are flagged for eutrophication.</b></p>`;
        }
      }
      mapView.graphics.add({ symbol, geometry: identifyPoint });
      mapView.popup.open({ content, location: identifyPoint });
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
