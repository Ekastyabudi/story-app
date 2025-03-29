import API from "../api.js";

const Register = {
  render: () => `
        <h2>Register</h2>
        <form id="register-form">
            <input type="text" id="name" placeholder="Nama Lengkap" required>
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password (min. 6 karakter)" required>
            <button type="submit" id="register-button">Daftar</button>
            <p id="error-message" style="color: red; display: none;"></p>
        </form>
    `,

  afterRender: () => {
    const form = document.getElementById("register-form");
    const errorMessage = document.getElementById("error-message");
    const registerButton = document.getElementById("register-button");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Ambil data dari form
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      // Validasi input
      if (!name || !email || !password) {
        errorMessage.textContent = "Semua kolom harus diisi!";
        errorMessage.style.display = "block";
        return;
      }

      if (password.length < 6) {
        errorMessage.textContent = "Password harus minimal 6 karakter!";
        errorMessage.style.display = "block";
        return;
      }

      // Tampilkan loading
      registerButton.textContent = "Mendaftarkan...";
      registerButton.disabled = true;

      try {
        const response = await API.register({ name, email, password });

        if (response.error) {
          errorMessage.textContent = response.message || "Registrasi gagal!";
          errorMessage.style.display = "block";
        } else {
          alert("Registrasi berhasil! Silakan login.");
          window.location.hash = "#/login";
        }
      } catch (error) {
        errorMessage.textContent = "Terjadi kesalahan. Coba lagi nanti.";
        errorMessage.style.display = "block";
      }

      // Kembalikan tombol ke kondisi semula
      registerButton.textContent = "Daftar";
      registerButton.disabled = false;
    });
  },
};

export default Register;
