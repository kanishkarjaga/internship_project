const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    status: {
      type: String,
      enum: ['open', 'replied', 'closed'],
      default: 'open',
      index: true,
    },
    replies: [
      {
        from: { type: String, enum: ['admin', 'client'], required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        body: { type: String, required: true, maxlength: 4000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    lastReplyAt: { type: Date, default: null },
    source: { type: String, enum: ['dashboard', 'contact'], default: 'dashboard' },
    // contact-form-only fields (optional)
    contactName: { type: String, trim: true, default: '' },
    contactEmail: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

messageSchema.methods.addReply = function addReply({ from, author, body }) {
  this.replies.push({ from, author, body });
  this.lastReplyAt = new Date();
  if (from === 'admin') this.status = 'replied';
};

module.exports = mongoose.model('Message', messageSchema);
