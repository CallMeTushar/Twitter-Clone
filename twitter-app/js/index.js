const URL = "http://localhost:3000/tweets";
let nextPageURL = null;

window.onload = () => {};

// To call getTwitterData function when the user presses the enter key
function onEnter(e) {
  if (e.key == "Enter") getTwitterData();
}

// to get the next set of tweets on clicking the down arrow button
function getNextTweets() {
  // true indicates that we want to append to current page
  if (nextPageURL) getTwitterData(true);
}

/**
 * Retrieve Twitter Data from API
 */
function getTwitterData(nextPage = false) {
  // nextPage is a boolean that indicates whether we want to append to current page or replace entire content
  // true => append
  // false by default
  const query = document.getElementById("user-input").value;
  if (!query) return;

  // So that we are able to use symbols such as # w/o any encoding issues
  const encodedQuery = encodeURIComponent(query);
  let getUrl = `${URL}?q=${encodedQuery}&count=10`;

  // checking both is needed
  // nextPage => topic change eg coding to car => do not update url to nextPageURL as that is next page url of coding
  // nextPageURL => it must exist to replace getUrl
  if (nextPage && nextPageURL) {
    getUrl = nextPageURL;
  }

  // fetching data from the backend API defined by us
  fetch(getUrl, {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      buildTweets(data.statuses, nextPage);
      // save the url of the next page to display it when the user wants
      saveNextPage(data.search_metadata);
      // Parameter passed so that we display the button only when new tweets exist
      nextPageButtonVisibility(data.search_metadata);
    })
    .catch((err) => console.log(err));
}

/**
 * Save the next page data
 */
function saveNextPage(metadata) {
  if (metadata.next_results) {
    nextPageURL = `${URL}${metadata.next_results}`;
  } else {
    nextPageURL = null;
  }
}

/**
 * Handle when a user clicks on a trend
 */
function selectTrend(e) {
  // Populate the search bar and get the tweets
  document.getElementById("user-input").value = e.innerText;
  getTwitterData();
}

/**
 * Set the visibility of next page based on if there is data on next page
 */
function nextPageButtonVisibility(metadata) {
  if (metadata.next_results) {
    document.querySelector(".next-page-container").style.visibility = "visible";
  } else {
    document.querySelector(".next-page-container").style.visibility = "hidden";
  }
}

/**
 * Build Tweets HTML based on Data from API
 */
function buildTweets(tweetsArray, nextPage) {
  let htmlTweets = "";
  tweetsArray.forEach((tweet) => {
    // statuses (array of objects) => entities => media (array of obj) => media_url

    const relativeTime = moment(tweet.created_at).fromNow();

    htmlTweets += `<div class="tweet-container">
    <div class="tweet-user-info">
      <div class="tweet-user-profile" style="
      background-image: url(${tweet.user.profile_image_url_https});
    "></div>
      <div class="tweet-name-container">
        <div class="tweet-user-fullname">${tweet.user.name}</div>
        <div class="tweet-username">@${tweet.user.screen_name}</div>
      </div>
    </div>`;

    // First : whether extended_entities attribute exists or not.
    // 2nd if it exists then len > 0 or not
    if (tweet.extended_entities && tweet.extended_entities.media.length > 0) {
      htmlTweets += buildImages(tweet.extended_entities.media);
      htmlTweets += buildVideo(tweet.extended_entities.media);
    }

    htmlTweets += `<div class="tweet-text">
      ${tweet.full_text}
    </div>
    <div class="tweet-date">${relativeTime}</div>
  </div>`;
  });
  if (nextPage) {
    // append
    document
      .getElementById("tweets-list")
      .insertAdjacentHTML("beforeend", htmlTweets);
  } else {
    // update
    document.getElementById("tweets-list").innerHTML = htmlTweets;
  }
}

/**
 * Build HTML for Tweets Images
 */
function buildImages(mediaList) {
  // statuses (array of objects) => extended_entities => media (array of obj) => media_url_https
  // here mediaList is the media in json recieved from API
  let imageHTML = `<div class="tweet-images-container">`;
  let doesImageExist = false;
  mediaList.forEach((media) => {
    if (media.type == "photo") {
      doesImageExist = true;
      imageHTML += `<div style="
    background-image: url(${media.media_url_https});
  " class="tweet-images"></div>`;
    }
  });

  imageHTML += `</div>`;

  return doesImageExist ? imageHTML : "";
}

/**
 * Build HTML for Tweets Video and GIFs
 */
function buildVideo(mediaList) {
  let videoHTML = `<div class="tweet-video-container">`;
  let doesVideoExist = false;
  mediaList.forEach((media) => {
    if (media.type == "video") {
      doesVideoExist = true;
      const videoVariant = media.video_info.variants.find(
        (variant) => variant.content_type == "video/mp4"
      );
      videoHTML += `<video controls>
      <source
        src=${videoVariant.url}
        type=video/mp4
      />
    </video>`;
    } else if (media.type == "animated_gif") {
      doesVideoExist = true;
      const videoVariant = media.video_info.variants.find(
        (variant) => variant.content_type == "video/mp4"
      );
      videoHTML += `<video loop autoplay>
      <source
      src=${videoVariant.url}
      type=video/mp4
      />
    </video>`;
    }
  });

  videoHTML += `</div>`;

  return doesVideoExist ? videoHTML : "";
}
