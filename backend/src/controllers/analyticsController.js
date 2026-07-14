const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { isDbConnected, demoTickets } = require('../utils/demoData');

/**
 * @desc    Get analytics metrics and system audit logs for Managers/Admins
 * @route   GET /api/analytics
 * @access  Private (Agent/Admin only)
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const tickets = demoTickets();
      const openStatuses = ['open', 'ai-reviewed', 'assigned', 'in-progress'];
      const departmentDistribution = { finance: 0, engineering: 0, qa: 0, product: 0, support: 0 };
      const sentimentDistribution = { positive: 0, neutral: 0, frustrated: 0, angry: 0 };
      const tierDistribution = { free: 0, membership: 0, premium: 0 };
      
      tickets.forEach((ticket) => {
        if (ticket.department in departmentDistribution) departmentDistribution[ticket.department] += 1;
        if (ticket.sentiment in sentimentDistribution) sentimentDistribution[ticket.sentiment] += 1;
        const tier = ticket.customerTier || 'free';
        if (tier in tierDistribution) tierDistribution[tier] += 1;
      });

      const rated = tickets.filter((ticket) => ticket.csatRating);
      const satisfied = rated.filter((ticket) => ticket.csatRating >= 4).length;

      return res.status(200).json({
        success: true,
        metrics: {
          totalTickets: tickets.length,
          openTickets: tickets.filter((ticket) => openStatuses.includes(ticket.status)).length,
          resolvedTickets: tickets.filter((ticket) => ticket.status === 'resolved').length,
          closedTickets: tickets.filter((ticket) => ticket.status === 'closed').length,
          averageCsat: rated.length ? Number((rated.reduce((sum, ticket) => sum + ticket.csatRating, 0) / rated.length).toFixed(2)) : 0,
          totalRatingsCount: rated.length,
          averageSlaHours: 2,
          aiUsageCount: tickets.filter((ticket) => ticket.aiSuggestedDrafts?.direct).length,
          customerSatisfactionPct: rated.length ? Math.round((satisfied / rated.length) * 100) : 0,
          topAgents: [],
          departmentDistribution,
          sentimentDistribution,
          tierDistribution,
        },
        auditLogs: [],
      });
    }

    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: { $in: ['open', 'ai-reviewed', 'assigned', 'in-progress'] } });
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
    const closedTickets = await Ticket.countDocuments({ status: 'closed' });

    const departmentLoad = await Ticket.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
    const deptStats = { finance: 0, engineering: 0, qa: 0, product: 0, support: 0 };
    departmentLoad.forEach((item) => {
      if (item._id in deptStats) deptStats[item._id] = item.count;
    });

    const sentimentLoad = await Ticket.aggregate([{ $group: { _id: '$sentiment', count: { $sum: 1 } } }]);
    const sentimentStats = { positive: 0, neutral: 0, frustrated: 0, angry: 0 };
    sentimentLoad.forEach((item) => {
      if (item._id in sentimentStats) sentimentStats[item._id] = item.count;
    });

    const tierLoad = await Ticket.aggregate([{ $group: { _id: '$customerTier', count: { $sum: 1 } } }]);
    const tierStats = { free: 0, membership: 0, premium: 0 };
    tierLoad.forEach((item) => {
      const key = item._id || 'free';
      if (key in tierStats) tierStats[key] = item.count;
    });

    const csatAgg = await Ticket.aggregate([
      { $match: { csatRating: { $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$csatRating' }, totalRated: { $sum: 1 } } },
    ]);
    const averageCsat = csatAgg.length > 0 ? Number(csatAgg[0].avgRating.toFixed(2)) : 0;
    const totalRatingsCount = csatAgg.length > 0 ? csatAgg[0].totalRated : 0;

    const slaAgg = await Ticket.aggregate([
      { $match: { resolvedAt: { $ne: null } } },
      { $project: { durationHours: { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60] } } },
      { $group: { _id: null, avgDuration: { $avg: '$durationHours' } } },
    ]);
    const averageSlaHours = slaAgg.length > 0 ? Number(slaAgg[0].avgDuration.toFixed(1)) : 0;

    const aiUsageCount = await Ticket.countDocuments({ 'aiSuggestedDrafts.direct': { $nin: [null, ''] } });
    const satisfiedRatings = await Ticket.countDocuments({ csatRating: { $gte: 4 } });
    const customerSatisfactionPct = totalRatingsCount ? Math.round((satisfiedRatings / totalRatingsCount) * 100) : 0;

    const topAgentAgg = await Ticket.aggregate([
      { $match: { assignedAgent: { $ne: null }, status: { $in: ['resolved', 'closed'] } } },
      { $group: { _id: '$assignedAgent', resolvedCount: { $sum: 1 }, avgCsat: { $avg: '$csatRating' } } },
      { $sort: { resolvedCount: -1 } },
      { $limit: 5 },
    ]);
    const agentIds = topAgentAgg.map((agent) => agent._id);
    const agentDocs = await User.find({ _id: { $in: agentIds } }).select('name email role');
    const agentMap = new Map(agentDocs.map((agent) => [agent._id.toString(), agent]));
    const topAgents = topAgentAgg.map((agent) => ({
      id: agent._id,
      name: agentMap.get(agent._id.toString())?.name || 'Agent',
      resolvedCount: agent.resolvedCount,
      avgCsat: agent.avgCsat ? Number(agent.avgCsat.toFixed(2)) : 0,
    }));

    const recentAuditLogs = await AuditLog.find()
      .populate('user', 'name role')
      .populate('ticket', 'title')
      .sort({ createdAt: -1 })
      .limit(15);

    return res.status(200).json({
      success: true,
      metrics: {
        totalTickets,
        openTickets,
        resolvedTickets,
        closedTickets,
        averageCsat,
        totalRatingsCount,
        averageSlaHours,
        aiUsageCount,
        customerSatisfactionPct,
        topAgents,
        departmentDistribution: deptStats,
        sentimentDistribution: sentimentStats,
        tierDistribution: tierStats,
      },
      auditLogs: recentAuditLogs,
    });
  } catch (error) {
    console.error('Fetch Analytics Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardAnalytics,
};
