const mongoose = require('mongoose')
const { AccessToken } = require('livekit-server-sdk')

const Campaign = require('../models/Campaign')
const OfficialNews = require('../models/OfficialNews')
const HealthTip = require('../models/HealthTip')
const LiveTeachingEvent = require('../models/LiveTeachingEvent')
const LiveTeachingQuestion = require('../models/LiveTeachingQuestion')
const SavedItem = require('../models/SavedItem')
const { logAudit } = require('../utils/audit')
const { notifyUser } = require('../utils/notify')

const PUBLIC_HEALTH_HUB_ROOM = 'public_health_hub'
const publicHealthEventRoom = (eventId) => `public_health_event_${String(eventId)}`

const campaignPopulate = [
  { path: 'relatedNews', select: 'title slug summary urgencyLevel sourceName publishedAt coverImage status' },
  { path: 'relatedTips', select: 'title shortText category language type imageUrl status' },
  {
    path: 'relatedLiveEvents',
    select:
      'title hostName hostRole organization scheduledAt endAt status streamUrl replayUrl',
  },
]

const newsPopulate = [
  { path: 'relatedCampaigns', select: 'title slug summary status startDate endDate organization' },
  { path: 'relatedTips', select: 'title shortText category language type imageUrl status' },
  {
    path: 'relatedLiveEvents',
    select:
      'title hostName hostRole organization scheduledAt endAt status streamUrl replayUrl',
  },
]

const tipPopulate = [
  { path: 'relatedCampaigns', select: 'title slug summary status startDate endDate organization' },
  { path: 'relatedNews', select: 'title slug summary urgencyLevel sourceName publishedAt status' },
]

const eventPopulate = [
  { path: 'relatedCampaigns', select: 'title slug summary status startDate endDate organization' },
  { path: 'relatedNews', select: 'title slug summary urgencyLevel sourceName publishedAt status' },
  { path: 'relatedTips', select: 'title shortText category language type imageUrl status' },
]

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const slugify = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

const toObjectIdArray = (value) => {
  const items = Array.isArray(value) ? value : []
  return items.filter((item) => mongoose.Types.ObjectId.isValid(item))
}

const toMaterials = (value) => {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => ({
      title: String(item?.title || '').trim(),
      url: String(item?.url || '').trim(),
      type: ['image', 'pdf', 'audio', 'video', 'link', 'other'].includes(item?.type)
        ? item.type
        : 'link',
    }))
    .filter((item) => item.title || item.url)
}

const parseBoolean = (value) => {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return undefined
}

const paginateArray = (items, page = 1, limit = 10) => {
  const currentPage = Math.max(parseInt(page, 10) || 1, 1)
  const perPage = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100)
  const start = (currentPage - 1) * perPage

  return {
    page: currentPage,
    limit: perPage,
    total: items.length,
    hasMore: start + perPage < items.length,
    items: items.slice(start, start + perPage),
  }
}

const emitHub = (io, eventName, payload) => {
  if (!io) return
  io.to(PUBLIC_HEALTH_HUB_ROOM).emit(eventName, payload)
  io.to('admin').emit(eventName, payload)
}

const emitEventRoom = (io, eventId, eventName, payload) => {
  if (!io || !eventId) return
  io.to(publicHealthEventRoom(eventId)).emit(eventName, payload)
  io.to('admin').emit(eventName, payload)
}

const generateUniqueSlug = async (Model, value, excludeId = null) => {
  const base = slugify(value) || `item-${Date.now()}`
  let candidate = base
  let counter = 1

  while (true) {
    const existing = await Model.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).select('_id')

    if (!existing) return candidate
    counter += 1
    candidate = `${base}-${counter}`
  }
}

const findByIdOrSlug = async (Model, idOrSlug, populate = []) => {
  const query = mongoose.Types.ObjectId.isValid(idOrSlug)
    ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
    : { slug: idOrSlug }

  let record = Model.findOne(query)
  populate.forEach((item) => {
    record = record.populate(item)
  })

  return record
}

const computeCampaignStatus = (campaign) => {
  if (campaign.archivedAt) return 'archived'
  if (!campaign.isPublished) return 'draft'

  const now = Date.now()
  const start = new Date(campaign.startDate).getTime()
  const end = new Date(campaign.endDate).getTime()

  if (Number.isFinite(start) && now < start) return 'upcoming'
  if (Number.isFinite(end) && now > end) return 'ended'
  return 'active'
}

const syncCampaignStatus = async (campaign) => {
  if (!campaign) return null
  const nextStatus = computeCampaignStatus(campaign)
  if (campaign.status !== nextStatus) {
    campaign.status = nextStatus
    await campaign.save()
  }
  return campaign
}

const computePublishStatus = (doc) => {
  if (doc.archivedAt) return 'archived'
  return doc.isPublished ? 'published' : 'draft'
}

const syncPublishStatus = async (doc) => {
  if (!doc) return null
  const nextStatus = computePublishStatus(doc)
  if (doc.status !== nextStatus) {
    doc.status = nextStatus
    await doc.save()
  }
  return doc
}

const computeEventStatus = (event) => {
  if (event.status === 'cancelled') return 'cancelled'
  if (!event.isPublished) return 'draft'

  const now = Date.now()
  const start = new Date(event.scheduledAt).getTime()
  const end = new Date(event.endAt).getTime()

  if (Number.isFinite(end) && now >= end) return 'past'
  if (Number.isFinite(start) && now < start) return 'upcoming'
  return 'live'
}

const syncEventStatus = async (event) => {
  if (!event) return null
  const nextStatus = computeEventStatus(event)
  if (event.status !== nextStatus) {
    event.status = nextStatus
    await LiveTeachingEvent.updateOne({ _id: event._id }, { $set: { status: nextStatus } })
  }
  return event
}

const ensureDateRange = (start, end) => {
  if (!start || !end) return false
  return new Date(start).getTime() <= new Date(end).getTime()
}

const ensureVisibleContent = async (model, id) => {
  const item = await model.findById(id)
  if (!item) return null

  if (item.status === 'archived') return item
  if (item.isPublished) return item
  return null
}

const getModelByItemType = (itemType) => {
  const models = {
    campaign: Campaign,
    news: OfficialNews,
    tip: HealthTip,
    live_event: LiveTeachingEvent,
  }

  return models[itemType] || null
}

