import { useState, useEffect, useRef } from 'react';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import Graphic from '@arcgis/core/Graphic';
const world = new Graphic({
  geometry: {
    type: 'extent',
    xmin: -180,
    xmax: 180,
    ymin: -90,
    ymax: 90
  },
  symbol: {
    type: 'simple-fill',
    color: 'rgba(255, 255, 255, 0.5)',
    outline: null
  }
});
const lowlightLayer = new GraphicsLayer({ opacity: 0 });
lowlightLayer.graphics.add(world);
const highlightLayer = new GraphicsLayer({
  title: 'Highlight layer',
  blendMode: 'destination-out'
});

const selectedGraphicLayer = new GraphicsLayer({
  title: 'Selected graphic layer',
  effect:
    'drop-shadow(0, 0px, 20px #08a657) drop-shadow(0, 0px, 10px #08a657) drop-shadow(0, 0px, 5px #08a657) drop-shadow(0, 0px, 15px #08a657)'
});

const groupLayer = new GroupLayer({
  layers: [lowlightLayer, selectedGraphicLayer, highlightLayer]
});
const symbol = {
  type: 'simple-fill',
  color: 'black',
  outline: {
    color: 'black'
  }
};
const selectedSymbol = {
  type: 'simple-fill',
  color: 'rgba(0,0,0,0)',
  outline: {
    color: '#08a657',
    size: 3
  }
};

const EEZLayer = ({ selectedCountry, mapView = null, setCountry }) => {
  const [layer, setLayer] = useState(null);
  const init = async () => {
    if (mapView) {
      const layer = mapView.map.layers.filter((layer) => layer.title === 'EEZLayer').getItemAt(0);
      layer.outFields = ['CountryName'];
      setLayer(layer);
      mapView.map.addMany([groupLayer]);
      mapView.on('click', (event) => {
        onClickEvent(event, layer);
      });
    }
  };

  const onClickEvent = async (event, layer) => {
    const result = await mapView.hitTest(event, { include: layer });
    if (result.results && result.results[0] && result.results[0].graphic) {
      const newCountrySelection = result.results[0].graphic.attributes['CountryName'];
      if (selectedCountry !== newCountrySelection) {
        setCountry(newCountrySelection);
      }
    } else {
      setCountry(null);
    }
  };
  const highlightCountry = async () => {
    if (selectedCountry) {
      const {
        features: [feature]
      } = await layer.queryFeatures({
        where: `CountryName ='${selectedCountry}'`,
        returnGeometry: true
      });
      if (feature) {
        highlightLayer.graphics.removeAll();
        selectedGraphicLayer.removeAll();
        feature.symbol = symbol;
        highlightLayer.graphics.add(feature);
        const selectedFeature = feature.clone();
        selectedFeature.symbol = selectedSymbol;
        selectedGraphicLayer.add(selectedFeature);
        lowlightLayer.opacity = 1;

        mapView.goTo(
          {
            target: feature.geometry
          },
          { animate: false }
        );
      } else {
        removeHighlight();
      }
    } else {
      removeHighlight();
    }
  };

  const removeHighlight = () => {
    highlightLayer.graphics.removeAll();
    selectedGraphicLayer.removeAll();
    lowlightLayer.opacity = 0;
    mapView.goTo(mapView.map.initialViewProperties.viewpoint);
  };

  useEffect(() => {
    init();
    return () => {
      if (mapView) {
        mapView.map.remove(highlightLayer);
      }
    };
  }, [mapView]);

  useEffect(() => {
    if (layer) {
      highlightCountry();
    }
  }, [selectedCountry]);

  return null;
};

export default EEZLayer;
