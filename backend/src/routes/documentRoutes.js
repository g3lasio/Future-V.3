const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const documentController = require('../controllers/documentController');
const multer = require('multer');
const path = require('path');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(process.env.DOCUMENT_STORAGE_PATH || './public/documents'));
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: function(req, file, cb) {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, DOC, DOCX y TXT'));
    }
  }
});

// Rutas para generación de documentos
router.post('/generate', authenticate, documentController.generateDocument);
router.post('/generate/template', authenticate, documentController.generateFromTemplate);
router.post('/generate/conversation', authenticate, documentController.startGenerationConversation);
router.post('/generate/conversation/:id', authenticate, documentController.continueGenerationConversation);

// Rutas para análisis de documentos
router.post('/analyze', authenticate, upload.single('document'), documentController.analyzeDocument);
router.post('/analyze/summary', authenticate, upload.single('document'), documentController.generateSummary);
router.post('/analyze/extract', authenticate, upload.single('document'), documentController.extractInformation);

// Rutas para gestión de documentos
router.get('/', authenticate, documentController.getAllDocuments);
router.get('/user', authenticate, documentController.getUserDocuments);
router.get('/:id', authenticate, documentController.getDocumentById);
router.put('/:id', authenticate, documentController.updateDocument);
router.delete('/:id', authenticate, documentController.deleteDocument);
router.post('/:id/version', authenticate, documentController.createNewVersion);
router.get('/:id/versions', authenticate, documentController.getDocumentVersions);
router.get('/:id/version/:versionId', authenticate, documentController.getSpecificVersion);

// Rutas para exportación de documentos
router.get('/:id/export/pdf', authenticate, documentController.exportToPdf);
router.get('/:id/export/docx', authenticate, documentController.exportToDocx);
router.get('/:id/export/txt', authenticate, documentController.exportToTxt);

// Rutas para firma de documentos
router.post('/:id/sign/prepare', authenticate, documentController.prepareForSigning);
router.get('/:id/sign/status', authenticate, documentController.getSigningStatus);
router.post('/:id/sign/complete', authenticate, documentController.completeSigningProcess);

// Rutas para compartir documentos
router.post('/:id/share', authenticate, documentController.shareDocument);
router.get('/:id/collaborators', authenticate, documentController.getCollaborators);
router.put('/:id/collaborator/:userId', authenticate, documentController.updateCollaboratorPermissions);
router.delete('/:id/collaborator/:userId', authenticate, documentController.removeCollaborator);

module.exports = router;
