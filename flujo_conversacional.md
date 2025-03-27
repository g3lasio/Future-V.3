# Implementación del Flujo Conversacional para FutureLex

## Visión General

El flujo conversacional es el componente central de FutureLex, ya que permite una experiencia personalizada donde el usuario interactúa con Claude AI para generar documentos legales adaptados a sus necesidades específicas. Este documento detalla la implementación técnica de este flujo, incluyendo la estructura de la conversación, el sistema de preguntas personalizadas y los mecanismos para la generación en tiempo real.

## Estructura del Flujo Conversacional

El flujo conversacional de FutureLex seguirá una estructura de tres fases principales:

### 1. Fase de Iniciación
- **Selección de documento**: El usuario selecciona el tipo de documento que necesita
- **Contextualización**: Claude AI explica el propósito del documento y el proceso
- **Establecimiento de expectativas**: Se informa al usuario sobre la información que necesitará proporcionar

### 2. Fase de Recopilación de Información
- **Preguntas secuenciales**: Claude AI realiza preguntas específicas según el tipo de documento
- **Validación en tiempo real**: Se verifica la coherencia y completitud de las respuestas
- **Adaptación dinámica**: El flujo se ajusta según las respuestas previas del usuario

### 3. Fase de Generación y Refinamiento
- **Generación inicial**: Se crea una primera versión del documento
- **Revisión guiada**: Claude AI guía al usuario a través de secciones clave para revisión
- **Refinamiento iterativo**: Se realizan ajustes según las preferencias del usuario

## Implementación Técnica con Claude AI

La implementación técnica del flujo conversacional se basará en el uso de herramientas personalizadas (tools) de Claude AI, que permiten crear interacciones estructuradas y procesar información específica.

### Definición de Herramientas Personalizadas

Para cada tipo de documento, se definirán herramientas específicas que Claude utilizará durante la conversación:

```javascript
// Ejemplo de definición de herramientas para un contrato de arrendamiento
const tools = [
  {
    name: "collect_property_info",
    description: "Recopilar información sobre la propiedad a arrendar",
    input_schema: {
      type: "object",
      properties: {
        property_address: {
          type: "string",
          description: "Dirección completa de la propiedad"
        },
        property_type: {
          type: "string",
          description: "Tipo de propiedad (apartamento, casa, local comercial, etc.)"
        },
        property_size: {
          type: "number",
          description: "Tamaño de la propiedad en metros cuadrados"
        }
      },
      required: ["property_address", "property_type"]
    }
  },
  {
    name: "collect_lease_terms",
    description: "Recopilar información sobre los términos del arrendamiento",
    input_schema: {
      type: "object",
      properties: {
        start_date: {
          type: "string",
          description: "Fecha de inicio del contrato (YYYY-MM-DD)"
        },
        duration: {
          type: "number",
          description: "Duración del contrato en meses"
        },
        monthly_rent: {
          type: "number",
          description: "Monto del alquiler mensual"
        },
        deposit_amount: {
          type: "number",
          description: "Monto del depósito de garantía"
        }
      },
      required: ["start_date", "duration", "monthly_rent"]
    }
  },
  {
    name: "collect_parties_info",
    description: "Recopilar información sobre las partes involucradas",
    input_schema: {
      type: "object",
      properties: {
        landlord_name: {
          type: "string",
          description: "Nombre completo del arrendador"
        },
        landlord_id: {
          type: "string",
          description: "Número de identificación del arrendador"
        },
        tenant_name: {
          type: "string",
          description: "Nombre completo del arrendatario"
        },
        tenant_id: {
          type: "string",
          description: "Número de identificación del arrendatario"
        }
      },
      required: ["landlord_name", "tenant_name"]
    }
  },
  {
    name: "generate_document",
    description: "Generar el documento de contrato de arrendamiento",
    input_schema: {
      type: "object",
      properties: {
        include_special_clauses: {
          type: "boolean",
          description: "Incluir cláusulas especiales en el contrato"
        },
        special_clauses: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Lista de cláusulas especiales a incluir"
        },
        format: {
          type: "string",
          enum: ["standard", "detailed"],
          description: "Formato del contrato (estándar o detallado)"
        }
      },
      required: ["include_special_clauses", "format"]
    }
  }
]
```

