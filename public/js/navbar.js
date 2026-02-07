import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    console.log("navbar.js loaded");

    const user = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const usernameSpan = document.getElementById('username');

    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';

        if (usernameSpan) {
            usernameSpan.innerHTML = `
                <span style="color: white; margin-left: 15px; font-weight: bold;">
                    <i class="fas fa-user-circle"></i> Welcome, ${user.name || 'User'}
                </span>
            `;
        }

        if (user.role === 'admin') {
            addNavLink('Admin', '/pages/admin.html', 'fa-user-shield');
        } else if (user.role === 'vendor' && user.isVerified) {
            addNavLink('Vendor', '/pages/vendor.html', 'fa-store');
        } else {
            if (user.role === 'user') {
                addNavLink('Become a Vendor', '/pages/signup.html', 'fa-handshake');
            }
        }

    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (usernameSpan) usernameSpan.innerHTML = '';

        removeNavLink('Admin');
        removeNavLink('Vendor');

        addNavLink('Become a Vendor', '/pages/signup.html', 'fa-handshake');
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            handleLogout();
        });
    }

    function addNavLink(text, href, iconClass) {
        const nav = document.querySelector('.navbar-nav');
        const existingLink = document.getElementById(`${text.toLowerCase()}Link`);

        if (!existingLink && nav) {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.id = `${text.toLowerCase()}Link`;
            li.innerHTML = `
                <a class="nav-link" href="${href}">
                    <i class="fas ${iconClass}"></i> ${text}
                </a>
            `;

            const logoutItem = nav.querySelector('#logoutBtn').parentElement;
            if (logoutItem) {
                nav.insertBefore(li, logoutItem);
            } else {
                nav.appendChild(li);
            }
        }
    }

    function removeNavLink(text) {
        const link = document.getElementById(`${text.toLowerCase()}Link`);
        if (link) link.remove();
    }
});

async function handleLogout() {
    console.log("Logout clicked");

    try {
        localStorage.removeItem('user');

        if (typeof firebase !== 'undefined' && firebase.auth) {
            await firebase.auth().signOut();
        }

        window.location.href = '/pages/login.html';

    } catch (error) {
        console.error("Logout error:", error);
        localStorage.removeItem('user');
        window.location.href = '/pages/login.html';
    }
}

window.logout = handleLogout;