import * as styles from './PopupInfo.module.css';
import '@esri/calcite-components/dist/components/calcite-action';
import { CalciteAction } from '@esri/calcite-components-react';

const renderInfo = (info, point) => {
  if (!info) {
    if (point) {
      return <div></div>;
    } else {
      return <div>Click a eutrophication area on the map for a local description of chlorophyll rates</div>;
    }
  } else {
    if (info.type === 'monthly') {
      const { chlorophyllValue, month } = info;
      return (
        <div>
          This pixel experienced an anomalously high chlorophyll-a concentration <b>{chlorophyllValue}</b>% of all{' '}
          <b>{month}</b>s since 2005.
        </div>
      );
    }
    if (info.type === 'yearly') {
      const { month, year, chlorophyllValue, monthlyValue, higherValue, ninetiethPercentile } = info;
      return (
        <div>
          <p>
            This pixel's measured chlorophyll value in {month} {year} was{' '}
            <b>
              {chlorophyllValue} mg/m<sup>3</sup>
            </b>
            . The expected value, for the month of {month}, was{' '}
            <b>
              {monthlyValue} mg/m<sup>3</sup>
            </b>
            . This is <b>{higherValue}%</b> higher* than expected.
          </p>
          <p>
            *For {month} {year}, any pixels greater than <b>{ninetiethPercentile}%</b> (90<sup>th</sup> percentile) are
            flagged for eutrophication.
          </p>
        </div>
      );
    }
    if (info.type == 'no-info') {
      return <div>{info.content}</div>;
    }
  }
};

const PopupInfo = ({ selectedCountry, identifyInfo, setIdentifyPoint, identifyPoint }) => {
  const removeIdentifyPoint = () => {
    setIdentifyPoint(null);
  };
  return (
    <div className={`${selectedCountry ? styles.show : styles.hide} ${styles.popupContainer}`}>
      {identifyPoint ? (
        <div className={styles.close}>
          <CalciteAction appearance='clear' icon='x' onClick={removeIdentifyPoint} scale='s'></CalciteAction>
        </div>
      ) : (
        <></>
      )}
      <div className={styles.textInfo}>{renderInfo(identifyInfo, identifyPoint)}</div>
    </div>
  );
};

export default PopupInfo;
