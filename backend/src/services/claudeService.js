const { Anthropic } = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');

/**
 * Servicio para interactuar con la API de Claude de Anthropic
 */
class ClaudeService {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!this.apiKey) {
      logger.error('API key de Anthropic no encontrada en las variables de entorno');
      throw new Error('API key de Anthropic no configurada');
    }
    
    this.client = new Anthropic({
      apiKey: this.apiKey,
    });
    
    this.defaultModel = 'claude-3-opus-20240229';
    this.defaultMaxTokens = 4096;
    
    logger.info('Servicio de Claude inicializado correctamente');
  }
  
  /**
   * Genera un documento basado en el tipo y los datos proporcionados
   * @param {String} documentType - Tipo de documento a generar
   * @param {Object} documentData - Datos para generar el documento
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<String>} - Documento generado
   */
  async generateDocument(documentType, documentData, options = {}) {
    try {
      const systemPrompt = this.getSystemPromptForDocumentType(documentType);
      
      const userPrompt = `
# Solicitud de Generación de Documento: ${documentType}

## Datos del Documento
${Object.entries(documentData).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Instrucciones
Por favor, genera un documento completo y profesional del tipo "${documentType}" utilizando los datos proporcionados.
El documento debe seguir todas las convenciones legales y formales apropiadas para este tipo de documento.
${options.additionalInstructions ? `\nInstrucciones adicionales: ${options.additionalInstructions}` : ''}
      `;
      
      const response = await this.client.messages.create({
        model: options.model || this.defaultModel,
        max_tokens: options.maxTokens || this.defaultMaxTokens,
        temperature: options.temperature || 0.2,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      logger.error(`Error al generar documento: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Analiza un documento y extrae información relevante
   * @param {String} documentContent - Contenido del documento a analizar
   * @param {String} analysisType - Tipo de análisis a realizar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Resultado del análisis
   */
  async analyzeDocument(documentContent, analysisType, options = {}) {
    try {
      const systemPrompt = this.getSystemPromptForAnalysisType(analysisType);
      
      const userPrompt = `
# Solicitud de Análisis de Documento

## Documento a Analizar
\`\`\`
${documentContent}
\`\`\`

## Tipo de Análisis
${analysisType}

## Instrucciones
${this.getInstructionsForAnalysisType(analysisType, options)}
      `;
      
      const response = await this.client.messages.create({
        model: options.model || this.defaultModel,
        max_tokens: options.maxTokens || this.defaultMaxTokens,
        temperature: options.temperature || 0.3,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ]
      });
      
      return {
        result: response.content[0].text,
        type: analysisType
      };
    } catch (error) {
      logger.error(`Error al analizar documento: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Edita un documento según las instrucciones proporcionadas
   * @param {String} documentContent - Contenido actual del documento
   * @param {String} editInstructions - Instrucciones de edición
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<String>} - Documento editado
   */
  async editDocument(documentContent, editInstructions, options = {}) {
    try {
      const systemPrompt = `
Eres un asistente legal especializado en la edición y mejora de documentos. Tu tarea es editar el documento proporcionado siguiendo las instrucciones específicas del usuario. Mantén el formato y estructura profesional del documento, y asegúrate de que todas las modificaciones sean coherentes con el propósito y contexto del documento original.
      `;
      
      const userPrompt = `
# Solicitud de Edición de Documento

## Documento Original
\`\`\`
${documentContent}
\`\`\`

## Instrucciones de Edición
${editInstructions}

## Tarea
Por favor, edita el documento siguiendo las instrucciones proporcionadas. Devuelve el documento completo con las modificaciones aplicadas.
      `;
      
      const response = await this.client.messages.create({
        model: options.model || this.defaultModel,
        max_tokens: options.maxTokens || this.defaultMaxTokens,
        temperature: options.temperature || 0.3,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      logger.error(`Error al editar documento: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Genera un flujo conversacional para crear un documento
   * @param {String} documentType - Tipo de documento a generar
   * @param {Object} initialData - Datos iniciales para el documento
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Primer mensaje del flujo conversacional
   */
  async startDocumentConversation(documentType, initialData = {}, options = {}) {
    try {
      const systemPrompt = `
Eres un asistente legal especializado en la creación de documentos a través de conversaciones. Tu tarea es guiar al usuario a través de un proceso paso a paso para recopilar toda la información necesaria para generar un documento ${documentType} completo y profesional.

Debes:
1. Hacer preguntas claras y específicas para obtener la información necesaria
2. Explicar por qué cada pieza de información es importante
3. Proporcionar ejemplos o sugerencias cuando sea apropiado
4. Adaptar tus preguntas basándote en las respuestas anteriores
5. Mostrar el progreso del documento a medida que se construye

Mantén un tono profesional pero amigable, y asegúrate de que el usuario comprenda cada paso del proceso.
      `;
      
      const userPrompt = `
# Inicio de Conversación para Generar Documento

## Tipo de Documento
${documentType}

## Datos Iniciales
${Object.keys(initialData).length > 0 ? Object.entries(initialData).map(([key, value]) => `- ${key}: ${value}`).join('\n') : 'No se proporcionaron datos iniciales.'}

## Instrucciones
Por favor, inicia una conversación para guiarme en la creación de este documento. Hazme las preguntas necesarias para recopilar toda la información requerida, explicando por qué cada dato es importante.
      `;
      
      const response = await this.client.messages.create({
        model: options.model || this.defaultModel,
        max_tokens: options.maxTokens || this.defaultMaxTokens,
        temperature: options.temperature || 0.7,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ]
      });
      
      return {
        message: response.content[0].text,
        conversationId: response.id,
        documentType,
        currentData: initialData
      };
    } catch (error) {
      logger.error(`Error al iniciar conversación de documento: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Continúa un flujo conversacional para crear un documento
   * @param {String} conversationId - ID de la conversación
   * @param {String} userResponse - Respuesta del usuario
   * @param {Object} currentData - Datos actuales del documento
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Siguiente mensaje del flujo conversacional
   */
  async continueDocumentConversation(conversationId, userResponse, currentData, options = {}) {
    try {
      // En una implementación real, aquí se recuperaría el historial de la conversación
      // Para este ejemplo, simulamos una respuesta
      
      const systemPrompt = `
Eres un asistente legal especializado en la creación de documentos a través de conversaciones. Estás en medio de una conversación para ayudar al usuario a crear un documento. Basándote en la respuesta del usuario, debes continuar la conversación para recopilar más información o finalizar el proceso si ya tienes todos los datos necesarios.
      `;
      
      const userPrompt = `
# Continuación de Conversación para Generar Documento

## Datos Actuales
${Object.entries(currentData).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Respuesta del Usuario
${userResponse}

## Instrucciones
Por favor, continúa la conversación basándote en la respuesta del usuario. Si ya tienes toda la información necesaria, genera una vista previa del documento y pregunta si el usuario desea realizar algún cambio antes de finalizar.
      `;
      
      const response = await this.client.messages.create({
        model: options.model || this.defaultModel,
        max_tokens: options.maxTokens || this.defaultMaxTokens,
        temperature: options.temperature || 0.7,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ]
      });
      
      // Aquí se analizaría la respuesta para extraer nuevos datos
      // Para este ejemplo, simplemente devolvemos la respuesta
      
      return {
        message: response.content[0].text,
        conversationId,
        currentData,
        isComplete: response.content[0].text.includes("documento está listo") || response.content[0].text.includes("vista previa final")
      };
    } catch (error) {
      logger.error(`Error al continuar conversación de documento: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Obtiene el prompt de sistema para un tipo de documento
   * @private
   */
  getSystemPromptForDocumentType(documentType) {
    const basePrompt = `
Eres un asistente legal especializado en la creación de documentos profesionales. Tu tarea es generar un documento completo, preciso y profesional basado en la información proporcionada por el usuario.
    `;
    
    const documentTypePrompts = {
      'contrato_arrendamiento': `
${basePrompt}

Especialización: Contratos de Arrendamiento
Debes crear un contrato de arrendamiento completo que incluya todas las cláusulas estándar y protecciones tanto para el arrendador como para el arrendatario. El documento debe ser legalmente sólido y cumplir con las prácticas habituales en contratos de arrendamiento.
      `,
      'contrato_servicios': `
${basePrompt}

Especialización: Contratos de Servicios Profesionales
Debes crear un contrato de servicios profesionales que defina claramente el alcance del trabajo, honorarios, plazos, entregables y responsabilidades de ambas partes. El documento debe proteger adecuadamente tanto al prestador de servicios como al cliente.
      `,
      'acuerdo_confidencialidad': `
${basePrompt}

Especialización: Acuerdos de Confidencialidad (NDA)
Debes crear un acuerdo de confidencialidad que proteja adecuadamente la información confidencial de la parte divulgadora. El documento debe definir claramente qué se considera información confidencial, las obligaciones de la parte receptora y las consecuencias del incumplimiento.
      `,
      'carta_renuncia': `
${basePrompt}

Especialización: Cartas de Renuncia
Debes crear una carta de renuncia profesional y respetuosa que comunique claramente la intención del empleado de dejar su puesto. La carta debe mantener un tono positivo y profesional, independientemente de las circunstancias de la renuncia.
      `,
      'demanda_civil': `
${basePrompt}

Especialización: Demandas Civiles
Debes crear una demanda civil que presente claramente los hechos, fundamentos legales, pretensiones y pruebas. El documento debe seguir la estructura formal de una demanda civil y utilizar el lenguaje jurídico apropiado.
      `,
      'poder_notarial': `
${basePrompt}

Especialización: Poderes Notariales
Debes crear un poder notarial que defina claramente las facultades otorgadas al apoderado, limitaciones, duración y condiciones de revocación. El documento debe ser preciso en cuanto al alcance de la representación autorizada.
      `,
    };
    
    return documentTypePrompts[documentType] || basePrompt;
  }
  
  /**
   * Obtiene el prompt de sistema para un tipo de análisis
   * @private
   */
  getSystemPromptForAnalysisType(analysisType) {
    const basePrompt = `
Eres un asistente legal especializado en el análisis de documentos. Tu tarea es analizar el documento proporcionado y extraer información relevante según el tipo de análisis solicitado.
    `;
    
    const analysisTypePrompts = {
      'summary': `
${basePrompt}

Especialización: Resumen de Documentos
Debes crear un resumen conciso pero completo del documento, identificando su tipo, partes involucradas, propósito principal, términos clave, obligaciones principales, fechas importantes y cláusulas destacables. El resumen debe proporcionar una visión general clara del contenido y propósito del documento.
      `,
      'extraction': `
${basePrompt}

Especialización: Extracción de Información
Debes extraer información específica del documento, como nombres de las partes, fechas, montos financieros, plazos, términos, obligaciones y condiciones especiales. La información debe presentarse de manera estructurada y fácil de entender.
      `,
      'risks': `
${basePrompt}

Especialización: Identificación de Riesgos
Debes identificar posibles riesgos o problemas en el documento, como cláusulas ambiguas, términos potencialmente desfavorables, obligaciones excesivas, ausencia de protecciones estándar, posibles conflictos con la legislación aplicable o inconsistencias internas. Para cada riesgo identificado, debes proporcionar una explicación y sugerencias para mitigarlo.
      `,
      'legal_analysis': `
${basePrompt}

Especialización: Análisis Legal
Debes realizar un análisis legal completo del documento, evaluando su validez, cumplimiento con la legislación aplicable, posibles vulnerabilidades legales y recomendaciones para mejorarlo. El análisis debe ser riguroso y basado en principios legales sólidos.
      `,
    };
    
    return analysisTypePrompts[analysisType] || basePrompt;
  }
  
  /**
   * Obtiene las instrucciones para un tipo de análisis
   * @private
   */
  getInstructionsForAnalysisType(analysisType, options = {}) {
    const instructionsByType = {
      'summary': `
Por favor, genera un resumen conciso pero completo del documento, identificando:
1. Tipo de documento
2. Partes involucradas
3. Propósito principal
4. Términos clave
5. Obligaciones principales
6. Fechas importantes
7. Cláusulas destacables

El resumen debe proporcionar una visión general clara del contenido y propósito del documento.
      `,
      'extraction': `
Por favor, extrae la siguiente información del documento:
${options.fieldsToExtract ? options.fieldsToExtract.map(field => `- ${field}`).join('\n') : `
- Nombres de las partes
- Fechas mencionadas
- Montos financieros
- Plazos y términos
- Obligaciones de cada parte
- Condiciones especiales
- Información de contacto
`}

Presenta la información de manera estructurada y fácil de entender, utilizando tablas cuando sea apropiado.
      `,
      'risks': `
Por favor, identifica posibles riesgos o problemas en el documento, incluyendo:
1. Cláusulas ambiguas
2. Términos potencialmente desfavorables
3. Obligaciones excesivas
4. Ausencia de protecciones estándar
5. Posibles conflictos con la legislación aplicable
6. Inconsistencias internas

Para cada riesgo identificado, proporciona:
- Ubicación en el documento
- Descripción del riesgo
- Nivel de riesgo (Alto, Medio, Bajo)
- Recomendación para mitigarlo
      `,
      'legal_analysis': `
Por favor, realiza un análisis legal completo del documento, evaluando:
1. Validez legal del documento
2. Cumplimiento con la legislación aplicable
3. Estructura y formato
4. Claridad y precisión del lenguaje
5. Posibles vulnerabilidades legales
6. Recomendaciones para mejorarlo

El análisis debe ser riguroso y basado en principios legales sólidos.
      `,
    };
    
    return instructionsByType[analysisType] || 'Por favor, analiza este documento y proporciona información relevante.';
  }
}

module.exports = new ClaudeService();
