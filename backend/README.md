# FutureLex Backend

Backend para la plataforma FutureLex de generación automatizada de documentos legales con IA.

## Descripción

FutureLex es una plataforma que permite la generación automatizada y personalizada de documentos legales y no legales utilizando Claude AI. El sistema implementa un flujo conversacional intuitivo para recopilar información del usuario y generar documentos personalizados en tiempo real.

## Funcionalidades principales

- Generación de documentos legales personalizados mediante IA
- Análisis y generación de reportes a partir de documentos legales
- Edición de documentos generados
- Integración con servicios de firma digital

## Tecnologías

- Node.js
- Express
- MongoDB
- Claude AI (Anthropic)
- DocuSign
- PDF-lib

## Estructura del proyecto

```
/backend
  /config        - Configuraciones de la aplicación
  /public        - Archivos estáticos
  /src
    /controllers - Controladores de la API
    /middleware  - Middleware personalizado
    /models      - Modelos de datos
    /routes      - Rutas de la API
    /services    - Servicios de negocio
    /utils       - Utilidades
  /tests         - Pruebas automatizadas
```

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno (copiar `.env.example` a `.env` y completar)
4. Iniciar el servidor: `npm run dev`

## Variables de entorno requeridas

- `PORT` - Puerto del servidor
- `MONGODB_URI` - URI de conexión a MongoDB
- `JWT_SECRET` - Secreto para firmar tokens JWT
- `ANTHROPIC_API_KEY` - Clave API de Anthropic (Claude)
- `DOCUSIGN_INTEGRATION_KEY` - Clave de integración de DocuSign
- `DOCUSIGN_USER_ID` - ID de usuario de DocuSign
- `DOCUSIGN_ACCOUNT_ID` - ID de cuenta de DocuSign
- `DOCUSIGN_BASE_PATH` - URL base de la API de DocuSign
- `DOCUSIGN_OAUTH_SERVER` - Servidor OAuth de DocuSign

## Endpoints principales

- `POST /api/documents/generate` - Genera un nuevo documento
- `POST /api/documents/analyze` - Analiza un documento existente
- `PUT /api/documents/:id` - Actualiza un documento existente
- `POST /api/documents/:id/sign` - Inicia proceso de firma

## Licencia

Privada - Todos los derechos reservados
