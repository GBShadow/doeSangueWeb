const express = require('express');
const nunjucks = require('nunjucks');
const Pool = require('pg').Pool;

const server = express();

server.use(express.static('public'));
server.use(express.urlencoded({ extended: true }));

const db = new Pool({
  user: 'postgres',
  password: 'docker',
  host: '192.168.15.10',
  port: 5432,
  database: 'blood_donation'
})

nunjucks.configure('./', {
  express: server,
  noCache: true
});

server.get('/', (request, response) => {
  db.query("SELECT * FROM donors", (err, result) => {
    if (err) return response.send(`<script>alert('Todos os campos são obrigatórios.'); window.location.href = "/";</script>`);

    const donors = result.rows;

    response.render("index.html", { donors });
  });
});

server.post('/', (request, response) => {
  const { name, email } = request.body;
  const blood = request.body.blood.toUpperCase();

  if (!name || !email || !blood) {
    return response.send(`<script>alert('Todos os campos são obrigatórios.'); window.location.href = "/";</script>`);
  }

  const query = `
        INSERT INTO donors ("name", "email", "blood") 
        VALUES ($1, $2, $3)`;
  
  const values = [name, email, blood];
  
  db.query(query, values, (err) => {
    if (err) return response.send(`<script>alert('Todos os campos são obrigatórios.'); window.location.href = "/";</script>`)
  
    return response.redirect("/");
  });
});

server.listen(3333, () => {
  console.log('Server Start in port 3333');
});