const attachSavedTargets = async (savedItems) => {
  const groupedIds = {
    campaign: [],
    news: [],
    tip: [],
    live_event: [],
  }

  savedItems.forEach((item) => {
    groupedIds[item.itemType]?.push(item.itemId)
  })

  const [campaigns, news, tips, events] = await Promise.all([
    Campaign.find({ _id: { $in: groupedIds.campaign } }).select(
      'title slug summary status startDate endDate coverImage organization'
    ),
    OfficialNews.find({ _id: { $in: groupedIds.news } }).select(
      'title slug summary status publishedAt urgencyLevel coverImage sourceName'
    ),
    HealthTip.find({ _id: { $in: groupedIds.tip } }).select(
      'title shortText category language type status imageUrl shareText'
    ),
    LiveTeachingEvent.find({ _id: { $in: groupedIds.live_event } }).select(
      'title hostName hostRole organization scheduledAt endAt status streamUrl replayUrl'
    ),
  ])

  const maps = {
    campaign: new Map(campaigns.map((item) => [String(item._id), item])),
    news: new Map(news.map((item) => [String(item._id), item])),
    tip: new Map(tips.map((item) => [String(item._id), item])),
    live_event: new Map(events.map((item) => [String(item._id), item])),
  }

  return savedItems.map((item) => ({
    ...item.toObject(),
    item: maps[item.itemType]?.get(String(item.itemId)) || null,
  }))
}

const notifyEventFollowers = async (req, eventDoc) => {
  const reminders = await SavedItem.find({
    itemType: 'live_event',
    itemId: eventDoc._id,
    status: { $in: ['saved', 'active'] },
    lastNotifiedAt: null,
  })

  for (const reminder of reminders) {
    await notifyUser(req, reminder.userId, {
      type: 'public_health.event_live',
      title: 'Live health teaching event has started',
      message: `${eventDoc.title} is now live.`,
      link: `/public-health/events/${eventDoc._id.toString()}`,
      metadata: { eventId: eventDoc._id.toString() },
    })

    reminder.lastNotifiedAt = new Date()
    if (reminder.reminderDateTime) reminder.status = 'completed'
    await reminder.save()
  }
}

const serializeQuestion = (question) => {
  const obj = question.toObject ? question.toObject() : question

  if (obj.anonymous) {
    obj.askedBy = {
      _id: null,
      name: 'Anonymous',
      role: 'patient',
      verified: false,
    }
  }

  return obj
}

const buildSearchQuery = (search, fields) => {
  const term = String(search || '').trim()
  if (!term) return {}

  const regex = { $regex: escapeRegex(term), $options: 'i' }
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  }
}

const getPublicHealthHome = async (req, res, next) => {
  try {
    const language = String(req.query.language || req.getLocale() || 'en').toLowerCase()

    let campaigns = await Campaign.find({ isPublished: true })
      .sort({ isUrgent: -1, isFeatured: -1, startDate: 1 })
      .limit(20)

    campaigns = await Promise.all(campaigns.map(syncCampaignStatus))
    campaigns = campaigns.filter((item) => ['active', 'upcoming'].includes(item.status)).slice(0, 6)

    let news = await OfficialNews.find({ isPublished: true, status: { $ne: 'archived' } })
      .sort({ urgencyLevel: -1, publishedAt: -1 })
      .limit(8)

    news = await Promise.all(news.map(syncPublishStatus))

    let tips = await HealthTip.find({
      isPublished: true,
      status: { $ne: 'archived' },
      ...(language !== 'all' ? { language: { $in: [language, 'multi'] } } : {}),
    })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(8)

    tips = await Promise.all(tips.map(syncPublishStatus))

    let events = await LiveTeachingEvent.find({ isPublished: true }).sort({ scheduledAt: 1 }).limit(12)
    events = await Promise.all(events.map(syncEventStatus))

    res.json({
      campaigns,
      urgentNews: news.filter((item) => ['high', 'critical'].includes(item.urgencyLevel)).slice(0, 4),
      latestNews: news.slice(0, 6),
      featuredTips: tips.slice(0, 6),
      liveEvents: events.filter((item) => item.status === 'live').slice(0, 3),
      upcomingEvents: events.filter((item) => item.status === 'upcoming').slice(0, 4),
    })
  } catch (err) {
    next(err)
  }
}

const listCampaigns = async (req, res, next) => {
  try {
    const { status = 'all', category, featured, urgent, search, page = 1, limit = 10 } = req.query

    const query = {
      isPublished: true,
      ...buildSearchQuery(search, ['title', 'summary', 'description', 'organization', 'locationText']),
    }

    if (category) query.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' }
    if (parseBoolean(featured) === true) query.isFeatured = true
    if (parseBoolean(urgent) === true) query.isUrgent = true

    let items = await Campaign.find(query)
      .sort({ isUrgent: -1, isFeatured: -1, startDate: 1, createdAt: -1 })
      .populate(campaignPopulate)

    items = await Promise.all(items.map(syncCampaignStatus))

    if (status !== 'all') items = items.filter((item) => item.status === status)

    res.json(paginateArray(items, page, limit))
  } catch (err) {
    next(err)
  }
}

const getCampaign = async (req, res, next) => {
  try {
    const campaign = await findByIdOrSlug(Campaign, req.params.idOrSlug, campaignPopulate)
    if (!campaign) return res.status(404).json({ msg: 'Campaign not found' })

    await syncCampaignStatus(campaign)

    if (!campaign.isPublished && campaign.status !== 'archived') {
      return res.status(404).json({ msg: 'Campaign not found' })
    }

    res.json(campaign)
  } catch (err) {
    next(err)
  }
}

const manageCampaigns = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 20, search } = req.query

    let items = await Campaign.find(buildSearchQuery(search, ['title', 'summary', 'description', 'organization']))
      .sort({ createdAt: -1 })
      .populate(campaignPopulate)

    items = await Promise.all(items.map(syncCampaignStatus))

    if (status !== 'all') items = items.filter((item) => item.status === status)

    res.json(paginateArray(items, page, limit))
  } catch (err) {
    next(err)
  }
}

