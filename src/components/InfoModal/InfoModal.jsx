import * as styles from './InfoModel.module.css';
import '@esri/calcite-components/dist/components/calcite-action';
import { CalciteAction } from '@esri/calcite-components-react';

const InfoModal = ({ isOpen, onClose }) => {
  return (
    <div className={isOpen ? styles.show : styles.hide}>
      <div className={styles.modalContainer}>
        <div className={styles.header}>
          <h1>Coastal Eutrophication</h1>
          <div className={styles.close}>
            <CalciteAction appearance='clear' icon='x' onClick={onClose} scale='l'></CalciteAction>
          </div>
        </div>
        <div className={styles.textInfo}>
          <h2>WHAT</h2>
          <p>
            Eutrophication is a process driven by enrichment of water by nutrients, especially compounds of nitrogen
            and/or phosphorus, leading to increased biomass of algae, changes in the balance of organisms, and water
            quality degradation. In coastal waters, excessive nutrient inputs primarily come from human sources
            including agricultural fertilizers, livestock waste and outlets from wastewater treatment plants.
            Eutrophication can lead to harmful algal blooms, hypoxia, fish kills, seagrass die off, loss of coral reef
            and nearshore hard bottom habitats, and health hazards to swimmers and fishers.
          </p>

          <h2>HOW</h2>
          <p>
            Phytoplankton cells (primarily chlorophyll-a) contain pigments that reflect light around the green part of
            the spectrum. Other eutrophication-contributing minerals and organic matter reflect light in predictable
            wavelengths. Satellite sensors detect these signals globally at a high frequency, revealing elevated rates
            of eutrophication-causing phytoplankton in surface waters compared to the recent average values.
          </p>

          <h2>WHY</h2>
          <p>
            The United Nations' Sustainable Development Goals (SDGs) provide a framework for the conservation and
            sustainable use of oceans, seas, and marine resources. In support of this framework, the rates of nutrient
            pollution are collected and analyzed, over time, within the Exclusive Economic Zone of each country. Learn
            more about these goals and methodologies{' '}
            <a href='https://chlorophyll-esrioceans.hub.arcgis.com/' target='_blank'>
              here
            </a>
            .
          </p>

          <h2>ABOUT</h2>
          <p>
            The Coastal Eutrophication application is a work of Esri’s Living Atlas of the World. To access this data
            directly, visit{' '}
            <a
              href='https://www.arcgis.com/home/group.html?id=79d07e80275f4e20965d30a2123d1701#overview'
              target='_blank'
            >
              this ArcGIS Online resource
            </a>
            . Please direct questions or comments to{' '}
            <a href='https://www.linkedin.com/in/keithvangraafeiland/' target='_blank'>
              Keith VanGraafeiland
            </a>
            .
          </p>
        </div>
        <footer></footer>
      </div>
    </div>
  );
};

export default InfoModal;
