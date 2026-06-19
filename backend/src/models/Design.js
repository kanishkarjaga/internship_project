const mongoose = require('mongoose');

const CATEGORIES = [
  'floral',
  'geometric',
  'lettering',
  'animals',
  'logos',
  'religious',
  'kids',
  'custom',
];

const designSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120, index: 'text' },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true, minlength: 3, maxlength: 3 },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileMime: { type: String, required: true },
    fileSize: { type: Number, required: true },
    thumbnailUrl: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: true },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

designSchema.index({ title: 'text', description: 'text', tags: 'text' });

designSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Design', designSchema);