const createCampaign = async (req, res, next) => {
  try {
    const {
      title,
      summary,
      description,
      category,
      targetAudience,
      organization,
      districtScope,
      startDate,
      endDate,
      coverImage,
      locationText,
      instructions,
      materials,
      isFeatured,
      isUrgent,
      relatedNews,
      relatedTips,
      relatedLiveEvents,
    } = req.body

    if (!title || !summary || !description || !organization || !startDate || !endDate) {
      return res.status(400).json({ msg: 'title, summary, description, organization, startDate and endDate are required' })
    }

    if (!ensureDateRange(startDate, endDate)) {
      return res.status(400).json({ msg: 'endDate must be after startDate' })
    }

    const slug = await generateUniqueSlug(Campaign, title)

    const campaign = await Campaign.create({
      title: String(title).trim(),
      slug,
      summary: String(summary).trim(),
      description: String(description).trim(),
      category: String(category || '').trim(),
      targetAudience: toArray(targetAudience),
      organization: String(organization).trim(),
      districtScope: toArray(districtScope),
      startDate,
      endDate,
      coverImage: String(coverImage || '').trim(),
      locationText: String(locationText || '').trim(),
      instructions: String(instructions || '').trim(),
      materials: toMaterials(materials),
      isFeatured: !!isFeatured,
      isUrgent: !!isUrgent,
      relatedNews: toObjectIdArray(relatedNews),
      relatedTips: toObjectIdArray(relatedTips),
      relatedLiveEvents: toObjectIdArray(relatedLiveEvents),
      isPublished: false,
      status: 'draft',
    })

    await logAudit(req, {
      action: 'public_health.campaign.create',
      targetType: 'campaign',
      targetId: campaign._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:campaignUpdated', {
      action: 'created',
      campaignId: campaign._id.toString(),
      status: campaign.status,
    })

    res.status(201).json(campaign)
  } catch (err) {
    next(err)
  }
}

const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
    if (!campaign) return res.status(404).json({ msg: 'Campaign not found' })

    const fields = [
      'title',
      'summary',
      'description',
      'category',
      'organization',
      'coverImage',
      'locationText',
      'instructions',
    ]

    fields.forEach((field) => {
      if (req.body[field] !== undefined) campaign[field] = String(req.body[field] || '').trim()
    })

    if (req.body.title !== undefined) {
      campaign.slug = await generateUniqueSlug(Campaign, req.body.title, campaign._id)
    }

    if (req.body.targetAudience !== undefined) campaign.targetAudience = toArray(req.body.targetAudience)
    if (req.body.districtScope !== undefined) campaign.districtScope = toArray(req.body.districtScope)
    if (req.body.materials !== undefined) campaign.materials = toMaterials(req.body.materials)
    if (req.body.isFeatured !== undefined) campaign.isFeatured = !!req.body.isFeatured
    if (req.body.isUrgent !== undefined) campaign.isUrgent = !!req.body.isUrgent
    if (req.body.relatedNews !== undefined) campaign.relatedNews = toObjectIdArray(req.body.relatedNews)
    if (req.body.relatedTips !== undefined) campaign.relatedTips = toObjectIdArray(req.body.relatedTips)
    if (req.body.relatedLiveEvents !== undefined) {
      campaign.relatedLiveEvents = toObjectIdArray(req.body.relatedLiveEvents)
    }

    if (req.body.startDate !== undefined) campaign.startDate = req.body.startDate
    if (req.body.endDate !== undefined) campaign.endDate = req.body.endDate

    if (!ensureDateRange(campaign.startDate, campaign.endDate)) {
      return res.status(400).json({ msg: 'endDate must be after startDate' })
    }

    await campaign.save()
    await syncCampaignStatus(campaign)

    await logAudit(req, {
      action: 'public_health.campaign.update',
      targetType: 'campaign',
      targetId: campaign._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:campaignUpdated', {
      action: 'updated',
      campaignId: campaign._id.toString(),
      status: campaign.status,
    })

    res.json(campaign)
  } catch (err) {
    next(err)
  }
}

const publishCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
    if (!campaign) return res.status(404).json({ msg: 'Campaign not found' })

    campaign.isPublished = true
    campaign.archivedAt = null
    await syncCampaignStatus(campaign)

    await logAudit(req, {
      action: 'public_health.campaign.publish',
      targetType: 'campaign',
      targetId: campaign._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:campaignUpdated', {
      action: 'published',
      campaignId: campaign._id.toString(),
      status: campaign.status,
    })

    res.json(campaign)
  } catch (err) {
    next(err)
  }
}

const archiveCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
    if (!campaign) return res.status(404).json({ msg: 'Campaign not found' })

    campaign.archivedAt = new Date()
    campaign.status = 'archived'
    await campaign.save()

    await logAudit(req, {
      action: 'public_health.campaign.archive',
      targetType: 'campaign',
      targetId: campaign._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:campaignUpdated', {
      action: 'archived',
      campaignId: campaign._id.toString(),
      status: campaign.status,
    })

    res.json(campaign)
  } catch (err) {
    next(err)
  }
}

const unarchiveCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
    if (!campaign) return res.status(404).json({ msg: 'Campaign not found' })

    campaign.archivedAt = null
    await syncCampaignStatus(campaign)

    await logAudit(req, {
      action: 'public_health.campaign.unarchive',
      targetType: 'campaign',
      targetId: campaign._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:campaignUpdated', {
      action: 'unarchived',
      campaignId: campaign._id.toString(),
      status: campaign.status,
    })

    res.json(campaign)
  } catch (err) {
    next(err)
  }
}

const listNews = async (req, res, next) => {
  try {
    const {
      category,
      urgency,
      official,
      search,
      status = 'published',
      page = 1,
      limit = 10,
    } = req.query

    const query = {
      ...buildSearchQuery(search, ['title', 'summary', 'body', 'sourceName']),
    }

    if (category) query.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' }
    if (urgency) query.urgencyLevel = urgency
    if (parseBoolean(official) !== undefined) query.isOfficial = parseBoolean(official)

    if (status === 'published') {
      query.isPublished = true
      query.status = { $ne: 'archived' }
    } else if (status === 'archived') {
      query.status = 'archived'
    }

    let items = await OfficialNews.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .populate(newsPopulate)

    items = await Promise.all(items.map(syncPublishStatus))
    if (status === 'all') items = items.filter((item) => item.status !== 'draft')

    res.json(paginateArray(items, page, limit))
  } catch (err) {
    next(err)
  }
}

const getNews = async (req, res, next) => {
  try {
    const item = await findByIdOrSlug(OfficialNews, req.params.idOrSlug, newsPopulate)
    if (!item) return res.status(404).json({ msg: 'News item not found' })

    await syncPublishStatus(item)

    if (item.status === 'draft') return res.status(404).json({ msg: 'News item not found' })

    res.json(item)
  } catch (err) {
    next(err)
  }
}

