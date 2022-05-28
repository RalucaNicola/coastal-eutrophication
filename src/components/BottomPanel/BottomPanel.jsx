import * as styles from './BottomPanel.module.css';
import '@esri/calcite-components/dist/components/calcite-action';
import { CalciteAction } from '@esri/calcite-components-react';
import { useState } from 'react';

const openEsriOceansPortal = () => {
  window.open('https://esrioceans.maps.arcgis.com/home/index.html', '_blank');
};

const BottomPanel = ({ setPaddingBottom, children, setModal, setLegend, isMobile }) => {
  const [visible, setVisible] = useState(false);
  const togglePanel = () => {
    setVisible(!visible);
    const padding = visible ? 80 : 350;
    setPaddingBottom(padding);
  };
  return (
    <div className={styles.container}>
      <header>
        <h1>
          <span className={styles.mainTitle}>Coastal eutrophication</span>{' '}
          {isMobile ? null : `Potential eutrophication, through time, within Exclusive Economic Zones`}
        </h1>
        <div className={styles.actionsContainer}>
          <CalciteAction icon='information' scale='s' onClick={setModal}></CalciteAction>
          <CalciteAction icon='legend' scale='s' onClick={setLegend}></CalciteAction>
          <CalciteAction icon='link' scale='s' onClick={openEsriOceansPortal}></CalciteAction>
          <div className={styles.borderLeft}>
            <CalciteAction icon={visible ? 'chevronDown' : 'chevronUp'} scale='s' onClick={togglePanel}></CalciteAction>
          </div>
        </div>
      </header>
      <div style={{ display: visible ? 'revert' : 'none' }}>{children}</div>
    </div>
  );
};

export default BottomPanel;
