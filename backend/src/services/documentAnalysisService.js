const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const claudeService = require('./claudeService');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Servicio para el análisis de documentos legales
 */
class DocumentAnalysisService {
  /**
   * Analiza un documento legal y genera un reporte
   * @param {String} documentContent - Contenido del documento a analizar
   * @param {String} documentType - Tipo de documento (contrato, demanda, etc.)
   * @param {Object} options - Opciones adicionales para el análisis
   * @returns {Promise<Object>} - Resultado del análisis
   */
  async analyzeDocument(documentContent, documentType, options = {}) {
    try {
      // Determinar el tipo de análisis basado en el tipo de documento
      const analysisType = this.determineAnalysisType(documentType);
      
      // Realizar análisis con Claude AI
      const analysis = await claudeService.analyzeDocument(
        documentContent,
        analysisType,
        options
      );
      
      return analysis;
    } catch (error) {
      logger.error('Error al analizar documento:', error);
      throw new ApiError('Error al analizar documento', 500);
    }
  }
  
  /**
   * Genera un resumen de un documento legal
   * @param {String} documentContent - Contenido del documento
   * @param {Object} options - Opciones para el resumen
   * @returns {Promise<String>} - Resumen del documento
   */
  async generateSummary(documentContent, options = {}) {
    try {
      const analysis = await claudeService.analyzeDocument(
        documentContent,
        'summary',
        options
      );
      
      return analysis.result;
    } catch (error) {
      logger.error('Error al generar resumen:', error);
      throw new ApiError('Error al generar resumen del documento', 500);
    }
  }
  
  /**
   * Extrae información específica de un documento
   * @param {String} documentContent - Contenido del documento
   * @param {Array} fieldsToExtract - Campos a extraer
   * @returns {Promise<Object>} - Información extraída
   */
  async extractInformation(documentContent, fieldsToExtract = []) {
    try {
      const analysis = await claudeService.analyzeDocument(
        documentContent,
        'extraction',
        { fieldsToExtract }
      );
      
      return analysis.result;
    } catch (error) {
      logger.error('Error al extraer información:', error);
      throw new ApiError('Error al extraer información del documento', 500);
    }
  }
  
  /**
   * Identifica posibles riesgos en un documento legal
   * @param {String} documentContent - Contenido del documento
   * @returns {Promise<Object>} - Riesgos identificados
   */
  async identifyRisks(documentContent) {
    try {
      const analysis = await claudeService.analyzeDocument(
        documentContent,
        'risks'
      );
      
      return analysis.result;
    } catch (error) {
      logger.error('Error al identificar riesgos:', error);
      throw new ApiError('Error al identificar riesgos en el documento', 500);
    }
  }
  
  /**
   * Compara dos documentos y encuentra diferencias
   * @param {String} document1 - Contenido del primer documento
   * @param {String} document2 - Contenido del segundo documento
   * @returns {Promise<Object>} - Diferencias encontradas
   */
  async compareDocuments(document1, document2) {
    try {
      const prompt = `
# Instrucciones para Comparación de Documentos

## Documento 1
\`\`\`
${document1}
\`\`\`

## Documento 2
\`\`\`
${document2}
\`\`\`

## Tarea
Por favor, compara estos dos documentos e identifica:
1. Diferencias clave en términos y condiciones
2. Cláusulas presentes en uno pero no en el otro
3. Cambios en obligaciones o responsabilidades
4. Diferencias en fechas, montos o plazos
5. Cualquier otra diferencia significativa

Presenta los resultados en formato estructurado, indicando claramente la ubicación de cada diferencia.
      `;
      
      const response = await claudeService.client.messages.create({
        model: claudeService.defaultModel,
        max_tokens: 4096,
        temperature: 0.3,
        system: "Eres un asistente legal especializado en la comparación de documentos. Tu tarea es identificar y explicar las diferencias entre dos versiones de un documento de manera clara y precisa.",
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      return {
        result: response.content[0].text,
        type: 'comparison'
      };
    } catch (error) {
      logger.error('Error al comparar documentos:', error);
      throw new ApiError('Error al comparar documentos', 500);
    }
  }
  
  /**
   * Genera un reporte de análisis en formato PDF
   * @param {Object} analysisResult - Resultado del análisis
   * @param {String} documentTitle - Título del documento analizado
   * @returns {Promise<Buffer>} - Buffer del PDF generado
   */
  async generatePdfReport(analysisResult, documentTitle) {
    try {
      // Crear nuevo documento PDF
      const pdfDoc = await PDFDocument.create();
      
      // Añadir página
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      // Añadir título
      page.drawText(`Análisis de Documento: ${documentTitle}`, {
        x: 50,
        y: height - 50,
        size: 18,
        color: rgb(0, 0, 0.8)
      });
      
      // Añadir fecha
      const date = new Date().toLocaleDateString();
      page.drawText(`Fecha: ${date}`, {
        x: 50,
        y: height - 80,
        size: 12,
        color: rgb(0.4, 0.4, 0.4)
      });
      
      // Añadir tipo de análisis
      page.drawText(`Tipo de análisis: ${analysisResult.type}`, {
        x: 50,
        y: height - 100,
        size: 12,
        color: rgb(0.4, 0.4, 0.4)
      });
      
      // Añadir contenido del análisis
      const contentLines = analysisResult.result.split('\n');
      let yPosition = height - 140;
      
      for (const line of contentLines) {
        if (yPosition < 50) {
          // Crear nueva página si no hay espacio
          const newPage = pdfDoc.addPage();
          yPosition = newPage.getSize().height - 50;
        }
        
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 10,
          color: rgb(0, 0, 0)
        });
        
        yPosition -= 15;
      }
      
      // Guardar PDF
      const pdfBytes = await pdfDoc.save();
      
      return Buffer.from(pdfBytes);
    } catch (error) {
      logger.error('Error al generar reporte PDF:', error);
      throw new ApiError('Error al generar reporte PDF', 500);
    }
  }
  
  /**
   * Determina el tipo de análisis basado en el tipo de documento
   * @private
   */
  determineAnalysisType(documentType) {
    const lowerType = documentType.toLowerCase();
    
    if (lowerType.includes('contrato') || lowerType.includes('acuerdo')) {
      return 'contract_analysis';
    } else if (lowerType.includes('demanda') || lowerType.includes('legal')) {
      return 'legal_analysis';
    } else if (lowerType.includes('carta') || lowerType.includes('comunicación')) {
      return 'correspondence_analysis';
    } else {
      return 'general';
    }
  }
}

module.exports = new DocumentAnalysisService();