const manageNews = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 20, search } = req.query

    let items = await OfficialNews.find(buildSearchQuery(search, ['title', 'summary', 'body', 'sourceName']))
      .sort({ createdAt: -1 })
      .populate(newsPopulate)

    items = await Promise.all(items.map(syncPublishStatus))
    if (status !== 'all') items = items.filter((item) => item.status === status)

    res.json(paginateArray(items, page, limit))
  } catch (err) {
    next(err)
  }
}

const createNews = async (req, res, next) => {
  try {
    const {
      title,
      summary,
      body,
      category,
      sourceName,
      sourceUrl,
      urgencyLevel,
      coverImage,
      isOfficial,
      relatedCampaigns,
      relatedTips,
      relatedLiveEvents,
    } = req.body

    if (!title || !summary || !body || !sourceName) {
      return res.status(400).json({ msg: 'title, summary, body and sourceName are required' })
    }

    const { institutionName, institutionBadge } = req.body

    const news = await OfficialNews.create({
      title: String(title).trim(),
      slug: await generateUniqueSlug(OfficialNews, title),
      summary: String(summary).trim(),
      body: String(body).trim(),
      category: String(category || '').trim(),
      sourceName: String(sourceName).trim(),
      sourceUrl: String(sourceUrl || '').trim(),
      urgencyLevel: ['low', 'normal', 'high', 'critical'].includes(urgencyLevel)
        ? urgencyLevel
        : 'normal',
      coverImage: String(coverImage || '').trim(),
      isOfficial: isOfficial === undefined ? true : !!isOfficial,
      institutionName: String(institutionName || '').trim(),
      institutionBadge: String(institutionBadge || '').trim(),
      relatedCampaigns: toObjectIdArray(relatedCampaigns),
      relatedTips: toObjectIdArray(relatedTips),
      relatedLiveEvents: toObjectIdArray(relatedLiveEvents),
      isPublished: false,
      status: 'draft',
    })

    await logAudit(req, {
      action: 'public_health.news.create',
      targetType: 'official_news',
      targetId: news._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:newsUpdated', {
      action: 'created',
      newsId: news._id.toString(),
      status: news.status,
    })

    res.status(201).json(news)
  } catch (err) {
    next(err)
  }
}

const updateNews = async (req, res, next) => {
  try {
    const news = await OfficialNews.findById(req.params.id)
    if (!news) return res.status(404).json({ msg: 'News item not found' })

    const fields = ['title', 'summary', 'body', 'category', 'sourceName', 'sourceUrl', 'coverImage', 'institutionName', 'institutionBadge']

    fields.forEach((field) => {
      if (req.body[field] !== undefined) news[field] = String(req.body[field] || '').trim()
    })

    if (req.body.title !== undefined) {
      news.slug = await generateUniqueSlug(OfficialNews, req.body.title, news._id)
    }

    if (req.body.urgencyLevel !== undefined) {
      news.urgencyLevel = ['low', 'normal', 'high', 'critical'].includes(req.body.urgencyLevel)
        ? req.body.urgencyLevel
        : news.urgencyLevel
    }

    if (req.body.isOfficial !== undefined) news.isOfficial = !!req.body.isOfficial
    if (req.body.relatedCampaigns !== undefined) news.relatedCampaigns = toObjectIdArray(req.body.relatedCampaigns)
    if (req.body.relatedTips !== undefined) news.relatedTips = toObjectIdArray(req.body.relatedTips)
    if (req.body.relatedLiveEvents !== undefined) {
      news.relatedLiveEvents = toObjectIdArray(req.body.relatedLiveEvents)
    }

    await news.save()
    await syncPublishStatus(news)

    await logAudit(req, {
      action: 'public_health.news.update',
      targetType: 'official_news',
      targetId: news._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:newsUpdated', {
      action: 'updated',
      newsId: news._id.toString(),
      status: news.status,
    })

    res.json(news)
  } catch (err) {
    next(err)
  }
}

const publishNews = async (req, res, next) => {
  try {
    const news = await OfficialNews.findById(req.params.id)
    if (!news) return res.status(404).json({ msg: 'News item not found' })

    news.isPublished = true
    news.archivedAt = null
    news.publishedAt = news.publishedAt || new Date()
    await syncPublishStatus(news)

    await logAudit(req, {
      action: 'public_health.news.publish',
      targetType: 'official_news',
      targetId: news._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:newsUpdated', {
      action: 'published',
      newsId: news._id.toString(),
      status: news.status,
    })

    res.json(news)
  } catch (err) {
    next(err)
  }
}

const archiveNews = async (req, res, next) => {
  try {
    const news = await OfficialNews.findById(req.params.id)
    if (!news) return res.status(404).json({ msg: 'News item not found' })

    news.archivedAt = new Date()
    news.status = 'archived'
    await news.save()

    await logAudit(req, {
      action: 'public_health.news.archive',
      targetType: 'official_news',
      targetId: news._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:newsUpdated', {
      action: 'archived',
      newsId: news._id.toString(),
      status: news.status,
    })

    res.json(news)
  } catch (err) {
    next(err)
  }
}

const unarchiveNews = async (req, res, next) => {
  try {
    const news = await OfficialNews.findById(req.params.id)
    if (!news) return res.status(404).json({ msg: 'News item not found' })

    news.archivedAt = null
    await syncPublishStatus(news)

    await logAudit(req, {
      action: 'public_health.news.unarchive',
      targetType: 'official_news',
      targetId: news._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:newsUpdated', {
      action: 'unarchived',
      newsId: news._id.toString(),
      status: news.status,
    })

    res.json(news)
  } catch (err) {
    next(err)
  }
}

const listTips = async (req, res, next) => {
  try {
    const {
      category,
      type,
      featured,
      search,
      status = 'published',
      page = 1,
      limit = 12,
    } = req.query

    const language = String(req.query.language || req.getLocale() || 'en').toLowerCase()

    const query = {
      ...buildSearchQuery(search, ['title', 'shortText', 'longText', 'shareText']),
    }

    if (category) query.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' }
    if (type) query.type = type
    if (parseBoolean(featured) === true) query.isFeatured = true
    if (language !== 'all') query.language = { $in: [language, 'multi'] }

    if (status === 'published') {
      query.isPublished = true
      query.status = { $ne: 'archived' }
    } else if (status === 'archived') {
      query.status = 'archived'
    }

    let items = await HealthTip.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .populate(tipPopulate)

    items = await Promise.all(items.map(syncPublishStatus))
    if (status === 'all') items = items.filter((item) => item.status !== 'draft')

    res.json(paginateArray(items, page, limit))
  } catch (err) {
    next(err)
  }
}

