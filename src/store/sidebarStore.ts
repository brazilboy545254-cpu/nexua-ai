import { create } from 'zustand'

interface SidebarStore {
  collapsed: boolean
  mobileOpen: boolean
  toggleCollapsed: () => void
  setMobileOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  collapsed: false,
  mobileOpen: false,
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
  setMobileOpen: (mobileOpen) => set({ mobileOpen })
}))
