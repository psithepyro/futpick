// token.js - Handles authentication on all pages

//this functions checks for JWT in local storage. if not there, it checks for a google session
//if authenticated, it redirects to homepage. If not, it redirects to login
async function fetchUserData() {
  const token = localStorage.getItem("token");

  if (!token) {
    // No JWT in localStorage - Check Google session
    try {
      const response = await fetch("http://localhost:3000/auth/success", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();
      console.log("Google /auth/success response:", data); //debug log

      if (data.success) {
        //user logged in through Google
        document.getElementById(
          "user-info"
        ).innerText = `Welcome, ${data.user.name}`;
        return; //user is logged in through Google
      } else {
        alert("error #1");
        console.error("Error fetching user data (Google session).");
        window.location.href = "login.html";
      }
    } catch (error) {
      alert("error #2");
      console.error("Error checking Google session:", error);
      window.location.href = "login.html";
    }
  } else {
    // token exits, verify with protected-route
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
        //token is invalid or expired
        alert("Session expired, please log in again");
        localStorage.removeItem("token");
        window.location.href = "login.html";
      }
    } catch (error) {
      console.error("Error verifying JWT token:", error);
      alert("Server error. Please try again.");
      window.location.href = "login.html";
    }
  }
}
//helper function to retrieve the stored token
function getToken() {
  const token = localStorage.getItem("token");
  console.log("Stored token: ", token); // debugging

  if (!token) {
    alert("Unauthorized! Please log in.");
    window.location.href = "login.html";
    return null;
  }
  return token;
}

// Call fetchUserData on page load
fetchUserData();
