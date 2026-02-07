import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentShopId = null;
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadVendorProfile(user.uid);
    await initShop(user.uid);
  } else {
    window.location.href = "../pages/login.html";
  }
});

async function loadVendorProfile(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();

      document.getElementById("vendorName").textContent = data.fullName || data.name || "Vendor";
      document.getElementById("vendorEmail").textContent = data.email;

      const statusBadge = document.getElementById("vendorStatus");
      if (data.isVerified) {
        statusBadge.textContent = "Verified";
        statusBadge.className = "status-badge status-success";
        statusBadge.style.backgroundColor = "#28a745";
      } else {
        statusBadge.textContent = "Pending Approval";
        statusBadge.className = "status-badge status-warning";
        statusBadge.style.backgroundColor = "#ffc107";
      }
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

async function initShop(uid) {
  const q = query(collection(db, "shops"), where("vendorId", "==", uid));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const shopDoc = querySnapshot.docs[0];
    currentShopId = shopDoc.id;
    const shopData = shopDoc.data();

    document.getElementById("shopName").value = shopData.shopName || "";
    document.getElementById("shopDescription").value = shopData.description || "";
    document.getElementById("shopPhone").value = shopData.phone || "";

    loadItems();
  } else {
    console.log("No shop found for this vendor.");
  }
}

window.createShop = async function () {
  if (!currentUser) return;

  const shopName = document.getElementById("shopName").value;
  const description = document.getElementById("shopDescription").value;
  const phone = document.getElementById("shopPhone").value;

  if (!shopName) {
    alert("Shop name is required!");
    return;
  }

  try {
    if (currentShopId) {
      await updateDoc(doc(db, "shops", currentShopId), {
        shopName,
        description,
        phone
      });
      alert("Shop updated successfully!");
    } else {
      const docRef = await addDoc(collection(db, "shops"), {
        shopName: shopName,
        vendorId: currentUser.uid,
        description: description,
        phone: phone,
        isActive: true,
        createdAt: new Date().toISOString()
      });
      currentShopId = docRef.id;
      alert("Shop created successfully!");
    }
  } catch (error) {
    console.error("Error creating shop:", error);
    alert("Failed to save shop.");
  }
};

window.addItem = async function () {
  if (!currentShopId) {
    alert("Please create a shop first!");
    return;
  }

  const name = document.getElementById("itemName").value;
  const price = document.getElementById("itemPrice").value;
  const image = document.getElementById("itemImage").value;
  const category = document.getElementById("itemCategory").value;
  const desc = document.getElementById("itemDescription").value;

  if (!name || !price) {
    alert("Name and Price are required!");
    return;
  }

  try {
    await addDoc(collection(db, "items"), {
      shopId: currentShopId,
      vendorId: currentUser.uid,
      name: name,
      price: Number(price),
      imageUrl: image || "https://via.placeholder.com/150",
      category: category,
      description: desc,
      createdAt: new Date().toISOString()
    });

    alert("Product added!");
    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
    loadItems();
  } catch (error) {
    console.error("Error adding item:", error);
    alert("Error adding item.");
  }
}

async function loadItems() {
  if (!currentShopId) return;

  const itemList = document.getElementById("itemList");
  itemList.innerHTML = "<p>Loading products...</p>";

  try {
    const q = query(collection(db, "items"), where("shopId", "==", currentShopId));
    const querySnapshot = await getDocs(q);

    itemList.innerHTML = "";

    if (querySnapshot.empty) {
      itemList.innerHTML = "<p>No products added yet.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const item = doc.data();
      const div = document.createElement("div");
      div.className = "vendor-card";
      div.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: center; width: 100%;">
                    <img src="${item.imageUrl}" width="80" height="80" style="object-fit: cover; border-radius: 8px;">
                    <div style="flex-grow: 1;">
                        <h5>${item.name}</h5>
                        <p class="text-muted">${item.category || 'General'} - PKR ${item.price}</p>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-warning" onclick="editItem('${doc.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteItem('${doc.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
      itemList.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading items:", error);
    itemList.innerHTML = "<p>Error loading items.</p>";
  }
}

window.deleteItem = async function (itemId) {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      await deleteDoc(doc(db, "items", itemId));
      loadItems();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete item.");
    }
  }
};

window.editItem = async function (itemId) {
  const itemDoc = await getDoc(doc(db, "items", itemId));
  if (itemDoc.exists()) {
    const data = itemDoc.data();
    document.getElementById("itemName").value = data.name;
    document.getElementById("itemPrice").value = data.price;
    document.getElementById("itemImage").value = data.imageUrl;
    document.getElementById("itemCategory").value = data.category || 'burger';
    document.getElementById("itemDescription").value = data.description || '';

    let newPrice = prompt("Enter new price:", data.price);
    if (newPrice !== null) {
      await updateDoc(doc(db, "items", itemId), {
        price: Number(newPrice)
      });
      loadItems();
    }
  }
};

window.logout = async function () {
  try {
    await signOut(auth);
    localStorage.removeItem('user');
    window.location.href = "../pages/login.html";
  } catch (error) {
    console.error("Logout error", error);
  }
};
