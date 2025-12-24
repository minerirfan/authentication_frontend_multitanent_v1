import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface TenantState {
  selectedTenant: Tenant | null;
  setSelectedTenant: (tenant: Tenant | null) => void;
  clearSelectedTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      selectedTenant: null,
      setSelectedTenant: (tenant) => set({ selectedTenant: tenant }),
      clearSelectedTenant: () => set({ selectedTenant: null }),
    }),
    {
      name: 'tenant-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

