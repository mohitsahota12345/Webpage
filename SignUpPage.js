// API endpoint - json-server must be running
const API_URL = "http://localhost:3000/users";

/* ----------------------
   TOGGLE PASSWORD EYE
   ---------------------- */
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

/* ----------------------
   SIGNUP FORM
   ---------------------- */
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
      // check if email already exists
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
      window.location.href = "SignInPage.html";
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  });
}

/* ----------------------
   SIGNIN FORM
   ---------------------- */
const signInForm = document.getElementById("signInForm");
if (signInForm) {
  signInForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signin_email")?.value?.trim()?.toLowerCase();
    const password = document.getElementById("signin_password")?.value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const users = await fetch(`${API_URL}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`).then(r => r.json());
      if (!users.length) {
        alert("Invalid email or password.");
        return;
      }

      const user = users[0];
      alert("Login successful!");
      window.location.href = "Textbook.html?id=" + user.id; // pass user id in URL
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });
}

/* ----------------------
   PROFILE SECTION
   ---------------------- */
async function openProfile() {
  const section = document.getElementById("profileSection");
  if (!section) return;

  // extract user id from URL
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("id");
  if (!userId) {
    alert("You must be signed in to view profile.");
    window.location.href = "SignInPage.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/${userId}`);
    if (!res.ok) throw new Error("User not found");
    const user = await res.json();
    populateProfile(user);
    section.style.display = "block";
    section.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    alert("Could not open profile: " + err.message);
  }
}

function populateProfile(user) {
  document.getElementById("profile_name").value = user.name || "";
  document.getElementById("profile_email").value = user.email || "";
  document.getElementById("profile_phone").value = user.phone || "";
  document.getElementById("profileImagePreview").innerHTML = user.image ? `<img src="${user.image}" alt="Profile">` : "+";
}

/* ----------------------
   IMAGE PREVIEW + SAVE
   ---------------------- */
async function previewProfileImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    document.getElementById("profileImagePreview").innerHTML = `<img src="${dataUrl}" alt="Profile">`;

    const userId = new URLSearchParams(window.location.search).get("id");
    if (!userId) return;

    try {
      await fetch(`${API_URL}/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl })
      });
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };
  reader.readAsDataURL(file);
}

async function deleteProfileImage() {
  document.getElementById("profileImagePreview").innerHTML = "+";
  document.getElementById("profileImageInput").value = "";

  const userId = new URLSearchParams(window.location.search).get("id");
  if (!userId) return;

  try {
    await fetch(`${API_URL}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: "" })
    });
  } catch (err) {
    console.error("Image delete failed:", err);
  }
}

/* ----------------------
   SAVE PROFILE
   ---------------------- */
const profileForm = document.getElementById("profileForm");
if (profileForm) {
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = new URLSearchParams(window.location.search).get("id");
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
}

/* ----------------------
   DROPDOWN
   ---------------------- */
document.querySelectorAll(".dropbtn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const menu = btn.nextElementSibling;
    if (menu) menu.classList.toggle("show");
  });
});
window.addEventListener("click", () => {
  document.querySelectorAll(".dropdown-content").forEach(d => d.classList.remove("show"));
});
