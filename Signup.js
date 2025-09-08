// API endpoint
const API_URL = "http://localhost:3000/users";

/* ---------------------- PASSWORD TOGGLE ---------------------- */
function togglePassword(inputId, el) {
  const input = document.getElementById(inputId);
  if (!input || !el) return;
  const icon = el.querySelector("i");
  if (!icon) return;
  if (input.type === "password") {
    input.type = "text";
    if (icon.classList.contains("fa-eye")) icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    if (icon.classList.contains("fa-eye-slash")) icon.classList.replace("fa-eye-slash", "fa-eye");
  }
}

/* ==================== SIGNUP PAGE ==================== */
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signup_name")?.value?.trim();
    const email = document.getElementById("signup_email")?.value?.trim()?.toLowerCase();
    const password = document.getElementById("signup_password")?.value;
    const confirm = document.getElementById("confirm_password")?.value;
    const phone = document.getElementById("signup_phone")?.value?.trim();
    const genderEl = signupForm.querySelector("input[name='gender']:checked");
    const gender = genderEl ? genderEl.value : null;

    if (!name || !email || !password || !confirm || !phone || !gender) {
      alert("Please fill all fields.");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }
    try {
      const existing = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`).then(r => r.json());
      if (existing.length) {
        alert("Email already exists. Please login.");
        return;
      }
      const newUser = { name, email, password, phone, gender, image: "" };
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      alert("Sign up successful! Please login.");
      signupForm.reset();
      window.location.href = "login.html";
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  });
}

/* ==================== LOGIN PAGE ==================== */
const loginForm = document.getElementById("signInForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signin_email")?.value?.trim()?.toLowerCase();
    const password = document.getElementById("signin_password")?.value;
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    try {
      const users = await fetch(
        `${API_URL}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      ).then(res => res.json());
      if (!users.length) {
        alert("Invalid email or password.");
        return;
      }
      const user = users[0];
      alert("Login successful!");
      window.location.href = `Textbook.html?user=${user.id}`;
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });
}

/* ==================== PROFILE PAGE ==================== */
function getUserIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('user');
}

const profileForm = document.getElementById("profileForm");
const profileImageInput = document.getElementById("profileImageInput");
const deleteProfileImageBtn = document.getElementById("deleteProfileImageBtn");
const profileImagePreview = document.getElementById("profileImagePreview");
const profileBackToTextbook = document.getElementById("profileBackToTextbook");
if (profileForm) {
  // Load profile data
  document.addEventListener("DOMContentLoaded", async () => {
    const userId = getUserIdFromURL();
    if (!userId) {
      alert("You must be signed in to view profile.");
      window.location.href = "login.html";
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${userId}`);
      if (!res.ok) throw new Error("User not found");
      const user = await res.json();
      populateProfile(user);
    } catch (err) {
      alert("Could not load profile: " + err.message);
    }
  });

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userId = getUserIdFromURL();
    if (!userId) {
      alert("Not signed in.");
      return;
    }
    const name = document.getElementById("profile_name")?.value?.trim();
    const email = document.getElementById("profile_email")?.value?.trim()?.toLowerCase();
    const phone = document.getElementById("profile_phone")?.value?.trim();
    if (!name || !email || !phone) {
      alert("All fields required.");
      return;
    }
    try {
      const patch = { name, email, phone };
      await fetch(`${API_URL}/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Profile update failed: " + err.message);
    }
  });

  if(profileImageInput){
    profileImageInput.addEventListener("change", async (event) => {
      const userId = getUserIdFromURL();
      if (!userId) return;
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;
        if(profileImagePreview) profileImagePreview.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        try {
          await fetch(`${API_URL}/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: dataUrl }),
          });
        } catch (err) {
          alert("Image upload failed: " + err.message);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  if(deleteProfileImageBtn){
    deleteProfileImageBtn.addEventListener("click", async () => {
      const userId = getUserIdFromURL();
      if (!userId) return;
      if(profileImagePreview) profileImagePreview.innerHTML = "+";
      if(profileImageInput) profileImageInput.value = "";
      try {
        await fetch(`${API_URL}/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify({ image: "" }),
        });
      } catch (err) {
        alert("Image delete failed: " + err.message);
      }
    });
  }

  if(profileBackToTextbook){
    profileBackToTextbook.addEventListener("click", (e)=>{
      e.preventDefault();
      const userId = getUserIdFromURL();
      if(userId) window.location.href = `Textbook.html?user=${userId}`;
      else window.location.href = "login.html";
    });
  }

  function populateProfile(user) {
    document.getElementById("profile_name").value = user.name || "";
    document.getElementById("profile_email").value = user.email || "";
    document.getElementById("profile_phone").value = user.phone || "";
    if(profileImagePreview){
      profileImagePreview.innerHTML = user.image
        ? `<img src="${user.image}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
        : "+";
    }
  }
}

/* ==================== TEXTBOOK PAGE ==================== */
const textbookProfileLink = document.getElementById("textbookProfileLink");
const textbookLogoutLink = document.getElementById("textbookLogoutLink");
if(textbookProfileLink){
  textbookProfileLink.addEventListener("click", (e) => {
    e.preventDefault();
    const userId = getUserIdFromURL();
    if(userId) window.location.href = `Profile.html?user=${userId}`;
    else window.location.href = "login.html";
  });
}
if(textbookLogoutLink){
  textbookLogoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "login.html";
  });
}

// Expose togglePassword globally (for inline onclick handlers)
window.togglePassword = togglePassword;
