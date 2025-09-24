
function togglePassword(id) {
  const input = document.getElementById(id);
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
}


document.addEventListener("DOMContentLoaded", () => {

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    const signupPassword = document.getElementById("signupPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const pwdError = document.getElementById("pwdError");

    const showPwdError = (msg) => {
      if (pwdError) pwdError.textContent = msg ? " * " + msg : "";
      if (confirmPassword) {
        if (msg) confirmPassword.classList.add("invalid");
        else confirmPassword.classList.remove("invalid");
      }
    };

    if (signupPassword && confirmPassword) {
      const validate = () => {
        if (!confirmPassword.value) {
          showPwdError("");
          return;
        }
        if (signupPassword.value !== confirmPassword.value) {
          showPwdError("Passwords do not match");
        } else {
          showPwdError("");
        }
      };
      signupPassword.addEventListener("input", validate);
      confirmPassword.addEventListener("input", validate);
    }


    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (signupPassword && confirmPassword && signupPassword.value !== confirmPassword.value) {
        showPwdError("Passwords do not match");
        confirmPassword.focus();
        return;
      }

      const roleEl = document.getElementById("role");
      if (roleEl && roleEl.value) {
        localStorage.setItem("userRole", roleEl.value);
      }

      window.location.href = "home.html";
    });
  }


  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = loginForm.querySelector('input[type="email"]');
      const pwd = loginForm.querySelector('input[type="password"]');
      if (email && !email.value) {
        email.focus();
        return;
      }
      if (pwd && !pwd.value) {
        pwd.focus();
        return;
      }

      window.location.href = "home.html"; 
    });
  }
});
