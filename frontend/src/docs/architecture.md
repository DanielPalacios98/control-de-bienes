
# 📐 Arquitectura del Sistema - InvTrack Pro (Versión Individualización)

Esta arquitectura está diseñada para el control estricto de activos militares donde cada pieza de equipo requiere un seguimiento único.

---

## 🗄️ ¿Qué Base de Datos utilizamos?

Para este proyecto, el stack recomendado es **Supabase**, que proporciona una base de datos **PostgreSQL** de clase empresarial.

1.  **PostgreSQL (Relacional):** Es ideal para inventarios porque garantiza que no haya IDs duplicados y permite relaciones complejas entre Activos, Responsables y Movimientos.
2.  **Tablas en Supabase:**
    *   `auth.users`: Maneja el login seguro y cifrado.
    *   `public.profiles`: Almacena el rol (`SUPER_ADMIN`, `BRANCH_ADMIN`) y la `sucursal_id`.
    *   `public.equipment`: Almacena cada ítem individual (1 fila = 1 objeto físico).
    *   `public.units`: Tabla maestra para tipos de unidad (Unidad, Par, Docena, etc.).
    *   `public.movements`: Historial inmutable para auditoría.

---

## 📦 Lógica de Ingreso Masivo (Individualización)

Cuando el administrador ingresa, por ejemplo, **50 Chalecos**:

1.  **Frontend:** Recibe la cantidad (50).
2.  **Lógica:** Ejecuta un ciclo `FOR` de 1 a 50.
3.  **Generación de IDs:**
    *   `system_id`: Generado automáticamente por la DB (ej: UUID).
    *   `inventory_id` (ID Definitivo): Se genera un valor temporal (ej: `TEMP-2024-001`) para permitir el guardado rápido.
4.  **Edición:** El usuario puede navegar por la lista y hacer clic en "Editar" para reemplazar el ID temporal por el código de barras o serial físico real del equipo.

---

## 🔐 Roles y Permisos

1.  **SuperUser (Administrador General):**
    *   Acceso a la tabla `public.profiles` para crear nuevos usuarios.
    *   Capacidad de asignar administradores a la **Ala 21** o **Ala 22**.
    *   Visibilidad global de reportes.
2.  **Branch Admin (Administrador de Bodega):**
    *   Solo puede ver y editar activos donde `branch_id` coincida con su perfil.
    *   Restringido a su sucursal específica mediante políticas de **RLS (Row Level Security)**.

---

## 🚀 Despliegue Demo
Para probar la demo actual:
- Login: `super@invtrack.com`
- Funcionalidad: Ingreso masivo disponible en el Dashboard.
- Sucursales: Actualizadas a Ala 21 y Ala 22.
