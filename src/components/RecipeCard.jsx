const { generateRecipeCardHTML } = require("../utils/recipeCardTemplate");

/**
 * RecipeCard - Vanilla HTML recipe card generator
 * @param {Object} recipe - Contentful recipe object
 * @param {string} linkBase - Base URL for recipe links
 * @returns {string} HTML string for the recipe card
 */
const RecipeCard = ({ recipe, linkBase = "" }) => {
  return generateRecipeCardHTML(recipe, linkBase);
};

module.exports = RecipeCard;