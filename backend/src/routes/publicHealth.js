const express = require('express')
const auth = require('../middleware/auth')
const isPublicHealthEditor = require('../middleware/isPublicHealthEditor')
const {
  getPublicHealthHome,

  listCampaigns,
  getCampaign,
  manageCampaigns,
  createCampaign,
  updateCampaign,
  publishCampaign,
  archiveCampaign,
  unarchiveCampaign,

  listNews,
  getNews,
  manageNews,
  createNews,
  updateNews,
  publishNews,
  archiveNews,
  unarchiveNews,

  listTips,
  getTip,
  manageTips,
  createTip,
  updateTip,
  publishTip,
  archiveTip,
  unarchiveTip,

  listEvents,
  getEvent,
  manageEvents,
  createEvent,
  updateEvent,
  publishEvent,
  startEvent,
  endEvent,
  cancelEvent,

  listEventQuestions,
  manageEventQuestions,
  submitEventQuestion,
  moderateEventQuestion,
  answerEventQuestion,

  saveItem,
  listSavedItems,
  updateSavedItem,
  deleteSavedItem,
} = require('../controllers/publicHealthController')

const router = express.Router()

router.get('/home', getPublicHealthHome)

router.get('/campaigns', listCampaigns)
router.get('/campaigns/:idOrSlug', getCampaign)

router.get('/news', listNews)
router.get('/news/:idOrSlug', getNews)

router.get('/tips', listTips)
router.get('/tips/:id', getTip)

router.get('/events', listEvents)
router.get('/events/:id', getEvent)
router.get('/events/:id/questions', listEventQuestions)
router.post('/events/:id/questions', auth, submitEventQuestion)

router.get('/saved-items', auth, listSavedItems)
router.post('/saved-items', auth, saveItem)
router.patch('/saved-items/:id', auth, updateSavedItem)
router.delete('/saved-items/:id', auth, deleteSavedItem)

router.use('/manage', auth, isPublicHealthEditor)

router.get('/manage/campaigns', manageCampaigns)
router.post('/manage/campaigns', createCampaign)
router.put('/manage/campaigns/:id', updateCampaign)
router.patch('/manage/campaigns/:id/publish', publishCampaign)
router.patch('/manage/campaigns/:id/archive', archiveCampaign)
router.patch('/manage/campaigns/:id/unarchive', unarchiveCampaign)

router.get('/manage/news', manageNews)
router.post('/manage/news', createNews)
router.put('/manage/news/:id', updateNews)
router.patch('/manage/news/:id/publish', publishNews)
router.patch('/manage/news/:id/archive', archiveNews)
router.patch('/manage/news/:id/unarchive', unarchiveNews)

router.get('/manage/tips', manageTips)
router.post('/manage/tips', createTip)
router.put('/manage/tips/:id', updateTip)
router.patch('/manage/tips/:id/publish', publishTip)
router.patch('/manage/tips/:id/archive', archiveTip)
router.patch('/manage/tips/:id/unarchive', unarchiveTip)

router.get('/manage/events', manageEvents)
router.post('/manage/events', createEvent)
router.put('/manage/events/:id', updateEvent)
router.patch('/manage/events/:id/publish', publishEvent)
router.patch('/manage/events/:id/start', startEvent)
router.patch('/manage/events/:id/end', endEvent)
router.patch('/manage/events/:id/cancel', cancelEvent)

router.get('/manage/events/:id/questions', manageEventQuestions)
router.patch('/manage/events/:id/questions/:questionId/moderate', moderateEventQuestion)
router.patch('/manage/events/:id/questions/:questionId/answer', answerEventQuestion)

module.exports = router