# Auth: Sessioner i Express

Du ska skriva en webbserver som istället för autentisering med JWT som vi tittat på, använder sessioner med `express-session`. 

När klienten gör en login-request till webbservern, kommer webbservern skapa en session och lagra den på servern. Och i svaret till klienten kommer den skicka en cookie. En cookie som innehåller sessionens unika ID som lagras på servern, så klienten kan lagra den och skicka tillbaka den till servern med varje kommande request.

Vi använder detta sessions-id't för att leta upp sessionen i en store på vår webbserver, för att kunna ta fram eventuell lagrad information om den användaren. Exempelvis vilken användare som sessionen till hör (email, id, etc)

Detta kommer till skillnad från JWT, göra HTTP-protokollet `stateful`. Eftersom webbservern håller reda på information om användaren istället för att skicka med det i en token i varje request.

## Cookie & Session

Konceptet cookies i webbserver-sammanhang är nog rätt nytt för er. Så vi skulle behöva särskilja vad en cookie är och vad en session är.

Cookien är ett s.k. `key-value par` som lagras i webbläsaren. Och cookies som klienten fått av servern kommer att skickas tillbaka/med i kommande requests till servern. 

Men eftersom cookien är ett `key-value par` kan vi bara lagra begränsad mängd data, vi kan inte heller lagra känsliga uppgifter som användaruppgifter eller nycklar av säkerhetsskäl heller. Då finns det risk att någon kommer åt den här informationen och kan låtsas vara du på den webbservern som utfärdat cookien.

Du kan se cookies under fliken Application i dev tools.
![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f23a031b-53e2-4c4e-b854-fcd5dd1cb342/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220614%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220614T133411Z&X-Amz-Expires=86400&X-Amz-Signature=13ad1525447fc41caa6c55e822bfaa0cd2649bff50eea83c3ae2619c3aa147b3&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22&x-id=GetObject)

Men vi kan däremot spara större mängder data om användaren i en session på webbservern, där vi kan se vem klienten är baserat på en säker nyckel eller ett sessions-id som vi får från cookien vid varje request.

## Kom igång

Jag har redan förberett två mappar i repot, en för en express-backend och en för en react-frontend med Vite.

Det du behöver göra:
- Klona det här repot
- Kör `npm install` i både `/frontend` och `/backend`
- Och skriva koden för dessa två, såklart!

## Backend

### Middlewares:
- `cors`
- `express.json`
- `session` (från express-session paketet)

För `cors` behöver du lägga till följande options:
```js
  {
    // Säger till webbläsaren att vi tillåter
    // att credentials tillåts i requests, så vi kan använda
    // vår cookie för att identifiera en användare
    credentials: true, 
    // Berättar vilken origin som får göra requests
    // (Behövs för att kunna skicka credentials)
    // Ersätt <PORT> med porten du använder
    origin: "http://localhost:<PORT>"
  }
```

För `session` behöver vi lägga till ett gäng options också:
```js
{
  // En unik nyckel som bör sparas i en env-variabel
  // och bör inte committas till git alls.
  secret: "<BYT_UT_MIG_TILL_EN_SÄKER_RANDOM_STRÄNG>",
  // Låter oss spara en icke-initialiserad session till storen
  saveUninitialized: true,
  // Sätter en livstid på cookien, där webbläsaren tar bort cookien
  // ifall tiden tar slut och följer inte med på framtida requests.
  cookie: { maxAge: oneDay },
  // För att undvika problem ifall två parallella requests från klienten 
  // skulle hända och de ändrar olika saker i sessionen
  resave: false,
}
```

`express.json` behöver inga options.

### Routes:

När vi har lagt till våra nödvändiga middlewares, kan vi nu lägga till våra routes där vi kan logga in, testa om vi är autentiserade och även logga ut/avsluta vår session.

- `POST /login`
- `POST /test`
- `POST /logout`

För `POST /login` kan vi hårdkoda ett användarnamn och ett lösenord lite längre upp i `server.js` och använda dessa för att logga in.

```js
// server.js
const username = "admin"
const password = "häst123"
```

Dessa kommer vi använda för att jämföra med det användaren skickar till webbservern i `req.body` (som inte finns om vi inte har `express.json`-middlewaren)

```js
// server.js
app.post("/login", (req, res) => {
  if (req.body.username === username && req.body.password === password) {
    // Om användarnamn och lösenord stämmer, kan vi i vår session
    // spara information om användaren och ev. om de är autentiserade.
    // Detta kan vi göra i req.session som express-session skapar åt oss.
    // Notera: Vi måste spara för att den ska sparas.
  } else {
    // Om användarnamnet eller lösenordet inte stämmer
  }
})
```

