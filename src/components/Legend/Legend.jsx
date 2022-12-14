import { style } from 'd3';
import * as styles from './Legend.module.css';

const GradientLegend = ({ title, values }) => {
  return (
    <div className={styles.legendContainer}>
      <div className={styles.legendValues}>
        <div>Low: {values.min}</div>
        <div>High: {values.max}</div>
      </div>
      <div className={styles.gradientContainer}></div>
      <div className={styles.legendTitle}>{title}</div>
    </div>
  );
};

const Legend = ({ selectedCountry, selectedRegionIndex, monthlyMode }) => {
  return (
    <div className={styles.legend}>
      {selectedCountry && selectedRegionIndex > 0 ? (
        <div>
          <img className={styles.legendHatch} src='./assets/legend-neighbors.png'></img>
          <div className={styles.legendTitle}>Regional neighbors</div>
        </div>
      ) : (
        <></>
      )}
      {monthlyMode ? (
        <GradientLegend title='Monthly anomalous pixel frequency(%)' values={{ min: 5.9, max: 50 }}></GradientLegend>
      ) : (
        <GradientLegend title='Chlorophyll-a concentration (mg/m3)' values={{ min: 0.002, max: 10 }}></GradientLegend>
      )}
    </div>
  );
};
export default Legend;