### Flujo de Interacción con Claude AI

El flujo de interacción se implementará mediante un sistema de gestión de estado que coordina las llamadas a la API de Claude:

```javascript
// Pseudocódigo para la implementación del flujo conversacional
async function handleConversationalFlow(documentType, userId) {
  // 1. Inicializar el estado de la conversación
  const conversationState = initializeConversationState(documentType);
  
  // 2. Cargar las herramientas específicas para este tipo de documento
  const tools = loadToolsForDocumentType(documentType);
  
  // 3. Mensaje inicial para el usuario
  const initialPrompt = generateInitialPrompt(documentType);
  
  // 4. Iniciar la conversación con Claude
  let claudeResponse = await callClaudeAPI({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 1024,
    tools: tools,
    messages: [
      {
        role: "user",
        content: initialPrompt
      }
    ]
  });
  
  // 5. Procesar la respuesta inicial
  updateConversationState(conversationState, claudeResponse);
  
  // 6. Bucle principal de conversación
  while (!conversationState.isComplete) {
    // Verificar si Claude quiere usar una herramienta
    if (claudeResponse.stop_reason === "tool_use") {
      // Extraer la herramienta y los parámetros
      const toolName = claudeResponse.content[0].tool_use.name;
      const toolParameters = claudeResponse.content[0].tool_use.input;
      
      // Procesar la solicitud de herramienta
      const toolResult = await processToolRequest(toolName, toolParameters, conversationState);
      
      // Enviar el resultado de la herramienta a Claude
      claudeResponse = await callClaudeAPI({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1024,
        tools: tools,
        messages: [
          ...conversationState.messages,
          {
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: claudeResponse.content[0].tool_use.id,
                content: toolResult
              }
            ]
          }
        ]
      });
    } else {
      // Mostrar la respuesta de Claude al usuario
      displayMessageToUser(claudeResponse.content);
      
      // Esperar la respuesta del usuario
      const userResponse = await getUserInput();
      
      // Enviar la respuesta del usuario a Claude
      claudeResponse = await callClaudeAPI({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1024,
        tools: tools,
        messages: [
          ...conversationState.messages,
          {
            role: "user",
            content: userResponse
          }
        ]
      });
    }
    
    // Actualizar el estado de la conversación
    updateConversationState(conversationState, claudeResponse);
    
    // Verificar si se ha completado el documento
    if (isDocumentComplete(conversationState)) {
      conversationState.isComplete = true;
    }
  }
  
  // 7. Generar el documento final
  const finalDocument = generateFinalDocument(conversationState);
  
  // 8. Guardar el documento en la base de datos
  saveDocumentToDatabase(finalDocument, userId);
  
  return finalDocument;
}
```

## Sistema de Preguntas Personalizadas

El sistema de preguntas personalizadas se implementará mediante una biblioteca de plantillas de preguntas para cada tipo de documento, que se adaptarán dinámicamente según las respuestas del usuario.

### Biblioteca de Plantillas de Preguntas

Para cada tipo de documento, se definirá una biblioteca de plantillas de preguntas organizadas por secciones:

```javascript
// Ejemplo de biblioteca de plantillas para un contrato de arrendamiento
const questionTemplates = {
  property_info: [
    {
      id: "property_address",
      question: "¿Cuál es la dirección completa de la propiedad que se va a arrendar?",
      followUp: {
        condition: (response) => response.length < 10,
        question: "Por favor, proporciona la dirección completa incluyendo calle, número, ciudad y código postal."
      }
    },
    {
      id: "property_type",
      question: "¿Qué tipo de propiedad es? (apartamento, casa, local comercial, etc.)",
      options: ["Apartamento", "Casa", "Local comercial", "Oficina", "Otro"]
    },
    {
      id: "property_size",
      question: "¿Cuál es el tamaño aproximado de la propiedad en metros cuadrados?",
      validation: (response) => !isNaN(response) && response > 0
    }
  ],
  lease_terms: [
    {
      id: "start_date",
      question: "¿Cuál es la fecha de inicio del contrato? (YYYY-MM-DD)",
      validation: (response) => /^\d{4}-\d{2}-\d{2}$/.test(response)
    },
    {
      id: "duration",
      question: "¿Cuál es la duración del contrato en meses?",
      validation: (response) => !isNaN(response) && response > 0
    },
    {
      id: "monthly_rent",
      question: "¿Cuál es el monto del alquiler mensual?",
      validation: (response) => !isNaN(response) && response > 0
    }
  ],
  // Más secciones...
}
```

