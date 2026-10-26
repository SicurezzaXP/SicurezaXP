import React from 'react';
import { FieldConfiguratorView } from './FieldConfiguratorView';

interface FieldConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FieldConfiguratorModal: React.FC<FieldConfiguratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#f8fafc] rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <FieldConfiguratorView isModal={true} onClose={onClose} />
      </div>
    </div>
  );
};
