const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const claudeService = require('./claudeService');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Servicio para la edición de documentos
 */
class DocumentEditorService {
  /**
   * Edita un documento existente según las instrucciones proporcionadas
   * @param {String} documentContent - Contenido actual del documento
   * @param {String} editInstructions - Instrucciones de edición
   * @returns {Promise<String>} - Contenido del documento editado
   */
  async editDocument(documentContent, editInstructions) {
    try {
      return await claudeService.editDocument(documentContent, editInstructions);
    } catch (error) {
      logger.error('Error al editar documento:', error);
      throw new ApiError('Error al editar documento', 500);
    }
  }
  
  /**
   * Fusiona dos o más documentos en uno solo
   * @param {Array} documents - Array de contenidos de documentos
   * @param {String} mergeInstructions - Instrucciones para la fusión
   * @returns {Promise<String>} - Contenido del documento fusionado
   */
  async mergeDocuments(documents, mergeInstructions) {
    try {
      if (!documents || documents.length < 2) {
        throw new ApiError('Se requieren al menos dos documentos para fusionar', 400);
      }
      
      const prompt = `
# Instrucciones para Fusión de Documentos

## Documentos a Fusionar
${documents.map((doc, index) => `
### Documento ${index + 1}
\`\`\`
${doc}
\`\`\`
`).join('\n')}

## Instrucciones de Fusión
${mergeInstructions || 'Fusiona estos documentos de manera coherente, eliminando redundancias y manteniendo todas las cláusulas importantes.'}

## Tarea
Por favor, fusiona estos documentos siguiendo las instrucciones proporcionadas. El resultado debe ser un único documento coherente y bien estructurado.
      `;
      
      const response = await claudeService.client.messages.create({
        model: claudeService.defaultModel,
        max_tokens: 4096,
        temperature: 0.3,
        system: "Eres un asistente legal especializado en la fusión de documentos. Tu tarea es combinar múltiples documentos en uno solo de manera coherente y profesional, siguiendo las instrucciones proporcionadas.",
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      logger.error('Error al fusionar documentos:', error);
      throw new ApiError('Error al fusionar documentos', 500);
    }
  }
  
  /**
   * Añade secciones específicas a un documento
   * @param {String} documentContent - Contenido actual del documento
   * @param {Array} sectionsToAdd - Secciones a añadir
   * @returns {Promise<String>} - Contenido del documento con las nuevas secciones
   */
  async addSections(documentContent, sectionsToAdd) {
    try {
      if (!sectionsToAdd || sectionsToAdd.length === 0) {
        throw new ApiError('Se requiere al menos una sección para añadir', 400);
      }
      
      const prompt = `
# Instrucciones para Añadir Secciones a Documento

## Documento Original
\`\`\`
${documentContent}
\`\`\`

## Secciones a Añadir
${sectionsToAdd.map(section => `
### ${section.title || 'Nueva Sección'}
${section.content}
`).join('\n')}

## Tarea
Por favor, añade estas secciones al documento original en las ubicaciones más apropiadas. Mantén la coherencia y el estilo del documento original. Si una sección similar ya existe, intégrala de manera que se complementen sin redundancias.
      `;
      
      const response = await claudeService.client.messages.create({
        model: claudeService.defaultModel,
        max_tokens: 4096,
        temperature: 0.3,
        system: "Eres un asistente legal especializado en la edición de documentos. Tu tarea es añadir nuevas secciones a un documento existente de manera coherente y profesional.",
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      logger.error('Error al añadir secciones:', error);
      throw new ApiError('Error al añadir secciones al documento', 500);
    }
  }
  
