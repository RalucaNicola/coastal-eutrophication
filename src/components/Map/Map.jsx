import * as styles from './Map.module.css';
import { useRef, useEffect, useState, Children, cloneElement } from 'react';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import { mapConfig, regionNames } from '../../config';
import { getSelectionRenderer, getSimpleRenderer } from '../../utils/utils';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import Graphic from '@arcgis/core/Graphic';
import { setMapCenterToHashParams, getMapCenterFromHashParams } from '../../utils/URLHashParams';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';

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
  const [eezLayer, setEezLayer] = useState(null);
  const eezLayerRef = useRef();

  const addEventHandlers = async (view) => {
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

    reactiveUtils.when(
      () => view.stationary === true,
      () => {
        const lon = +view.center.longitude.toFixed(3);
        const lat = +view.center.latitude.toFixed(3);
        const zoom = view.zoom;
        setMapCenterToHashParams({ lon, lat }, zoom);
      }
    );
  };

  useEffect(() => {
    if (mapView) {
      mapView.padding.bottom = paddingBottom;
    }
  }, [paddingBottom]);

  useEffect(() => {
    if (data && eezLayer) {
      if (selectedCountry) {
        highlightCountry();
        selectedCountryRef.current = selectedCountry;
        if (selectedRegionIndex > 0) {
          const feature = data.countryData.filter((feature) => {
            return feature.country === selectedCountry.name;
          })[0];
          const field = regionNames[selectedRegionIndex].field;
          const regions = regionNames.map((region) => feature[region.name]);
          const value = regions[selectedRegionIndex];
          eezLayer.renderer = getSelectionRenderer(field, value);
        } else {
          eezLayer.renderer = getSimpleRenderer();
        }
      }
    }
  }, [selectedRegionIndex, selectedCountry, data, eezLayer]);

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
          top: 50,
          bottom: paddingBottom || 0
        },
        ui: {
          components: []
        },
        constraints: {
          minZoom: 1
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
        const mapCenter = getMapCenterFromHashParams();
        if (mapCenter) {
          view.map.loadAll().then(() => {
            view.goTo({ zoom: mapCenter.zoom, center: [mapCenter.center.lon, mapCenter.center.lat] });
          });
        }
        const eezLayer = view.map.layers
          .filter((layer) => layer.title === 'Exclusive Economic Zone boundaries')
          .getItemAt(0);
        eezLayer.outFields = regionNames.map((region) => region.field);
        eezLayer.renderer = getSimpleRenderer();
        setEezLayer(eezLayer);
        eezLayerRef.current = eezLayer;
        groupLayer.add(eezLayer, 0);
        view.map.add(groupLayer);
        addEventHandlers(view);
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
    if (selectedCountry && eezLayer) {
      const {
        features: [feature]
      } = await eezLayer.queryFeatures({
        where: `CountryName ='${selectedCountry.name}'`,
        returnGeometry: true
      });
      if (feature) {
        highlightLayer.removeAll();
        shadowLayer.removeAll();
        feature.symbol = maskSymbol;
        const shadowFeature = feature.clone();
        shadowFeature.symbol = symbol;
        highlightLayer.add(feature);
        shadowLayer.add(shadowFeature);
        lowlightLayer.opacity = 1;
        if (!selectedCountry.selectedFromMap) {
          const extent = feature.geometry.extent;
          const expand = extent.width < 15000000 && extent.height < 15000000;
          mapView.goTo(
            {
              target: expand ? extent.expand(1.7) : extent
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
