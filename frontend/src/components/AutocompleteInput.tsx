import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  suggestions: string[];
  error?: string;
  isValid?: boolean;
  showValidation?: boolean;
  onFieldChange?: (value: string) => void;
  onFieldBlur?: () => void;
  onSelectSuggestion?: (value: string) => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  suggestions,
  error,
  isValid,
  showValidation = true,
  onFieldChange,
  onFieldBlur,
  onSelectSuggestion,
  className = '',
  value,
  ...inputProps
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const baseClasses = "w-full border bg-white text-gray-900 p-2.5 rounded-lg mt-1 outline-none transition-all font-medium shadow-sm";
  
  const getInputClasses = () => {
    if (!showValidation) return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-indigo-500`;
    if (error) return `${baseClasses} border-rose-300 bg-rose-50/50 focus:ring-2 focus:ring-rose-500`;
    if (isValid) return `${baseClasses} border-emerald-300 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500`;
    return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-indigo-500`;
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onFieldChange?.(newValue);
    setShowSuggestions(newValue.length > 0 && suggestions.length > 0);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectSuggestion = (suggestion: string) => {
    onSelectSuggestion?.(suggestion);
    onFieldChange?.(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  return (
    <div className={className} ref={wrapperRef}>
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
      <div className="relative">
        <input
          {...inputProps}
          value={value}
          className={getInputClasses()}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={(e) => {
            inputProps.onBlur?.(e);
            // Pequeño delay para permitir clicks en sugerencias
            setTimeout(() => onFieldBlur?.(), 200);
          }}
          autoComplete="off"
        />
        
        {/* Dropdown de sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className={`w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-slate-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-indigo-50' : ''
                }`}
                onClick={() => selectSuggestion(suggestion)}
              >
                <div className="flex items-center gap-2">
                  <i className="fas fa-history text-slate-400 text-xs"></i>
                  <span className="text-sm font-medium text-slate-700">{suggestion}</span>
                </div>
              </button>
            ))}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <i className="fas fa-lightbulb mr-1"></i>
                {suggestions.length} sugerencia{suggestions.length !== 1 ? 's' : ''} basada{suggestions.length !== 1 ? 's' : ''} en historial
              </span>
            </div>
          </div>
        )}
      </div>
      
      {showValidation && error && (
        <p className="text-xs text-rose-600 mt-1 ml-1 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          <i className="fas fa-exclamation-triangle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
};

export default AutocompleteInput;
