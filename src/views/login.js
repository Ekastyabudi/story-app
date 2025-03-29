import API from "../api.js";
import Router from "../router.js"; // Tambahkan ini

const Login = {
  render: () => `
        <h2>Login</h2>
        <form id="login-form">
            <input type="text" id="email" placeholder="Email">
            <input type="password" id="password" placeholder="Password">
            <button type="submit">Login</button>
        </form>
    `,
  afterRender: () => {
    document
      .getElementById("login-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await API.login({ email, password });
        if (response.error) {
          alert("Login gagal!");
        } else {
          localStorage.setItem("token", response.loginResult.token);
          window.location.hash = "#/";
          Router.updateNav(); // Update navbar setelah login berhasil
        }
      });
  },
};

export default Login;
