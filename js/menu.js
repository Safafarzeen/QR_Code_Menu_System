document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll("nav ul li button");
    const tabContents = document.querySelectorAll(".tab-content");
    let recipes = []; // Store all recipes fetched from the API

    // Function to render recipes in the correct tab
    const renderRecipes = (category) => {
        const container = document.querySelector(`#${category} .recipe-cards-container`);
        container.innerHTML = ''; // Clear existing recipes in the container

        const filteredRecipes = recipes.filter(recipe => recipe.category.toLowerCase() === category.toLowerCase());
        filteredRecipes.forEach(recipe => {
            const card = document.createElement('div');
            card.classList.add('recipe-card');
            card.innerHTML = `
                <img src="${recipe.image_url}" alt="${recipe.name}" data-img="${recipe.image_url}">
                <h3>${recipe.name}</h3>
                <div class="price"> &#8377; ${recipe.price}</div>
                <button class="add-to-cart" data-id="${recipe.id}" data-name="${recipe.name}" data-price="${recipe.price}">Add to Cart</button>
            `;
            container.appendChild(card);
        });

        // Add event listeners to all 'Add to Cart' buttons
        const addToCartButtons = container.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                // Get the button's recipe data
                const recipeId = button.getAttribute('data-id');
                const recipeName = button.getAttribute('data-name');
                const recipePrice = parseFloat(button.getAttribute('data-price'));

                // Find the corresponding img tag and get the image URL
                const card = button.closest('.recipe-card');
                const recipeImage = card.querySelector('img').getAttribute('data-img'); // Access the data-img attribute of the <img> tag

                // Add recipe to cart (localStorage)
                addToCart(recipeId, recipeName, recipePrice, recipeImage);
            });
        });
    };

    // Function to add items to the cart in localStorage
    const addToCart = (recipeId, recipeName, recipePrice, recipeImage) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        // Check if the recipe already exists in the cart
        const existingItem = cart.find(item => item.recipe_id === recipeId);
        if (existingItem) {
            // If exists, update the quantity
            existingItem.quantity += 1;
        } else {
            // If doesn't exist, add new item
            cart.push({
                recipe_id: recipeId,
                name: recipeName,
                quantity: 1,
                price: recipePrice,
                image_url: recipeImage
            });
        }

        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Show toast notification when item is added to the cart
        showToast(`${recipeName} has been added to your cart! Quantity: ${existingItem ? existingItem.quantity : 1}`, 3000);

        console.log('Cart updated:', cart); // For debugging
    };

    // Fetch recipes from the backend
    const fetchRecipes = async () => {
        try {
            const response = await fetch('https://gddq60js-3000.inc1.devtunnels.ms/recipes/menu');
            const data = await response.json();
            if (data.success) {
                recipes = data.recipes;
                renderRecipes('breakfast'); // Show breakfast by default
            } else {
                console.error('Failed to fetch recipes:', data.error);
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    };

    // Add event listener to each tab button
    tabs.forEach(tab => {
        tab.addEventListener("click", function (e) {
            e.preventDefault();

            // Remove 'active' class from all tabs
            tabs.forEach(tab => {
                tab.classList.remove('active');
            });

            // Add 'active' class to the clicked tab
            tab.classList.add('active');

            // Hide all tab content
            tabContents.forEach(content => {
                content.classList.remove("active");
            });

            // Show clicked tab content
            const target = document.querySelector(`#${tab.getAttribute("data-tab")}`);
            target.classList.add("active");

            // Render recipes for the clicked category
            renderRecipes(tab.getAttribute("data-tab"));
        });
    });

    // Show the "Breakfast" tab by default and add the active class
    const defaultTab = document.querySelector("button[data-tab='breakfast']");
    defaultTab.classList.add('active');
    defaultTab.click();

    // Fetch the recipes when the page loads
    fetchRecipes();
});

// Function to create and show toast
function showToast(message, duration = 3000) {
    // Create a toast element
    const toast = document.createElement('div');
    toast.classList.add('toast'); // Add the toast class for styling

    // Create a message element
    const toastMessage = document.createElement('span');
    toastMessage.textContent = message; // Set the toast message
    toast.appendChild(toastMessage);

    // Create a close button
    const closeButton = document.createElement('span');
    closeButton.classList.add('toast-close');
    closeButton.innerHTML = '&times;'; // Close icon
    closeButton.onclick = () => removeToast(toast); // Close the toast when clicked
    toast.appendChild(closeButton);

    // Append the toast to the toast container
    const toastContainer = document.getElementById('toast-container');
    toastContainer.appendChild(toast);

    // Show the toast with animation
    setTimeout(() => {
        toast.classList.add('show'); // Trigger the animation (fade in)
    }, 10); // Tiny delay to trigger the animation

    // Automatically remove the toast after the specified duration
    setTimeout(() => {
        toast.classList.add('fade-out'); // Trigger fade-out animation
        setTimeout(() => {
            removeToast(toast); // Remove the toast from DOM after animation
        }, 300); // Delay to allow fade-out animation
    }, duration);
}

// Function to remove toast from DOM
function removeToast(toast) {
    toast.remove();
}
