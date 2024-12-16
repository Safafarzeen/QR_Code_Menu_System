// Store the loaded recipes globally
let recipesData = [];

// Variables for the form inputs
const nameInput = document.querySelector("#name");
const categoryInput = document.querySelector("#category");
const priceInput = document.querySelector("#price");
const imageUrlInput = document.querySelector("#image_url");
const submitButton = document.querySelector("#add-recipe-form button");
const formTitle = document.querySelector("#form-title");

let isEditing = false;  // Flag to track edit mode
let editingRecipeId = null;  // Store the ID of the recipe being edited

// Function to fetch recipes and store them in the global array
async function fetchRecipes() {
    try {
        const response = await fetch("https://rntjlq4b-3000.inc1.devtunnels.ms/recipes/menu");
        const data = await response.json();
        if (data.success) {
            recipesData = data.recipes; // Store the fetched recipes in the global array
            renderRecipeCards(data.recipes); // Render the recipes
        } else {
            console.error("Failed to fetch recipes:", data.error);
        }
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}

function renderRecipeCards(recipes) {
    const recipeCardsContainer = document.querySelector("#recipe-cards-container");
    recipeCardsContainer.innerHTML = ""; // Clear previous cards

    recipes.forEach((recipe) => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");
        card.innerHTML = `
            <img src="${recipe.image_url}" alt="${recipe.name}">
            <div class="details">
                <h3>${recipe.name}</h3>
                <p>${recipe.category}</p>
                <p class="price">$${recipe.price}</p>
                <div class="edit-delete-buttons">
                    <button onclick="editRecipe(${recipe.id})">Edit</button>
                    <button onclick="deleteRecipe(${recipe.id})">Delete</button>
                </div>
            </div>
        `;
        recipeCardsContainer.appendChild(card);
    });
}

async function deleteRecipe(id) {
    try {
        const response = await fetch(`https://rntjlq4b-3000.inc1.devtunnels.ms/recipes/${id}`, {
            method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
            alert("Recipe deleted successfully");
            fetchRecipes();  // Refresh the recipe list
        } else {
            console.error("Failed to delete recipe:", data.error);
        }
    } catch (error) {
        console.error("Error deleting recipe:", error);
        alert(`Error deleting recipe: ${error.message}`);
    }
}

// Edit recipe using already loaded data
function editRecipe(id) {
    const recipe = recipesData.find((recipe) => recipe.id === id); // Get the recipe from the stored data
    if (recipe) {
        // Populate the form with the recipe's current data
        nameInput.value = recipe.name;
        categoryInput.value = recipe.category;
        priceInput.value = recipe.price;
        imageUrlInput.value = recipe.image_url;

        // Set editing flag and recipe ID
        isEditing = true;
        editingRecipeId = id;
        formTitle.textContent = "Edit Recipe";
        submitButton.textContent = "Update Recipe";
    } else {
        console.error("Recipe not found");
    }
}

// Add your event listeners inside the DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    const addRecipeForm = document.querySelector("#add-recipe-form");

    // Handle form submission (add or update recipe)
    addRecipeForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const recipeData = {
            name: nameInput.value,
            category: categoryInput.value,
            price: parseFloat(priceInput.value),
            image_url: imageUrlInput.value,
        };

        try {
            let response;
            if (isEditing) {
                // Update the recipe in the local data array
                const recipeIndex = recipesData.findIndex((recipe) => recipe.id === editingRecipeId);
                if (recipeIndex !== -1) {
                    recipesData[recipeIndex] = { ...recipesData[recipeIndex], ...recipeData };
                    alert("Recipe updated successfully!");
                    isEditing = false; // Reset the editing flag
                    submitButton.textContent = "Add Recipe";
                    formTitle.textContent = "Add New Recipe";
                } else {
                    console.error("Recipe not found for updating");
                    return;
                }
            } else {
                // Add a new recipe
                response = await fetch("https://rntjlq4b-3000.inc1.devtunnels.ms/recipes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(recipeData),
                });
            }

            fetchRecipes(); // Refresh the recipe list with updated data
            addRecipeForm.reset(); // Clear the form
        } catch (error) {
            console.error("Error saving recipe:", error);
        }
    });

    // Fetch recipes when the page loads
    fetchRecipes();
});
