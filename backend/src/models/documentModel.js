const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['legal', 'business', 'personal', 'other'],
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    language: {
      type: String,
      default: 'es',
      enum: ['es', 'en']
    },
    jurisdiction: {
      type: String,
      default: 'general'
    },
    parties: [{
      name: String,
      role: String,
      contact: String
    }],
    keywords: [String],
    customFields: {
      type: Map,
      of: String
    }
  },
  fileUrls: [{
    format: {
      type: String,
      enum: ['pdf', 'docx', 'txt', 'html'],
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'final', 'signed', 'archived'],
    default: 'draft'
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      type: String,
      enum: ['view', 'edit', 'sign'],
      default: 'view'
    }
  }],
  signatureInfo: {
    isSignable: {
      type: Boolean,
      default: false
    },
    signatureStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started'
    },
    docusignEnvelopeId: String,
    signers: [{
      name: String,
      email: String,
      status: {
        type: String,
        enum: ['pending', 'signed', 'declined'],
        default: 'pending'
      },
      signedAt: Date
    }]
  },
  versionHistory: [{
    version: Number,
    content: String,
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    changeDescription: String
  }]
}, {
  timestamps: true
});

// Índices para búsqueda eficiente
documentSchema.index({ title: 'text', content: 'text', 'metadata.keywords': 'text' });
documentSchema.index({ creator: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
