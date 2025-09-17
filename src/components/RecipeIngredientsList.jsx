
import React from "react";

const RecipeIngredientsList = ({ ingredients }) => {
  if (!ingredients || !Array.isArray(ingredients)) {
    return null;
  }

  return (
    <div className="recipe-ingredients-section">
      <h3 className="recipe-section-title">Ingredients</h3>
      <ul className="recipe-ingredients-list">
        {ingredients.map((ingredient, index) => {
          const ingredientData = ingredient.fields || {};
          const amount = ingredientData.amount || "";
          const name = ingredientData.ingredientName || "";

          return (
            <li key={index} className="recipe-ingredient-item">
              {amount && <span className="ingredient-amount">{amount}</span>}
              {amount && name && <span className="ingredient-separator"> </span>}
              <span className="ingredient-name">{name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecipeIngredientsList;