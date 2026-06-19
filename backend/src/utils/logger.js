const ActivityLog = require('../models/ActivityLog');

async function log({ req, actor, actorRole, action, targetType, targetId, meta }) {
  try {
    await ActivityLog.create({
      actor: actor || null,
      actorRole: actorRole || 'anonymous',
      action,
      targetType: targetType || '',
      targetId: targetId ? String(targetId) : '',
      meta: meta || {},
      ip: req?.ip || '',
    });
  } catch (err) {
    // Logging should never break a request
    console.error('[log] failed:', err.message);
  }
}

module.exports = { log };
