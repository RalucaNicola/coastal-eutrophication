import * as styles from './App.module.css';
import { useState } from 'react';
import { Map, BottomPanel, InfoModal } from '../components';

export const App = () => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const setModal = (value) => {
    setIsInfoModalOpen(value);
    console.log(isInfoModalOpen);
  };
  return (
    <>
      <Map></Map>
      <BottomPanel setModal={() => setModal(true)}></BottomPanel>
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setModal(false)} />
    </>
  );
};
