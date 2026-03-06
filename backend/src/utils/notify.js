// FILE: backend/src/utils/notify.js
const Notification = require('../models/Notification')

const notifyUser = async (
  req,
  userId,
  { type, title = '', message = '', link = '', metadata = {} }
) => {
  try {
    if (!userId) return null

    const doc = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      metadata,
      read: false,
    })

    const io = req?.app?.get?.('io')
    if (io) {
      io.to(`user_${userId.toString()}`).emit('notification:new', doc)
      // admin can also watch everything live (optional)
      io.to('admin').emit('notification:new', doc)
    }

    return doc
  } catch (e) {
    return null
  }
}

module.exports = { notifyUser }