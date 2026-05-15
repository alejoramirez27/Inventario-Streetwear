import { create } from 'zustand'

type Rol = 'administrador' | 'bodeguero'

interface Session {
  id:     string
  nombre: string
  rol:    Rol
}

interface InventarioStore {
  // Sesión activa
  session:    Session | null
  setSession: (s: Session | null) => void

  // Colección seleccionada para filtros
  coleccionFiltro:    string | null   // id_coleccion o null = todas
  setColeccionFiltro: (id: string | null) => void

  // Estado del sidebar en móvil
  sidebarOpen:    boolean
  setSidebarOpen: (v: boolean) => void
  toggleSidebar:  () => void
}

export const useInventarioStore = create<InventarioStore>((set) => ({
  session:    null,
  setSession: (s) => set({ session: s }),

  coleccionFiltro:    null,
  setColeccionFiltro: (id) => set({ coleccionFiltro: id }),

  sidebarOpen:    false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar:  () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
