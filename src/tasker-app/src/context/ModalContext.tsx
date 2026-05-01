import React, { createContext, useContext, useState, Suspense, lazy, ReactNode } from 'react';

const CabinetModal = lazy(() => import('../components/cabinet/CabinetModal').then((m) => ({ default: m.CabinetModal })));

/** Только модалка кабинета; области/задачи/папки — в панели детализации Tasker. */
export interface ModalContextType {
  openCabinetModal: () => void;
  closeCabinetModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [cabinetModal, setCabinetModal] = useState<{ isOpen: boolean }>({ isOpen: false });

  const openCabinetModal = () => {
    setCabinetModal({ isOpen: true });
  };

  const closeCabinetModal = () => {
    setCabinetModal({ isOpen: false });
  };

  return (
    <ModalContext.Provider value={{ openCabinetModal, closeCabinetModal }}>
      {children}

      <Suspense fallback={null}>
        <CabinetModal isOpen={cabinetModal.isOpen} onClose={closeCabinetModal} />
      </Suspense>
    </ModalContext.Provider>
  );
};
