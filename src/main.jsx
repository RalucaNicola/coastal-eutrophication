import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { setAssetPath } from '@esri/calcite-components/dist/components';
setAssetPath('https://js.arcgis.com/calcite-components/1.0.0-beta.80/assets');
import './main.css';

ReactDOM.render(<App />, document.getElementById('root'));
