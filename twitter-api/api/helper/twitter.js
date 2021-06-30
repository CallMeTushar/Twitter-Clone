const axios = require("axios");
require("dotenv").config();

class Twitter {
  // maxId is used so that we can get the next page of tweets
  get(query, count, maxId) {
    const url = "https://api.twitter.com/1.1/search/tweets.json";

    // to access the tweets using the api
    // returns a promise
    return axios.get(url, {
      params: {
        q: query,
        count: count,
        max_id: maxId,
        // So that we get the entire tweet and not the truncated one.
        tweet_mode: "extended",
      },
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_API_TOKEN}`,
      },
    });
  }
}

module.exports = Twitter;
