let cart = JSON.parse(localStorage.getItem("cart")) || [];

function loadCart() {
    const cartItems = document.getElementById("cartItems");
    const itemCount = document.getElementById("itemCount");
    const subtotal = document.getElementById("subtotal");
    const total = document.getElementById("total");

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-shopping-cart fa-5x text-muted mb-3"></i>
                <h3>Your cart is empty</h3>
                <p>Add some delicious food items to get started!</p>
                <a href="home.html" class="btn btn-primary">
                    <i class="fas fa-utensils"></i> Browse Menu
                </a>
            </div>
        `;
        itemCount.innerText = "0";
        subtotal.innerText = "0";
        total.innerText = "100";
        return;
    }

    let totalPrice = 0;

    cart.forEach((item, index) => {
        totalPrice += item.price;

        cartItems.innerHTML += `
            <div class="col-md-12 mb-3">
                <div class="card">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-2">
                                <img src="${item.image || 'https://via.placeholder.com/100'}" 
                                     class="img-fluid rounded" 
                                     alt="${item.name}" 
                                     style="width: 100px; height: 100px; object-fit: cover;">
                            </div>
                            <div class="col-md-4">
                                <h5>${item.name}</h5>
                                <p class="text-muted">Item ID: ${item.id}</p>
                            </div>
                            <div class="col-md-3">
                                <p class="price">${item.price} PKR</p>
                            </div>
                            <div class="col-md-3 text-end">
                                <button class="btn btn-danger" onclick="removeFromCart(${index})">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    itemCount.innerText = cart.length;
    subtotal.innerText = totalPrice;
    total.innerText = totalPrice + 100;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

function clearCart() {
    if (confirm("Are you sure you want to clear your cart?")) {
        cart = [];
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Please login to checkout");
        window.location.href = "login.html";
        return;
    }

    alert(`Order placed successfully! Total: ${parseInt(document.getElementById("total").innerText)} PKR`);
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
        cartCount.innerText = cart.length;
    }
}

document.addEventListener("DOMContentLoaded", loadCart);