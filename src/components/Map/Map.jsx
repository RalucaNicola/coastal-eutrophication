import * as styles from './Map.module.css';
import { useRef, useEffect, useState, Children, cloneElement } from 'react';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import { mapConfig } from '../../config';
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
    color: 'rgba(0, 0, 0, 0.3)',
    outline: null
  }
});

const lowlightLayer = new GraphicsLayer({ opacity: 0 });
lowlightLayer.graphics.add(world);

const highlightLayer = new GraphicsLayer({
  title: 'Highlight layer',
  blendMode: 'destination-out',
  effect: 'drop-shadow(0, 0px, 25px) drop-shadow(0, 0px, 5px)'
});

const groupLayer = new GroupLayer({
  layers: [lowlightLayer, highlightLayer]
});
const symbol = {
  type: 'simple-fill',
  color: 'black',
  outline: null
};

const Map = ({ selectedCountry, setCountry, setIdentifyPoint, paddingBottom, children }) => {
  const mapDivRef = useRef();
  const [mapView, setMapView] = useState(null);
  const selectedCountryRef = useRef(selectedCountry);
  const eezLayerRef = useRef();

  const addEventHandler = async (view) => {
    view.on('click', async (event) => {
      const result = await view.hitTest(event, { include: [eezLayerRef.current] });
      if (result.results && result.results[0] && result.results[0].graphic) {
        const newCountrySelection = result.results[0].graphic.attributes['CountryName'];
        if (selectedCountryRef.current !== newCountrySelection) {
          setCountry(newCountrySelection);
          setIdentifyPoint(null);
        } else {
          setIdentifyPoint(event.mapPoint);
        }
      } else {
        setCountry(null);
        setIdentifyPoint(null);
      }
    });
  };

  // initialize effect
  useEffect(() => {
    let view = null;
    try {
      view = new MapView({
        container: mapDivRef.current,
        map: new WebMap({
          portalItem: {
            id: mapConfig['web-map-id']
          }
        }),
        padding: {
          bottom: paddingBottom || 0
        },
        ui: {
          components: []
        },
        popup: {
          dockEnabled: true,
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false
          },
          highlightEnabled: false,
          defaultPopupTemplateEnabled: false,
          autoOpenEnabled: false
        }
      });

      view.when(() => {
        setMapView(view);
        const eezLayer = view.map.layers.filter((layer) => layer.title === 'EEZLayer').getItemAt(0);
        eezLayer.outFields = ['CountryName'];
        eezLayerRef.current = eezLayer;
        view.map.add(groupLayer);
        addEventHandler(view);
        window.view = view;
      });
    } catch (err) {
      console.error(err);
    }
    return () => {
      // make sure to remove event handler
      if (view) {
        view.destroy();
        view = null;
      }
    };
  }, []);

  const highlightCountry = async () => {
    if (selectedCountry) {
      const {
        features: [feature]
      } = await eezLayerRef.current.queryFeatures({
        where: `CountryName ='${selectedCountry}'`,
        returnGeometry: true
      });
      if (feature) {
        highlightLayer.graphics.removeAll();
        feature.symbol = symbol;
        highlightLayer.graphics.add(feature);
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
    lowlightLayer.opacity = 0;
    mapView.goTo(mapView.map.initialViewProperties.viewpoint);
  };

  // highlight layer effect
  useEffect(() => {
    if (!eezLayerRef.current) {
      return;
    }
    highlightCountry();
    selectedCountryRef.current = selectedCountry;
  }, [selectedCountry]);

  return (
    <>
      <div className={styles.mapContainer} ref={mapDivRef}></div>
      {Children.map(children, (child) => {
        return cloneElement(child, {
          mapView
        });
      })}
    </>
  );
};

export default Map;