const getTip = async (req, res, next) => {
  try {
    const tip = await HealthTip.findById(req.params.id).populate(tipPopulate)
    if (!tip) return res.status(404).json({ msg: 'Health tip not found' })

    await syncPublishStatus(tip)
    if (tip.status === 'draft') return res.status(404).json({ msg: 'Health tip not found' })

    res.json(tip)
  } catch (err) {
    next(err)
  }
}

const manageTips = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 20, search } = req.query

    let items = await HealthTip.find(buildSearchQuery(search, ['title', 'shortText', 'longText', 'shareText']))
      .sort({ createdAt: -1 })
      .populate(tipPopulate)

    items = await Promise.all(items.map(syncPublishStatus))
    if (status !== 'all') items = items.filter((item) => item.status === status)

    res.json(paginateArray(items, page, limit))
  } catch (err) {
    next(err)
  }
}

const createTip = async (req, res, next) => {
  try {
    const {
      title,
      shortText,
      longText,
      category,
      language,
      audioUrl,
      imageUrl,
      type,
      isFeatured,
      shareText,
      relatedCampaigns,
      relatedNews,
    } = req.body

    if (!title || !shortText || !category || !type) {
      return res.status(400).json({ msg: 'title, shortText, category and type are required' })
    }

    const tip = await HealthTip.create({
      title: String(title).trim(),
      shortText: String(shortText).trim(),
      longText: String(longText || '').trim(),
      category: String(category).trim(),
      language: ['en', 'rw', 'fr', 'multi'].includes(language) ? language : 'en',
      audioUrl: String(audioUrl || '').trim(),
      imageUrl: String(imageUrl || '').trim(),
      type,
      isFeatured: !!isFeatured,
      shareText: String(shareText || '').trim(),
      relatedCampaigns: toObjectIdArray(relatedCampaigns),
      relatedNews: toObjectIdArray(relatedNews),
      isPublished: false,
      status: 'draft',
    })

    await logAudit(req, {
      action: 'public_health.tip.create',
      targetType: 'health_tip',
      targetId: tip._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:tipUpdated', {
      action: 'created',
      tipId: tip._id.toString(),
      status: tip.status,
    })

    res.status(201).json(tip)
  } catch (err) {
    next(err)
  }
}

const updateTip = async (req, res, next) => {
  try {
    const tip = await HealthTip.findById(req.params.id)
    if (!tip) return res.status(404).json({ msg: 'Health tip not found' })

    const fields = ['title', 'shortText', 'longText', 'category', 'audioUrl', 'imageUrl', 'shareText']
    fields.forEach((field) => {
      if (req.body[field] !== undefined) tip[field] = String(req.body[field] || '').trim()
    })

    if (req.body.language !== undefined && ['en', 'rw', 'fr', 'multi'].includes(req.body.language)) {
      tip.language = req.body.language
    }
    if (req.body.type !== undefined && ['myth_fact', 'quick_tip', 'danger_sign', 'prevention', 'checklist'].includes(req.body.type)) {
      tip.type = req.body.type
    }
    if (req.body.isFeatured !== undefined) tip.isFeatured = !!req.body.isFeatured
    if (req.body.relatedCampaigns !== undefined) tip.relatedCampaigns = toObjectIdArray(req.body.relatedCampaigns)
    if (req.body.relatedNews !== undefined) tip.relatedNews = toObjectIdArray(req.body.relatedNews)

    await tip.save()
    await syncPublishStatus(tip)

    await logAudit(req, {
      action: 'public_health.tip.update',
      targetType: 'health_tip',
      targetId: tip._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:tipUpdated', {
      action: 'updated',
      tipId: tip._id.toString(),
      status: tip.status,
    })

    res.json(tip)
  } catch (err) {
    next(err)
  }
}

const publishTip = async (req, res, next) => {
  try {
    const tip = await HealthTip.findById(req.params.id)
    if (!tip) return res.status(404).json({ msg: 'Health tip not found' })

    tip.isPublished = true
    tip.archivedAt = null
    await syncPublishStatus(tip)

    await logAudit(req, {
      action: 'public_health.tip.publish',
      targetType: 'health_tip',
      targetId: tip._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:tipUpdated', {
      action: 'published',
      tipId: tip._id.toString(),
      status: tip.status,
    })

    res.json(tip)
  } catch (err) {
    next(err)
  }
}

const archiveTip = async (req, res, next) => {
  try {
    const tip = await HealthTip.findById(req.params.id)
    if (!tip) return res.status(404).json({ msg: 'Health tip not found' })

    tip.archivedAt = new Date()
    tip.status = 'archived'
    await tip.save()

    await logAudit(req, {
      action: 'public_health.tip.archive',
      targetType: 'health_tip',
      targetId: tip._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:tipUpdated', {
      action: 'archived',
      tipId: tip._id.toString(),
      status: tip.status,
    })

    res.json(tip)
  } catch (err) {
    next(err)
  }
}

const unarchiveTip = async (req, res, next) => {
  try {
    const tip = await HealthTip.findById(req.params.id)
    if (!tip) return res.status(404).json({ msg: 'Health tip not found' })

    tip.archivedAt = null
    await syncPublishStatus(tip)

    await logAudit(req, {
      action: 'public_health.tip.unarchive',
      targetType: 'health_tip',
      targetId: tip._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:tipUpdated', {
      action: 'unarchived',
      tipId: tip._id.toString(),
      status: tip.status,
    })

    res.json(tip)
  } catch (err) {
    next(err)
  }
}

const listEvents = async (req, res, next) => {
  try {
    const { status = 'all', search, page = 1, limit = 10 } = req.query

    const query = {
      isPublished: true,
      ...buildSearchQuery(search, ['title', 'description', 'hostName', 'hostRole', 'organization']),
    }

    let items = await LiveTeachingEvent.find(query)
      .sort({ scheduledAt: 1, createdAt: -1 })
      .populate(eventPopulate)

    items = await Promise.all(items.map(syncEventStatus))
    if (status !== 'all') items = items.filter((item) => item.status === status)
    else items = items.filter((item) => item.status !== 'draft')

    res.json(paginateArray(items, page, limit))
  } catch (err) {
    next(err)
  }
}

