import * as styles from './Header.module.css';

const Header = ({ setModal, isMobile }) => {
  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <h1 className={styles.mainTitle}>
          {' '}
          Esri | <span className={styles.uppercase}> Coastal Eutrophication </span>
        </h1>
        {isMobile ? null : (
          <div className={styles.subtitle}>Potential eutrophication within Exclusive Economic Zones</div>
        )}
      </div>
      <button className={styles.about} onClick={setModal}>
        <img src='./assets/information-24.svg'></img>
      </button>
    </header>
  );
};

export default Header;
