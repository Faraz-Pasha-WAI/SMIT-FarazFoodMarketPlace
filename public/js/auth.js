import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword }
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc, query, where, collection, getDocs, deleteDoc }
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function showMessage(message, type = 'error') {
    console.log(`${type.toUpperCase()}: ${message}`);
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> ${message}`;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'flex';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

window.login = async function (event) {
    if (event) event.preventDefault();

    console.log("Login function called");

    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value;
    const selectedRole = document.querySelector('input[name="role"]:checked')?.value || "user";

    console.log("Email:", email, "Role:", selectedRole);

    if (!email || !password) {
        showMessage("Please fill in all fields!");
        return;
    }

    try {
        const btn = document.querySelector('#loginForm button[type="submit"]');
        let originalText = "";
        if (btn) {
            originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
            btn.disabled = true;
        }

        console.log("Attempting to sign in...");

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        console.log("User signed in, UID:", uid);

        const userDoc = await getDoc(doc(db, "users", uid));

        if (!userDoc.exists()) {
            console.log("User document not found. Creating new default profile...");

            const newUserData = {
                email: email,
                role: "user",
                isVerified: true,
                fullName: "User",
                createdAt: new Date().toISOString(),
                restored: true
            };

            try {
                await setDoc(doc(db, "users", uid), newUserData);
                console.log("Created missing profile for user.");

                if (selectedRole !== "user") {

                }

                processLogin(newUserData, "user", true, "User", selectedRole, btn, originalText, email, uid);
                return;
            } catch (err) {
                console.error("Error creating profile:", err);
                throw err;
            }
        }

        const userData = userDoc.data();
        processLogin(userData, userData.role, userData.isVerified, userData.fullName || userData.name, selectedRole, btn, originalText, email, uid);

    } catch (error) {
        console.error("Login error:", error);
        let errorMessage = "Login failed! ";

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage += "No account found with this email!";
                break;
            case 'auth/wrong-password':
                errorMessage += "Incorrect password!";
                break;
            case 'auth/invalid-email':
                errorMessage += "Invalid email address!";
                break;
            case 'auth/invalid-credential':
                errorMessage += "Invalid email or password!";
                break;
            case 'auth/too-many-requests':
                errorMessage += "Too many failed attempts. Try again later!";
                break;
            case 'auth/network-request-failed':
                errorMessage += "Network error. Check your internet connection!";
                break;
            default:
                errorMessage += error.message || "Unknown error occurred";
        }

        showMessage(errorMessage);

        const btn = document.querySelector('#loginForm button[type="submit"]');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            btn.disabled = false;
        }
    }
};


window.signup = async function (event) {
    if (event) event.preventDefault();

    console.log("Signup function called");

    const firstName = document.getElementById("firstName")?.value?.trim();
    const lastName = document.getElementById("lastName")?.value?.trim();
    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;
    const terms = document.getElementById("terms")?.checked;
    const selectedRole = document.querySelector('input[name="role"]:checked')?.value || "user";

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showMessage("Please fill in all fields!");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Passwords do not match!");
        return;
    }

    if (!terms) {
        showMessage("You must agree to the Terms & Conditions!");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters long!");
        return;
    }

    try {
        const btn = document.querySelector('#signupForm button[type="submit"]');
        let originalText = "";
        if (btn) {
            originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            btn.disabled = true;
        }

        console.log("Creating user...");

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        console.log("User created, UID:", uid);

        const userData = {
            firstName: firstName,
            lastName: lastName,
            fullName: `${firstName} ${lastName}`,
            email: email,
            role: selectedRole,
            createdAt: new Date().toISOString(),
            isVerified: selectedRole === 'user' ? true : false,
            uid: uid
        };

        await setDoc(doc(db, "users", uid), userData);
        console.log("User profile saved to Firestore");

        showMessage("Account created successfully! Redirecting...", "success");

        setTimeout(() => {
            processLogin(userData, selectedRole, userData.isVerified, userData.fullName, selectedRole, btn, originalText, email, uid);
        }, 1500);

    } catch (error) {
        console.error("Signup error:", error);
        let errorMessage = "Signup failed! ";

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage += "Email is already in use!";
                break;
            case 'auth/invalid-email':
                errorMessage += "Invalid email address!";
                break;
            case 'auth/weak-password':
                errorMessage += "Password is too weak!";
                break;
            case 'auth/network-request-failed':
                errorMessage += "Network error. Check your internet connection!";
                break;
            default:
                errorMessage += error.message || "Unknown error occurred";
        }

        showMessage(errorMessage);

        const btn = document.querySelector('#signupForm button[type="submit"]');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
            btn.disabled = false;
        }
    }
};

function processLogin(userData, role, isVerified, userName, selectedRole, btn, originalText, email, uid) {
    if (selectedRole !== role) {
        showMessage(`Please login as ${role} from the role selection!`);

        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
        return;
    }

    localStorage.setItem('user', JSON.stringify({
        uid: uid,
        email: email,
        name: userName,
        role: role,
        isVerified: isVerified
    }));

    setTimeout(() => {
        if (role === "admin") {
            window.location.href = "../pages/admin.html";
        } else if (role === "vendor") {
            if (isVerified === true) {
                window.location.href = "../pages/vendor.html";
            } else {
                showMessage("Your vendor account is pending admin approval. Please wait for verification.", "warning");
                window.location.href = "../pages/home.html";
            }
        } else {
            window.location.href = "../pages/home.html";
        }
    }, 1000);
}