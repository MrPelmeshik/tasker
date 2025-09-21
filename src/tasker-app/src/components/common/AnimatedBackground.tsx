import React from 'react';
import css from '../../styles/animated-background.module.css';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className={css.root} aria-hidden>
      <div className={`${css.layer} ${css.layerA}`} />
      <div className={`${css.layer} ${css.layerB}`} />
      <div className={`${css.layer} ${css.layerC}`} />
    </div>
  );
};


