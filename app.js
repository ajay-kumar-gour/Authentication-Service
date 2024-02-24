const express = require("express");

const app = express();

const PORT = 3000;
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "authentication service",
  });
});
function matchCredentials(req, res, next) {
  const user = "admin";
  const pwd = "pwd";
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({
      success: false,
      message: "username/passwaord is missing",
    });
  }
  if (username !== user || password !== pwd) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid credentials" });
    }
    else {
      next();
    }
 
}

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
app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});
