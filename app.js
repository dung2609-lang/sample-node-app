const express = require('express');
const app = express();

const PORT = 3000;
const HOST = '0.0.0.0';  // Quan trọng để Docker nhận kết nối từ ngoài

app.get('/', (req, res) => {
  res.send('Hello from Dockerized Node.js App!');
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