const getEvent = async (req, res, next) => {
  try {
    const event = await LiveTeachingEvent.findById(req.params.id).populate(eventPopulate)
    if (!event) return res.status(404).json({ msg: 'Live teaching event not found' })

    await syncEventStatus(event)
    if (event.status === 'draft') return res.status(404).json({ msg: 'Live teaching event not found' })

    const approvedQuestionsCount = await LiveTeachingQuestion.countDocuments({
      eventId: event._id,
      status: { $in: ['approved', 'answered'] },
    })

    res.json({ event, approvedQuestionsCount })
  } catch (err) {
    next(err)
  }
}

const manageEvents = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 20, search } = req.query

    let items = await LiveTeachingEvent.find(
      buildSearchQuery(search, ['title', 'description', 'hostName', 'hostRole', 'organization'])
    )
      .sort({ createdAt: -1 })
      .populate(eventPopulate)

    items = await Promise.all(items.map(syncEventStatus))
    if (status !== 'all') items = items.filter((item) => item.status === status)

    res.json(paginateArray(items, page, limit))
  } catch (err) {
    next(err)
  }
}

const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      hostName,
      hostRole,
      organization,
      scheduledAt,
      endAt,
      streamUrl,
      replayUrl,
      moderationEnabled,
      relatedCampaigns,
      relatedNews,
      relatedTips,
    } = req.body

    if (!title || !description || !hostName || !hostRole || !organization || !scheduledAt || !endAt) {
      return res.status(400).json({ msg: 'title, description, hostName, hostRole, organization, scheduledAt and endAt are required' })
    }

    if (!ensureDateRange(scheduledAt, endAt)) {
      return res.status(400).json({ msg: 'endAt must be after scheduledAt' })
    }

    const event = await LiveTeachingEvent.create({
      title: String(title).trim(),
      description: String(description).trim(),
      hostName: String(hostName).trim(),
      hostRole: String(hostRole).trim(),
      organization: String(organization).trim(),
      scheduledAt,
      endAt,
      streamUrl: String(streamUrl || '').trim(),
      replayUrl: String(replayUrl || '').trim(),
      moderationEnabled: moderationEnabled === undefined ? true : !!moderationEnabled,
      relatedCampaigns: toObjectIdArray(relatedCampaigns),
      relatedNews: toObjectIdArray(relatedNews),
      relatedTips: toObjectIdArray(relatedTips),
      isPublished: false,
      status: 'draft',
    })

    await logAudit(req, {
      action: 'public_health.event.create',
      targetType: 'live_teaching_event',
      targetId: event._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:eventUpdated', {
      action: 'created',
      eventId: event._id.toString(),
      status: event.status,
    })

    res.status(201).json(event)
  } catch (err) {
    next(err)
  }
}

const updateEvent = async (req, res, next) => {
  try {
    const event = await LiveTeachingEvent.findById(req.params.id)
    if (!event) return res.status(404).json({ msg: 'Live teaching event not found' })

    const fields = [
      'title',
      'description',
      'hostName',
      'hostRole',
      'organization',
      'streamUrl',
      'replayUrl',
    ]

    fields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = String(req.body[field] || '').trim()
    })

    if (req.body.scheduledAt !== undefined) event.scheduledAt = req.body.scheduledAt
    if (req.body.endAt !== undefined) event.endAt = req.body.endAt
    if (req.body.moderationEnabled !== undefined) event.moderationEnabled = !!req.body.moderationEnabled
    if (req.body.relatedCampaigns !== undefined) event.relatedCampaigns = toObjectIdArray(req.body.relatedCampaigns)
    if (req.body.relatedNews !== undefined) event.relatedNews = toObjectIdArray(req.body.relatedNews)
    if (req.body.relatedTips !== undefined) event.relatedTips = toObjectIdArray(req.body.relatedTips)

    if (!ensureDateRange(event.scheduledAt, event.endAt)) {
      return res.status(400).json({ msg: 'endAt must be after scheduledAt' })
    }

    await event.save()
    await syncEventStatus(event)

    await logAudit(req, {
      action: 'public_health.event.update',
      targetType: 'live_teaching_event',
      targetId: event._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:eventUpdated', {
      action: 'updated',
      eventId: event._id.toString(),
      status: event.status,
    })

    res.json(event)
  } catch (err) {
    next(err)
  }
}

const publishEvent = async (req, res, next) => {
  try {
    const event = await LiveTeachingEvent.findById(req.params.id)
    if (!event) return res.status(404).json({ msg: 'Live teaching event not found' })

    event.isPublished = true
    await syncEventStatus(event)

    await logAudit(req, {
      action: 'public_health.event.publish',
      targetType: 'live_teaching_event',
      targetId: event._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:eventUpdated', {
      action: 'published',
      eventId: event._id.toString(),
      status: event.status,
    })

    res.json(event)
  } catch (err) {
    next(err)
  }
}

const startEvent = async (req, res, next) => {
  try {
    const event = await LiveTeachingEvent.findById(req.params.id)
    if (!event) return res.status(404).json({ msg: 'Live teaching event not found' })
    if (event.status === 'cancelled') return res.status(400).json({ msg: 'Cancelled events cannot be started' })

    const now = new Date()
    event.isPublished = true
    event.scheduledAt = now
    if (!event.endAt || new Date(event.endAt).getTime() <= now.getTime()) {
      event.endAt = new Date(now.getTime() + 60 * 60 * 1000)
    }
    event.status = 'live'
    await event.save()

    await notifyEventFollowers(req, event)

    await logAudit(req, {
      action: 'public_health.event.start',
      targetType: 'live_teaching_event',
      targetId: event._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:eventStarted', {
      eventId: event._id.toString(),
      title: event.title,
      status: event.status,
      scheduledAt: event.scheduledAt,
      endAt: event.endAt,
    })
    emitEventRoom(req.app.get('io'), event._id, 'publicHealth:eventStarted', {
      eventId: event._id.toString(),
      title: event.title,
      status: event.status,
      scheduledAt: event.scheduledAt,
      endAt: event.endAt,
    })

    res.json(event)
  } catch (err) {
    next(err)
  }
}

