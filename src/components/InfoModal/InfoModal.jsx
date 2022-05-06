import '@esri/calcite-components/dist/components/calcite-modal';
import { CalciteModal } from '@esri/calcite-components-react';
import '@esri/calcite-components/dist/components/calcite-button';
import { CalciteButton } from '@esri/calcite-components-react';

const InfoModal = ({ isOpen, onClose }) => {
  return (
    <CalciteModal
      aria-labelledby='modal-title'
      background-color='white'
      active={isOpen ? true : null}
      disableCloseButton
      scale='s'
    >
      <div slot='header' id='modal-title'>
        Coastal Eutrophication
      </div>
      <div slot='content'>Info about the app</div>
      <CalciteButton scale='s' slot='primary' onClick={onClose}>
        Close
      </CalciteButton>
    </CalciteModal>
  );
};

export default InfoModal;
