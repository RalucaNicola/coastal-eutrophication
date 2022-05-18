import { useEffect, useRef } from 'react';
import Legend from '@arcgis/core/widgets/Legend';
const LegendComponent = ({ isLegendOpen, mapView = null }) => {
  const legendRef = useRef();

  useEffect(() => {
    if (legendRef.current) {
      legendRef.current.visible = isLegendOpen;
    }
  }, [isLegendOpen, legendRef]);
  useEffect(() => {
    if (mapView) {
      const legend = new Legend({
        view: mapView,
        visible: isLegendOpen
      });
      legendRef.current = legend;

      mapView.ui.add(legend, 'bottom-right');
    }
  }, [mapView]);

  return null;
};
export default LegendComponent;
