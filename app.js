
var client_id = 'd5ba16cb907845f3b468c4b9706e23b1'; // Your client id
var client_secret = '9aa59fd5f74f4f25a4bbb5266955017e'; // Your secret
var redirect_uri = 'http://127.0.0.1:5501/public/index.html'; // Your redirect uri

const AUTHORIZE = 'https://accounts.spotify.com/authorize';
const TOKEN = 'https://accounts.spotify.com/api/token';
const TRACKS = 'https://api.spotify.com/v1/me/top/tracks?time_range=medium_term';
const TRACKS_LONG_TERM = 'https://api.spotify.com/v1/me/top/tracks?time_range=long_term';
const TRACKS_SHORT_TERM = 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term';
const ARTISTS = 'https://api.spotify.com/v1/me/top/artists';
const ARTISTS_LONG_TERM = 'https://api.spotify.com/v1/me/top/artists?time_range=long_term';
const ARTISTS_SHORT_TERM = 'https://api.spotify.com/v1/me/top/artists?time_range=short_term';
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PROFILE = 'https://api.spotify.com/v1/me';
const SEARCH_TRACK = 'https://api.spotify.com/v1/search?';
const ARTIST_INFO = 'https://api.spotify.com/v1/artists/';
const TRACK_REC = 'https://api.spotify.com/v1/recommendations?'

function onPageLoad() {
  if (window.location.search.length > 0) {
    handleRedirect();
  }
  else {
    access_token = localStorage.getItem("access_token");
    if (access_token == null) {
      // we don't have an access token so present token section
      document.getElementById("tokenSection").style.display = 'block';
    }
    else {
      // we have an access token so present sections based on the current page
      var currentPath = window.location.pathname;
      console.log('current path=', currentPath);
      if (currentPath.includes("/topTracks")) {
        document.getElementById("tracksSection").style.display = 'block';
        var sliderValue = localStorage.getItem(window.location.pathname + "_slider_value");
        if (sliderValue != null) {
          document.getElementById("myRange").value = sliderValue;
          updateTracks();
        }

        let oldTracks = JSON.parse(localStorage.getItem("stored_tracks")) || [];
        // console.log('list of old tracks', oldTracks);
        // Display each artist on the page
        oldTracks.forEach(function (track) {
          addTracks(track);
          // console.log("added tracks");
        });
        // refreshTopTracks();
      } else if (currentPath.includes("/topArtists")) {
        document.getElementById("artistsSection").style.display = 'block';
        var sliderValue = localStorage.getItem(window.location.pathname + "_slider_value");
        if (sliderValue != null) {
          document.getElementById("myRange").value = sliderValue;
          updateArtists();
        }

        // Retrieve the stored artists from local storage
        let oldArtists = JSON.parse(localStorage.getItem("stored_artists")) || [];
        // console.log('list of old artists', oldArtists);
        oldArtists.forEach(function (artist) {
          addArtists(artist);
          // console.log("added artists");
        });
        // refreshTopArtists();
      } else if (currentPath.includes("/profile")) {
        document.getElementById("profileSection").style.display = 'block';
        getProfile();
      } else if (currentPath.includes("recommend")) {
        document.getElementById("recommendedSection").style.display = 'block';
        let oldRecTracks = JSON.parse(localStorage.getItem("stored_recTracks")) || [];
        // console.log('list of old artists', oldArtists);
        oldRecTracks.forEach(function (track) {
          addTrackRec(track);
          // console.log("added artists");
        });
      }
    }
  }
}



function getCode() {
  let code = null;
  const queryString = window.location.search;
  if (queryString.length > 0) {
    const urlParams = new URLSearchParams(queryString);
    code = urlParams.get('code');
  }
  return code;
}

function handleRedirect() {
  let code = getCode();
  fetchAccessToken(code);
  window.history.pushState("", "", redirect_uri);
}



function requestAuth() {
  let url = AUTHORIZE;
  url += '?client_id=' + client_id;
  url += '&response_type=code';
  url += '&redirect_uri=' + encodeURI(redirect_uri);
  url += '&show_dialog=true';
  url += '&user-read-private user-read-email user-read-currently-playing user-read-playback-position user-library-modify playlist-modify-private playlist-modify-public user-top-read user-library-read';
  window.location.href = url;
}


function fetchAccessToken(code) {
  let body = 'grant_type=authorization_code';
  body += '&code=' + code;
  body += '&redirect_uri=' + encodeURI(redirect_uri);
  body += '&client_id=' + client_id;
  body += '&client_secret=' + client_secret;
  // console.log(client_secret);
  callAuthApi(body);
}

