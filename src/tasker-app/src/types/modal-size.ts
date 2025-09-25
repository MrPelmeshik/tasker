export type ModalSize = 'small' | 'medium' | 'large';

export type ModalSizeProps = {
  size?: ModalSize;
};

export const MODAL_SIZE_CONFIG = {
  small: {
    maxWidth: 'calc(var(--space-24) * 16.67)', // 400px
    maxHeight: 'calc(var(--space-24) * 12.5)', // 300px
    width: '90vw',
    height: 'auto',
  },
  medium: {
    maxWidth: 'calc(var(--space-24) * 25)', // 600px
    maxHeight: 'calc(var(--space-24) * 20.83)', // 500px
    width: '90vw',
    height: 'auto',
  },
  large: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '90vw',
    height: '90vh',
  },
} as const;
