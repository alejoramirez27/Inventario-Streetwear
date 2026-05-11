# Inventario Streetwear

Plataforma web de gestión de inventario para una tienda de ropa urbana (streetwear), desarrollada como proyecto final universitario en la **Universidad Tecnológica de Pereira**. Permite administrar colecciones, prendas, stock, solicitudes a proveedores, salidas de bodega y generar reportes en tiempo real.

---

## ¿Qué problema soluciona?

Las tiendas de streetwear manejan múltiples colecciones, referencias (SKUs) por talla y movimientos constantes de mercancía. Sin un sistema centralizado, el control de inventario se vuelve caótico. Esta plataforma reemplaza el manejo manual en hojas de cálculo por un sistema web con roles de usuario, trazabilidad de movimientos y reportes automáticos.

---

## Stack tecnológico

### Base de datos
| Herramienta | Uso |
|---|---|
| **Supabase** (PostgreSQL) | Base de datos relacional en la nube con triggers, vistas y restricciones |

### Backend
| Herramienta | Uso |
|---|---|
| **Next.js 16 — API Routes** | Endpoints REST para cada módulo del sistema |
| **Supabase JS SDK** | Cliente para consultas y mutaciones desde el servidor |
| **Cookies + Middleware** | Autenticación por sesión y protección de rutas |

### Frontend
| Herramienta | Uso |
|---|---|
| **Next.js 16** (App Router) | Framework principal con renderizado híbrido |
| **React 19** | Componentes de interfaz con hooks |
| **TypeScript** | Tipado estático en todo el proyecto |
| **CSS-in-JS (inline styles)** | Estilos sin dependencias externas |
| **Claude (Anthropic)** — IA | Asistente de desarrollo: diseño de UI, componentes, lógica de negocio y resolución de errores |

### Despliegue
| Herramienta | Uso |
|---|---|
| **Vercel** | Hosting con CI/CD automático desde GitHub |
| **GitHub** | Control de versiones y repositorio del proyecto |

---

## Funcionalidades principales

- **Autenticación** — Login con email y contraseña, sesión por cookies
- **Roles de usuario** — Administrador (acceso total) y Bodeguero (acceso restringido)
- **Colecciones** — Gestión de colecciones activas e inactivas
- **Prendas y SKUs** — Registro de referencias por talla con stock individual
- **Inventario** — Vista en tiempo real del stock disponible
- **Solicitudes a proveedor** — Creación y seguimiento de pedidos con recepción parcial o completa
- **Salidas de bodega** — Registro de despachos con descuento automático de stock
- **Reportes** — Stock activo, prendas rezagadas, historial de salidas y solicitudes
- **Dashboard** — Resumen ejecutivo con métricas clave del negocio

---

## Estructura del proyecto

```
src/
├── app/
│   ├── api/          # Endpoints REST (colecciones, prendas, inventario, etc.)
│   ├── login/        # Página de autenticación
│   ├── dashboard/    # Vista principal
│   ├── colecciones/
│   ├── prendas/
│   ├── inventario/
│   ├── solicitudes/
│   ├── salidas/
│   └── reportes/
├── components/
│   ├── Sidebar.tsx   # Navegación con control de roles
│   └── LayoutShell.tsx
├── lib/
│   └── supabase/     # Clientes de Supabase (server / client)
└── proxy.ts          # Middleware de autenticación y protección de rutas
```

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Autor

**Alejandro Ramírez**  
Estudiante de Ingeniería — Universidad Tecnológica de Pereira  
GitHub: [@alejoramirez27](https://github.com/alejoramirez27)

---

## Herramientas de IA utilizadas

Este proyecto fue desarrollado con asistencia de **Claude (Anthropic)**, un modelo de lenguaje avanzado utilizado como copiloto de desarrollo. Claude colaboró en:

- Diseño y maquetación de la interfaz de usuario (UI)
- Implementación de componentes React y lógica de páginas
- Diagnóstico y resolución de errores técnicos



---

> Proyecto académico — 2025