### Adaptación Dinámica de Preguntas

El sistema adaptará dinámicamente las preguntas según las respuestas previas del usuario:

```javascript
// Pseudocódigo para la adaptación dinámica de preguntas
function getNextQuestion(conversationState) {
  const currentSection = conversationState.currentSection;
  const answeredQuestions = conversationState.answeredQuestions;
  
  // Obtener la plantilla de preguntas para la sección actual
  const sectionTemplates = questionTemplates[currentSection];
  
  // Encontrar la primera pregunta no respondida
  const nextQuestionTemplate = sectionTemplates.find(template => 
    !answeredQuestions.includes(template.id)
  );
  
  if (!nextQuestionTemplate) {
    // Si todas las preguntas de la sección actual han sido respondidas,
    // pasar a la siguiente sección o finalizar
    return moveToNextSection(conversationState);
  }
  
  // Personalizar la pregunta según las respuestas previas
  let question = nextQuestionTemplate.question;
  
  // Aplicar lógica de personalización
  if (nextQuestionTemplate.id === "special_clauses" && 
      conversationState.answers.property_type === "Local comercial") {
    question += " Considera incluir cláusulas específicas para uso comercial.";
  }
  
  return {
    id: nextQuestionTemplate.id,
    question: question,
    validation: nextQuestionTemplate.validation,
    options: nextQuestionTemplate.options
  };
}
```

## Generación de Documentos en Tiempo Real

La generación de documentos en tiempo real se implementará utilizando la herramienta de editor de texto de Claude AI, que permite crear y modificar documentos durante la conversación.

### Estructura de Plantillas de Documentos

Para cada tipo de documento, se definirá una plantilla base que Claude utilizará para generar el documento:

```javascript
// Ejemplo de plantilla para un contrato de arrendamiento
const documentTemplate = `
# CONTRATO DE ARRENDAMIENTO

## PARTES

**ARRENDADOR**: {{landlord_name}}, con identificación {{landlord_id}}
**ARRENDATARIO**: {{tenant_name}}, con identificación {{tenant_id}}

## OBJETO DEL CONTRATO

El ARRENDADOR da en arrendamiento al ARRENDATARIO, y éste lo toma, el inmueble ubicado en {{property_address}}, con una superficie de {{property_size}} metros cuadrados.

## DURACIÓN Y PRECIO

El presente contrato tendrá una duración de {{duration}} meses, comenzando el {{start_date}}.

El precio del arrendamiento se fija en la suma de {{monthly_rent}} mensuales, que el ARRENDATARIO pagará por mensualidades anticipadas dentro de los primeros cinco días de cada mes.

## DEPÓSITO

El ARRENDATARIO entrega en este acto la suma de {{deposit_amount}} en concepto de depósito de garantía.

