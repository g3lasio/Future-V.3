const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Servicio para interactuar con la API de PandaDoc
 */
class PandaDocService {
  constructor() {
    this.apiKey = process.env.PANDADOC_API_KEY;
    
    if (!this.apiKey) {
      logger.error('API key de PandaDoc no encontrada en las variables de entorno');
      throw new Error('API key de PandaDoc no configurada');
    }
    
    this.baseUrl = 'https://api.pandadoc.com/public/v1';
    this.headers = {
      'Authorization': `API-Key ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
    
    logger.info('Servicio de PandaDoc inicializado correctamente');
  }
  
  /**
   * Crea un documento para firma
   * @param {String} documentName - Nombre del documento
   * @param {String} documentContent - Contenido del documento en HTML
   * @param {Array} recipients - Lista de destinatarios para firma
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Información del documento creado
   */
  async createDocument(documentName, documentContent, recipients, options = {}) {
    try {
      const url = `${this.baseUrl}/documents`;
      
      // Convertir el contenido del documento a formato HTML si no lo está
      const htmlContent = documentContent.startsWith('<!DOCTYPE html>') || documentContent.startsWith('<html>') 
        ? documentContent 
        : this.convertToHtml(documentContent);
      
      // Preparar los destinatarios en el formato requerido por PandaDoc
      const formattedRecipients = recipients.map(recipient => ({
        email: recipient.email,
        first_name: recipient.firstName || '',
        last_name: recipient.lastName || '',
        role: recipient.role || 'signer'
      }));
      
      const payload = {
        name: documentName,
        recipients: formattedRecipients,
        content_html: htmlContent,
        tags: options.tags || [],
        fields: options.fields || {},
        metadata: options.metadata || {}
      };
      
      const response = await axios.post(url, payload, { headers: this.headers });
      
      return response.data;
    } catch (error) {
      logger.error(`Error al crear documento en PandaDoc: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Envía un documento para firma
   * @param {String} documentId - ID del documento
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Información del documento enviado
   */
  async sendDocument(documentId, options = {}) {
    try {
      const url = `${this.baseUrl}/documents/${documentId}/send`;
      
      const payload = {
        message: options.message || 'Por favor, firme este documento.',
        subject: options.subject || 'Documento para firma',
        silent: options.silent || false
      };
      
      const response = await axios.post(url, payload, { headers: this.headers });
      
      return response.data;
    } catch (error) {
      logger.error(`Error al enviar documento en PandaDoc: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Obtiene el estado de un documento
   * @param {String} documentId - ID del documento
   * @returns {Promise<Object>} - Información del estado del documento
   */
  async getDocumentStatus(documentId) {
    try {
      const url = `${this.baseUrl}/documents/${documentId}`;
      
      const response = await axios.get(url, { headers: this.headers });
      
      return response.data;
    } catch (error) {
      logger.error(`Error al obtener estado del documento en PandaDoc: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Descarga un documento
   * @param {String} documentId - ID del documento
   * @returns {Promise<Buffer>} - Buffer del documento descargado
   */
  async downloadDocument(documentId) {
    try {
      const url = `${this.baseUrl}/documents/${documentId}/download`;
      
      const response = await axios.get(url, { 
        headers: this.headers,
        responseType: 'arraybuffer'
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Error al descargar documento de PandaDoc: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Crea una plantilla a partir de un documento
   * @param {String} documentName - Nombre de la plantilla
   * @param {String} documentContent - Contenido del documento en HTML
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Información de la plantilla creada
   */
  async createTemplate(documentName, documentContent, options = {}) {
    try {
      const url = `${this.baseUrl}/templates`;
      
      // Convertir el contenido del documento a formato HTML si no lo está
      const htmlContent = documentContent.startsWith('<!DOCTYPE html>') || documentContent.startsWith('<html>') 
        ? documentContent 
        : this.convertToHtml(documentContent);
      
      const payload = {
        name: documentName,
        content_html: htmlContent,
        tags: options.tags || [],
        fields: options.fields || {},
        metadata: options.metadata || {}
      };
      
      const response = await axios.post(url, payload, { headers: this.headers });
      
      return response.data;
    } catch (error) {
      logger.error(`Error al crear plantilla en PandaDoc: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Convierte texto plano a formato HTML
   * @private
   */
  convertToHtml(text) {
    // Convertir saltos de línea a etiquetas <br>
    const htmlContent = text.replace(/\n/g, '<br>');
    
    // Envolver en estructura HTML básica
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Documento</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 40px;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 20px;
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
    `;
  }
}

module.exports = new PandaDocService();
