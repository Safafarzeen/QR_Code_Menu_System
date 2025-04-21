function toggleForm() {
    document.getElementById("login-box").style.display =
        document.getElementById("login-box").style.display === "none" ? "block" : "none";
    document.getElementById("signup-box").style.display =
        document.getElementById("signup-box").style.display === "none" ? "block" : "none";
}

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const res = await fetch("https://6tt32vsz-3000.inc1.devtunnels.ms/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    
    if (data.token) {
        localStorage.setItem("token", JSON.stringify(data.token));  // Store full response in localStorage
        alert("Login successful!");
        window.location.href = "admin.html";

    } else {
        alert(data.message);
    }
}

async function signup() {
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    const res = await fetch("https://6tt32vsz-3000.inc1.devtunnels.ms/signup", {  // Updated URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    alert(data.message);
}
