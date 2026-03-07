const express = require('express');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Group = require('../models/Group');
const JoinRequest = require('../models/JoinRequest');
const CircleCreationRequest = require('../models/CircleCreationRequest');
const { logAudit } = require('../utils/audit');
const { notifyUser } = require('../utils/notify');

const router = express.Router();

// ========== Circle Creation Requests ==========

// User requests to create a circle
router.post('/circles/request', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, conditionTag } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ msg: 'Name required' });

    const existing = await CircleCreationRequest.findOne({ requestedBy: req.user.id, status: 'pending' });
    if (existing) return res.status(400).json({ msg: 'You already have a pending circle creation request' });

    const request = await CircleCreationRequest.create({
      requestedBy: req.user.id,
      name: name.trim(),
      description: description?.trim() || '',
      conditionTag: conditionTag?.trim() || '',
      status: 'pending',
    });

    await logAudit(req, { action: 'circle.request_creation', targetType: 'circlecreationrequest', targetId: request._id });

    const io = req.app.get('io');
    if (io) io.to('admin').emit('circle:newCreationRequest', request);

    res.status(201).json({ msg: 'Circle creation request submitted', request });
  } catch (err) {
    next(err);
  }
});

// Admin: list all pending circle creation requests
router.get('/circles/requests', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const requests = await CircleCreationRequest.find({ status: 'pending' })
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// Admin: approve circle creation request
router.post('/circles/requests/:id/approve', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const request = await CircleCreationRequest.findById(req.params.id);
    if (!request || request.status !== 'pending') return res.status(404).json({ msg: 'Request not found or already processed' });

    // Create the circle
    const circle = await Group.create({
      name: request.name,
      description: request.description,
      conditionTag: request.conditionTag,
      privacy: 'private',
      approvalRequired: true,
      type: 'circle',
      moderators: [request.requestedBy],
    });

    request.status = 'approved';
    request.resolvedBy = req.user.id;
    request.resolvedAt = new Date();
    await request.save();

    await logAudit(req, { action: 'circle.approve_creation', targetType: 'circle', targetId: circle._id });

    await notifyUser(req, request.requestedBy, {
      type: 'circle.creation_approved',
      title: 'Your circle creation request was approved',
      message: `Your circle "${circle.name}" is now live. You can manage it from the group page.`,
      link: `/group/${circle._id}`,
      metadata: { circleId: circle._id },
    });

    const io = req.app.get('io');
    if (io) io.to('admin').emit('circle:creationRequestResolved', { requestId: request._id, approved: true });

    res.json({ msg: 'Circle created', circle });
  } catch (err) {
    next(err);
  }
});

// Admin: reject circle creation request
router.post('/circles/requests/:id/reject', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const { notes } = req.body;
    const request = await CircleCreationRequest.findById(req.params.id);
    if (!request || request.status !== 'pending') return res.status(404).json({ msg: 'Request not found or already processed' });

    request.status = 'rejected';
    request.resolvedBy = req.user.id;
    request.resolvedAt = new Date();
    request.notes = notes?.trim() || '';
    await request.save();

    await logAudit(req, { action: 'circle.reject_creation', targetType: 'circlecreationrequest', targetId: request._id });

    await notifyUser(req, request.requestedBy, {
      type: 'circle.creation_rejected',
      title: 'Your circle creation request was not approved',
      message: notes || 'Your request was rejected by an admin.',
      link: null,
      metadata: { requestId: request._id },
    });

    const io = req.app.get('io');
    if (io) io.to('admin').emit('circle:creationRequestResolved', { requestId: request._id, approved: false });

    res.json({ msg: 'Request rejected' });
  } catch (err) {
    next(err);
  }
});

// ========== Join Requests for circles/groups ==========

// User requests to join a group/circle (with reason)
router.post('/groups/:id/join-request', authMiddleware, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    if (group.members.includes(req.user.id)) return res.status(400).json({ msg: 'You are already a member' });

    const existing = await JoinRequest.findOne({ user: req.user.id, group: group._id, status: 'pending' });
    if (existing) return res.status(400).json({ msg: 'You already have a pending request' });

    const joinReq = await JoinRequest.create({
      user: req.user.id,
      group: group._id,
      reason: reason?.trim() || '',
      status: 'pending',
    });

    await logAudit(req, { action: 'group.join_request', targetType: 'joinrequest', targetId: joinReq._id });

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('group:newJoinRequest', { request: joinReq, groupId: group._id });
    }

    res.status(201).json({ msg: 'Join request submitted', request: joinReq });
  } catch (err) {
    next(err);
  }
});

