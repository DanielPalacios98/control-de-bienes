import { useState, useEffect } from 'react';
import { Equipment } from '../types';
import { inventoryAPI } from '../services/api';

interface AutocompleteCache {
  descriptions: string[];
  prefixes: string[];
  lastUsedUnit: { [description: string]: string };
  lastUsedCondition: { [description: string]: string };
}

const CACHE_KEY = 'equipment_autocomplete_cache';

export const useAutocomplete = (inventory: Equipment[]) => {
  const [cache, setCache] = useState<AutocompleteCache>(() => {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : {
      descriptions: [],
      prefixes: [],
      lastUsedUnit: {},
      lastUsedCondition: {}
    };
  });

  // Actualizar cache cuando cambia el inventario
  useEffect(() => {
    const descriptions = new Set<string>();
    const prefixes = new Set<string>();
    const lastUsedUnit: { [key: string]: string } = {};
    const lastUsedCondition: { [key: string]: string } = {};

    inventory.forEach(item => {
      // Agregar descripción
      descriptions.add(item.description);

      // Extraer prefijo del inventoryId si existe
      if (item.inventoryId) {
        const parts = item.inventoryId.split('-');
        if (parts.length > 0) {
          prefixes.add(parts[0]);
        }
      }

      // Guardar última unidad y condición usada para cada descripción
      lastUsedUnit[item.description] = item.unit;
      lastUsedCondition[item.description] = item.condition;
    });

    const newCache = {
      descriptions: Array.from(descriptions).sort(),
      prefixes: Array.from(prefixes).sort(),
      lastUsedUnit,
      lastUsedCondition
    };

    setCache(newCache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
  }, [inventory]);

  const getSuggestions = (input: string, field: 'description' | 'prefix'): string[] => {
    if (!input) return [];
    
    const normalized = input.toLowerCase().trim();
    const list = field === 'description' ? cache.descriptions : cache.prefixes;
    
    return list
      .filter(item => item.toLowerCase().includes(normalized))
      .slice(0, 5); // Limitar a 5 sugerencias
  };

  const getNextSequentialId = (prefix: string): string => {
    const matching = inventory
      .filter(item => item.inventoryId?.startsWith(prefix))
      .map(item => {
        const parts = item.inventoryId?.split('-') || [];
        const lastPart = parts[parts.length - 1];
        return parseInt(lastPart) || 0;
      })
      .filter(num => !isNaN(num));

    const maxNum = matching.length > 0 ? Math.max(...matching) : 0;
    const nextNum = maxNum + 1;
    
    return `${prefix}-${String(nextNum).padStart(4, '0')}`;
  };

  // Obtener próximo ID desde el backend (más confiable en escenarios concurrentes)
  const getNextSequentialIdFromServer = async (prefix: string): Promise<string> => {
    try {
      const result = await inventoryAPI.getNextId(prefix);
      return result.nextId;
    } catch (error) {
      console.error('Error obteniendo próximo ID del servidor, usando fallback local:', error);
      // Fallback a la generación local si falla el servidor
      return getNextSequentialId(prefix);
    }
  };

  const getContextualDefaults = (description: string) => {
    return {
      unit: cache.lastUsedUnit[description] || 'UN',
      condition: cache.lastUsedCondition[description] || 'Servible'
    };
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setCache({
      descriptions: [],
      prefixes: [],
      lastUsedUnit: {},
      lastUsedCondition: {}
    });
  };

  return {
    getSuggestions,
    getNextSequentialId,
    getNextSequentialIdFromServer,
    getContextualDefaults,
    cache,
    clearCache
  };
};
