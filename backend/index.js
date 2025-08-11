const express = require("express");
const { connectToMongoDB } = require("./connect");
const urlRoutes = require("./routes/url");

const URL = require("./models/url");
const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToMongoDB("mongodb://localhost:27017/urlShortener").then(() =>
  console.log("Connected to MongoDB")
);

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", async (req, res) => {
  const urls = await URL.find({});
  res.render("index", { urls, url: undefined }); // pass urls to EJS
});

app.post("/shortId", async (req, res) => {
  const body = req.body;
  if (!body.url) return res.status(400).json({ error: "URL is required" });
  const shortID = require("shortid").generate();
  await URL.create({
    shortId: shortID,
    redirectUrl: body.url,
    visitHistory: [],
  });

  const shortUrl = `${req.protocol}://${req.get("host")}/${shortID}`;
  const urls = await URL.find({});
  res.render("index", { urls, url: shortUrl });
});

app.use("/urls", urlRoutes);

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId: shortId,
    },
    {
      $push: {
        visitHistory: { timestamp: Date.now() },
      },
    }
  );
  res.redirect(entry.redirectUrl);
});

app.listen(PORT, () => {
  console.log(`Server Started at Port ${PORT}`);
});
