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

const username = "admin";
const password = "password";
function matchCredentials(user, pwd) {
  if (user === username && pwd === password) return true;
  return false;
}
app.get("/admin", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send({
            success: false,
            message:"username/password is required"
        })
    }

  const checkAuthorize = matchCredentials(username, password);

  if (!checkAuthorize) {
    res.status(400).send({
      success: false,
      messsage: "you are not authorized to access this",
    });
  } else {
    res.status(200).send({
      success: true,
      messsage: `welcome ${username}`,
    });
  }
});
app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});
