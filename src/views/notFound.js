const NotFound = {
    render: () => {
      return `
        <div style="text-align: center; padding: 50px;">
          <h1 style="color: red;">404</h1>
          <p>Halaman yang Anda cari tidak ditemukan.</p>
          <a href="#/" style="text-decoration: none; color: blue;">Kembali ke Beranda</a>
        </div>
      `;
    },
    afterRender: () => {
      console.log("Halaman 404 ditampilkan");
    },
  };
  
  export default NotFound;
  