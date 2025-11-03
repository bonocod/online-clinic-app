const HealthLog = require('../models/HealthLog')

const createLog = async (req, res, next) => {
  try {
    const { vitals, notes } = req.body
    if (!vitals || typeof vitals !== 'object')
      return res.status(400).json({ msg: req.__('logs.vitals_required') })

    const log = new HealthLog({ userId: req.user.id, vitals, notes })
    await log.save()
    res.status(201).json({ log, msg: req.__('logs.log_created') })
  } catch (err) {
    next(err)
  }
}

const getLog = async (req, res, next) => {
  try {
    const log = await HealthLog.findOne({ _id: req.params.id, userId: req.user.id })
    if (!log) return res.status(404).json({ msg: req.__('logs.log_not_found') })
    res.json({ log })
  } catch (err) {
    next(err)
  }
}

module.exports = { createLog,  getLog }