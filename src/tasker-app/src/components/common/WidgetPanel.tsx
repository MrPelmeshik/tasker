import React, { PropsWithChildren } from 'react';
import styles from '../../styles/widget-panel.module.css';

type WidgetPanelProps = PropsWithChildren<{
  title?: string;
}>;

export const WidgetPanel: React.FC<WidgetPanelProps> = ({ title, children }) => {
  return (
    <div className={styles.panelContainer}>
      {title && (
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{title}</h2>
        </div>
      )}
      <div className={styles.panelGrid}>{children}</div>
    </div>
  );
};


