// auth.js - Handles authentication on all pages
async function fetchUserData() {
  const token = localStorage.getItem("token");

  if (!token) {
    try {
      const response = await fetch("http://localhost:3000/auth/success", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        document.getElementById(
          "user-info"
        ).innerText = `Welcome, ${data.user.name}`;
        return;
      } else {
        window.location.href = "login.html";
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      window.location.href = "login.html";
    }
  } else {
    try {
      const response = await fetch(
        "http://localhost:3000/auth/jwt/protected-route",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        document.getElementById(
          "user-info"
        ).innerText = `Welcome, ${data.user.name}`;
      } else {
        alert("Session expired, please log in again");
        localStorage.removeItem("token");
        window.location.href = "login.html";
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Server error. Please try again.");
    }
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
