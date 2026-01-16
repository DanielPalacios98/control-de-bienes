import { useState, useEffect } from 'react';
import { Equipment } from '../types';

interface AutocompleteCache {
  descriptions: string[];
  tipos: string[];
  lastUsedUnit: { [description: string]: string };
  lastUsedTipo: { [description: string]: string };
}

const CACHE_KEY = 'equipment_autocomplete_cache';

export const useAutocomplete = (inventory: Equipment[]) => {
  const [cache, setCache] = useState<AutocompleteCache>(() => {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : {
      descriptions: [],
      tipos: [],
      lastUsedUnit: {},
      lastUsedTipo: {}
    };
  });

  // Actualizar cache cuando cambia el inventario
  useEffect(() => {
    const descriptions = new Set<string>();
    const tipos = new Set<string>();
    const lastUsedUnit: { [key: string]: string } = {};
    const lastUsedTipo: { [key: string]: string } = {};

    inventory.forEach(item => {
      // Agregar descripción y tipo
      descriptions.add(item.description);
      tipos.add(item.tipo);

      // Guardar última unidad y tipo usados para cada descripción
      lastUsedUnit[item.description] = item.unit;
      lastUsedTipo[item.description] = item.tipo;
    });

    const newCache = {
      descriptions: Array.from(descriptions).sort(),
      tipos: Array.from(tipos).sort(),
      lastUsedUnit,
      lastUsedTipo
    };

    setCache(newCache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
  }, [inventory]);

  const getSuggestions = (input: string, field: 'description' | 'tipo'): string[] => {
    if (!input) return [];
    
    const normalized = input.toLowerCase().trim();
    const list = field === 'description' ? cache.descriptions : cache.tipos;
    
    return list
      .filter(item => item.toLowerCase().includes(normalized))
      .slice(0, 5); // Limitar a 5 sugerencias
  };

  const getContextualDefaults = (description: string) => {
    return {
      unit: cache.lastUsedUnit[description] || 'EA',
      tipo: cache.lastUsedTipo[description] || ''
    };
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setCache({
      descriptions: [],
      tipos: [],
      lastUsedUnit: {},
      lastUsedTipo: {}
    });
  };

  return {
    getSuggestions,
    getContextualDefaults,
    cache,
    clearCache
  };
};
