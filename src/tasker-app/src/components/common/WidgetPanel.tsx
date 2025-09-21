import React, { PropsWithChildren } from 'react';
import styles from '../../styles/widget-panel.module.css';

type WidgetPanelProps = PropsWithChildren<{}>;

export const WidgetPanel: React.FC<WidgetPanelProps> = ({ children }) => {
  return (
    <div className={styles.panelContainer}>
      <div className={styles.panelGrid}>{children}</div>
    </div>
  );
};