  /**
   * Elimina secciones específicas de un documento
   * @param {String} documentContent - Contenido actual del documento
   * @param {Array} sectionsToRemove - Títulos o descripciones de secciones a eliminar
   * @returns {Promise<String>} - Contenido del documento sin las secciones eliminadas
   */
  async removeSections(documentContent, sectionsToRemove) {
    try {
      if (!sectionsToRemove || sectionsToRemove.length === 0) {
        throw new ApiError('Se requiere al menos una sección para eliminar', 400);
      }
      
      const prompt = `
# Instrucciones para Eliminar Secciones de Documento

## Documento Original
\`\`\`
${documentContent}
\`\`\`

## Secciones a Eliminar
${sectionsToRemove.map(section => `- ${section}`).join('\n')}

## Tarea
Por favor, elimina las secciones especificadas del documento original. Asegúrate de mantener la coherencia y el flujo del documento después de las eliminaciones. Si es necesario, ajusta el texto para que las transiciones entre secciones sean naturales.
      `;
      
      const response = await claudeService.client.messages.create({
        model: claudeService.defaultModel,
        max_tokens: 4096,
        temperature: 0.3,
        system: "Eres un asistente legal especializado en la edición de documentos. Tu tarea es eliminar secciones específicas de un documento existente manteniendo su coherencia y estructura general.",
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      logger.error('Error al eliminar secciones:', error);
      throw new ApiError('Error al eliminar secciones del documento', 500);
    }
  }
  
  /**
   * Reformatea un documento para mejorar su estructura y presentación
   * @param {String} documentContent - Contenido del documento
   * @param {Object} formatOptions - Opciones de formato
   * @returns {Promise<String>} - Documento reformateado
   */
  async reformatDocument(documentContent, formatOptions = {}) {
    try {
      const prompt = `
# Instrucciones para Reformatear Documento

## Documento Original
\`\`\`
${documentContent}
\`\`\`

## Opciones de Formato
${formatOptions.style ? `Estilo: ${formatOptions.style}` : 'Estilo: Profesional'}
${formatOptions.structure ? `Estructura: ${formatOptions.structure}` : 'Estructura: Estándar'}
${formatOptions.additionalInstructions ? `Instrucciones adicionales: ${formatOptions.additionalInstructions}` : ''}

## Tarea
Por favor, reformatea el documento siguiendo las opciones especificadas. Mejora la estructura, organización y presentación del contenido sin alterar su significado legal. Asegúrate de que el documento sea claro, profesional y fácil de leer.
      `;
      
      const response = await claudeService.client.messages.create({
        model: claudeService.defaultModel,
        max_tokens: 4096,
        temperature: 0.3,
        system: "Eres un asistente legal especializado en el formato y presentación de documentos. Tu tarea es mejorar la estructura y presentación de documentos manteniendo su contenido y significado legal.",
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      logger.error('Error al reformatear documento:', error);
      throw new ApiError('Error al reformatear documento', 500);
    }
  }
  
  /**
   * Traduce un documento a otro idioma
   * @param {String} documentContent - Contenido del documento
   * @param {String} targetLanguage - Idioma destino
   * @returns {Promise<String>} - Documento traducido
   */
  async translateDocument(documentContent, targetLanguage) {
    try {
      if (!targetLanguage) {
        throw new ApiError('El idioma destino es requerido', 400);
      }
      
      const prompt = `
# Instrucciones para Traducción de Documento

## Documento Original
\`\`\`
${documentContent}
\`\`\`

## Idioma Destino
${targetLanguage}

## Tarea
Por favor, traduce este documento al idioma especificado. Mantén la estructura, formato y significado legal del documento original. Asegúrate de que la traducción sea precisa y utilice la terminología legal apropiada para el idioma destino.
      `;
      
      const response = await claudeService.client.messages.create({
        model: claudeService.defaultModel,
        max_tokens: 4096,
        temperature: 0.3,
        system: "Eres un asistente legal especializado en la traducción de documentos. Tu tarea es traducir documentos manteniendo su significado legal, estructura y formato.",
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      logger.error('Error al traducir documento:', error);
      throw new ApiError('Error al traducir documento', 500);
    }
  }
  
  /**
   * Simplifica un documento legal para hacerlo más comprensible
   * @param {String} documentContent - Contenido del documento
   * @param {String} targetAudience - Audiencia objetivo (general, técnica, etc.)
   * @returns {Promise<String>} - Documento simplificado
   */
  async simplifyDocument(documentContent, targetAudience = 'general') {
    try {
      const prompt = `
# Instrucciones para Simplificación de Documento

## Documento Original
\`\`\`
${documentContent}
\`\`\`

## Audiencia Objetivo
${targetAudience}

## Tarea
Por favor, simplifica este documento legal para hacerlo más comprensible para la audiencia especificada. Reemplaza la jerga legal con lenguaje más accesible, clarifica conceptos complejos y reorganiza la información si es necesario. Mantén el significado legal esencial del documento.
      `;
      
      const response = await claudeService.client.messages.create({
        model: claudeService.defaultModel,
        max_tokens: 4096,
        temperature: 0.4,
        system: "Eres un asistente legal especializado en hacer documentos legales más accesibles. Tu tarea es simplificar documentos complejos manteniendo su significado legal esencial.",
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      logger.error('Error al simplificar documento:', error);
      throw new ApiError('Error al simplificar documento', 500);
    }
  }
}

module.exports = new DocumentEditorService();
