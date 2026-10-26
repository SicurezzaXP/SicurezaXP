# Sicurezza — Sistema Web de Gestión y Analítica de Casos SAC

Sistema web centralizado y profesional para la gestión, registro, analítica en tiempo real (Business Intelligence) y exportación gerencial de casos de Atención al Cliente de **Sicurezza** (Perú).

Reemplaza el flujo manual anterior de **Google Forms ➔ Google Sheets ➔ Descarga periódica ➔ Importación en Power BI**, permitiendo a la gerencia y a los equipos de tienda y postventa operar con datos en vivo desde cualquier navegador o dispositivo.

---

## 📌 1. Estado del Formulario Original de Google Forms

El requerimiento especificaba inspeccionar el formulario actual:
`https://docs.google.com/forms/d/e/1FAIpQLScGM7gXaBegWbpPVtKE3b61R-OLg_eokpaQ21Y1IW4Ng0m8xg/viewform`

> **Resultado del diagnóstico:** El servidor de Google responde con `HTTP Error 401: Unauthorized` debido a que el formulario está configurado con acceso restringido exclusivamente para usuarios con cuentas de Google Workspace del dominio `@sicurezza.pe`.

**Solución arquitectónica implementada:**
1. Se configuró la estructura base con los campos estándar de atención al cliente de retail y moda íntima de Sicurezza (tiendas físicas en Lima, tienda online, tallas, reclamos, garantías, motivos SAC y canales).
2. Se implementó un **Gestor Dinámico de Campos** en la interfaz para que cualquier administrador pueda agregar, renombrar o ajustar preguntas y listas desplegables en segundos sin tener que modificar código.
3. El sistema está preparado para recibir la lista exacta de preguntas o capturas del formulario cuando el usuario lo disponga.

---

## 🚀 2. Tecnologías Utilizadas

- **Frontend:** React 19 + TypeScript + Vite.
- **Estilos:** Tailwind CSS v4 con diseño sobrio y paleta corporativa de Sicurezza (tonos arena, rosa blush `#E88069` y pizarra).
- **Gráficos e Indicadores BI:** Recharts (evolución diaria/semanal/mensual, estados, ranking de tiendas, motivos).
- **Procesamiento de Archivos:** SheetJS (`xlsx`) para exportaciones en Excel (.xlsx con doble pestaña de casos y resumen gerencial) y CSV compatible con Excel (UTF-8 con BOM).
- **Persistencia y Base de Datos:**
  - **Firebase Cloud Firestore:** Persistencia en tiempo real en la nube con reglas de seguridad ABAC (`firestore.rules`).
  - **Modo Local Reactivo:** Fallback automático con 45 casos precargados de Sicurezza y bus de eventos reactivo para pruebas inmediatas antes de enlazar Firebase.
- **Control de Acceso (RBAC):** Roles de Administrador, Analista y Registrador con selector interactivo de pruebas.

---

## 🛠️ 3. Instalación y Ejecución Local

### Prerrequisitos
- Node.js (versión 18 o superior).
- npm (versión 9 o superior).

### Pasos
1. Clona el repositorio o descarga el código fuente:
   ```bash
   git clone https://github.com/tu-organizacion/sicurezza-sac.git
   cd sicurezza-sac
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación se abrirá en `http://localhost:3000`.

---

## ☁️ 4. Conexión a tu Propio Firebase

