import * as styles from './App.module.css';
import '@esri/calcite-components/dist/components/calcite-shell';
import { CalciteShell } from '@esri/calcite-components-react';
import { Map } from '../components';

export const App = () => {
  return (
    <>
      <Map></Map>
    </>
  );
};
