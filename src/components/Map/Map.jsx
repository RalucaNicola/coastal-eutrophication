import * as styles from './Map.module.css';
import { useRef, useEffect, useState, Children, cloneElement } from 'react';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import { mapConfig, regionNames } from '../../config';
import { getSelectionRenderer, getSimpleRenderer } from '../../utils';
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
    color: 'rgba(0, 0, 0, 0.4)',
    outline: null
  }
});

const lowlightLayer = new GraphicsLayer({ opacity: 0 });
lowlightLayer.graphics.add(world);

const shadowLayer = new GraphicsLayer({
  effect:
    'drop-shadow(0, 0, 30px, rgb(40, 40, 40)) drop-shadow(0, 0, 10px, rgb(40, 40, 40)) drop-shadow(0, 0, 5px, rgb(40, 40, 40))'
});

const highlightLayer = new GraphicsLayer({
  title: 'Highlight layer',
  blendMode: 'destination-out'
  // effect: 'drop-shadow(0, 0, 25px) drop-shadow(0, 0, 5px)'
});

const groupLayer = new GroupLayer({
  layers: [lowlightLayer, shadowLayer, highlightLayer]
});
const maskSymbol = {
  type: 'simple-fill',
  color: 'black',
  outline: null
};

const symbol = {
  type: 'simple-fill',
  color: [0, 0, 0, 0],
  outline: {
    color: 'rgb(40, 40, 40)',
    width: 2
  }
};

const Map = ({ data, selectedCountry, setCountry, setIdentifyPoint, paddingBottom, selectedRegionIndex, children }) => {
  const mapDivRef = useRef();
  const [mapView, setMapView] = useState(null);
  const selectedCountryRef = useRef(selectedCountry);
  const eezLayerRef = useRef();

  const addEventHandler = async (view) => {
    view.on('click', async (event) => {
      const result = await view.hitTest(event, { include: [eezLayerRef.current] });
      if (result.results && result.results[0] && result.results[0].graphic) {
        const newCountrySelection = result.results[0].graphic.attributes['CountryName'];
        if (!selectedCountryRef.current || selectedCountryRef.current.name !== newCountrySelection) {
          setCountry({ name: newCountrySelection, selectedFromMap: true });
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

  useEffect(() => {
    if (mapView) {
      mapView.padding = {
        bottom: paddingBottom
      };
    }
  }, [paddingBottom]);

  useEffect(() => {
    if (data && eezLayerRef.current) {
      if (selectedCountry && selectedRegionIndex > 0) {
        const feature = data.countryData.filter((feature) => {
          return feature.country === selectedCountry.name;
        })[0];
        const field = regionNames[selectedRegionIndex].field;
        const regions = regionNames.map((region) => feature[region.name]);
        const value = regions[selectedRegionIndex];
        eezLayerRef.current.renderer = getSelectionRenderer(field, value);
      } else {
        eezLayerRef.current.renderer = getSimpleRenderer();
      }
    }
  }, [selectedRegionIndex, selectedCountry, data, eezLayerRef]);

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
        // background: {
        //   color: [60, 60, 60]
        // },
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
        const eezLayer = view.map.layers
          .filter((layer) => layer.title === 'Exclusive Economic Zone boundaries')
          .getItemAt(0);
        eezLayer.outFields = regionNames.map((region) => region.field);
        eezLayer.renderer = getSimpleRenderer();
        eezLayerRef.current = eezLayer;
        groupLayer.add(eezLayer, 0);
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
        where: `CountryName ='${selectedCountry.name}'`,
        returnGeometry: true
      });
      if (feature) {
        highlightLayer.removeAll();
        shadowLayer.removeAll();
        feature.symbol = maskSymbol;
        const greenShadowFeature = feature.clone();
        greenShadowFeature.symbol = symbol;
        highlightLayer.add(feature);
        shadowLayer.add(greenShadowFeature);
        lowlightLayer.opacity = 1;
        if (!selectedCountry.selectedFromMap) {
          mapView.goTo(
            {
              target: feature.geometry
            },
            { animate: false }
          );
        }
      } else {
        removeHighlight();
      }
    } else {
      removeHighlight();
    }
  };

  const removeHighlight = () => {
    highlightLayer.removeAll();
    shadowLayer.removeAll();
    lowlightLayer.opacity = 0;
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
