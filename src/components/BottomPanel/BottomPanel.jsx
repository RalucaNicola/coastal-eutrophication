import * as styles from './BottomPanel.module.css';
import '@esri/calcite-components/dist/components/calcite-action';
import '@esri/calcite-components/dist/components/calcite-label';
import '@esri/calcite-components/dist/components/calcite-switch';
import { CalciteLabel, CalciteSwitch } from '@esri/calcite-components-react';
import { CalciteAction } from '@esri/calcite-components-react';
import { useState, useRef, useEffect } from 'react';
import { Legend } from '../index';

const BottomPanel = ({
  setPaddingBottom,
  children,
  selectedCountry,
  selectedRegionIndex,
  monthlyMode,
  setMonthlyMode
}) => {
  const containerRef = useRef();
  const [visible, setVisible] = useState(false);
  const togglePanel = () => {
    setVisible(!visible);
  };

  const toggleMode = (event) => {
    setMonthlyMode(event.target.checked);
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
      <div className={styles.actionsContainer}>
        <div className={styles.leftActionsContainer}>
          {selectedCountry ? (
            <div>
              <span>
                This chart shows the <b>percentage</b> of{' '}
                <span className={styles.selectedCountry}>{selectedCountry.name}'s EEZ area </span>
                impacted by eutrophication, through time.{' '}
                {selectedRegionIndex > 0 ? `Regional neighbors shown for comparison.` : <></>}
              </span>
            </div>
          ) : (
            <div>Select a zone to explore eutrophication rates.</div>
          )}
          <CalciteAction
            icon={visible ? 'chevronDown' : 'chevronUp'}
            scale='s'
            appearance='clear'
            onClick={togglePanel}
          ></CalciteAction>
        </div>
        <div className={styles.labelContainer}>
          <CalciteLabel layout='inline' alignment='start'>
            <CalciteSwitch onCalciteSwitchChange={toggleMode}></CalciteSwitch>
            Monthly average
          </CalciteLabel>
        </div>
      </div>
      <Legend
        selectedCountry={selectedCountry}
        selectedRegionIndex={selectedRegionIndex}
        monthlyMode={monthlyMode}
      ></Legend>
      <div style={{ display: visible ? 'revert' : 'none' }}>{children}</div>
    </div>
  );
};

export default BottomPanel;
