document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.querySelector("#cart-items-container");
    const totalPriceElement = document.querySelector("#total-price");
    const orderButton = document.querySelector("#order-button");

    // Fetch cart data from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Function to render cart items
    const renderCartItems = () => {
        cartItemsContainer.innerHTML = ''; // Clear previous items
        let totalPrice = 0;

        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');

            // Calculate item total price
            const itemTotalPrice = item.price * item.quantity;
            totalPrice += itemTotalPrice;

            cartItem.innerHTML = `
                <img src="${item.image_url}" alt="${item.name}">
                <div class="details">
                    <h3>${item.name}</h3>
                    <div class="quantity-control">
                        <button class="decrease" data-id="${item.recipe_id}">-</button>
                        <p class="quantity">Quantity: <span>${item.quantity}</span></p>
                        <button class="increase" data-id="${item.recipe_id}">+</button>
                    </div>
                    <p class="price">Price: &#8377;${itemTotalPrice}</p>
                </div>
            `;

            cartItemsContainer.appendChild(cartItem);
        });

        totalPriceElement.innerHTML = `Total Price: &#8377; ${totalPrice}`;
    };

    // Function to update the cart in localStorage
    const updateCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
    };

    // Function to update the quantity of an item or remove it if quantity reaches zero
    const updateQuantity = (recipeId, change) => {
        const itemIndex = cart.findIndex(item => item.recipe_id === recipeId);
        if (itemIndex !== -1) {
            cart[itemIndex].quantity += change;

            if (cart[itemIndex].quantity < 1) {
                // Remove item if quantity is less than 1
                cart.splice(itemIndex, 1);
                showToast(`${cart[itemIndex].name} has been removed from your cart!`, 'info'); // Show toast when item is removed
            } else {
                showToast(`${cart[itemIndex].name} quantity updated. New Quantity: ${cart[itemIndex].quantity}`, 'info'); // Show toast when quantity is updated
            }

            updateCart(); // Update the cart display
        }
    };

    // Function to place the order
    const placeOrder = async () => {
        if (cart.length === 0) {
            showToast("Your cart is empty!", 'error'); // Show error toast when cart is empty
            return;
        }

        // Prepare order data
        const orderData = {
            total_price: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
            items: cart.map(item => ({
                recipe_id: item.recipe_id,
                quantity: item.quantity,
                price: item.price
            }))
        };

        try {
            // Send order data to backend
            const response = await fetch('https://rntjlq4b-3000.inc1.devtunnels.ms/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Order placed successfully:', result);

                // Show success message using toast notification
                showToast("Your order has been placed successfully!", 'success');

                // Clear the cart in localStorage
                localStorage.removeItem('cart');

                // Redirect to the home page (index.html) after the success message
                setTimeout(() => {
                    window.location.href = '../index.html'; // Adjust this path to where you want the user to go
                }, 1000); // Wait for the toast to be seen before redirecting
            } else {
                console.error('Failed to place order:', result);
                showToast('Failed to place order', 'error');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            showToast('Error placing order', 'error');
        }
    };

    // Function to show toast notifications
    const showToast = (message, type) => {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        toast.classList.add('toast');
        toast.classList.add(type);  // Add 'success', 'error' or 'info' class for different styles
        toast.innerText = message;

        // Append the toast to the container
        toastContainer.appendChild(toast);

        // Remove the toast after a few seconds
        setTimeout(() => {
            toast.remove();
        }, 1000); // Toast will disappear after 2 seconds
    };

    // Add event listeners for quantity buttons
    cartItemsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('decrease')) {
            const recipeId = event.target.dataset.id;
            updateQuantity(recipeId, -1); // Decrease quantity
        }

        if (event.target.classList.contains('increase')) {
            const recipeId = event.target.dataset.id;
            updateQuantity(recipeId, 1); // Increase quantity
        }
    });

    // Render the cart items when the page loads
    renderCartItems();

    // Add event listener to the order button
    orderButton.addEventListener('click', placeOrder);
});