const endEvent = async (req, res, next) => {
  try {
    const event = await LiveTeachingEvent.findById(req.params.id)
    if (!event) return res.status(404).json({ msg: 'Live teaching event not found' })

    event.endAt = new Date()
    event.status = 'past'
    await event.save()

    await logAudit(req, {
      action: 'public_health.event.end',
      targetType: 'live_teaching_event',
      targetId: event._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:eventEnded', {
      eventId: event._id.toString(),
      title: event.title,
      status: event.status,
      endAt: event.endAt,
    })
    emitEventRoom(req.app.get('io'), event._id, 'publicHealth:eventEnded', {
      eventId: event._id.toString(),
      title: event.title,
      status: event.status,
      endAt: event.endAt,
    })

    res.json(event)
  } catch (err) {
    next(err)
  }
}

const cancelEvent = async (req, res, next) => {
  try {
    const event = await LiveTeachingEvent.findById(req.params.id)
    if (!event) return res.status(404).json({ msg: 'Live teaching event not found' })

    event.status = 'cancelled'
    await event.save()

    await logAudit(req, {
      action: 'public_health.event.cancel',
      targetType: 'live_teaching_event',
      targetId: event._id,
    })

    emitHub(req.app.get('io'), 'publicHealth:eventUpdated', {
      action: 'cancelled',
      eventId: event._id.toString(),
      status: event.status,
    })

    res.json(event)
  } catch (err) {
    next(err)
  }
}

const listEventQuestions = async (req, res, next) => {
  try {
    const event = await LiveTeachingEvent.findById(req.params.id)
    if (!event) return res.status(404).json({ msg: 'Live teaching event not found' })

    await syncEventStatus(event)
    if (event.status === 'draft') {
      return res.status(404).json({ msg: 'Live teaching event not found' })
    }

    const questions = await LiveTeachingQuestion.find({
      eventId: event._id,
      status: { $in: ['approved', 'answered'] },
    })
      .sort({ createdAt: 1 })
      .populate('askedBy', 'name role verified')
      .populate('answeredBy', 'name role verified')

    res.json(questions.map(serializeQuestion))
  } catch (err) {
    next(err)
  }
}

const manageEventQuestions = async (req, res, next) => {
  try {
    const event = await LiveTeachingEvent.findById(req.params.id)
    if (!event) return res.status(404).json({ msg: 'Live teaching event not found' })

    const query = { eventId: event._id }
    if (req.query.status) query.status = req.query.status

    const questions = await LiveTeachingQuestion.find(query)
      .sort({ createdAt: 1 })
      .populate('askedBy', 'name role verified')
      .populate('moderatedBy', 'name role verified')
      .populate('answeredBy', 'name role verified')

    res.json(questions.map(serializeQuestion))
  } catch (err) {
    next(err)
  }
}

const submitEventQuestion = async (req, res, next) => {
  try {
    const event = await LiveTeachingEvent.findById(req.params.id)
    if (!event) return res.status(404).json({ msg: 'Live teaching event not found' })

    await syncEventStatus(event)
    if (!event.isPublished || event.status !== 'live') {
      return res.status(400).json({ msg: 'Questions can only be submitted while the event is live' })
    }

    const questionText = String(req.body?.questionText || '').trim()
    if (!questionText) return res.status(400).json({ msg: 'questionText is required' })

    const question = await LiveTeachingQuestion.create({
      eventId: event._id,
      askedBy: req.user.id,
      questionText,
      anonymous: !!req.body?.anonymous,
      status: event.moderationEnabled ? 'pending' : 'approved',
      moderatedBy: event.moderationEnabled ? null : req.user.id,
      moderatedAt: event.moderationEnabled ? null : new Date(),
    })

    await logAudit(req, {
      action: 'public_health.event.question.submit',
      targetType: 'live_teaching_question',
      targetId: question._id,
      metadata: { eventId: event._id.toString() },
    })

    const populated = await LiveTeachingQuestion.findById(question._id)
      .populate('askedBy', 'name role verified')
      .populate('moderatedBy', 'name role verified')

    emitEventRoom(req.app.get('io'), event._id, 'publicHealth:eventQuestionSubmitted', {
      eventId: event._id.toString(),
      question: serializeQuestion(populated),
    })

    if (!event.moderationEnabled) {
      emitEventRoom(req.app.get('io'), event._id, 'publicHealth:eventQuestionApproved', {
        eventId: event._id.toString(),
        question: serializeQuestion(populated),
      })
    }

    res.status(201).json(serializeQuestion(populated))
  } catch (err) {
    next(err)
  }
}

const moderateEventQuestion = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'status must be approved or rejected' })
    }

    const question = await LiveTeachingQuestion.findOne({
      _id: req.params.questionId,
      eventId: req.params.id,
    })
      .populate('askedBy', 'name role verified')
      .populate('answeredBy', 'name role verified')

    if (!question) return res.status(404).json({ msg: 'Question not found' })

    question.status = status
    question.moderatedBy = req.user.id
    question.moderatedAt = new Date()
    await question.save()

    await logAudit(req, {
      action: `public_health.event.question.${status}`,
      targetType: 'live_teaching_question',
      targetId: question._id,
      metadata: { eventId: req.params.id },
    })

    const eventName = status === 'approved'
      ? 'publicHealth:eventQuestionApproved'
      : 'publicHealth:eventQuestionRejected'

    emitEventRoom(req.app.get('io'), req.params.id, eventName, {
      eventId: req.params.id,
      question: serializeQuestion(question),
    })

    res.json(serializeQuestion(question))
  } catch (err) {
    next(err)
  }
}

const answerEventQuestion = async (req, res, next) => {
  try {
    const answerText = String(req.body?.answerText || '').trim()
    if (!answerText) return res.status(400).json({ msg: 'answerText is required' })

    const question = await LiveTeachingQuestion.findOne({
      _id: req.params.questionId,
      eventId: req.params.id,
      status: { $ne: 'rejected' },
    })
      .populate('askedBy', 'name role verified')
      .populate('answeredBy', 'name role verified')

    if (!question) return res.status(404).json({ msg: 'Question not found' })

    question.status = 'answered'
    question.answerText = answerText
    question.answeredBy = req.user.id
    question.answeredAt = new Date()
    question.moderatedBy = question.moderatedBy || req.user.id
    question.moderatedAt = question.moderatedAt || new Date()
    await question.save()

    if (question.askedBy?._id) {
      await notifyUser(req, question.askedBy._id, {
        type: 'public_health.event_question_answered',
        title: 'Your live event question was answered',
        message: 'A moderator or host answered your question.',
        link: `/public-health/events/${req.params.id}`,
        metadata: { eventId: req.params.id, questionId: question._id.toString() },
      })
    }

    await logAudit(req, {
      action: 'public_health.event.question.answer',
      targetType: 'live_teaching_question',
      targetId: question._id,
      metadata: { eventId: req.params.id },
    })

    const refreshed = await LiveTeachingQuestion.findById(question._id)
      .populate('askedBy', 'name role verified')
      .populate('answeredBy', 'name role verified')

    emitEventRoom(req.app.get('io'), req.params.id, 'publicHealth:eventQuestionAnswered', {
      eventId: req.params.id,
      question: serializeQuestion(refreshed),
    })

    res.json(serializeQuestion(refreshed))
  } catch (err) {
    next(err)
  }
}

