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

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p>Your cart is empty.</p>`;
            totalPriceElement.innerHTML = `Total Price: &#8377; 0`;
            return;
        }

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
                const removedItemName = cart[itemIndex].name;
                cart.splice(itemIndex, 1);
                showToast(`${removedItemName} has been removed from your cart!`, 'info');
            } else {
                showToast(`${cart[itemIndex].name} quantity updated. New Quantity: ${cart[itemIndex].quantity}`, 'info');
            }

            updateCart();
        }
    };

    // ✅ Function to place the order (with token included)
    const placeOrder = async () => {
        if (cart.length === 0) {
            showToast("Your cart is empty!", 'error');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showToast("You must be logged in to place an order.", 'error');
            return;
        }

        const orderData = {
            total_price: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
            items: cart.map(item => ({
                recipe_id: item.recipe_id,
                quantity: item.quantity,
                price: item.price
            }))
        };

        try {
            const response = await fetch('https://6tt32vsz-3000.inc1.devtunnels.ms/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // ✅ Added token
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Order placed successfully:', result);
                showToast("Your order has been placed successfully!", 'success');
                localStorage.removeItem('cart');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            } else {
                console.error('Failed to place order:', result);
                showToast(result.error || 'Failed to place order', 'error');
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
        toast.classList.add(type);
        toast.innerText = message;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 1000);
    };

    // Add event listeners for quantity buttons
    cartItemsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('decrease')) {
            const recipeId = event.target.dataset.id;
            updateQuantity(recipeId, -1);
        }

        if (event.target.classList.contains('increase')) {
            const recipeId = event.target.dataset.id;
            updateQuantity(recipeId, 1);
        }
    });

    // Render the cart items when the page loads
    renderCartItems();

    // Add event listener to the order button
    orderButton.addEventListener('click', placeOrder);
});