function refreshAccessToken() {
  refresh_token = localStorage.getItem("refresh_token");
  let body = "grant_type=refresh_token";
  body += "&refresh_token=" + refresh_token;
  body += "&client_id=" + client_id;
  callAuthApi(body);
}

function callAuthApi(body) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
  xhr.send(body);
  xhr.onload = handleAuthResponse;
}

function handleAuthResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    var data = JSON.parse(this.responseText);
    if (data.access_token != undefined) {
      access_token = data.access_token;
      localStorage.setItem("access_token", access_token);
    }
    if (data.refresh_token != undefined) {
      refresh_token = data.refresh_token;
      localStorage.setItem("refresh_token", refresh_token);
    }
    onPageLoad();
  }
  else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function getRecTracks(recUrl) {
  callApi("GET", recUrl, null, handleRecTrackResponse);
}

function getTrack(artistId) {
  callApi("GET", artistId, null, handleGetArtistInfoResponse);
}

function searchTrack(name) {
  callApi("GET", name, null, handleSearchTrackResponse);
}

function refreshTopArtists(range) {
  callApi("GET", range, null, handleArtistsResponse);
}

function refreshTopTracks(range) {
  callApi("GET", range, null, handleTracksResponse);
}

function getProfile() {
  callApi("GET", PROFILE, null, handleProfileResponse);
}

function handleProfileResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    // removeAllItems("profile");
    // data.item.forEach(item => addProfileInfo(item));
    addProfileInfo(data);

  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText)
  }
}

function handleRecTrackResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    removeAllItems("recTracks");
    data.tracks.forEach(item => addTrackRec(item));

  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText)
  }
}

function handleGetArtistInfoResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    let seed_artists = data.id;
    let seed_genres = data.genres[0];
    let seedSong = localStorage.getItem('seed_track');
    // console.log(seed_genres);
    // console.log(seed_artists);
    // console.log(seedSong);
    requestTrackRec(seed_artists, seed_genres, seedSong);

  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText)
  }
}

function handleSearchTrackResponse() {// send artist id to get genres
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    removeAllItems("recTracks");
    let seed_tracks = data.tracks.items[0].id;
    localStorage.setItem('seed_track', seed_tracks);
    let artist_id = data.tracks.items[0].artists[0].id
    // console.log('artist_id: ', artist_id);
    getArtistInfo(artist_id)

  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText)
  }
}

function handleArtistsResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    removeAllItems("topArtists");
    data.items.forEach(item => addArtists(item));
  }
  else if (this.status == 401) {
    refreshAccessToken()
  }
  else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function handleTracksResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    removeAllItems("topTracks");
    data.items.forEach(item => addTracks(item));


  }
  else if (this.status == 401) {
    refreshAccessToken()
  }
  else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function addTrackRec(item) {
  let rowNode = document.createElement("tr");
  let nameNode = document.createElement("td");
  let imageNode = document.createElement("img");

  nameNode.value = item.id;
  nameNode.className = "titleText";
  nameNode.innerHTML = item.name;
  imageNode.src = item.album.images[1].url;

  rowNode.appendChild(imageNode);
  rowNode.appendChild(nameNode);

  document.getElementById("recTrack").style.display = "block";
  document.getElementById("recTrack").appendChild(rowNode);


  let storedRecTracks = JSON.parse(localStorage.getItem("stored_recTracks")) || [];
  storedRecTracks.push(item);
  if (storedRecTracks.length > 20) {
    storedRecTracks.shift();
  }

  let firstArtistImage = storedRecTracks[0].album.images[0].url;
  document.body.style.backgroundImage = `url(${firstArtistImage})`;

  localStorage.setItem("stored_recTracks", JSON.stringify(storedRecTracks));
}

function addArtists(item) {
  let rowNode = document.createElement("tr");
  let nameNode = document.createElement("td");
  let imageNode = document.createElement("img");

  nameNode.value = item.id;
  nameNode.className = "titleText";
  nameNode.innerHTML = item.name;
  imageNode.src = item.images[1].url;

  rowNode.appendChild(imageNode);
  rowNode.appendChild(nameNode);

  document.getElementById("topArtists").style.display = "block";
  document.getElementById("topArtists").appendChild(rowNode);


  let storedArtists = JSON.parse(localStorage.getItem("stored_artists")) || [];

  storedArtists.push(item);
  if (storedArtists.length > 20) {
    storedArtists.shift();
  }
  let firstArtistImage = storedArtists[0].images[0].url;
  document.body.style.backgroundImage = `url(${firstArtistImage})`;

  localStorage.setItem("stored_artists", JSON.stringify(storedArtists));
}

