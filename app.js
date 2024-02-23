const express = require("express");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "authentication service",
  });
});

app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});
