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

  // create object to match dog breeds manually
  const dogNameOverride = {
    appenzeller: "Appenzeller Sennenhund",
    bouvier: "Bouvier des Flandres",
    brabancon: "Brabancon Griffon",
    "bullterrier - staffordshire": "Staffordshire Bull Terrier",
    chow: "chow chow",
    clumber: "Clumber Spaniel",
    cotondetulear: "Coton de Tulear",
    "terrier - westhighland": "West Highland White Terrier",
    "terrier - toy": "English Toy Terrier",
    "terrier - russell": "Russell_Terrier",
    "terrier - kerryblue": "Kerry Blue Terrier",
    "terrier - dandie": "Dandie Dinmont Terrier",
    "terrier - american": "American Staffordshire Terrier",
    stbernard: "St. Bernard (dog)",
    "spaniel - irish": "Irish Water Spaniel",
    "spaniel - blenheim": "King Charles Spaniel",
    "sheepdog - english": "Old English Sheepdog",
    "retriever - curly": "Curly-coated Retriever",
    "retriever - chesapeake": "Chesapeake Bay Retriever",
    redbone: "Redbone Coonhound",
    pyrenees: "Great Pyrenees",
    "pointer - germanlonghair": "German Longhaired Pointer",
    "pointer - german": "German Shorthaired Pointer",
    pembroke: "Pembroke Welsh Corgi",
    "mountain - swiss": "Swiss mountain dog",
    "mountain - bernese": "Bernese Mountain Dog",
    mix: "Mongrel",
    mexicanhairless: "Mexican Hairless Dog",
    lhasa: "Lhasa Apso",
    leonberg: "Leonberger",
    kelpie: "Australian Kelpie",
    "hound - walker": "Treeing Walker Coonhound",
    "hound - english": "English Foxhound",
    germanshepherd: "German Shepherd",
    eskimo: "American Eskimo Dog"
  };

  // if the dog bree is in the override object
  if (dogNameOverride.hasOwnProperty(searchWord)) {
    wikiParams.titles = dogNameOverride[searchWord];
  }
  // if dog is a sub-breed
  else if (searchWord.includes("-")) {
    // put sub-breed before breed
    searchWord = searchWord
      .replace(" - ", " ") // replace hyphen with space
      .split(" ") // create array with each word as item
      .reverse() // reverse order of array
      .join(" "); // join each item of array into a string with a space between each word
    wikiParams.titles = searchWord;
  } else {
    wikiParams.titles = searchWord + " dog";
  }

  let url = "https://en.wikipedia.org/w/api.php";
  $.getJSON(url, wikiParams, function(data) {
    console.log("first call: ", wikiParams.titles);

    // if no results
    if (data.query.pageids[0] === "-1") {
      // replace 'dog' with 'terrier'
      wikiParams.titles = searchWord + " terrier";

      // call API again with 'terreir'
      $.getJSON(url, wikiParams, function(data) {
        console.log("2nd call: ", wikiParams.titles);

        // if no results
        if (data.query.pageids[0] === "-1") {
          wikiParams.titles = searchWord;

          // call API again with just the breed name
          $.getJSON(url, wikiParams, function(data) {
            console.log("3rd call: ", wikiParams.titles);
            showWiki(data.query, searchWord);
          });
        } else {
          showWiki(data.query, searchWord);
        }
      });
    } else {
      showWiki(data.query, searchWord);
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
function showWiki(results, breedName) {
  const pageID = results.pageids[0];
  const dogBlurb = results.pages[pageID].extract;

  $("#wiki").html("");

  // if images exist
  if ("thumbnail" in results.pages[pageID]) {
    const dogImgURL = results.pages[pageID].thumbnail.source;
    $("#wiki").append(
      `<img class="dog-image" src='${dogImgURL}' alt='${breedName}'>`
    );
  }

  $("#wiki").append(dogBlurb);
  $("#wiki").append(
    `<a href='https://en.wikipedia.org/?curid=${pageID}' target='blank'>link to wiki page</a>`
  );
}

// Display YouTube data
function showYoutube(searchWord, results) {
  console.log(results);
}

// Display dog breeds in menu
function populateBreedMenu(results) {
  let breedList = [];
  let subBreed = "";
  console.log(results);

  // loop through results object for each breed
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

  // insert all breed names into pull-down menu
  $.each(breedList, function(i, breedName) {
    $("#breed-list").append(
      $("<option></option>")
        .val(breedName)
        .html(breedName)
    );
  });
}

// Display dog images
function showDogImages(results) {
  console.log(results);
}

// Event listener for submit btn
function watchForm() {
  $("form").submit(event => {
    event.preventDefault();
    let searchWord = $("#breed-list option:selected").text();
    searchWiki(searchWord);
    // searchYoutube();
    // getBreedImages();
  });
}

// on load
$(function() {
  watchForm();
  getAllBreeds();
});