{{#if include_special_clauses}}
## CLÁUSULAS ESPECIALES

{{#each special_clauses}}
- {{this}}
{{/each}}
{{/if}}

## FIRMAS

________________________
ARRENDADOR

________________________
ARRENDATARIO

Fecha: {{current_date}}
`;
```

### Actualización en Tiempo Real

El documento se actualizará en tiempo real a medida que el usuario proporcione información:

```javascript
// Pseudocódigo para la actualización en tiempo real del documento
function updateDocumentInRealTime(conversationState, newAnswer) {
  // Actualizar el estado de la conversación con la nueva respuesta
  conversationState.answers[newAnswer.id] = newAnswer.value;
  
  // Obtener la plantilla del documento
  const template = getDocumentTemplate(conversationState.documentType);
  
  // Compilar la plantilla con las respuestas actuales
  const compiledDocument = compileTemplate(template, conversationState.answers);
  
  // Actualizar el documento en el estado de la conversación
  conversationState.currentDocument = compiledDocument;
  
  // Enviar el documento actualizado al frontend para visualización
  sendDocumentToFrontend(compiledDocument);
  
  return compiledDocument;
}
```

### Visualización y Edición Interactiva

El sistema permitirá al usuario ver el documento en tiempo real y solicitar ediciones específicas:

```javascript
// Pseudocódigo para la edición interactiva del documento
async function handleDocumentEdit(editRequest, conversationState) {
  // Construir un prompt para Claude solicitando la edición
  const editPrompt = `
    El usuario ha solicitado la siguiente edición en el documento:
    "${editRequest}"
    
    Por favor, actualiza el documento actual para reflejar esta solicitud.
    
    Documento actual:
    ${conversationState.currentDocument}
  `;
  
  // Llamar a Claude con la herramienta de editor de texto
  const claudeResponse = await callClaudeAPI({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 1024,
    tools: [
      {
        type: "text_editor_20250124",
        name: "str_replace_editor"
      }
    ],
    messages: [
      {
        role: "user",
        content: editPrompt
      }
    ]
  });
  
  // Procesar la respuesta de Claude y actualizar el documento
  if (claudeResponse.stop_reason === "tool_use" && 
      claudeResponse.content[0].tool_use.name === "str_replace_editor") {
    
    const oldStr = claudeResponse.content[0].tool_use.input.old_str;
    const newStr = claudeResponse.content[0].tool_use.input.new_str;
    
    // Realizar el reemplazo en el documento
    conversationState.currentDocument = 
      conversationState.currentDocument.replace(oldStr, newStr);
    
    // Enviar el documento actualizado al frontend
    sendDocumentToFrontend(conversationState.currentDocument);
  }
  
  return conversationState.currentDocument;
}
```

## Integración con la Interfaz de Usuario

La integración del flujo conversacional con la interfaz de usuario se realizará mediante WebSockets para permitir actualizaciones en tiempo real:

```javascript
// Pseudocódigo para la integración con la interfaz de usuario
function setupWebSocketConnection(userId, sessionId) {
  const socket = new WebSocket(`wss://api.futurelex.com/ws/${userId}/${sessionId}`);
  
  socket.onopen = () => {
    console.log("Conexión WebSocket establecida");
  };
  
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
      case "claude_message":
        // Mostrar mensaje de Claude en la interfaz de chat
        displayClaudeMessage(message.content);
        break;
      
      case "document_update":
        // Actualizar el visualizador de documentos
        updateDocumentViewer(message.content);
        break;
      
      case "question":
        // Mostrar una pregunta específica con opciones si las hay
        displayQuestion(message.content);
        break;
      
      case "completion":
        // Notificar al usuario que el documento está completo
        notifyDocumentCompletion(message.content);
        break;
    }
  };
  
  return socket;
}
```

## Ejemplos de Flujos Conversacionales

### Ejemplo 1: Contrato de Arrendamiento

```
Claude: Bienvenido a FutureLex. Vamos a crear un contrato de arrendamiento personalizado. Este documento establecerá los términos y condiciones para el alquiler de una propiedad. ¿Está listo para comenzar?

Usuario: Sí, estoy listo.

Claude: Excelente. Primero, necesito información sobre la propiedad. ¿Cuál es la dirección completa de la propiedad que se va a arrendar?

Usuario: Calle Principal 123, Colonia Centro, Ciudad de México, CP 06000.

Claude: Gracias. ¿Qué tipo de propiedad es? ¿Un apartamento, casa, local comercial u otro?

Usuario: Es un local comercial.

Claude: Entendido. ¿Cuál es el tamaño aproximado del local comercial en metros cuadrados?

Usuario: 85 metros cuadrados.

Claude: Perfecto. Ahora necesito información sobre los términos del arrendamiento. ¿Cuál es la fecha de inicio del contrato? (Por favor, use el formato YYYY-MM-DD)

Usuario: 2025-04-01

Claude: ¿Cuál será la duración del contrato en meses?

Usuario: 24 meses.

Claude: ¿Cuál es el monto del alquiler mensual en pesos?

Usuario: 15000 pesos.

Claude: ¿Cuál es el monto del depósito de garantía?

Usuario: 30000 pesos, equivalente a dos meses.

[El documento se actualiza en tiempo real mostrando la información proporcionada]

Claude: Ahora necesito información sobre las partes involucradas. ¿Cuál es el nombre completo del arrendador (propietario)?

Usuario: Juan Pérez González.

Claude: ¿Cuál es el número de identificación del arrendador (cédula, DNI, etc.)?

Usuario: PEGJ750812ABC

Claude: ¿Cuál es el nombre completo del arrendatario (inquilino)?

Usuario: Comercial Innovadora S.A. de C.V.

Claude: ¿Cuál es el número de identificación fiscal del arrendatario?

Usuario: CIN201005XYZ

[El documento se actualiza con la información de las partes]

Claude: Dado que es un local comercial, ¿desea incluir cláusulas especiales relacionadas con el uso comercial del inmueble?

Usuario: Sí, quiero incluir restricciones sobre modificaciones estructurales y horarios de operación.

Claude: Por favor, especifique las restricciones sobre modificaciones estructurales que desea incluir.

Usuario: El arrendatario no podrá realizar modificaciones estructurales sin autorización escrita del arrendador. Solo se permiten modificaciones decorativas que no afecten la estructura del local.

Claude: ¿Qué restricciones de horarios de operación desea incluir?

Usuario: El local podrá operar de lunes a sábado de 9:00 a 21:00 horas. Los domingos de 10:00 a 18:00 horas. Cualquier operación fuera de estos horarios requerirá autorización escrita del arrendador.

[El documento se actualiza con las cláusulas especiales]

Claude: He actualizado el contrato con las cláusulas especiales. ¿Hay alguna otra cláusula especial que desee incluir?

Usuario: Sí, quiero incluir una cláusula sobre el uso de áreas comunes.

Claude: Por favor, especifique la cláusula sobre el uso de áreas comunes.

Usuario: El arrendatario tendrá derecho al uso de áreas comunes como pasillos y estacionamiento (2 espacios asignados), pero deberá contribuir proporcionalmente a los gastos de mantenimiento de dichas áreas.

[El documento se actualiza con la nueva cláusula]

Claude: El contrato ha sido actualizado. Por favor, revise el documento completo. ¿Hay alguna sección que desee modificar?

Usuario: En la sección de duración, quisiera agregar una opción de renovación.

Claude: Entendido. ¿Qué términos desea para la opción de renovación?

Usuario: El contrato podrá renovarse por un período adicional de 12 meses, siempre que el arrendatario notifique su intención de renovar con al menos 3 meses de anticipación y no existan incumplimientos contractuales.

[El documento se actualiza con la cláusula de renovación]

Claude: He actualizado el contrato con la cláusula de renovación. ¿Desea realizar alguna otra modificación?

Usuario: No, el contrato está completo.

Claude: Perfecto. El contrato de arrendamiento está listo. Puede descargarlo en formato PDF o DOCX utilizando los botones en la parte inferior de la pantalla. También puede proceder a la firma digital si lo desea.

Usuario: Gracias, descargaré el PDF.

Claude: El PDF ha sido generado y está listo para descargar. ¿Hay algo más en lo que pueda ayudarle?

Usuario: No, eso es todo. Gracias.

Claude: Ha sido un placer ayudarle. Si necesita crear otro documento legal en el futuro, no dude en volver a FutureLex. ¡Que tenga un excelente día!
```

### Ejemplo 2: Carta de Renuncia Laboral

```
Claude: Bienvenido a FutureLex. Vamos a crear una carta de renuncia laboral personalizada. Este documento formalizará su decisión de terminar su relación laboral con su empleador actual. ¿Está listo para comenzar?

Usuario: Sí, vamos a hacerlo.

Claude: Para crear su carta de renuncia, necesito algunos datos básicos. ¿Cuál es su nombre completo?

Usuario: María Rodríguez López.

Claude: ¿Cuál es el nombre de la empresa para la que trabaja actualmente?

Usuario: Tecnologías Avanzadas S.A.

Claude: ¿Cuál es su puesto o cargo actual en la empresa?

Usuario: Gerente de Proyectos de Desarrollo.

Claude: ¿A quién va dirigida esta carta? Por favor, proporcione el nombre y cargo de la persona.

Usuario: Roberto Sánchez, Director de Recursos Humanos.

[El documento se actualiza en tiempo real con la información proporcionada]

Claude: ¿Cuál es la fecha en que desea presentar su renuncia? (Por favor, use el formato YYYY-MM-DD)

Usuario: 2025-04-15

Claude: ¿Cuál será su último día de trabajo? Recuerde que es común dar un preaviso de al menos dos semanas.

Usuario: 2025-04-30

Claude: ¿Desea incluir el motivo de su renuncia en la carta?

Usuario: Sí, me gustaría mencionarlo brevemente.

Claude: Por favor, indique el motivo de su renuncia.

Usuario: He recibido una oferta para un puesto que representa un avance significativo en mi carrera profesional.

[El documento se actualiza con el motivo de la renuncia]

Claude: ¿Desea incluir un agradecimiento a la empresa por las oportunidades brindadas?

Usuario: Sí, definitivamente.

Claude: ¿Hay algún aspecto específico de su experiencia en la empresa que le gustaría destacar en su agradecimiento?

Usuario: Me gustaría agradecer las oportunidades de crecimiento profesional y el excelente ambiente de trabajo durante los últimos tres años.

[El documento se actualiza con el agradecimiento]

Claude: ¿Desea ofrecer su ayuda durante la transición a su reemplazo?

Usuario: Sí, estoy dispuesta a ayudar en la transición.

Claude: ¿Qué tipo de ayuda está dispuesta a ofrecer durante la transición?

Usuario: Estoy dispuesta a capacitar a mi reemplazo y documentar los proyectos en curso para facilitar la continuidad del trabajo.

[El documento se actualiza con la oferta de ayuda]

Claude: He actualizado la carta con su oferta de ayuda durante la transición. ¿Hay alguna información adicional que desee incluir en la carta?

Usuario: Me gustaría añadir que espero mantener el contacto profesional con mis colegas.

[El documento se actualiza con la información adicional]

Claude: La carta de renuncia ha sido actualizada. Por favor, revise el documento completo. ¿Hay alguna sección que desee modificar?

Usuario: Todo se ve bien, pero me gustaría que el tono general sea más formal.

Claude: Entendido. He ajustado el tono de la carta para que sea más formal. ¿Desea realizar alguna otra modificación?

Usuario: No, ahora está perfecta.

Claude: Excelente. Su carta de renuncia está lista. Puede descargarla en formato PDF o DOCX utilizando los botones en la parte inferior de la pantalla.

Usuario: Gracias, descargaré ambos formatos.

Claude: Los archivos han sido generados y están listos para descargar. ¿Hay algo más en lo que pueda ayudarle?

Usuario: No, eso es todo. Muchas gracias por la ayuda.

Claude: Ha sido un placer ayudarle con su carta de renuncia. Si necesita crear otro documento legal en el futuro, no dude en volver a FutureLex. ¡Le deseamos mucho éxito en su nueva etapa profesional!
```

## Consideraciones para la Implementación

### Gestión de Errores y Excepciones

- Implementar mecanismos de recuperación para fallos en la API de Claude
- Proporcionar mensajes de error claros y opciones de recuperación para el usuario
- Guardar el estado de la conversación periódicamente para evitar pérdida de datos

### Optimización de Costos

- Implementar un sistema de caché para prompts frecuentes
- Optimizar el uso de tokens en las llamadas a la API
- Utilizar modelos más económicos para etapas iniciales de la conversación

### Mejora Continua

- Recopilar feedback de los usuarios sobre la calidad de los documentos generados
- Analizar las conversaciones para identificar patrones y mejorar los prompts
- Actualizar regularmente las plantillas de documentos según cambios legales o mejores prácticas

## Próximos Pasos

1. **Desarrollo de prototipos**: Implementar flujos conversacionales para 2-3 tipos de documentos comunes
2. **Pruebas de usuario**: Realizar pruebas con usuarios reales para refinar la experiencia conversacional
3. **Optimización de prompts**: Ajustar los prompts y herramientas para mejorar la calidad de los documentos
4. **Expansión gradual**: Añadir más tipos de documentos y personalización avanzada
