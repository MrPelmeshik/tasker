import React from 'react';
import css from './MetaInfoItem.module.css';

export interface MetaInfoItemProps {
    label?: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
    variant?: 'default' | 'secondary';
}

export const MetaInfoItem: React.FC<MetaInfoItemProps> = ({
    label,
    value,
    icon,
    className = '',
    variant = 'default',
}) => {
    return (
        <div className={`${css.container} ${variant === 'secondary' ? css.variantSecondary : ''} ${className}`}>
            {icon && <span className={css.icon}>{icon}</span>}
            {label && <span className={css.label}>{label}</span>}
            <span className={css.value}>{value}</span>
        </div>
    );
};
