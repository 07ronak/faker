const { faker } = require("@faker-js/faker");
const mysql = require(`mysql2`);
const express = require(`express`);
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "",
  password: "",
});

//.........................HOME ROUTE
app.get("/", (req, res) => {
  let q = "select count(*) from user";
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send(`some error in database`);
  }
});

//.......................SHOW ROUTER
app.get("/user", (req, res) => {
  let q = `select id, username, email from user`;
  try {
    connection.query(q, (err, users) => {
      res.render("showUsers.ejs", { users });
    });
  } catch {}
});

//.........................EDIT ROUTE
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `Select * from user where id ='${id}' `;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    res.send("some error in DB");
    console.log(err);
  }
});
//.....................UPDATE ROUTE
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUserName } = req.body;
  let q = `Select * from user where id ='${id}' `;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        res.send("wrong password");
      } else {
        let q2 = `UPDATE user SET username='${newUserName}' where id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    res.send("some error in DB");
  }
});

//.......................ADD USER
app.get("/user/add", (req, res) => {
  res.render("addUser.ejs");
});

app.post("/user/add", (req, res) => {
  let {
    username: formUsername,
    email: formEmail,
    password: formPassword,
  } = req.body;
  let id = uuidv4();
  let q = `insert into user values ('${id}','${formUsername}','${formEmail}','${formPassword}')`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.redirect("/user");
      console.log(result);
    });
  } catch (err) {
    res.send("some error in DB");
  }
});

//..................DELETE POST
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("deleteUser.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let q = `Select * from user where id ='${id}' `;
  let { password: formPass } = req.body;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (formPass != user.password) {
        res.send("wrong password");
      } else {
        let q2 = `Delete from user where id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log("deleted");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error in DB");
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`server is listning to ${port}`);
});

let createRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};
