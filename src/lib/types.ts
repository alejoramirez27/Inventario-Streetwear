export type Rol = 'administrador' | 'bodeguero'
export type EstadoColeccion = 'activa' | 'inactiva'
export type EstadoSolicitud = 'pendiente' | 'recibido_parcial' | 'recibido_completo'
export type EstadoVerificacion = 'pendiente' | 'recibido_parcial' | 'recibido_completo'
export type Categoria = 'ROPA' | 'ACCESORIOS'

export interface Usuario {
  id_usuario: string
  nombre: string
  email: string
  rol: Rol
  estado: 'activo' | 'inactivo'
}

export interface Coleccion {
  id_coleccion: string
  nombre: string
  temporada: string
  fecha_lanzamiento: string
  estado: EstadoColeccion
}

export interface Prenda {
  id_prenda: string
  id_coleccion: string
  nombre: string
  categoria: Categoria
  subcategoria: string
  coleccion?: Coleccion
}

export interface SKU {
  id_sku: string
  id_prenda: string
  codigo_sku: string
  talla: string
  stock: number
  stock_inicial: number
  prenda?: Prenda
}

export interface SolicitudProveedor {
  id_solicitud: string
  id_proveedor: string
  id_coleccion: string
  id_usuario: string
  fecha_solicitud: string
  estado: EstadoSolicitud
}

export interface DetalleSolicitud {
  id_detalle: string
  id_solicitud: string
  id_sku: string
  cantidad_solicitada: number
  cantidad_recibida: number
  estado_verificacion: EstadoVerificacion
}

export interface SalidaBodega {
  id_salida: string
  id_sku: string
  id_usuario: string
  cantidad: number
  fecha_salida: string
  observacion?: string
}