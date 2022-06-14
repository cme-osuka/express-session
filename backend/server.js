const express = require("express");
const session = require("express-session");
const cors = require("cors");

const PORT = 4000;
const USERNAME = "admin";
const PASSWORD = "potato";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
// Inbyggda middlewares för att läsa och tolka json och formdata
app.use(express.json());

// 1000 ms = 1 sekund, 60 sekunder = 1 minut, 60 minuter = 1 timme, 24 timmar = en dag
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    // En random unik nyckel, normalt sett sparad i en environment-variabel
    // och bör inte committas till ditt repo alls.
    secret: "VERYSECRETKEYWITH3DIFFERENTANIMALSZEBRAELEPHANTPOTATO",
    // Låter oss spara en icke-initialiserad session till storen
    saveUninitialized: true,
    // Sätter en livstid på cookien, där webbläsaren tar bort cookien
    // ifall tiden tar slut och följer inte med på framtida requests.
    cookie: { maxAge: oneDay },
    // För att undvika att två parallella requests från klienten händer
    resave: false,
  })
);

app.post("/login", (req, res) => {
  if (req.body.username === USERNAME && req.body.password === PASSWORD) {
    req.session.authenticated = true;
    req.session.save();
    res.json({ message: "success" });
  } else {
    res.json({ message: "failed" });
  }
});

app.post("/test", (req, res) => {
  req.session.reload(() => {
    if (!req.session.authenticated) {
      res.json({ message: "not authenticated" });
    } else {
      res.json({ message: "authenticated", session_id: req.session.id });
    }
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "logged out" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
