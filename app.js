const express = require("express");
const fs = require("fs");
const app = express();
let users = [];
// console.log(fs);
try {
  let userData = fs.readFileSync("users.json", "utf-8");

  console.log("userData", userData);
  console.log("TYPE OF userData", typeof userData);

  users = JSON.parse(userData);

  console.log("users", users);
  console.log("type of users", typeof users);
} catch (error) {
  console.log("error reading users.json file", error);
}

const PORT = 3000;
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "authentication service",
  });
});
const matchCredentials = (req, res, next) => {
  try {
    // const user = "admin";
    // const pwd = "pwd";
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({
        success: false,
        message: "username/password is missing",
      });
    }
    // if (username !== user || password !== pwd) {
    //   return res
    //     .status(400)
    //     .send({ success: false, message: "Invalid credentials" });
    // } else {
    //   next();
    // }

    const user = users.find((user) => {
      return user.username === username;
    });
    console.log(user);
    if (!user) {
      return res
        .status(401)
        .send({ success: false, message: "user does not exist" });
    }
    if (user.password !== password) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid password" });
    }

    next();
  } catch (error) {
    res.status(500).send({ success: false, message: "Internal Server Error" });
    console.log(error);
  }
};

// function matchCredentials(user, pwd) {
//   if (user === username && pwd === password) return true;
//   return false;
// }
app.get("/admin", matchCredentials, (req, res) => {
  const { username } = req.body;
  res.status(200).send({
    success: true,
    message: `Welcome ${username}`,
  });
});

app.post("/user", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .send({ success: false, message: "username/password is missing" });
    }
    const existingUser = users.find((user) => {
      return user.username === username;
    });

    if (existingUser) {
      return res
        .status(409)
        .send({ success: false, message: "user already exist" });
    }
    // create a new suer objet

    const newUser = { username, password };

    users.push(newUser); // this is in uers array

    //now update the new users array to the json file

    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

    res.status(201).send({
      success: true,
      message: "user created successfully",
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Internal Server error" });
  }
});

app.get("/users", (req, res) => {
  if (users.length == 0) {
    res.status(400).send({
      success: true,
      message: "no users found",
    });
  } else {
    res.status(200).send({
      success: true,
      mesaage: "users fetched",
      totatUsers: users.length,
      users,
    });
  }
});
app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});
