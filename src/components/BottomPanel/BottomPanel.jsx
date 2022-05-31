import * as styles from './BottomPanel.module.css';
import '@esri/calcite-components/dist/components/calcite-action';
import { CalciteAction } from '@esri/calcite-components-react';
import { useState, useRef, useEffect } from 'react';

const openEsriOceansPortal = () => {
  window.open('https://esrioceans.maps.arcgis.com/home/index.html', '_blank');
};

const BottomPanel = ({ setPaddingBottom, children, setModal, setLegend, isMobile, selectedCountry }) => {
  const containerRef = useRef();
  const [visible, setVisible] = useState(false);
  const togglePanel = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    if (selectedCountry) {
      setVisible(true);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((elements) => {
        const padding = elements[0].contentRect.height + 50;
        setPaddingBottom(padding);
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [containerRef]);
  return (
    <div className={styles.container} ref={containerRef}>
      <header>
        <h1>
          <span className={styles.mainTitle}>Coastal eutrophication</span>{' '}
          {isMobile ? null : `Potential eutrophication, through time, within Exclusive Economic Zones`}
        </h1>
        <div className={styles.actionsContainer}>
          <CalciteAction icon='information' scale='s' appearance='clear' onClick={setModal}></CalciteAction>
          <CalciteAction icon='legend' scale='s' appearance='clear' onClick={setLegend}></CalciteAction>
          <CalciteAction icon='link' scale='s' appearance='clear' onClick={openEsriOceansPortal}></CalciteAction>
          <div className={styles.borderLeft}>
            <CalciteAction
              icon={visible ? 'chevronDown' : 'chevronUp'}
              scale='s'
              appearance='clear'
              onClick={togglePanel}
            ></CalciteAction>
          </div>
        </div>
      </header>
      <div style={{ display: visible ? 'revert' : 'none' }}>{children}</div>
    </div>
  );
};

export default BottomPanel;
