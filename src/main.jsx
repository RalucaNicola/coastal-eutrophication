import React from 'react';
import ReactDOM from 'react-dom';
import { StrictMode } from 'react';
import { App } from './App';
import AppContextProvider from './contexts/AppContextProvider';
import { setAssetPath } from '@esri/calcite-components/dist/components';
setAssetPath('https://unpkg.com/@esri/calcite-components/dist/calcite/assets');
import './main.css';

ReactDOM.render(
  <StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </StrictMode>,
  document.getElementById('root')
);
