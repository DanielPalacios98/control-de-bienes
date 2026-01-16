import React from 'react';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isValid?: boolean;
  showValidation?: boolean;
  onFieldChange?: (value: string) => void;
  onFieldBlur?: () => void;
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  error,
  isValid,
  showValidation = true,
  onFieldChange,
  onFieldBlur,
  className = '',
  ...inputProps
}) => {
  const baseClasses = "w-full border bg-white text-gray-900 p-2.5 rounded-lg mt-1 outline-none transition-all font-medium shadow-sm";
  
  const getInputClasses = () => {
    if (!showValidation) return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-indigo-500`;
    if (error) return `${baseClasses} border-rose-300 bg-rose-50/50 focus:ring-2 focus:ring-rose-500`;
    if (isValid) return `${baseClasses} border-emerald-300 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500`;
    return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-indigo-500`;
  };

  return (
    <div className={className}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
        <span>{label}</span>
        {showValidation && isValid && (
          <span className="text-emerald-500">
            <i className="fas fa-check-circle"></i>
          </span>
        )}
        {showValidation && error && (
          <span className="text-rose-500">
            <i className="fas fa-exclamation-circle"></i>
          </span>
        )}
      </label>
      <input
        {...inputProps}
        className={getInputClasses()}
        onChange={(e) => {
          inputProps.onChange?.(e);
          onFieldChange?.(e.target.value);
        }}
        onBlur={(e) => {
          inputProps.onBlur?.(e);
          onFieldBlur?.();
        }}
      />
      {showValidation && error && (
        <p className="text-xs text-rose-600 mt-1 ml-1 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          <i className="fas fa-exclamation-triangle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
};

export default ValidatedInput;
