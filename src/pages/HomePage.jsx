const React = require("react");
const Header = require("../components/Header.jsx");
const HomeHeader = require("../components/HomeHeader.jsx");
const CategorySection = require("../components/CategorySection.jsx");

/**
 * HomePage - Complete homepage with header, home header, and category sections
 * @param {Array} categoriesWithArticles - Array of objects containing category and articles
 */
const HomePage = ({ categoriesWithArticles = [] }) => {
  // Create breadcrumbs for homepage
  const headerBreadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Garden Guide" }, // Current page (no href)
  ];

  return React.createElement(
    "div",
    {
      className: "homepage",
    },
    [
      // Navigation Header

      // Home Header (Burpee Garden Guide section with category buttons and search)
      React.createElement(HomeHeader, {
        key: "home-header",
      }),

      // Category sections with alternating backgrounds
      ...categoriesWithArticles.map((categoryData, index) =>
        React.createElement(CategorySection, {
          key: categoryData.category.sys.id,
          category: categoryData.category,
          articles: categoryData.articles,
          isEven: index % 2 === 1, // Alternate backgrounds (0=odd/cream, 1=even/white)
        })
      ),
    ]
  );
};

module.exports = HomePage;
