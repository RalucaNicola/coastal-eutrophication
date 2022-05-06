import * as styles from './Map.module.css';
import { useRef, useEffect, useState, Children, cloneElement } from 'react';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import { mapConfig } from '../../config';

const Map = ({ paddingBottom, onClickHandler, children }) => {
  const mapDivRef = useRef();
  const [mapView, setMapView] = useState(null);

  const initMapView = async () => {
    try {
      const view = new MapView({
        container: mapDivRef.current,
        map: new WebMap({
          portalItem: {
            id: mapConfig['web-map-id']
          }
        })
      });

      view.when(() => {
        setMapView(view);
        window.view = view;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const initEventHandlers = () => {
    return mapView.on('click', (event) => {
      if (onClickHandler) {
        onClickHandler(event.mapPoint);
      }
    });
  };

  useEffect(() => {
    initMapView();
    return () => {
      if (mapView) {
        mapView.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (mapView) {
      const eventHandler = initEventHandlers();
      return () => {
        eventHandler.remove();
      };
    }
  }, [mapView]);

  return (
    <>
      <div
        className={styles.mapContainer}
        style={{
          bottom: paddingBottom || 0
        }}
        ref={mapDivRef}
      ></div>
      {Children.map(children, (child) => {
        return cloneElement(child, {
          mapView
        });
      })}
    </>
  );
};

export default Map;
