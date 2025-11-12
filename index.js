const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

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
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    res.send(`Running query: ${query}<br><br>Login failed.`);
});

// XSS
app.get('/hello', (req, res) => {
    const name = req.query.name || 'Anonymous';
    res.send(`<h3>Hello ${name}</h3>`);
});

app.listen(8080, () => console.log('App running on http://localhost:8080'));