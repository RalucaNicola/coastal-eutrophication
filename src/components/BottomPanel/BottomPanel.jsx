import * as styles from './BottomPanel.module.css';
import '@esri/calcite-components/dist/components/calcite-action';
import { CalciteAction } from '@esri/calcite-components-react';
import { useState, useRef, useEffect } from 'react';
import { Legend } from '../index';

const BottomPanel = ({ setPaddingBottom, children, selectedCountry, selectedRegionIndex, monthlyMode }) => {
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
      <div className={styles.actionsContainer}>
        <CalciteAction
          icon={visible ? 'chevronDown' : 'chevronUp'}
          scale='s'
          appearance='clear'
          onClick={togglePanel}
        ></CalciteAction>
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
