import React from 'react';
import glassWidgetStyles from '../../../../styles/glass-widget.module.css';

/** Пустое состояние дерева: нет областей. */
export const TreeEmpty: React.FC = () => (
  <div className={glassWidgetStyles.placeholder}>Нет доступных областей</div>
);
