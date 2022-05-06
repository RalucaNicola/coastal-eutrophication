import * as styles from './BottomPanel.module.css';
import '@esri/calcite-components/dist/components/calcite-action';
import { CalciteAction } from '@esri/calcite-components-react';

const openEsriOceansPortal = () => {
  window.open('https://esrioceans.maps.arcgis.com/home/index.html', '_blank');
};

const BottomPanel = ({ children, setModal }) => {
  return (
    <div className={styles.container}>
      <header>
        <h1>
          <span className={styles.mainTitle}>Coastal eutrophication</span> Potential eutrophication, through time,
          within Exclusive Economic Zones
        </h1>
        <div className={styles.actionsContainer}>
          <CalciteAction icon='information' scale='s' onClick={() => setModal(true)}></CalciteAction>
          <CalciteAction icon='dataMagnifyingGlass' scale='s' onClick={openEsriOceansPortal}></CalciteAction>
          <CalciteAction icon='link' scale='s' disabled></CalciteAction>
          <div className={styles.borderLeft}>
            <CalciteAction icon='chevronDown' scale='s'></CalciteAction>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
};

export default BottomPanel;