Och för att spara data för den användaren session, sätter vi det på `req.session`-objektet och kallar på `req.session.save()`.
Det kommer då sparas i `express-session`s store på just den användarens sessions-id och vi kan komma åt det på varje request den användaren gör.

```js
req.session.authenticated = true;
req.session.username = req.body.username;
req.session.save();

// Du kan även skicka med en callback till .save() som körs
// när den sparat sessionen. Ifall du behöver vänta på den.
req.session.save((err) => {
  if (err) {
    // Handle error
  }
  // Svara med responsen
})
```

Detta kan du komma åt i andra routes, exempelvis `POST /test` för att demonstrera detta. Allt den kommer göra är att kolla efter ett värde i `req.session` - exempelvis `authenticated` som vi kan spara när personen loggar in.

```js
// server.js
app.post("/test", (req, res) => {
  if (!req.session.authenticated) {
    // Användaren är inte inloggad
  } else {
    // Användaren är inloggad
  }
})
```

Och slutligen för att logga ut eller förstöra sessionen i backenden, så kan vi lägga till routen `POST /logout`. Där allt den behöver göra är att kalla på metoden `req.session.destroy()` för att ta bort den på servern. Och sedan berätta för användaren att man har loggat ut.

Och det är allt vi behöver göra för backenden. Man kan även koppla på databaser för att spara sessioner istället för att spara det i något som kallas `MemoryStore` - som inte lagras någonstans utan bara lever sålänge processen lever. Du kan hitta listan här: [Github: express-session - Compatible Session Stores](https://github.com/expressjs/session#compatible-session-stores)

Det finns även exempel på en `view counter` och en liknande `user login` längre ner i dens README.

## Frontend

För frontenden behöver du sätta upp följande:

- Input-fält för `username` och `password`
- Tre knappar, en som `loggar in`, en som `kör anropet till /test` och en för att `logga ut`
- Handler-funktioner som kör `axios`-anrop till respektive endpoint
- State(s) som håller i det vi skriver i input-fälten och uppdateras när vi ändrar i dessa - som vi sedan skickar i ex. `handleLogin`-funktionen till servern.
- (optional) State för att spara och visa meddelande som servern kanske skickar på din frontend

```js
// server.js
// Om du ex. skickar data till klienten i följande format
res.json({ message: "logged in" })
```

Du kan skriva allt direkt i `App.jsx`. Oroa dig inte för att strukturera upp det när vi bara testar :)

### Sätta upp Axios och credentials

För att vi ska skicka med credentials (cookien med session-id) behöver vi även berätta för `axios` att den ska göra det. Det kan vi göra genom att sätta `defaults` på `axios` och berätta att alla requests ska skicka med `credentials`. Istället för att behöva lägga till det i varje request.

```js
axios.defaults.withCredentials = true;
```

Du kan göra detta högst upp i filen efter dina imports och glömma bort att den finns :)

### Skapa UI't

Därefter behöver du skapa UI't, börja med att lägga till input-fälten för `username` och `password` och eventuellt `login-knappen`. Testa så du kan logga in med dina uppgifter du hårdkodade i backenden.

När du kan göra det, kan du lägga till knappen för `test` och handler-funktionen som skickar en request till `POST /test` för att kolla efter `req.session.authenticated` på servern och svara om personen är inloggad eller inte.

Och till sist `logout`-knappen och dess handler-funktion.

Tänk på att inte hänga upp dig på styling eller liknande, se till så funktionaliteten är där först och att `login`, `test` och `logout` fungerar innan du lägger krut på det. Efter det kan du experimentera med vilken funktionalitet du vill :)

## Hur vet jag att det funkar?

Beroende på vilken approach du tar, om du exempelvis bara `console.log`ar allt eller om du väljer att skicka `json` med meddelande från servern som du skriver ut i ex. en `p`-tagg på Frontenden (ex: "logged in", "authenticated", "not authenticated", "logged out")

1. Logga in på frontenden (sätt `req.session.authenticated = true` på servern)
2. Klicka på test (kolla om `req.session.authenticated` finns i `/test`)
3. Logga ut (rensar sessionen på servern)
4. Klicka på test igen (skapar en ny session, `req.session.authenticated` bör inte finnas och svarar ex. med `not authenticated` )

## Vart hittar jag lösningen? 
**Lösningen hittar du under branchen `solution`**. 

Men undvik att titta på den innan du gjort ett eller flera ärliga försök!