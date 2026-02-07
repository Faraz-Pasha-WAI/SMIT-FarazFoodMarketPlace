import { db } from "./firebase.js";
import { collection, getDocs } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const productDiv = document.getElementById("products");

async function loadProducts(){
  const querySnapshot = await getDocs(collection(db,"items"));

  productDiv.innerHTML = "";

  querySnapshot.forEach((doc)=>{
    const p = doc.data();
    productDiv.innerHTML += `
      <div class="card">
        <h4>${p.name}</h4>
        <p>${p.price} PKR</p>
        <img src="${p.imageUrl}" width="150">
        <button onclick="addToCart('${doc.id}')">Buy</button>
      </div>
    `;
  });
}

loadProducts();
