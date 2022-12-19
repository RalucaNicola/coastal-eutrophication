import * as styles from './Header.module.css';
import '@esri/calcite-components/dist/components/calcite-action';
import { CalciteAction } from '@esri/calcite-components-react';

const Header = ({ setModal, isMobile }) => {
  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <h1 className={styles.mainTitle}>
          {' '}
          Esri | <span className={styles.uppercase}> Coastal Eutrophication </span>
        </h1>
        {isMobile ? null : (
          <div className={styles.subtitle}>Potential eutrophication within Exclusive Economic Zones</div>
        )}
      </div>
      <CalciteAction
        icon='information'
        scale='m'
        onClick={setModal}
        appearance='clear'
        className={styles.about}
        compact
      ></CalciteAction>
    </header>
  );
};

export default Header;