1. Ingresa a la [Consola de Firebase](https://console.firebase.google.com/) y crea un proyecto.
2. Habilita **Cloud Firestore** en la región más cercana (ej. `us-east1` o `us-central1`).
3. Habilita **Firebase Authentication** y activa el proveedor **Google** o **Email/Contraseña**.
4. En la configuración del proyecto, añade una aplicación Web y copia tus credenciales.
5. Crea un archivo `.env` en la raíz del proyecto (basándote en `.env.example`):
   ```env
   VITE_FIREBASE_API_KEY="AIzaSyTuClaveReal..."
   VITE_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="tu-proyecto"
   VITE_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
   VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
   VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"
   ```
6. Despliega las reglas de seguridad de Firestore:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules,firestore:indexes
   ```

---

## 🌐 5. Despliegue en Firebase Hosting

Para publicar la aplicación web y acceder desde cualquier lugar mediante un navegador:

1. Genera la versión de producción optimizada:
   ```bash
   npm run build
   ```
2. Inicializa Firebase Hosting si aún no lo has hecho:
   ```bash
   firebase init hosting
   ```
   - Directorio público: `dist`
   - Configurar como Single Page App (SPA): `Yes`
   - Configurar builds automáticos con GitHub: Opcional (`Yes` / `No`)
3. Despliega la aplicación:
   ```bash
   firebase deploy --only hosting
   ```
4. Firebase te entregará una URL pública (ej. `https://sicurezza-sac.web.app`).

---

## 📊 6. Características Principales

### A. Registro de Casos («Registrar caso»)
- Formulario optimizado para ingreso rápido por asesores de tienda y canales digitales.
- Bloqueo contra doble clic accidental durante el guardado.
- Validaciones en tiempo real con mensajes claros.
- Generación de identificador único correlativo (`SIC-2026-XXXX`).
- Distinción entre fecha de ingreso del caso (`fechaIngreso`) y fechas de auditoría (`createdAt`, `updatedAt`).

### B. Dashboard Ejecutivo (Business Intelligence)
- Métricas clave (KPIs): Total de casos, Tasa de resolución (%), Casos en gestión, Tiempo promedio de resolución en días hábiles, Top Tienda y Top Motivo.
- Comparación automática con el período anterior de igual duración (% de variación).
- Gráfico de evolución temporal con selector de agrupación por **Día**, **Semana** o **Mes**.
- Gráficos interactivos de estado, ranking de tiendas físicas y motivos de consulta/reclamo.
- **Cross-filtering**: al hacer clic en una tienda, estado o categoría en los gráficos, todos los indicadores se filtran al instante.

### C. Filtros Dinámicos con Zona Horaria de Perú (America/Lima)
- Selector de fecha inicial y final con botón «Aplicar filtros» y «Limpiar filtros».
- Accesos rápidos calibrados para la hora de Perú:
  - *Hoy*
  - *Últimos 7 días* (incluye el día actual)
  - *Últimos 14 días* (incluye el día actual)
  - *Últimos 30 días*
  - *Esta semana* (Lunes a Domingo)
  - *Semana anterior*
  - *Este mes*
  - *Mes anterior*
  - *Rango personalizado*

### D. Base de Casos (Explorador)
- Búsqueda por texto libre (nombre, teléfono, DNI, número de pedido o descripción).
- Ordenamiento por columnas (código, fecha, clienta, sede, motivo, estado, prioridad).
- Paginación dinámica (10, 25, 50 o 100 por página).
- Modales para ver detalle completo del caso y edición con control de roles.
- Archivo lógico (soft delete) con confirmación y trazabilidad.

### E. Reportes y Exportación
- Exportación a **Excel (.xlsx)** con formato enriquecido:
  - Hoja 1: Casos detallados filtrados.
  - Hoja 2: Resumen gerencial con indicadores y métricas agregadas.
- Exportación a **CSV (.csv)** con codificación UTF-8 con BOM para apertura perfecta de tildes y caracteres en español en Microsoft Excel.
- Selector de columnas para personalizar qué datos se exportan.

### F. Herramienta de Migración Histórica
- Carga de archivos `.xlsx` o `.csv` provenientes de Google Sheets o Excel.
- Mapeador inteligente de columnas (detecta nombres similares como "Fecha", "Cliente", "Teléfono").
- Validación previa de filas incompletas antes de importar.
- Plantilla de ejemplo descargable con un clic.

---

## 🔒 7. Roles y Permisos (RBAC)

| Función | Administrador | Analista | Registrador |
| :--- | :---: | :---: | :---: |
| Registrar casos nuevos | ✅ | ✅ | ✅ |
| Consultar Dashboard BI | ✅ | ✅ | ❌ |
| Exportar reportes Excel/CSV | ✅ | ✅ | ❌ |
| Editar cualquier caso | ✅ | ❌ | Solo propios / estado |
| Archivar casos | ✅ | ❌ | ❌ |
| Migración masiva histórica | ✅ | ❌ | ❌ |
| Configurar campos del sistema | ✅ | ❌ | ❌ |
