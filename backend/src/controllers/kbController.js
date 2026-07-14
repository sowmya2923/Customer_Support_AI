const KBArticle = require('../models/KBArticle');
const { isDbConnected, demoArticles } = require('../utils/demoData');

/**
 * @desc    Create a Knowledge Base article
 * @route   POST /api/kb
 * @access  Private (Agent/Admin only)
 */
const createKBArticle = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide article title and content' });
    }

    const article = await KBArticle.create({
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Knowledge Base article created successfully',
      article,
    });
  } catch (error) {
    console.error('Create KB Article Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all KB articles or search articles by text query
 * @route   GET /api/kb
 * @access  Public
 */
const getKBArticles = async (req, res) => {
  try {
    const { search, category } = req.query;

    if (!isDbConnected()) {
      const needle = (search || '').toLowerCase();
      const articles = demoArticles.filter((article) => {
        const categoryMatch = !category || article.category === category;
        const searchMatch = !needle || article.title.toLowerCase().includes(needle) || article.content.toLowerCase().includes(needle);
        return categoryMatch && searchMatch;
      });
      return res.json({ success: true, count: articles.length, articles });
    }
    let findQuery = {};

    if (category) {
      findQuery.category = category;
    }

    // If search term is present, use text search or regex fallback
    if (search) {
      findQuery.$text = { $search: search };
    }

    let articles;
    if (search) {
      // Sort search results by text score relevance
      articles = await KBArticle.find(findQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .populate('createdBy', 'name email');
    } else {
      articles = await KBArticle.find(findQuery)
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name email');
    }

    return res.json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error('Get KB Articles Error:', error);
    // Regex fallback if text index fails or is in creation state
    try {
      const { search } = req.query;
      const regexQuery = search ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ]
      } : {};
      
      const articles = await KBArticle.find(regexQuery).populate('createdBy', 'name email');
      return res.json({ success: true, count: articles.length, articles });
    } catch (fallbackError) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

/**
 * @desc    Get single KB article details
 * @route   GET /api/kb/:id
 * @access  Public
 */
const getKBArticleById = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const article = demoArticles.find((item) => item._id === req.params.id);
      if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
      return res.json({ success: true, article });
    }

    const article = await KBArticle.findById(req.params.id).populate('createdBy', 'name email');

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    return res.json({ success: true, article });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createKBArticle,
  getKBArticles,
  getKBArticleById,
};