function addTracks(item) {
  let rowNode = document.createElement("tr");
  let nameNode = document.createElement("td");
  let imageNode = document.createElement("img");

  nameNode.value = item.id;
  nameNode.className = "titleText";
  nameNode.innerHTML = item.name;
  imageNode.src = item.album.images[1].url;

  rowNode.appendChild(imageNode);
  rowNode.appendChild(nameNode);

  document.getElementById("topTracks").style.display = "block";
  document.getElementById("topTracks").appendChild(rowNode);

  let storedTracks = JSON.parse(localStorage.getItem("stored_tracks")) || [];

  storedTracks.push(item);
  if (storedTracks.length > 20) {
    storedTracks.shift();
  }
  let firstImage = storedTracks[0].album.images[0].url;
  document.body.style.backgroundImage = `url(${firstImage})`;
  localStorage.setItem("stored_tracks", JSON.stringify(storedTracks));

}

function addProfileInfo(item) {
  let followersCount = document.createElement("div");
  let accountType = document.createElement("div");
  let country = document.createElement("div");
  let profileImage = document.createElement("div");
  let displayName = document.createElement("div");

  let pI = document.createElement("img");


  followersCount.className = "followerCount";
  followersCount.innerHTML = item.followers.total;
  displayName.className = "DisplayName";
  displayName.innerHTML = item.display_name;
  accountType.className = "AccountType";
  accountType.innerHTML = item.product;
  country.className = "Country";
  country.innerHTML = item.country;
  profileImage.className = "profileImage";
  pI.src = item.images[0].url;

  document.getElementById("profileContainer").style.display = "grid";
  document.getElementById("profileContainer").appendChild(followersCount);
  document.getElementById("profileContainer").appendChild(profileImage).appendChild(pI);
  document.getElementById("profileContainer").appendChild(displayName);
  document.getElementById("profileContainer").appendChild(country);
  document.getElementById("profileContainer").appendChild(accountType);

  // document.getElementById("profile").appendChild(followersRowNode);
  // document.getElementById("profile").appendChild(accountRowNode);

}

function callApi(method, url, body, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
  xhr.send(body);
  xhr.onload = callback;
}

function removeAllItems(elementId) {
  let node = document.getElementById(elementId);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function updateTracks() {
  var slider = document.getElementById("myRange");
  let value = slider.value;
  // console.log(slider.value);
  if (value == 50) {
    refreshTopTracks(TRACKS);
  } else if (value == 1) {
    refreshTopTracks(TRACKS_SHORT_TERM);
  } else {
    refreshTopTracks(TRACKS_LONG_TERM);
  }
  localStorage.setItem(window.location.pathname + "_slider_value", value)
}

function updateArtists() {
  var slider = document.getElementById("myRange");
  let value = slider.value;
  // console.log(slider.value);
  if (value == 50) {
    refreshTopArtists(ARTISTS);
  } else if (value == 1) {
    refreshTopArtists(ARTISTS_SHORT_TERM);
  } else {
    refreshTopArtists(ARTISTS_LONG_TERM);
  }
  localStorage.setItem(window.location.pathname + "_slider_value", value)

}

function handleTracksRefresh() {
  refreshTopTracks(TRACKS);
}
function handleArtistsRefresh() {
  refreshTopArtists(ARTISTS);
}


function fetchTrack() {
  //     window.location.reload();

  var value = document.getElementById("searchKey").value;
  let url = SEARCH_TRACK;
  url += 'q=track%3A' + value;
  url += '&type=track&limit=20';
  searchTrack(url);
  document.getElementById("btn1").addEventListener("click", function () {
    window.location.reload();
  });
}

function getArtistInfo(artistId) {
  let url = ARTIST_INFO;
  url += artistId;
  // console.log("artist url: ", url);
  // console.log('seed song: ');

  getTrack(url);
}

function requestTrackRec(seed_artists, seed_genres, seed_tracks) {
  let url = TRACK_REC;
  url += 'limit=20';
  url += '&seed_artists=' + seed_artists;
  url += '&seed_genres=' + seed_genres;
  url += '&seed_tracks=' + seed_tracks;
  // console.log(url);

  getRecTracks(url);
}

// function refreshRecTracks() {
//   fetchTrack();
//   document.getElementById("refreshButton").addEventListener("click", function () {
//     window.location.reload();
//   });
//   console.log('refresh clicked');
// }
