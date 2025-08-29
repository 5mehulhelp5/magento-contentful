const { generateArticleCardHTML } = require("../utils/articleCardTemplate");

/**
 * ArticleCard - Vanilla HTML article card generator
 * @param {Object} article - Contentful article object
 * @param {string} linkBase - Base URL for article links
 * @returns {string} HTML string for the article card
 */
const ArticleCard = ({ article, linkBase = "/preview/article" }) => {
  return generateArticleCardHTML(article, linkBase);
};

module.exports = ArticleCard;