// List pending join requests for a group (admin/moderator only)
router.get('/groups/:id/join-requests', authMiddleware, async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    const isMod = group.moderators?.some(id => id.toString() === req.user.id.toString()) || false;
    if (!req.user.isAdmin && !isMod) return res.status(403).json({ msg: 'Only admins or moderators can view join requests' });

    const requests = await JoinRequest.find({ group: group._id, status: 'pending' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// Approve a join request
router.post('/groups/:groupId/join-requests/:requestId/approve', authMiddleware, async (req, res, next) => {
  try {
    const { groupId, requestId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    const isMod = group.moderators?.some(id => id.toString() === req.user.id.toString()) || false;
    if (!req.user.isAdmin && !isMod) return res.status(403).json({ msg: 'Only admins or moderators can approve requests' });

    const joinReq = await JoinRequest.findOne({ _id: requestId, group: groupId, status: 'pending' });
    if (!joinReq) return res.status(404).json({ msg: 'Join request not found' });

    // Add user to group members
    if (!group.members.includes(joinReq.user)) {
      group.members.push(joinReq.user);
      await group.save();
    }

    joinReq.status = 'approved';
    joinReq.resolvedBy = req.user.id;
    joinReq.resolvedAt = new Date();
    await joinReq.save();

    await logAudit(req, { action: 'group.join_approved', targetType: 'joinrequest', targetId: joinReq._id });

    await notifyUser(req, joinReq.user, {
      type: 'group.join_approved',
      title: 'Your join request was approved',
      message: `You are now a member of ${group.name}.`,
      link: `/group/${groupId}`,
      metadata: { groupId },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${joinReq.user.toString()}`).emit('group:joinApproved', { groupId });
    }

    res.json({ msg: 'Request approved' });
  } catch (err) {
    next(err);
  }
});

// Reject a join request
router.post('/groups/:groupId/join-requests/:requestId/reject', authMiddleware, async (req, res, next) => {
  try {
    const { groupId, requestId } = req.params;
    const { notes } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    const isMod = group.moderators?.some(id => id.toString() === req.user.id.toString()) || false;
    if (!req.user.isAdmin && !isMod) return res.status(403).json({ msg: 'Only admins or moderators can reject requests' });

    const joinReq = await JoinRequest.findOne({ _id: requestId, group: groupId, status: 'pending' });
    if (!joinReq) return res.status(404).json({ msg: 'Join request not found' });

    joinReq.status = 'rejected';
    joinReq.resolvedBy = req.user.id;
    joinReq.resolvedAt = new Date();
    joinReq.notes = notes?.trim() || '';
    await joinReq.save();

    await logAudit(req, { action: 'group.join_rejected', targetType: 'joinrequest', targetId: joinReq._id });

    await notifyUser(req, joinReq.user, {
      type: 'group.join_rejected',
      title: 'Your join request was not approved',
      message: notes || 'Your request to join the group was rejected.',
      link: null,
      metadata: { groupId },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${joinReq.user.toString()}`).emit('group:joinRejected', { groupId });
    }

    res.json({ msg: 'Request rejected' });
  } catch (err) {
    next(err);
  }
});

// Remove member from group (admin/mod only)
router.delete('/groups/:groupId/members/:userId', authMiddleware, async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: 'Group not found' });

    const isMod = group.moderators?.some(id => id.toString() === req.user.id.toString()) || false;
    if (!req.user.isAdmin && !isMod) return res.status(403).json({ msg: 'Only admins or moderators can remove members' });

    const index = group.members.findIndex(id => id.toString() === userId);
    if (index === -1) return res.status(404).json({ msg: 'User not a member' });

    group.members.splice(index, 1);
    await group.save();

    await logAudit(req, { action: 'group.remove_member', targetType: 'group', targetId: groupId, metadata: { removedUser: userId } });

    await notifyUser(req, userId, {
      type: 'group.member_removed',
      title: 'You have been removed from the group',
      message: `You are no longer a member of ${group.name}.`,
      link: null,
      metadata: { groupId },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('group:removed', { groupId });
    }

    res.json({ msg: 'Member removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;