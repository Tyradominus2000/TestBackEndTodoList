// import du framework Express, de la dépendance mysql qui va permettre de nous connecter
// à la base de données et de body-parser qui analyse les données JSON dans les requêtes HTTP
const express = require("express");
const mysql = require("mysql");
// body-parser n'est pas utile pour le moment avec la requête GET
const bodyParser = require("body-parser");

// création d'une instance d'express
const app = express();

// cela permettra de récupérer le corps des requêtes POST, DELETE, PUT sous forme d'objet JavaScript
app.use(bodyParser.json());

// définition du port dans une variable
const port = 8000;

// identifiants de connexion à la base de données avec l'hôte, l'utilisateur et le mot de passe (root et pas de
// mot de passe par défaut et du nom de la base de données ciblée)
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "todolist",
});

// connexion à la base de données avec récupération d'une éventuelle erreur et feedback si réussite dans la console
connection.connect((err) => {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL");
});

// middleware qui accepte les requêtes venant de toutes les uRL
// middleware qui accepte les requêtes avec les 4 verbes GET PUT POST et DELETE
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (_, res) => {
  res.send(JSON.stringify("API WORKING"));
});

// middleware qui écoute les réquêtes de type GET sur la route localhost:8000/getTodos
// on prépare notre requête de récupération des todos avec le select en précisant la table
// on lance la requête, checkons s'il y a une erreur et affichons le résultat en console
// nous devons obligatoirement mettre fin à la requête avec res.send() pour le moment
app.get("/getTodos", (req, res) => {
  const sql = "SELECT * FROM todo";
  connection.query(sql, (err, result) => {
    if (err) throw err;
    console.log("Todos récupérés");
    console.log(result);
    result.map(
      (r) => (
        r.edit === 0 ? (r.edit = false) : (r.edit = true),
        r.done === 0 ? (r.done = false) : (r.done = true)
      )
    );
    console.log(result);
    res.send(JSON.stringify(result));
  });
});

app.post("/addTodo", (req, res) => {
  console.log(req.body);
  const { content, done, edit } = req.body;

  const sql = `INSERT INTO todo (content, edit, done) VALUES (?, ?, ?)`;
  const values = [content, edit, done];

  connection.query(sql, values, (err, result) => {
    if (err) throw err;
    console.log("Todo ajouté en BDD");
    console.log(result);
    let resultBack = req.body;
    resultBack.id = result.insertId;
    res.json(resultBack);
  });
});

// nous précisons sur quel port notre application tourne et laissons un message en console
app.listen(port, () => {
  console.log(`serveur Node écoutant sur le port ${port}`);
});

module.exports = app;
