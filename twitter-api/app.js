const express = require("express");
const cors = require("cors");
const Twitter = require("./api/helper/twitter.js");

const app = express();
app.use(cors());
const PORT = 3000;
const twitter = new Twitter();

app.get("/tweets", (req, res) => {
  // Accessing the query inputs
  const query = req.query.q;
  const count = req.query.count;
  const maxId = req.query.max_id;

  twitter
    .get(query, count, maxId)
    .then((response) => {
      res.status(200).send(response.data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
