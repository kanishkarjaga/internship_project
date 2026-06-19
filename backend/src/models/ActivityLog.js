const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    actorRole: { type: String, enum: ['admin', 'client', 'anonymous'], default: 'anonymous' },
    action: { type: String, required: true, index: true },
    targetType: { type: String, default: '' },
    targetId: { type: String, default: '' },
    meta: { type: Object, default: {} },
    ip: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
