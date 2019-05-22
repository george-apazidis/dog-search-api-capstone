"use strict";

let currentBreed = "dalmatian";

// AJAX call to dog API - All Breeds
function getAllBreeds() {
  fetch("https://dog.ceo/api/breeds/list/all")
    .then(response => response.json())
    .then(responseJson => populateBreedMenu(responseJson))
    .catch(error => console.log(error));
}

// AJAX call to dog API - Breed images
function getBreedImages() {
  // if "-" exists in currentBreed, so reconstruct currentBreed var
  currentBreed = currentBreed.includes("-")
    ? currentBreed.replace(" - ", "/")
    : currentBreed;

  fetch(`https://dog.ceo/api/breed/${currentBreed}/images/random/20`)
    .then(response => response.json())
    .then(responseJson => showDogImages(responseJson))
    .catch(error => alert("Something went wrong. Try again later."));
}

// AJAX call to Wikipedia API
// convert to FETCH API
function searchWiki(searchWord) {
  var wikiParams = {
    origin: "*",
    action: "query",
    format: "json",
    prop: "extracts|pageimages",
    indexpageids: 1,
    redirects: 1,
    exchars: 1200,
    // explaintext: 1,
    exsectionformat: "plain",
    piprop: "name|thumbnail|original",
    pithumbsize: 250
  };

  wikiParams.titles = searchWord;
  url = "https://en.wikipedia.org/w/api.php";
  $.getJSON(url, wikiParams, function(data) {
    if (data.query.pageids[0] === "-1") {
      wikiParams.titles = searchWord.replace(/\b\w/g, function(l) {
        return l.toUpperCase();
      });
      $.getJSON(url, wikiParams, function(data) {
        if (data.query.pageids[0] === "-1") {
          wikiParams.titles = searchWord.toUpperCase();
          $.getJSON(url, wikiParams, function(data) {
            showWiki(data.query);
          });
        } else {
          showWiki(data.query);
        }
      });
    } else {
      showWiki(data.query);
    }
  });
}

// AJAX call to YouTube API
// convert to FETCH API
function searchYoutube(searchWord) {
  var params = {
    part: "snippet",
    key: "AIzaSyA2b7kNQ0eZHeAFJYwxI6-8xJo755yPkX0",
    q: "What is a" + searchWord + "dog",
    maxResults: 8,
    type: "video",
    order: "Relevance",
    safeSearch: "strict",
    relevanceLanguage: "en"
  };

  url = "https://www.googleapis.com/youtube/v3/search";
  $.getJSON(url, params, function(data) {
    showYoutube(searchWord, data.items);
  });
}

// Display Wikipedia data
function showWiki(results) {
  console.log(results);
}

// Display YouTube data
function showYoutube(searchWord, results) {
  console.log(results);
}

// Display dog breeds in menu
function populateBreedMenu(results) {
  console.log(results);

  let breedList = [];
  let subBreed = "";

  // loop through results object
  Object.keys(results.message).forEach(function(key) {
    // if breed contains sub-breed
    if (results.message[key].length >= 1) {
      // itterate through all sub-breeds
      for (let i = 0; i < results.message[key].length; i++) {
        // get sub-breed name
        subBreed = results.message[key][i];
        // construct new string of 'Breed - sub-breed' and add to breedList array
        breedList.push(key + " - " + subBreed);
      }
    } else {
      // add breed
      breedList.push(key);
    }
  });
  console.log(breedList);

  // insert all breed names into pull-down menu
}

// Display dog images
function showDogImages(results) {
  console.log(results);
}

getAllBreeds();
