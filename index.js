const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Cấu hình cổng và Host chuẩn cho Docker
const PORT = 3000;        // Phải khớp với EXPOSE trong Dockerfile
const HOST = '0.0.0.0';   // Bắt buộc là 0.0.0.0 để truy cập từ ngoài container

app.use(bodyParser.urlencoded({ extended: true }));

// Trang chủ (Form đăng nhập lỗi)
app.get('/', (req, res) => {
  res.send(`
    <h2>Welcome to DevSecOps Demo</h2>
    <form method="POST" action="/login">
      <input type="text" name="username" placeholder="Username"/><br/>
      <input type="password" name="password" placeholder="Password"/><br/>
      <button type="submit">Login</button>
    </form>
  `);
});

// SQL Injection giả lập
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Code này cố tình viết lỗi để demo SQL Injection
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  res.send(`Running query: ${query}<br><br>Login failed.`);
});

// XSS giả lập
app.get('/hello', (req, res) => {
  const name = req.query.name || 'Anonymous';
  // Code này cố tình viết lỗi để demo XSS
  res.send(`<h3>Hello ${name}</h3>`);
});

// [QUAN TRỌNG] Lắng nghe đúng cổng 3000 và IP 0.0.0.0
app.listen(PORT, HOST, () => {
  console.log(`App running on http://${HOST}:${PORT}`);
});
