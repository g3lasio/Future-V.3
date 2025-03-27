const Document = require('../models/documentModel');
const claudeService = require('../services/claudeService');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

/**
 * Controlador para la gestión de documentos
 */
const documentController = {
  /**
   * Genera un nuevo documento utilizando Claude AI
   */
  async generateDocument(req, res, next) {
    try {
      const { 
        documentType, 
        jurisdiction = 'general', 
        language = 'es', 
        userInfo, 
        additionalInstructions 
      } = req.body;
      
      if (!documentType) {
        throw ApiError.badRequest('El tipo de documento es requerido');
      }
      
      if (!userInfo) {
        throw ApiError.badRequest('La información del usuario es requerida');
      }
      
      // Generar el documento con Claude AI
      const documentContent = await claudeService.generateDocument({
        documentType,
        jurisdiction,
        language,
        userInfo,
        additionalInstructions
      });
      
      // Crear el documento en la base de datos
      const document = await Document.create({
        title: `${documentType} - ${new Date().toLocaleDateString()}`,
        type: determineDocumentType(documentType),
        category: documentType,
        content: documentContent,
        metadata: {
          language,
          jurisdiction,
          parties: extractParties(userInfo),
          keywords: extractKeywords(documentType, userInfo)
        },
        creator: req.user.id,
        status: 'draft'
      });
      
      // Crear versión inicial en el historial
      document.versionHistory.push({
        version: 1,
        content: documentContent,
        modifiedBy: req.user.id,
        changeDescription: 'Versión inicial generada por IA'
      });
      
      await document.save();
      
      res.status(201).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Inicia una conversación para generar un documento de forma interactiva
   */
  async startGenerationConversation(req, res, next) {
    try {
      const { documentType, initialMessage } = req.body;
      
      if (!documentType || !initialMessage) {
        throw ApiError.badRequest('El tipo de documento y el mensaje inicial son requeridos');
      }
      
      // Iniciar conversación con Claude AI
      const response = await claudeService.conversationalDocumentGeneration(
        null, 
        `Quiero crear un documento de tipo ${documentType}. ${initialMessage}`
      );
      
      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Continúa una conversación existente para generar un documento
   */
  async continueGenerationConversation(req, res, next) {
    try {
      const { id } = req.params;
      const { message, history } = req.body;
      
      if (!message) {
        throw ApiError.badRequest('El mensaje es requerido');
      }
      
      // Continuar conversación con Claude AI
      const response = await claudeService.conversationalDocumentGeneration(
        id,
        message,
        history || []
      );
      
      // Si la conversación está completa, crear el documento
      if (response.isComplete) {
        // Extraer el contenido del documento de la respuesta
        const documentContent = extractDocumentFromConversation(response.message);
        
        // Crear el documento en la base de datos
        const document = await Document.create({
          title: extractTitleFromConversation(history, response.message),
          type: determineDocumentTypeFromConversation(history),
          category: extractCategoryFromConversation(history),
          content: documentContent,
          metadata: {
            language: extractLanguageFromConversation(history) || 'es',
            jurisdiction: extractJurisdictionFromConversation(history) || 'general',
            parties: extractPartiesFromConversation(history),
            keywords: extractKeywordsFromConversation(history)
          },
          creator: req.user.id,
          status: 'draft'
        });
        
        // Crear versión inicial en el historial
        document.versionHistory.push({
          version: 1,
          content: documentContent,
          modifiedBy: req.user.id,
          changeDescription: 'Versión inicial generada por conversación con IA'
        });
        
        await document.save();
        
        response.document = document;
      }
      
      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Genera un documento a partir de una plantilla existente
   */
  async generateFromTemplate(req, res, next) {
    try {
      const { templateId, userInfo, customizations } = req.body;
      
      if (!templateId || !userInfo) {
        throw ApiError.badRequest('El ID de la plantilla y la información del usuario son requeridos');
      }
      
      // Buscar la plantilla
      const template = await Document.findById(templateId);
      
      if (!template) {
        throw ApiError.notFound('Plantilla no encontrada');
      }
      
      // Generar el documento personalizado con Claude AI
      const documentContent = await claudeService.editDocument(
        template.content,
        `Personaliza este documento con la siguiente información: ${JSON.stringify(userInfo)}. ${customizations || ''}`
      );
      
      // Crear el documento en la base de datos
      const document = await Document.create({
        title: `${template.title} - Personalizado`,
        type: template.type,
        category: template.category,
        content: documentContent,
        metadata: {
          ...template.metadata,
          parties: extractParties(userInfo)
        },
        creator: req.user.id,
        status: 'draft'
      });
      
      // Crear versión inicial en el historial
      document.versionHistory.push({
        version: 1,
        content: documentContent,
        modifiedBy: req.user.id,
        changeDescription: 'Versión inicial generada a partir de plantilla'
      });
      
      await document.save();
      
      res.status(201).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Analiza un documento existente
   */
  async analyzeDocument(req, res, next) {
    try {
      if (!req.file) {
        throw ApiError.badRequest('No se ha proporcionado ningún archivo');
      }
      
      const { analysisType = 'general' } = req.body;
      
      // Leer el contenido del archivo
      const filePath = req.file.path;
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      
      // Analizar el documento con Claude AI
      const analysis = await claudeService.analyzeDocument(
        fileContent,
        analysisType,
        req.body.options || {}
      );
      
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Genera un resumen de un documento
   */
  async generateSummary(req, res, next) {
    try {
      if (!req.file) {
        throw ApiError.badRequest('No se ha proporcionado ningún archivo');
      }
      
      // Leer el contenido del archivo
      const filePath = req.file.path;
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      
      // Analizar el documento con Claude AI
      const analysis = await claudeService.analyzeDocument(
        fileContent,
        'summary'
      );
      
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Extrae información específica de un documento
   */
  async extractInformation(req, res, next) {
    try {
      if (!req.file) {
        throw ApiError.badRequest('No se ha proporcionado ningún archivo');
      }
      
      const { fieldsToExtract } = req.body;
      
      // Leer el contenido del archivo
      const filePath = req.file.path;
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      
      // Analizar el documento con Claude AI
      const analysis = await claudeService.analyzeDocument(
        fileContent,
        'extraction',
        { fieldsToExtract }
      );
      
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Obtiene todos los documentos (con paginación)
   */
  async getAllDocuments(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const documents = await Document.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('creator', 'name email');
      
      const total = await Document.countDocuments();
      
      res.status(200).json({
        success: true,
        count: documents.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: documents
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Obtiene los documentos del usuario actual
   */
  async getUserDocuments(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const query = { 
        $or: [
          { creator: req.user.id },
          { 'collaborators.user': req.user.id }
        ]
      };
      
      // Filtros adicionales
      if (req.query.type) {
        query.type = req.query.type;
      }
      
      if (req.query.category) {
        query.category = req.query.category;
      }
      
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      const documents = await Document.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Document.countDocuments(query);
      
      res.status(200).json({
        success: true,
        count: documents.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: documents
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Obtiene un documento por su ID
   */
  async getDocumentById(req, res, next) {
    try {
      const document = await Document.findById(req.params.id)
        .populate('creator', 'name email')
        .populate('collaborators.user', 'name email');
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos
      if (!isAuthorizedForDocument(req.user, document)) {
        throw ApiError.forbidden('No tiene permisos para acceder a este documento');
      }
      
      res.status(200).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Actualiza un documento existente
   */
  async updateDocument(req, res, next) {
    try {
      let document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos
      if (!canEditDocument(req.user, document)) {
        throw ApiError.forbidden('No tiene permisos para editar este documento');
      }
      
      const { title, content, status, metadata } = req.body;
      const updates = {};
      
      if (title) updates.title = title;
      if (status) updates.status = status;
      if (metadata) updates.metadata = { ...document.metadata, ...metadata };
      
      // Si se actualiza el contenido, crear nueva versión
      if (content) {
        // Guardar versión actual en historial
        const currentVersion = document.versionHistory.length > 0 
          ? document.versionHistory[document.versionHistory.length - 1].version + 1 
          : 1;
        
        document.versionHistory.push({
          version: currentVersion,
          content: document.content,
          modifiedBy: req.user.id,
          modifiedAt: new Date(),
          changeDescription: req.body.changeDescription || 'Actualización manual'
        });
        
        updates.content = content;
      }
      
      // Actualizar documento
      document = await Document.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );
      
      res.status(200).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Elimina un documento
   */
  async deleteDocument(req, res, next) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos (solo el creador o admin puede eliminar)
      if (document.creator.toString() !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('No tiene permisos para eliminar este documento');
      }
      
      await document.remove();
      
      res.status(200).json({
        success: true,
        data: {}
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Crea una nueva versión del documento
   */
  async createNewVersion(req, res, next) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos
      if (!canEditDocument(req.user, document)) {
        throw ApiError.forbidden('No tiene permisos para editar este documento');
      }
      
      const { content, changeDescription } = req.body;
      
      if (!content) {
        throw ApiError.badRequest('El contenido es requerido');
      }
      
      // Calcular número de versión
      const newVersion = document.versionHistory.length > 0 
        ? document.versionHistory[document.versionHistory.length - 1].version + 1 
        : 1;
      
      // Añadir nueva versión al historial
      document.versionHistory.push({
        version: newVersion,
        content: document.content,
        modifiedBy: req.user.id,
        modifiedAt: new Date(),
        changeDescription: changeDescription || `Versión ${newVersion}`
      });
      
      // Actualizar contenido actual
      document.content = content;
      
      await document.save();
      
      res.status(200).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Obtiene el historial de versiones de un documento
   */
  async getDocumentVersions(req, res, next) {
    try {
      const document = await Document.findById(req.params.id)
        .populate('versionHistory.modifiedBy', 'name email');
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos
      if (!isAuthorizedForDocument(req.user, document)) {
        throw ApiError.forbidden('No tiene permisos para acceder a este documento');
      }
      
      // Ordenar versiones de más reciente a más antigua
      const versions = document.versionHistory
        .sort((a, b) => b.version - a.version)
        .map(version => ({
          version: version.version,
          modifiedBy: version.modifiedBy,
          modifiedAt: version.modifiedAt,
          changeDescription: version.changeDescription
        }));
      
      res.status(200).json({
        success: true,
        data: versions
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Obtiene una versión específica de un documento
   */
  async getSpecificVersion(req, res, next) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos
      if (!isAuthorizedForDocument(req.user, document)) {
        throw ApiError.forbidden('No tiene permisos para acceder a este documento');
      }
      
      const versionId = parseInt(req.params.versionId);
      const version = document.versionHistory.find(v => v.version === versionId);
      
      if (!version) {
        throw ApiError.notFound('Versión no encontrada');
      }
      
      res.status(200).json({
        success: true,
        data: version
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Exporta un documento a formato PDF
   */
  async exportToPdf(req, res, next) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos
      if (!isAuthorizedForDocument(req.user, document)) {
        throw ApiError.forbidden('No tiene permisos para acceder a este documento');
      }
      
      // Crear PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      // Añadir contenido al PDF
      page.drawText(document.title, {
        x: 50,
        y: height - 50,
        size: 20
      });
      
      // Dividir el contenido en líneas para ajustarlo a la página
      const contentLines = document.content.split('\n');
      let yPosition = height - 100;
      
      for (const line of contentLines) {
        if (yPosition < 50) {
          // Crear nueva página si no hay espacio
          const newPage = pdfDoc.addPage();
          yPosition = newPage.getSize().height - 50;
        }
        
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 12
        });
        
        yPosition -= 15;
      }
      
      // Guardar PDF
      const pdfBytes = await pdfDoc.save();
      
      // Configurar respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${document.title.replace(/\s+/g, '_')}.pdf`);
      
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Exporta un documento a formato DOCX
   */
  async exportToDocx(req, res, next) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos
      if (!isAuthorizedForDocument(req.user, document)) {
        throw ApiError.forbidden('No tiene permisos para acceder a este documento');
      }
      
      // Implementación de exportación a DOCX
      // Nota: Requiere una biblioteca adicional como docx
      
      res.status(501).json({
        success: false,
        message: 'Exportación a DOCX no implementada'
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Exporta un documento a formato TXT
   */
  async exportToTxt(req, res, next) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos
      if (!isAuthorizedForDocument(req.user, document)) {
        throw ApiError.forbidden('No tiene permisos para acceder a este documento');
      }
      
      // Configurar respuesta
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename=${document.title.replace(/\s+/g, '_')}.txt`);
      
      res.send(document.content);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Prepara un documento para firma
   */
  async prepareForSigning(req, res, next) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos (solo el creador puede iniciar firma)
      if (document.creator.toString() !== req.user.id) {
        throw ApiError.forbidden('Solo el creador puede iniciar el proceso de firma');
      }
      
      const { signers } = req.body;
      
      if (!signers || !Array.isArray(signers) || signers.length === 0) {
        throw ApiError.badRequest('Se requiere al menos un firmante');
      }
      
      // Actualizar información de firma
      document.signatureInfo = {
        isSignable: true,
        signatureStatus: 'not_started',
        signers: signers.map(signer => ({
          name: signer.name,
          email: signer.email,
          status: 'pending'
        }))
      };
      
      await document.save();
      
      res.status(200).json({
        success: true,
        data: document.signatureInfo
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Obtiene el estado de firma de un documento
   */
  async getSigningStatus(req, res, next) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos
      if (!isAuthorizedForDocument(req.user, document)) {
        throw ApiError.forbidden('No tiene permisos para acceder a este documento');
      }
      
      res.status(200).json({
        success: true,
        data: document.signatureInfo
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Completa el proceso de firma
   */
  async completeSigningProcess(req, res, next) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos (solo el creador puede completar firma)
      if (document.creator.toString() !== req.user.id) {
        throw ApiError.forbidden('Solo el creador puede completar el proceso de firma');
      }
      
      // Actualizar estado de firma
      document.signatureInfo.signatureStatus = 'completed';
      document.status = 'signed';
      
      await document.save();
      
      res.status(200).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Comparte un documento con otros usuarios
   */
  async shareDocument(req, res, next) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos (solo el creador puede compartir)
      if (document.creator.toString() !== req.user.id) {
        throw ApiError.forbidden('Solo el creador puede compartir el documento');
      }
      
      const { collaborators } = req.body;
      
      if (!collaborators || !Array.isArray(collaborators)) {
        throw ApiError.badRequest('Se requiere al menos un colaborador');
      }
      
      // Actualizar colaboradores
      document.collaborators = collaborators.map(collab => ({
        user: collab.userId,
        permissions: collab.permissions || 'view'
      }));
      
      await document.save();
      
      res.status(200).json({
        success: true,
        data: document.collaborators
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Obtiene los colaboradores de un documento
   */
  async getCollaborators(req, res, next) {
    try {
      const document = await Document.findById(req.params.id)
        .populate('collaborators.user', 'name email');
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos
      if (!isAuthorizedForDocument(req.user, document)) {
        throw ApiError.forbidden('No tiene permisos para acceder a este documento');
      }
      
      res.status(200).json({
        success: true,
        data: document.collaborators
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Actualiza los permisos de un colaborador
   */
  async updateCollaboratorPermissions(req, res, next) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos (solo el creador puede actualizar permisos)
      if (document.creator.toString() !== req.user.id) {
        throw ApiError.forbidden('Solo el creador puede actualizar permisos');
      }
      
      const { permissions } = req.body;
      const userId = req.params.userId;
      
      if (!permissions) {
        throw ApiError.badRequest('Se requieren los permisos');
      }
      
      // Buscar colaborador
      const collaboratorIndex = document.collaborators.findIndex(
        collab => collab.user.toString() === userId
      );
      
      if (collaboratorIndex === -1) {
        throw ApiError.notFound('Colaborador no encontrado');
      }
      
      // Actualizar permisos
      document.collaborators[collaboratorIndex].permissions = permissions;
      
      await document.save();
      
      res.status(200).json({
        success: true,
        data: document.collaborators
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Elimina un colaborador
   */
  async removeCollaborator(req, res, next) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        throw ApiError.notFound('Documento no encontrado');
      }
      
      // Verificar permisos (solo el creador puede eliminar colaboradores)
      if (document.creator.toString() !== req.user.id) {
        throw ApiError.forbidden('Solo el creador puede eliminar colaboradores');
      }
      
      const userId = req.params.userId;
      
      // Filtrar colaboradores
      document.collaborators = document.collaborators.filter(
        collab => collab.user.toString() !== userId
      );
      
      await document.save();
      
      res.status(200).json({
        success: true,
        data: document.collaborators
      });
    } catch (error) {
      next(error);
    }
  }
};

// Funciones auxiliares

/**
 * Determina el tipo de documento basado en su categoría
 */
function determineDocumentType(documentType) {
  const legalTypes = ['contrato', 'demanda', 'contrademanda', 'afidavit', 'acuerdo', 'testamento'];
  const businessTypes = ['factura', 'presupuesto', 'propuesta', 'plan_negocio'];
  const personalTypes = ['carta', 'curriculum', 'solicitud'];
  
  const lowerType = documentType.toLowerCase();
  
  if (legalTypes.some(type => lowerType.includes(type))) {
    return 'legal';
  } else if (businessTypes.some(type => lowerType.includes(type))) {
    return 'business';
  } else if (personalTypes.some(type => lowerType.includes(type))) {
    return 'personal';
  } else {
    return 'other';
  }
}

/**
 * Extrae las partes involucradas de la información del usuario
 */
function extractParties(userInfo) {
  const parties = [];
  
  // Añadir partes basadas en la información proporcionada
  if (userInfo.parties && Array.isArray(userInfo.parties)) {
    return userInfo.parties;
  }
  
  // Intentar extraer partes de otros campos
  if (userInfo.name) {
    parties.push({
      name: userInfo.name,
      role: 'principal',
      contact: userInfo.email || userInfo.phone || ''
    });
  }
  
  if (userInfo.otherParty) {
    parties.push({
      name: userInfo.otherParty.name || 'Otra parte',
      role: userInfo.otherParty.role || 'contraparte',
      contact: userInfo.otherParty.contact || ''
    });
  }
  
  return parties;
}

/**
 * Extrae palabras clave basadas en el tipo de documento y la información del usuario
 */
function extractKeywords(documentType, userInfo) {
  const keywords = [documentType];
  
  // Añadir palabras clave basadas en el tipo de documento
  switch (determineDocumentType(documentType)) {
    case 'legal':
      keywords.push('legal', 'jurídico', 'contrato');
      break;
    case 'business':
      keywords.push('negocio', 'comercial', 'empresa');
      break;
    case 'personal':
      keywords.push('personal', 'individual');
      break;
  }
  
  // Añadir palabras clave de la información del usuario
  if (userInfo.keywords && Array.isArray(userInfo.keywords)) {
    keywords.push(...userInfo.keywords);
  }
  
  return keywords;
}

/**
 * Verifica si un usuario está autorizado para acceder a un documento
 */
function isAuthorizedForDocument(user, document) {
  // El creador siempre tiene acceso
  if (document.creator.toString() === user.id) {
    return true;
  }
  
  // Los administradores tienen acceso a todos los documentos
  if (user.role === 'admin') {
    return true;
  }
  
  // Verificar si es colaborador
  return document.collaborators.some(collab => collab.user.toString() === user.id);
}

/**
 * Verifica si un usuario puede editar un documento
 */
function canEditDocument(user, document) {
  // El creador siempre puede editar
  if (document.creator.toString() === user.id) {
    return true;
  }
  
  // Los administradores pueden editar todos los documentos
  if (user.role === 'admin') {
    return true;
  }
  
  // Verificar si es colaborador con permisos de edición
  return document.collaborators.some(
    collab => collab.user.toString() === user.id && 
    (collab.permissions === 'edit' || collab.permissions === 'sign')
  );
}

/**
 * Extrae el contenido del documento de una respuesta de conversación
 */
function extractDocumentFromConversation(message) {
  // Buscar el documento entre delimitadores
  const documentRegex = /```([\s\S]*?)```/;
  const match = message.match(documentRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Si no hay delimitadores, usar todo el mensaje
  return message;
}

/**
 * Extrae el título del documento de una conversación
 */
function extractTitleFromConversation(history, finalMessage) {
  // Buscar título en el mensaje final
  const titleRegex = /[Tt]ítulo:?\s*([^\n]+)/;
  const match = finalMessage.match(titleRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Buscar en el historial
  for (let i = history.length - 1; i >= 0; i--) {
    const historyMatch = history[i].content.match(titleRegex);
    if (historyMatch && historyMatch[1]) {
      return historyMatch[1].trim();
    }
  }
  
  // Título por defecto
  return `Documento generado - ${new Date().toLocaleDateString()}`;
}

/**
 * Determina el tipo de documento a partir de una conversación
 */
function determineDocumentTypeFromConversation(history) {
  // Buscar tipo en el historial
  for (let i = 0; i < history.length; i++) {
    if (history[i].role === 'user') {
      const typeMatch = history[i].content.match(/[Tt]ipo de documento:?\s*([^\n]+)/);
      if (typeMatch && typeMatch[1]) {
        return determineDocumentType(typeMatch[1].trim());
      }
      
      // Buscar menciones de tipos de documento
      const content = history[i].content.toLowerCase();
      if (content.includes('contrato') || content.includes('acuerdo') || content.includes('legal')) {
        return 'legal';
      } else if (content.includes('negocio') || content.includes('empresa') || content.includes('comercial')) {
        return 'business';
      } else if (content.includes('personal') || content.includes('carta')) {
        return 'personal';
      }
    }
  }
  
  return 'other';
}

/**
 * Extrae la categoría del documento de una conversación
 */
function extractCategoryFromConversation(history) {
  // Buscar categoría en el historial
  for (let i = 0; i < history.length; i++) {
    if (history[i].role === 'user') {
      const categoryMatch = history[i].content.match(/[Cc]ategoría:?\s*([^\n]+)/);
      if (categoryMatch && categoryMatch[1]) {
        return categoryMatch[1].trim();
      }
      
      // Buscar menciones de tipos específicos
      const content = history[i].content.toLowerCase();
      if (content.includes('contrato')) return 'Contrato';
      if (content.includes('carta')) return 'Carta';
      if (content.includes('demanda')) return 'Demanda';
      if (content.includes('acuerdo')) return 'Acuerdo';
    }
  }
  
  return 'General';
}

/**
 * Extrae el idioma del documento de una conversación
 */
function extractLanguageFromConversation(history) {
  // Buscar idioma en el historial
  for (let i = 0; i < history.length; i++) {
    if (history[i].role === 'user') {
      const langMatch = history[i].content.match(/[Ii]dioma:?\s*([^\n]+)/);
      if (langMatch && langMatch[1]) {
        const lang = langMatch[1].trim().toLowerCase();
        return lang.includes('español') || lang.includes('spanish') ? 'es' : 
               lang.includes('inglés') || lang.includes('english') ? 'en' : 'es';
      }
    }
  }
  
  return 'es'; // Español por defecto
}

/**
 * Extrae la jurisdicción del documento de una conversación
 */
function extractJurisdictionFromConversation(history) {
  // Buscar jurisdicción en el historial
  for (let i = 0; i < history.length; i++) {
    if (history[i].role === 'user') {
      const jurisdictionMatch = history[i].content.match(/[Jj]urisdicción:?\s*([^\n]+)/);
      if (jurisdictionMatch && jurisdictionMatch[1]) {
        return jurisdictionMatch[1].trim();
      }
    }
  }
  
  return 'general';
}

/**
 * Extrae las partes involucradas de una conversación
 */
function extractPartiesFromConversation(history) {
  const parties = [];
  
  // Buscar partes en el historial
  for (let i = 0; i < history.length; i++) {
    if (history[i].role === 'user') {
      // Buscar menciones de partes
      const partyMatches = history[i].content.match(/[Pp]arte[s]?:?\s*([^\n]+)/g);
      if (partyMatches) {
        for (const match of partyMatches) {
          const partyInfo = match.split(':')[1].trim();
          const parts = partyInfo.split(',');
          
          if (parts.length >= 1) {
            parties.push({
              name: parts[0].trim(),
              role: parts.length >= 2 ? parts[1].trim() : 'parte',
              contact: parts.length >= 3 ? parts[2].trim() : ''
            });
          }
        }
      }
    }
  }
  
  return parties;
}

/**
 * Extrae palabras clave de una conversación
 */
function extractKeywordsFromConversation(history) {
  const keywords = [];
  
  // Buscar palabras clave en el historial
  for (let i = 0; i < history.length; i++) {
    if (history[i].role === 'user') {
      const keywordMatch = history[i].content.match(/[Pp]alabras clave:?\s*([^\n]+)/);
      if (keywordMatch && keywordMatch[1]) {
        const keywordList = keywordMatch[1].split(',');
        keywords.push(...keywordList.map(k => k.trim()));
      }
    }
  }
  
  // Añadir palabras clave basadas en el tipo de documento
  const documentType = determineDocumentTypeFromConversation(history);
  switch (documentType) {
    case 'legal':
      keywords.push('legal', 'jurídico', 'contrato');
      break;
    case 'business':
      keywords.push('negocio', 'comercial', 'empresa');
      break;
    case 'personal':
      keywords.push('personal', 'individual');
      break;
  }
  
  return keywords;
}

module.exports = documentController;
