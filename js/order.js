let ordersData = [];
const storedUser = JSON.parse(localStorage.getItem("token"));

if (!storedUser) {
    alert("Unauthorized! Please login first.");
    window.location.href = "login.html"; // Redirect to login page
}
// Function to fetch orders from API
async function fetchOrders() {
  try {
    const response = await fetch("https://6tt32vsz-3000.inc1.devtunnels.ms/orders");
    const data = await response.json();
    if (data && Array.isArray(data)) {
      ordersData = data;
      renderOrdersTable(data);
    } else {
      console.error("Failed to fetch orders:", data.error);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}

// Function to render orders table
function renderOrdersTable(orders) {
  const ordersTableBody = document.querySelector("#orders-table tbody");
  ordersTableBody.innerHTML = ""; // Clear previous data

  orders.forEach(order => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${new Date(order.order_date).toLocaleString()}</td>
      <td>$${order.total_price}</td>
      <td><button onclick="viewOrderDetails(${order.id})">View Details</button></td>
    `;
    ordersTableBody.appendChild(row);
  });
}

// Function to show the order details in a modal
async function viewOrderDetails(orderId) {
  try {
    const response = await fetch(`https://6tt32vsz-3000.inc1.devtunnels.ms/orders/${orderId}`);
    const data = await response.json();

    if (data && Array.isArray(data)) {
      renderOrderDetailsModal(data);
    } else {
      console.error("Failed to fetch order details:", data.error);
    }
  } catch (error) {
    console.error("Error fetching order details:", error);
  }

  // Show the modal
  document.getElementById("order-modal").style.display = "block";
}

// Function to render the order details inside the modal
function renderOrderDetailsModal(orderDetails) {
  const orderDetailsTableBody = document.querySelector("#order-details-table tbody");
  orderDetailsTableBody.innerHTML = ""; // Clear previous data

  orderDetails.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${(item.price * item.quantity).toFixed(2)}</td>
    `;
    orderDetailsTableBody.appendChild(row);
  });
}

// Close modal when clicked on the close button
document.getElementById("close-modal").addEventListener("click", function () {
  document.getElementById("order-modal").style.display = "none";
});

// Fetch orders when the page loads
document.addEventListener("DOMContentLoaded", function () {
  fetchOrders();
});
