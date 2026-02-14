import React, { PropsWithChildren } from 'react';
import styles from '../../styles/widget-panel.module.css';

type WidgetPanelProps = PropsWithChildren<{
  /** Режим для правой панели: одна колонка, виджеты вертикально */
  variant?: 'default' | 'sidebar';
}>;

export const WidgetPanel: React.FC<WidgetPanelProps> = ({ children, variant = 'default' }) => {
  const containerClass =
    variant === 'sidebar' ? `${styles.panelContainer} ${styles.sidebarPanel}` : styles.panelContainer;
  return (
    <div className={containerClass}>
      <div className={styles.panelGrid}>{children}</div>
    </div>
  );
};


