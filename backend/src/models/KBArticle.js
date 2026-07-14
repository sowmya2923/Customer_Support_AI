const mongoose = require('mongoose');

const kbArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add article title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please add article content'],
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      default: 'general',
    },
    tags: [
      {
        type: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index text fields to allow full-text search on knowledge base articles
kbArticleSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('KBArticle', kbArticleSchema);
