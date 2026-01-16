import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule;
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

export const useFormValidation = (validationRules: FieldValidation) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return 'Este campo es obligatorio';
    }

    if (!value) return null;

    // MinLength validation
    if (rules.minLength && value.toString().length < rules.minLength) {
      return `Mínimo ${rules.minLength} caracteres`;
    }

    // MaxLength validation
    if (rules.maxLength && value.toString().length > rules.maxLength) {
      return `Máximo ${rules.maxLength} caracteres`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value.toString())) {
      return 'Formato inválido';
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, [validationRules]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
  }, [validateField]);

  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  const validateForm = useCallback((formData: { [key: string]: any }): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  }, [validationRules, validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const getFieldError = useCallback((fieldName: string): string => {
    return touched[fieldName] ? errors[fieldName] || '' : '';
  }, [errors, touched]);

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return touched[fieldName] && !!errors[fieldName];
  }, [errors, touched]);

  const isFieldValid = useCallback((fieldName: string): boolean => {
    return touched[fieldName] && !errors[fieldName];
  }, [errors, touched]);

  return {
    errors,
    touched,
    validateField,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    clearErrors,
    getFieldError,
    hasFieldError,
    isFieldValid
  };
};
