const Ticket = require('../models/Ticket');
const KBArticle = require('../models/KBArticle');
const { suggestReply } = require('../utils/aiHelper');

/**
 * @desc    Generate AI Suggested Reply for a specific Ticket
 * @route   POST /api/ai/suggest/:ticketId
 * @access  Private (Agent/Admin only)
 */
const getSuggestedReply = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Step 1: Scan Knowledge Base for matching context
    // We can search KB articles using the ticket title and words from the description
    // This is simple keyword matching (retrieval step in RAG)
    const keywords = ticket.title.split(' ').slice(0, 5).join(' ');
    
    let matchingArticles = [];
    try {
      matchingArticles = await KBArticle.find(
        { $text: { $search: keywords } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(3);
    } catch (err) {
      // RegEx fallback search if text index is not ready
      const regex = new RegExp(ticket.title.split(' ')[0], 'i');
      matchingArticles = await KBArticle.find({
        $or: [{ title: regex }, { content: regex }],
      }).limit(3);
    }

    // Step 2: Feed ticket details and KB context into AI engine
    const aiResponse = await suggestReply(
      { title: ticket.title, description: ticket.description },
      matchingArticles,
      ticket.customerTier || 'free'
    );

    return res.json({
      success: true,
      suggestedReply: aiResponse,
      referencedArticlesCount: matchingArticles.length,
      referencedArticles: matchingArticles.map(a => ({ id: a._id, title: a.title })),
    });
  } catch (error) {
    console.error('Suggest Reply Controller Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSuggestedReply,
};


