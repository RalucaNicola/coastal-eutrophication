import * as styles from './BottomPanel.module.css';
import '@esri/calcite-components/dist/components/calcite-action';
import { CalciteAction } from '@esri/calcite-components-react';
import { useState, useRef, useEffect } from 'react';

const BottomPanel = ({ setPaddingBottom, children, setLegend, selectedCountry }) => {
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
        <div className={styles.actionsContainer}>
          <CalciteAction icon='legend' scale='s' appearance='clear' onClick={setLegend}></CalciteAction>
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
