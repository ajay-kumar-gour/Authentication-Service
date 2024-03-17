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

const adminchecker = (req, res, next) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).send({
      success: false,
      message: "role is missing",
    });
  }

  if (role === "admin") {
    next();
  } else {
    res.status(400).send({
      success: false,
      message: "Unauthorized for this, check your role",
    });
  }
};
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

app.get("/users", adminchecker, (req, res) => {
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

app.delete("/user", (req, res) => {
  const username = req.body.username;
  console.log(username);
  if (!username) {
    return res.status(400).send({
      success: false,
      mesaage: "username is required",
    });
  }

  const index = users.findIndex((user) => {
    return user.username === username;
  });

  console.log("indexofuser", index);

  if (index != -1) {
    const updatedUsers = users.splice(index, 1);

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
      succcess: false,
      message: "username/oldpassword/newpassowrd is required",
    });
  }

  const existingUser = users.find((user) => {
    return user.username === username;
  });

  if (!existingUser) {
    return res.status(400).send({
      succes: false,
      mesaage: "user does not exist",
    });
  }
  if (existingUser.password != oldPassword) {
    return res.status(400).send({
      succes: false,
      message: "old password does not matched",
    });
  }
  existingUser.password = newPassword;

  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  res.status(200).send({
    success: true,
    message: `user ${username} passwords were updated successfully`,
    userNewDetail: existingUser,
    users,
  });
});
app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});