const saveItem = async (req, res, next) => {
  try {
    const { itemType, itemId, reminderDateTime, notificationChannel } = req.body
    if (!itemType || !itemId) return res.status(400).json({ msg: 'itemType and itemId are required' })

    const Model = getModelByItemType(itemType)
    if (!Model) return res.status(400).json({ msg: 'Invalid itemType' })

    const target = await ensureVisibleContent(Model, itemId)
    if (!target) return res.status(404).json({ msg: 'Item not found' })

    const update = {
      reminderDateTime: reminderDateTime || null,
      notificationChannel: ['in_app', 'email', 'sms'].includes(notificationChannel)
        ? notificationChannel
        : 'in_app',
      status: reminderDateTime ? 'active' : 'saved',
    }

    const savedItem = await SavedItem.findOneAndUpdate(
      { userId: req.user.id, itemType, itemId },
      { $set: update, $setOnInsert: { userId: req.user.id, itemType, itemId } },
      { new: true, upsert: true }
    )

    await logAudit(req, {
      action: 'public_health.saved_item.upsert',
      targetType: 'saved_item',
      targetId: savedItem._id,
      metadata: { itemType, itemId },
    })

    const [hydrated] = await attachSavedTargets([savedItem])
    res.status(201).json(hydrated)
  } catch (err) {
    next(err)
  }
}

const listSavedItems = async (req, res, next) => {
  try {
    const { itemType, status } = req.query
    const query = { userId: req.user.id }
    if (itemType) query.itemType = itemType
    if (status) query.status = status

    const items = await SavedItem.find(query).sort({ createdAt: -1 })
    const hydrated = await attachSavedTargets(items)

    res.json(hydrated)
  } catch (err) {
    next(err)
  }
}

const updateSavedItem = async (req, res, next) => {
  try {
    const savedItem = await SavedItem.findOne({ _id: req.params.id, userId: req.user.id })
    if (!savedItem) return res.status(404).json({ msg: 'Saved item not found' })

    if (req.body.reminderDateTime !== undefined) {
      savedItem.reminderDateTime = req.body.reminderDateTime || null
    }

    if (req.body.notificationChannel !== undefined) {
      savedItem.notificationChannel = ['in_app', 'email', 'sms'].includes(req.body.notificationChannel)
        ? req.body.notificationChannel
        : savedItem.notificationChannel
    }

    if (req.body.status !== undefined && ['saved', 'active', 'completed', 'cancelled'].includes(req.body.status)) {
      savedItem.status = req.body.status
    } else if (req.body.reminderDateTime !== undefined) {
      savedItem.status = savedItem.reminderDateTime ? 'active' : 'saved'
    }

    await savedItem.save()

    await logAudit(req, {
      action: 'public_health.saved_item.update',
      targetType: 'saved_item',
      targetId: savedItem._id,
    })

    const [hydrated] = await attachSavedTargets([savedItem])
    res.json(hydrated)
  } catch (err) {
    next(err)
  }
}

const deleteSavedItem = async (req, res, next) => {
  try {
    const savedItem = await SavedItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    if (!savedItem) return res.status(404).json({ msg: 'Saved item not found' })

    await logAudit(req, {
      action: 'public_health.saved_item.delete',
      targetType: 'saved_item',
      targetId: savedItem._id,
    })

    res.json({ msg: 'Saved item removed' })
  } catch (err) {
    next(err)
  }
}

const getLiveKitToken = async (req, res, next) => {
  try {
    const event = await LiveTeachingEvent.findById(req.params.id)
    if (!event) return res.status(404).json({ msg: 'Live teaching event not found' })

    if (event.status !== 'live') {
      return res.status(400).json({ msg: 'This event is not currently live' })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const livekitUrl = process.env.LIVEKIT_URL

    if (!apiKey || !apiSecret || !livekitUrl) {
      return res.status(500).json({ msg: 'LiveKit is not configured on the server' })
    }

    const roomName = `health_event_${event._id}`
    const identity = req.user?.id ? `user_${req.user.id}` : `guest_${Date.now()}`

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: req.user?.name || identity,
      ttl: 3600,
    })

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: false,
      canSubscribe: true,
      canPublishData: true,
    })

    const token = await at.toJwt()

    await logAudit(req, {
      action: 'public_health.event.livekit_join',
      targetType: 'live_teaching_event',
      targetId: event._id,
      metadata: { roomName, identity },
    })

    res.json({ token, roomName, livekitUrl, eventId: event._id })
  } catch (err) {
    next(err)
  }
}

const getHostLiveKitToken = async (req, res, next) => {
  try {
    const event = await LiveTeachingEvent.findById(req.params.id)
    if (!event) return res.status(404).json({ msg: 'Live teaching event not found' })

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const livekitUrl = process.env.LIVEKIT_URL

    if (!apiKey || !apiSecret || !livekitUrl) {
      return res.status(500).json({ msg: 'LiveKit is not configured on the server' })
    }

    const roomName = `health_event_${event._id}`
    const identity = `host_${req.user.id}`

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: req.user?.name || 'Host',
      ttl: 7200,
    })

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: true,
    })

    const token = await at.toJwt()

    await logAudit(req, {
      action: 'public_health.event.livekit_host',
      targetType: 'live_teaching_event',
      targetId: event._id,
      metadata: { roomName, identity },
    })

    res.json({ token, roomName, livekitUrl, eventId: event._id })
  } catch (err) {
    next(err)
  }
}

module.exports = {
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

  getLiveKitToken,
  getHostLiveKitToken,
}