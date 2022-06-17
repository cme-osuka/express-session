const express = require("express");
const session = require("express-session");
const cors = require("cors");

const PORT = 4000;
const USERNAME = "admin";
const PASSWORD = "potato";

const app = express();


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
