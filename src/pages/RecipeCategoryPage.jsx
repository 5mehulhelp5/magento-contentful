import React from "react";
import RecipeCard from "../components/RecipeCard.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";
import Header from "../components/Header.jsx";

const RecipeCategoryPage = ({
  recipes = [],
  totalCount = 0,
  allCategories = [],
}) => {
  // Simple breadcrumbs for single "Harvest Recipes" category
  const headerBreadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Garden Guide", href: "/garden-guide" },
    { name: "Harvest Recipes" } // Current page (no href)
  ];

  // Infinite scroll configuration
  const initialRecipeCount = 12;
  const initialRecipes = recipes.slice(0, initialRecipeCount);
  const hasMoreRecipes = recipes.length > initialRecipeCount;

  // Create linkBase for production URLs - uses garden-guide/harvest-recipes pattern
  const linkBase = "garden-guide/harvest-recipes";

  // Use categories directly from Contentful (including manually added recipe category)
  const categoriesWithRecipes = allCategories;

  // Strip down recipe data to essential fields only to prevent Magento truncation
  const optimizedRecipes = recipes.map(recipe => ({
    sys: { id: recipe.sys?.id },
    fields: {
      title: recipe.fields?.title,
      slug: recipe.fields?.slug,
      newSlug: recipe.fields?.newSlug,
      frontendUrl: recipe.fields?.frontendUrl,
      publishedAt: recipe.fields?.publishedAt,
      // Only include one optimized image
      listImageStandard: recipe.fields?.listImageStandard,
      listImage: recipe.fields?.listImage,
      featuredImage: recipe.fields?.featuredImage,
      listImageAlt: recipe.fields?.listImageAlt,
      imageAlt: recipe.fields?.imageAlt,
      // Include minimal body content for description
      body: recipe.fields?.body?.content?.[0] ? {
        content: [recipe.fields.body.content[0]]
      } : null,
      // Include instruction count for metadata
      instructions: recipe.fields?.instructions?.slice(0, 0) || [] // Just for length, not content
    }
  }));

  return (
    <div className="page-layout">
      {/* Header component */}
      <Header
        key="main-header"
        breadcrumbs={headerBreadcrumbs}
        currentPath="/garden-guide/harvest-recipes"
      />
      {/* Header section */}
      <div key="header" className="page-header">
        <div className="container page-header-content">
          {/* Page title */}
          <div key="title-section" className="page-title-section">
            <h1 key="title" className="page-title">
              Harvest Recipes
            </h1>
          </div>
        </div>
      </div>

      {/* Main content area with sidebar and recipes */}
      <div key="main-content" className="container">
        <div className="content-with-sidebar">
          {/* Category Sidebar */}
          <CategorySidebar
            key="category-sidebar"
            categories={categoriesWithRecipes}
            currentCategoryId="7kq3Zq7HxhhfV2kFLkWz8u"
            currentPath="/garden-guide/harvest-recipes"
          />

          {/* Recipes section */}
          <div key="recipes-content" className="articles-main">
            {/* Results count */}
            {totalCount > 0 && (
              <div key="results-count" className="results-count">
                <p className="results-text">
                  Showing{" "}
                  <span
                    key="current-count"
                    className="results-number"
                    id="current-article-count"
                  >
                    {initialRecipes.length.toString()}
                  </span>
                  {" "}of{" "}
                  <span key="total-count" className="results-number">
                    {totalCount.toString()}
                  </span>
                  {totalCount === 1 ? " recipe" : " recipes"}
                </p>
              </div>
            )}

            {/* Recipes Grid */}
            {initialRecipes.length > 0 ? (
              <div
                key="recipe-grid"
                className="articles-grid"
                id="articles-grid"
              >
                {initialRecipes.map((recipe, index) => {
                  const recipeHTML = RecipeCard({
                    recipe,
                    linkBase,
                  });
                  return (
                    <div
                      key={recipe.sys?.id || index}
                      dangerouslySetInnerHTML={{ __html: recipeHTML }}
                    />
                  );
                })}
                {/* Loading indicator for infinite scroll */}
                {hasMoreRecipes && (
                  <div
                    key="loading-indicator"
                    id="loading-indicator"
                    className="loading-indicator"
                    style={{ display: "none" }}
                  >
                    <div key="loading-spinner" className="loading-spinner">
                      Loading more recipes...
                    </div>
                    <button
                      key="load-more-button"
                      className="load-more-button"
                      id="load-more-button"
                      aria-label="Load more recipes"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Empty state */
              <div key="empty-state" className="empty-state">
                <div key="empty-content" className="empty-content">
                  <h3 key="empty-title" className="empty-title">
                    No recipes found
                  </h3>
                  <p key="empty-description" className="empty-description">
                    There are no recipes in this category yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embed recipe data for infinite scroll */}
      <script
        key="article-data"
        type="application/json"
        id="article-data"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            articles: optimizedRecipes,
            linkBase: linkBase,
            initialCount: initialRecipeCount,
            totalCount: totalCount,
          }),
        }}
      />

      {/* Load unified recipe card template */}
      <script
        key="recipe-template-script"
        src={`/recipeCardTemplate.js?v=${Date.now()}`}
      />

      {/* Load infinite scroll JavaScript */}
      <script
        key="infinite-scroll-script"
        src={`/infiniteScroll.js?v=${Date.now()}`}
        defer
      />

      {/* Load category sidebar JavaScript */}
      <script
        key="category-sidebar-script"
        src={`/categorySidebar.js?v=${Date.now()}`}
        defer
      />
    </div>
  );
};

export default RecipeCategoryPage;