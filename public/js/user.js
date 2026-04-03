import { db } from "./firebase.js";
import { collection, onSnapshot, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let products = [];
let productList = document.getElementById("productList");
let searchInput = document.getElementById("searchInput");
let filterSelect = document.getElementById("filterSelect");
let loader = document.getElementById("loader");

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function showLoader() {
    if (loader) {
        loader.style.display = 'block';
    }
}

function hideLoader() {
    if (loader) {
        loader.style.display = 'none';
    }
}

const dummyProducts = [
    {
        id: 'dummy-1',
        name: 'Burger Deluxe',
        price: 850,
        category: 'burger',
        images: ['../public/images/products/burger.png'],
        description: 'Juicy beef patty with premium cheese and fresh vegetables.'
    },
    {
        id: 'dummy-2',
        name: 'Pepperoni Pizza',
        price: 1200,
        category: 'pizza',
        images: ['../public/images/products/pizza.png'],
        description: 'Classic pepperoni with mozzarella cheese and tomato sauce.'
    },
    {
        id: 'dummy-3',
        name: 'Crispy Fries',
        price: 350,
        category: 'fries',
        images: ['../public/images/products/fries.png'],
        description: 'Golden brown crispy fries with a touch of sea salt.'
    },
    {
        id: 'dummy-4',
        name: 'Sushi Platter',
        price: 2500,
        category: 'general',
        images: ['../public/images/products/sushi.png'],
        description: 'Assorted fresh sushi rolls with wasabi and ginger.'
    },
    {
        id: 'dummy-5',
        name: 'Pasta Carbonara',
        price: 950,
        category: 'general',
        images: ['../public/images/products/pasta.png'],
        description: 'Creamy pasta with smoked pancetta and parmesan cheese.'
    },
    {
        id: 'dummy-6',
        name: 'Chocolate Lava Cake',
        price: 550,
        category: 'general',
        images: ['../public/images/products/cake.png'],
        description: 'Warm chocolate cake with a gooey molten center.'
    },
    {
        id: 'dummy-7',
        name: 'Strawberry Smoothie',
        price: 450,
        category: 'general',
        images: ['https://images.unsplash.com/photo-1543648964-18ab2573d65a?q=80&w=800&auto=format&fit=crop'],
        description: 'Refreshing blend of fresh strawberries and yogurt.'
    },
    {
        id: 'dummy-8',
        name: 'Grilled Chicken Salad',
        price: 750,
        category: 'general',
        images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'],
        description: 'Healthy grilled chicken breast with organic greens.'
    }
];

function initRealTimeProducts() {
    showLoader();
    const q = query(collection(db, "items"));

    onSnapshot(q, (snapshot) => {
        products = [];
        snapshot.forEach((doc) => {
            let data = doc.data();
            let image = "https://via.placeholder.com/300x200?text=No+Image";
            if (Array.isArray(data.images) && data.images.length > 0) {
                image = data.images[0];
            } else if (data.imageUrl) {
                image = data.imageUrl;
            } else if (data.image) {
                image = data.image;
            }

            products.push({
                id: doc.id,
                name: data.name,
                price: Number(data.price),
                category: data.category || 'general',
                images: [image],
                description: data.description || ''
            });
        });

        // Add dummy products
        products = [...products, ...dummyProducts];

        console.log("Products updated:", products.length);
        filterProducts();
        hideLoader();
    }, (error) => {
        console.error("Error fetching products:", error);
        hideLoader();
        if (productList) {
            productList.innerHTML = `<p class="text-center text-danger">Error loading products.</p>`;
        }
    });
}

function showProducts(list) {
    if (!productList) return;

    productList.innerHTML = "";

    if (list.length === 0) {
        productList.innerHTML = `
          <div class="col-12 text-center py-5">
              <i class="fas fa-utensils fa-4x text-muted mb-3"></i>
              <h3>No products found</h3>
              <p>Try a different search or filter</p>
          </div>
      `;
        return;
    }

    list.forEach(product => {
        let card = document.createElement("div");
        card.className = "col-lg-3 col-md-4 col-sm-6 mb-4";

        card.innerHTML = `
          <div class="card product-card h-100">
              <button class="wishlist-btn" onclick="toggleWishlist('${product.id}')">
                  <i class="far fa-heart"></i>
              </button>
              
              <img src="${product.images[0]}" class="card-img-top product-img" alt="${product.name}" 
                   style="height: 150px; object-fit: cover;"
                   onerror="this.src='https://via.placeholder.com/300x200?text=Food'">
              
              <div class="card-body d-flex flex-column p-3">
                  <h6 class="card-title mb-1 text-truncate">${product.name}</h6>
                  <p class="card-text text-muted small mb-2 text-truncate">${product.description}</p>
                  
                  <div class="mt-auto">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                          <span class="price" style="font-size: 1.1rem;">PKR ${product.price}</span>
                          <div class="rating small">
                              <i class="fas fa-star text-warning"></i> 4.5
                          </div>
                      </div>
                      <button class="btn btn-primary btn-sm w-100" onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price})">
                          <i class="fas fa-cart-plus"></i> Add
                      </button>
                  </div>
              </div>
          </div>
      `;

        productList.appendChild(card);
    });
}

function addToCart(productId, productName, productPrice) {
    const cartItem = {
        id: productId,
        name: productName,
        price: productPrice,
        quantity: 1,
        image: products.find(p => p.id === productId)?.images[0] || ''
    };

    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    if (window.updateCartBadge) {
        window.updateCartBadge();
    }
    showToast(`${productName} added to cart!`);
}

function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const index = wishlist.indexOf(productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        showToast('Removed from wishlist');
    } else {
        wishlist.push(productId);
        showToast('Added to wishlist');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistButtons();
}

function updateWishlistButtons() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
    });
}

function showToast(message) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 9999;
      `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.style.cssText = `
      background: #28a745; color: white; padding: 10px 20px;
      border-radius: 5px; margin-bottom: 10px; animation: slideIn 0.3s ease-out;
  `;
    toast.innerHTML = `<i class="fas fa-check-circle me-2"></i> ${message}`;

    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function filterProducts() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const filterValue = filterSelect ? filterSelect.value : "all";

    let filteredProducts = products;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
    }

    if (filterValue !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === filterValue);
    }

    showProducts(filteredProducts);
}

function init() {
    console.log("Initializing user page with Real-time data...");
    initRealTimeProducts();

    if (searchInput) searchInput.addEventListener('input', filterProducts);
    if (filterSelect) filterSelect.addEventListener('change', filterProducts);

    addStyles();
}

function addStyles() {
}

window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;

document.addEventListener('DOMContentLoaded', init);