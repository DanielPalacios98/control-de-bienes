import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export interface LoginResponse {
    _id: string;
    name: string;
    email: string;
    role: string;
    branchId?: string;
    token: string;
}

export const authAPI = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    getMe: async (): Promise<Omit<LoginResponse, 'token'>> => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    }
};

export interface EquipmentResponse {
    _id: string;
    ord: number;
    esigeft: boolean;
    esbye: boolean;
    tipo: string;
    description: string;
    unit: string;
    materialServible: number;
    materialCaducado: number;
    materialPrestado: number;
    totalEnBodega: number;
    total: number;
    observacion?: string;
    branchId: string | { _id: string; name: string; location: string };
    entryDate: string;
    createdAt?: string;
    updatedAt?: string;
}

export const inventoryAPI = {
    getAll: async (): Promise<EquipmentResponse[]> => {
        const response = await api.get<EquipmentResponse[]>('/inventory');
        return response.data;
    },

    create: async (data: Partial<EquipmentResponse>): Promise<EquipmentResponse> => {
        const response = await api.post<EquipmentResponse>('/inventory', data);
        return response.data;
    },

    update: async (id: string, data: Partial<EquipmentResponse>): Promise<EquipmentResponse> => {
        const response = await api.put<EquipmentResponse>(`/inventory/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/inventory/${id}`);
    },

    registerIncome: async (data: { equipmentId: string; cantidad: number; tipo: 'servible' | 'caducado' }): Promise<any> => {
        const response = await api.post('/inventory/income', data);
        return response.data;
    },

    registerOutcome: async (data: { 
        equipmentId: string; 
        cantidad: number;
        responsibleName: string;
        responsibleIdentification?: string;
        responsibleArea?: string;
        custodianId: string;
        observacion?: string;
    }): Promise<any> => {
        const response = await api.post('/inventory/outcome', data);
        return response.data;
    }
};

export interface MovementResponse {
    _id: string;
    equipmentId: string | { _id: string; description: string; tipo?: string };
    type: string;
    quantity: number;
    responsibleId: string | { _id: string; name: string; email: string };
    performedById: string | { _id: string; name: string; email: string };
    branchId: string | { _id: string; name: string };
    timestamp: string;
    reason?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const movementAPI = {
    getAll: async (): Promise<MovementResponse[]> => {
        const response = await api.get<MovementResponse[]>('/movements');
        return response.data;
    },

    create: async (data: Partial<MovementResponse>): Promise<MovementResponse> => {
        const response = await api.post<MovementResponse>('/movements', data);
        return response.data;
    }
};

export interface BranchResponse {
    _id: string;
    name: string;
    location: string;
    managerId: string | { _id: string; name: string; email: string };
    createdAt?: string;
    updatedAt?: string;
}

export const branchAPI = {
    getAll: async (): Promise<BranchResponse[]> => {
        const response = await api.get<BranchResponse[]>('/branches');
        return response.data;
    },

    getById: async (id: string): Promise<BranchResponse> => {
        const response = await api.get<BranchResponse>(`/branches/${id}`);
        return response.data;
    }
};

export interface CustodianResponse {
    _id: string;
    name: string;
    rank?: string;
    identification: string;
    area?: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const custodianAPI = {
    getAll: async (): Promise<CustodianResponse[]> => {
        const response = await api.get<CustodianResponse[]>('/custodians');
        return response.data;
    },

    getDefault: async (): Promise<CustodianResponse> => {
        const response = await api.get<CustodianResponse>('/custodians/default');
        return response.data;
    }
};

import { LoanRecord } from '../types';

export const loanRecordAPI = {
    getActive: async (): Promise<LoanRecord[]> => {
        const response = await api.get<LoanRecord[]>('/loan-records/active');
        return response.data;
    },

    getAll: async (filters?: { status?: string; equipmentId?: string; custodianId?: string }): Promise<LoanRecord[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.equipmentId) params.append('equipmentId', filters.equipmentId);
        if (filters?.custodianId) params.append('custodianId', filters.custodianId);
        
        const response = await api.get<LoanRecord[]>(`/loan-records?${params.toString()}`);
        return response.data;
    },

    getByEquipment: async (equipmentId: string): Promise<LoanRecord[]> => {
        const response = await api.get<LoanRecord[]>(`/loan-records/equipment/${equipmentId}`);
        return response.data;
    },

    registerReturn: async (loanRecordId: string, observacion?: string): Promise<any> => {
        const response = await api.post(`/loan-records/${loanRecordId}/return`, { observacion });
        return response.data;
    }
};

export default api;
