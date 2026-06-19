const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');

const ROOT = path.resolve(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
const DESIGNS = path.join(ROOT, 'designs');
const AVATARS = path.join(ROOT, 'avatars');

for (const dir of [DESIGNS, AVATARS]) {
  fs.mkdirSync(dir, { recursive: true });
}

const DESIGN_MAX = (Number(process.env.MAX_UPLOAD_MB) || 15) * 1024 * 1024;
const AVATAR_MAX = 2 * 1024 * 1024;

const designStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DESIGNS),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '';
    cb(null, `${Date.now()}-${uuid()}${ext}`);
  },
});

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATARS),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuid()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ok =
    /\.(jpe?g|png|gif|webp|bmp|svg|svgz|pdf|ai|eps|dst|pes|exp|vp3|hus|jef)$/i.test(
      file.originalname
    );
  if (!ok) return cb(new Error('Unsupported file type.'));
  cb(null, true);
}

const uploadDesign = multer({
  storage: designStorage,
  fileFilter,
  limits: { fileSize: DESIGN_MAX },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) return cb(new Error('Avatar must be an image.'));
    cb(null, true);
  },
  limits: { fileSize: AVATAR_MAX },
});

module.exports = { uploadDesign, uploadAvatar, ROOT, DESIGNS, AVATARS };
