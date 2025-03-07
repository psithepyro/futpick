// auth.js - Handles authentication on all pages
async function fetchUserData() {
  const token = localStorage.getItem("token");
  console.log("Stored token:", token); // Debugging

  if (!token) {
    //alert("Unauthorized! Please log in");
    window.location.href = "login.html"; // Redirect to login page
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/auth/jwt/protected-route",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send JWT token in headers
        },
      }
    );

    const data = await response.json();
    console.log("Protected Route Response:", data);

    if (response.ok) {
      // Insert user info dynamically into homepage
      document.getElementById(
        "user-info"
      ).innerText = `Welcome, ${data.user.name}`;
    } else {
      alert("Session expired, please log in again");
      localStorage.removeItem("token"); // Clear token if invalid
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert("Server error. Please try again.");
  }
}

function getToken() {
  const token = localStorage.getItem("token"); //retrieve token from local storage
  console.log("Stored token: ", token); // for debugging

  if (!token) {
    alert("Unauthorized! Please log in.");
    window.location.href = "login.html";
    return null;
  }
  return token;
}

// Call fetchUserData when the page loads
fetchUserData();
