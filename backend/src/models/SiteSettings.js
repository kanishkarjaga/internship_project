const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: 'global', unique: true },
    businessName: { type: String, default: 'StitchWorks Embroidery' },
    tagline: { type: String, default: 'Computer-precise embroidery, custom-made.' },
    contactEmail: { type: String, default: 'hello@embroidery.local' },
    contactPhone: { type: String, default: '+1 555 0100' },
    address: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    aboutText: {
      type: String,
      default:
        'We specialize in high-quality computer embroidery for apparel, accessories, gifts, and custom one-offs.',
    },
    socials: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    notifications: {
      notifyOnContact: { type: Boolean, default: true },
      notifyOnClientMessage: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne({ singletonKey: 'global' });
  if (!doc) doc = await this.create({ singletonKey: 'global' });
  return doc;
};

module.exports = mongoose.model('SiteSettings', settingsSchema);
