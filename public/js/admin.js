import { db } from "./firebase.js";
import { collection, getDocs, doc, updateDoc }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let vendorList = document.getElementById("vendorList");

async function loadVendors() {
  const usersSnapshot = await getDocs(collection(db, "users"));

  let total = 0;
  let verified = 0;
  let pending = 0;
  let rejected = 0;

  vendorList.innerHTML = "";

  usersSnapshot.forEach((userDoc) => {
    let userData = userDoc.data();

    if (userData.role === "vendor") {
      total++;

      let statusHtml = '';
      if (userData.isVerified === true) {
        verified++;
        statusHtml = '<span class="badge bg-success">Verified</span>';
      } else if (userData.isVerified === false) {

        pending++;
        statusHtml = '<span class="badge bg-warning text-dark">Pending</span>';
      }

      let div = document.createElement("div");
      div.className = "vendor-card";

      let actionButtons = '';
      if (userData.isVerified) {
        actionButtons = `<button class="reject" onclick="toggleVendorStatus('${userDoc.id}', false)">Unverify / Reject</button>`;
      } else {
        actionButtons = `<button class="verify" onclick="toggleVendorStatus('${userDoc.id}', true)">Verify</button>`;
      }

      div.innerHTML = `
        <div class="vendor-info">
            <h5>${userData.fullName || userData.name || 'Unknown Vendor'}</h5>
            <p><i class="fas fa-envelope"></i> ${userData.email}</p>
            <div class="vendor-status">Status: ${statusHtml}</div>
        </div>
        <div class="vendor-actions">
            ${actionButtons}
        </div>
      `;

      vendorList.appendChild(div);
    }
  });

  updateStats(total, verified, pending);
}

function updateStats(total, verified, pending) {
  if (document.getElementById('totalVendors')) document.getElementById('totalVendors').innerText = total;
  if (document.getElementById('verifiedVendors')) document.getElementById('verifiedVendors').innerText = verified;
  if (document.getElementById('pendingVendors')) document.getElementById('pendingVendors').innerText = pending;
}


window.toggleVendorStatus = async function (uid, newStatus) {
  try {
    await updateDoc(doc(db, "users", uid), {
      isVerified: newStatus
    });
    console.log(`Vendor ${uid} status updated to ${newStatus}`);

    loadVendors();
  } catch (error) {
    console.error("Error updating vendor:", error);
    alert("Error updating vendor status: " + error.message);
  }
}

window.logout = async function () {
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      await firebase.auth().signOut();
    }
    localStorage.removeItem('user');
    window.location.href = "/pages/login.html";
  } catch (error) {
    console.error("Logout error", error);
    localStorage.removeItem('user');
    window.location.href = "/pages/login.html";
  }
};

loadVendors();
