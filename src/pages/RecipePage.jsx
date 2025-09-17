import React from "react";
import RichTextRenderer from "../components/RichTextRenderer.jsx";
import Header from "../components/Header.jsx";
import ProductSidebar from "../components/ProductSidebar.jsx";
import RecipeIngredientsList from "../components/RecipeIngredientsList.jsx";
import RecipeInstructionsList from "../components/RecipeInstructionsList.jsx";

const RecipePage = ({ data }) => {
  const {
    title,
    body,
    featuredImage,
    imageAlt,
    publishedAt,
    recipeIngredients,
    instructions,
    metaTitle,
    metaDescription
  } = data || {};

  // Create breadcrumbs for recipe page
  const headerBreadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Recipes", href: "/recipes" },
    { name: title || "Recipe" },
  ];

  // Generate JSON-LD structured data for recipe
  const generateRecipeSchema = () => {
    if (!title || !instructions) return null;

    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": title,
      "description": metaDescription || body?.content?.[0]?.content?.[0]?.value || "",
      "recipeInstructions": instructions.map((instruction, index) => ({
        "@type": "HowToStep",
        "name": `Step ${index + 1}`,
        "text": instruction.replace(/^\d+\.\s*/, "")
      }))
    };

    if (recipeIngredients && Array.isArray(recipeIngredients)) {
      schemaData.recipeIngredient = recipeIngredients.map(ingredient => {
        const ingredientData = ingredient.fields || {};
        const amount = ingredientData.amount || "";
        const name = ingredientData.ingredientName || "";
        return amount ? `${amount} ${name}` : name;
      }).filter(Boolean);
    }

    if (featuredImage?.fields?.file?.url) {
      schemaData.image = featuredImage.fields.file.url.startsWith("//")
        ? `https:${featuredImage.fields.file.url}`
        : featuredImage.fields.file.url;
    }

    if (publishedAt) {
      schemaData.datePublished = new Date(publishedAt).toISOString();
    }

    return schemaData;
  };

  const recipeSchema = generateRecipeSchema();

  return (
    <div className="recipe-page">
      {/* JSON-LD structured data */}
      {recipeSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(recipeSchema)
          }}
        />
      )}

      {/* Header Component */}
      <Header key="header" breadcrumbs={headerBreadcrumbs} />

      {/* Main content wrapper with sidebar */}
      <div
        key="main-wrapper"
        className="recipe-with-sidebar"
        style={{
          maxWidth: "1314px",
          margin: "0 auto",
          padding: "0 1rem",
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
        }}
      >
        {/* Main content column */}
        <div
          key="main-content"
          className="recipe-main-content"
          style={{
            flex: "1",
            minWidth: "0", // Allows content to shrink
          }}
        >
          {/* Recipe Header */}
          <div key="recipe-header" className="recipe-header">
            <div className="recipe-container">
              <h1 key="title" className="recipe-title">
                {title || "Recipe Title"}
              </h1>
              {publishedAt && (
                <time key="date" className="recipe-date">
                  Published {new Date(publishedAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </time>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {featuredImage && (
            <div key="featured-image" className="recipe-image-section">
              <div className="recipe-image-container">
                <img
                  src={
                    featuredImage.fields?.file?.url?.startsWith("//")
                      ? `https:${featuredImage.fields.file.url}`
                      : featuredImage.fields?.file?.url
                  }
                  alt={imageAlt || title}
                  className="recipe-featured-image"
                />
              </div>
            </div>
          )}

          {/* Recipe Body Content */}
          {body && (
            <article key="description" className="recipe-description-section">
              <div className="recipe-description" style={{ fontSize: "19px" }}>
                <RichTextRenderer document={body} />
              </div>
            </article>
          )}

          {/* Recipe Components Section */}
          <div key="recipe-components" className="recipe-components-section">
            {/* Ingredients */}
            {recipeIngredients && (
              <RecipeIngredientsList ingredients={recipeIngredients} />
            )}

            {/* Instructions */}
            {instructions && (
              <RecipeInstructionsList instructions={instructions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;