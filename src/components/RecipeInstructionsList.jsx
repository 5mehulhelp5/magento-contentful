
import React from "react";

const RecipeInstructionsList = ({ instructions }) => {
  if (!instructions || !Array.isArray(instructions)) {
    return null;
  }

  return (
    <div className="recipe-instructions-section">
      <h3 className="recipe-section-title">Instructions</h3>
      <ol className="recipe-instructions-list">
        {instructions.map((instruction, index) => {
          // Remove leading numbers if they exist (e.g., "1. " or "2. ")
          const cleanedInstruction = instruction.replace(/^\d+\.\s*/, "");

          return (
            <li key={index} className="recipe-instruction-item">
              <span className="instruction-text">{cleanedInstruction}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default RecipeInstructionsList;