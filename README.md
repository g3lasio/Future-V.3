# FutureLex - Documentación

## Descripción General

FutureLex es una plataforma avanzada de generación automatizada de documentos legales y no legales utilizando inteligencia artificial (Claude). La plataforma permite a profesionales como contratistas, agentes inmobiliarios, dueños de negocios, contadores y prestamistas generar, analizar y editar documentos legales sin depender de expertos o terceros costosos.

## Características Principales

- **Generación de documentos personalizados**: Creación de documentos legales mediante un flujo conversacional intuitivo.
- **Análisis de documentos legales**: Extracción de información clave, generación de resúmenes e identificación de riesgos.
- **Edición de documentos**: Herramientas para editar, fusionar, traducir y reformatear documentos con asistencia de IA.
- **Sistema de autenticación avanzado**: Múltiples métodos de inicio de sesión (email/contraseña, Apple ID, GitHub, teléfono).
- **Planes de suscripción**: Diferentes niveles (Gratuito, Premium, Enterprise) con opciones de pago mensual y anual.
- **Interfaz futurista**: Diseño con fondo negro y efectos visuales avanzados utilizando Three.js.

## Estructura del Proyecto

```
futurelex/
├── backend/                 # Servidor Node.js con Express
│   ├── src/
│   │   ├── controllers/     # Controladores para manejar las solicitudes
│   │   ├── middleware/      # Middleware para autenticación y manejo de errores
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Rutas de la API
│   │   ├── services/        # Servicios para lógica de negocio
│   │   └── utils/           # Utilidades y helpers
│   ├── .env                 # Variables de entorno
│   └── package.json         # Dependencias del backend
│
└── frontend/                # Aplicación React
    ├── public/              # Archivos estáticos
    └── src/
        ├── assets/          # Imágenes y recursos
        ├── components/      # Componentes reutilizables
        │   ├── Layout/      # Componentes de estructura
        │   └── UI/          # Componentes de interfaz
        ├── context/         # Contextos de React (Auth, etc.)
        ├── pages/           # Páginas de la aplicación
        ├── services/        # Servicios para comunicación con API
        ├── styles/          # Estilos y temas
        └── utils/           # Utilidades y helpers
```

## Requisitos Técnicos

- Node.js 14.x o superior
- MongoDB o Supabase para base de datos
- API keys:
  - Anthropic Claude API
  - PandaDoc API
  - Stripe (para pagos)
  - Proveedores de autenticación (Apple, GitHub, etc.)

## Instalación

### Backend

1. Navegar al directorio del backend:
   ```
   cd futurelex/backend
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env`
   - Completar con las API keys correspondientes

4. Iniciar el servidor:
   ```
   npm run dev
   ```

### Frontend

1. Navegar al directorio del frontend:
   ```
   cd futurelex/frontend
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Iniciar la aplicación:
   ```
   npm start
   ```

## API Endpoints

### Autenticación

- `POST /api/auth/signup` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión con email/contraseña
- `POST /api/auth/login/apple` - Inicio de sesión con Apple
- `POST /api/auth/login/github` - Inicio de sesión con GitHub
- `POST /api/auth/login/phone` - Inicio de sesión con teléfono
- `GET /api/auth/verify-token` - Verificar token de autenticación

### Documentos

- `POST /api/documents/generate` - Generar nuevo documento
- `POST /api/documents/analyze` - Analizar documento existente
- `PUT /api/documents/:id` - Editar documento
- `GET /api/documents/:id` - Obtener documento
- `GET /api/documents` - Listar documentos del usuario
- `DELETE /api/documents/:id` - Eliminar documento

### Suscripciones

- `GET /api/subscriptions/plans` - Obtener planes disponibles
- `GET /api/subscriptions/my-subscription` - Obtener suscripción actual
- `POST /api/subscriptions/subscribe` - Suscribirse a un plan
- `POST /api/subscriptions/cancel` - Cancelar suscripción
- `POST /api/subscriptions/change-plan` - Cambiar de plan

## Planes de Suscripción

### Plan Gratuito
- Generación de documentos básicos
- Visualización de documentos
- Descarga de documentos
- Límite de 5 documentos por mes

### Plan Premium ($29.99/mes o $299.88/año)
- Todas las características del plan gratuito
- Generación de documentos avanzados
- Análisis de documentos
- Edición de documentos
- Guardado de plantillas
- Límite de 50 documentos por mes

### Plan Enterprise ($99.99/mes o $999.88/año)
- Todas las características del plan Premium
- Documentos ilimitados
- Acceso a API
- Soporte prioritario
- Acceso para equipos
- Personalización de plantillas

## Integración con Claude AI

La plataforma utiliza Claude AI para:

1. **Generación de documentos**: Creación de documentos legales personalizados basados en las respuestas del usuario a preguntas específicas.

2. **Análisis de documentos**: Extracción de información clave, identificación de riesgos y generación de resúmenes.

3. **Edición de documentos**: Asistencia en la edición, reformateo y traducción de documentos.

## Integración con PandaDoc

La plataforma utiliza PandaDoc para:

1. **Firma digital**: Permitir a los usuarios firmar documentos electrónicamente.

2. **Seguimiento de documentos**: Monitorear el estado de los documentos enviados para firma.

## Integración con Stripe

La plataforma utiliza Stripe para:

1. **Procesamiento de pagos**: Gestionar suscripciones y pagos recurrentes.

2. **Webhooks**: Actualizar el estado de las suscripciones en tiempo real.

## Flujo de Trabajo

1. **Registro/Inicio de sesión**: El usuario se registra o inicia sesión utilizando uno de los métodos disponibles.

2. **Selección de plan**: El usuario elige entre los planes disponibles (Gratuito, Premium, Enterprise).

3. **Generación de documento**:
   - El usuario selecciona el tipo de documento que desea crear
   - La plataforma inicia un flujo conversacional para recopilar información
   - El documento se genera en tiempo real a medida que el usuario responde preguntas
   - El usuario puede visualizar, editar y descargar el documento final

4. **Análisis de documento**:
   - El usuario carga un documento existente
   - La plataforma analiza el documento y genera un informe
   - El usuario puede visualizar y descargar el informe

5. **Edición de documento**:
   - El usuario selecciona un documento para editar
   - La plataforma proporciona herramientas de edición asistidas por IA
   - El usuario puede guardar, visualizar y descargar el documento editado

## Seguridad

- Autenticación mediante JWT (JSON Web Tokens)
- Encriptación de contraseñas con bcrypt
- Validación de datos en frontend y backend
- Protección contra ataques CSRF y XSS
- Limitación de tasa para prevenir ataques de fuerza bruta

## Mantenimiento y Soporte

Para reportar problemas o solicitar soporte, contactar a través de:
- Email: soporte@futurelex.com
- Sistema de tickets: https://futurelex.com/soporte

## Licencia

Todos los derechos reservados. Este software es propiedad de FutureLex y su uso no autorizado está prohibido.
