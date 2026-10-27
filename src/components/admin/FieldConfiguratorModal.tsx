import React from 'react';
import { FieldConfiguratorView } from './FieldConfiguratorView';
import { MasterOptionsConfig } from '../../config/formFields';

interface FieldConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCaseType?: string;
  initialTab?: 'variables' | 'preguntas';
  initialListKey?: keyof MasterOptionsConfig;
  onFieldUpdated?: () => void;
}

export const FieldConfiguratorModal: React.FC<FieldConfiguratorModalProps> = ({
  isOpen,
  onClose,
  activeCaseType,
  initialTab = 'variables',
  initialListKey = 'tiendas',
  onFieldUpdated,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#f8fafc] rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <FieldConfiguratorView
          isModal={true}
          onClose={onClose}
          activeCaseType={activeCaseType}
          initialTab={initialTab}
          initialListKey={initialListKey}
          onFieldUpdated={onFieldUpdated}
        />
      </div>
    </div>
  );
};
