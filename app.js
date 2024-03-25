const express = require("express");
const fs = require("fs");
const app = express();
let users = [];
console.log(fs);
try {
  let userData = fs.readFileSync("users.json", "utf-8");

  console.log("userData", userData);
  console.log("TYPE OF userData", typeof userData);

  users = JSON.parse(userData);

  console.log("users", users);
  console.log("type of users", typeof users);
} catch (error) {
  console.log("error reading users file", error);
}

const PORT = 5000;
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "authentication usaage service",
  });
});

const adminchecker = (req, res, next) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).send({
      success: false,
      message: "role is required",
    });
  }

  if (role === "admin") {
    next();
  } else {
    res.status(400).send({
      success: false,
      message: "Unauthorized for this, please check your role",
    });
  }
};

const matchCredentials = (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({
        success: false,
        message: "username/password is missing and is required",
      });
    }

    const user = users.find((user) => user.username === username);

    if (!user) {
      return res
        .status(401)
        .send({ success: false, message: "user not found" });
    }

    if (user.password !== password) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid password, please check again" });
    }

    next();
  } catch (error) {
    res.status(500).send({ success: false, message: "Internal Server Error" });
    console.log(error);
  }
};

app.get("/admin", (req, res) => {
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
    const existingUser = users.find((user) => user.username === username);

    if (existingUser) {
      return res
        .status(409)
        .send({ success: false, message: "user already exists" });
    }

    const newUser = { username, password };

    users.push(newUser);

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
  if (users.length === 0) {
    res.status(400).send({
      success: true,
      message: "no users found",
    });
  } else {
    res.status(200).send({
      success: true,
      message: "users fetched",
      totalUsers: users.length,
      users,
    });
  }
});

app.delete("/user", (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).send({
      success: false,
      message: "username is required",
    });
  }

  const index = users.findIndex((user) => user.username === username);

  if (index !== -1) {
    users.splice(index, 1);

    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

    return res.status(200).send({
      success: true,
      message: `user ${username} deleted successfully`,
      totalUsers: users.length,
      newUsersList: users,
    });
  } else {
    res.status(400).send({
      success: false,
      message: "user not found",
    });
  }
});

app.put("/user", (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  if (!username || !oldPassword || !newPassword) {
    return res.status(400).send({
      success: false,
      message: "username/oldpassword/newpassword is required",
    });
  }

  const existingUser = users.find((user) => user.username === username);

  if (!existingUser) {
    return res.status(400).send({
      success: false,
      message: "user does not exist",
    });
  }

  if (existingUser.password !== oldPassword) {
    return res.status(400).send({
      success: false,
      
      message: "old password does not match",
    });
  }

  existingUser.password = newPassword;

  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  res.status(200).send({
    success: true,
    message: `user ${username} password updated successfully`,
    userNewDetail: existingUser,
    users,
  });
});

app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});
