import React from 'react';
import css from './GlassButton.module.css'; // Reusing GlassButton styles or creating new one? 
// Let's check generic button styles first or just inline/module specific for icon button. 
// Actually, user wants "glass effect" and "universal icons". 
// I'll create a dedicated module for this to ensure it's specific.

import styles from './GlassIconButton.module.css';

interface GlassIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    size?: 's' | 'm' | 'l';
    variant?: 'subtle' | 'danger' | 'primary';
}

export const GlassIconButton: React.FC<GlassIconButtonProps> = ({
    icon,
    size = 'm',
    variant = 'subtle',
    className,
    ...props
}) => {
    return (
        <button
            className={`${styles.button} ${styles[size]} ${styles[variant]} ${className || ''}`}
            type="button"
            {...props}
        >
            {icon}
        </button>
    );
};
