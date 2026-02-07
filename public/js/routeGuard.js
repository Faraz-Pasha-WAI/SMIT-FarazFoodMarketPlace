import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc }
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const currentPage = window.location.pathname;

onAuthStateChanged(auth, async (user) => {
    console.log("Auth state changed. User:", user?.email);

    if (currentPage.includes("login.html") || currentPage.includes("signup.html")) {
        if (user) {
            console.log("User logged in, redirecting from login page...");
            try {
                const snap = await getDoc(doc(db, "users", user.uid));
                if (snap.exists()) {
                    const userData = snap.data();
                    if (userData.role === "admin") {
                        window.location.href = "/pages/admin.html";
                    } else if (userData.role === "vendor" && userData.isVerified) {
                        window.location.href = "/pages/vendor.html";
                    } else {
                        window.location.href = "/pages/home.html";
                    }
                }
            } catch (error) {
                console.error("Error checking user data:", error);
            }
        }
        return;
    }

    if (!user && !currentPage.includes("home.html") && !currentPage.includes("index.html")) {
        console.log("No user, redirecting to login...");
        window.location.href = "../pages/login.html";
        return;
    }

    if (user) {
        try {
            let snap = await getDoc(doc(db, "users", user.uid));

            if (!snap.exists()) {
                console.log("User data not found in Firestore");
                return;
            }

            let userData = snap.data();
            let role = userData.role;
            let verified = userData.isVerified;

            console.log("User role:", role, "Verified:", verified);

            if (currentPage.includes("admin.html") && role !== "admin") {
                alert("Access denied. Admin only!");
                window.location.href = "../pages/home.html";
                return;
            }

            if (currentPage.includes("vendor.html")) {
                if (role !== "vendor") {
                    alert("Access denied. Vendor only!");
                    window.location.href = "../pages/home.html";
                } else if (!verified) {
                    alert("Your vendor account is pending admin verification!");
                    window.location.href = "../pages/home.html";
                }
            }

        } catch (error) {
            console.error("Error in route guard:", error);
        }
    }
});