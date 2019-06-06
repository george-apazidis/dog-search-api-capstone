"use strict";

let cleanName = "";

// AJAX call to dog API - All Breeds
function getAllBreeds() {
  fetch("https://dog.ceo/api/breeds/list/all")
    .then(response => response.json())
    .then(responseJson => populateBreedMenu(responseJson))
    .catch(error => console.log(error));
}

// AJAX call to dog API - Breed images
function getBreedImages(currentBreed) {
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
function getWiki(searchWord) {
  var wikiParams = {
    origin: "*",
    action: "query",
    format: "json",
    prop: "extracts|pageimages",
    indexpageids: 1,
    redirects: 1,
    exchars: 600,
    // explaintext: 1,
    exsectionformat: "plain",
    piprop: "name|thumbnail|original",
    pithumbsize: 250
  };

  wikiParams.titles = cleanName;
  // console.log("cleanName = ", cleanName);

  let url = "https://en.wikipedia.org/w/api.php";
  $.getJSON(url, wikiParams, function(data) {
    // console.log("first call: ", wikiParams.titles);

    // if no results
    if (data.query.pageids[0] === "-1") {
      // replace 'dog' with 'terrier'
      wikiParams.titles = cleanName.replace("dog", "terrier");

      // call API again with 'terreir'
      $.getJSON(url, wikiParams, function(data) {
        // console.log("2nd call: ", wikiParams.titles);

        // if no results
        if (data.query.pageids[0] === "-1") {
          // title param = no 'dog' or 'terrier' words
          wikiParams.titles = cleanName.replace(" dog", "");

          // call API again with just the breed name
          $.getJSON(url, wikiParams, function(data) {
            // console.log("3rd call: ", wikiParams.titles);
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
function getYoutube(searchWord) {
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

  let url = "https://www.googleapis.com/youtube/v3/search";
  $.getJSON(url, params, function(data) {
    showYoutube(data.items);
  });
}

// Display Wikipedia data
function showWiki(results, breedName) {
  const pageID = results.pageids[0];
  let dogBlurb = results.pages[pageID].extract;

  // MARIUS --
  // if dogBlurb ends with '...'

  if (dogBlurb.endsWith("...")) {
    // get index of '<'
    let lastClosingTag = dogBlurb.lastIndexOf("<");

    // remove '...' from end
    dogBlurb = dogBlurb.slice(0, -3);

    // insert '...' before lastClosingTag
    dogBlurb = [
      dogBlurb.slice(0, lastClosingTag),
      "...",
      dogBlurb.slice(lastClosingTag)
    ].join("");
  }

  //dogBlurb = dogBlurb.slice(-3);
  //console.log(dogBlurb);

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
    `<hr><p class="ext_link"><a href='https://en.wikipedia.org/?curid=${pageID}' target='blank'><i class="fas fa-external-link-square-alt"></i>more on Wikipedia</a></p>`
  );
}

// Display YouTube data
function showYoutube(results) {
  console.log(results);
  $("#youTube").html("");

  let thumbURL = "";
  let vidURL = "";
  let title = "";
  let descrip = "";
  let date = "";
  let channelTitle = "";

  for (let i = 0; i < results.length; i++) {
    thumbURL = results[i].snippet.thumbnails.medium.url;
    vidURL = `https://www.youtube.com/watch?v=${results[i].id.videoId}`;
    title = results[i].snippet.title;
    descrip = results[i].snippet.description;
    date = results[i].snippet.publishedAt
      .substring(0, results[i].snippet.publishedAt.length - 14)
      .replace(/-/g, "/");
    channelTitle = results[i].snippet.channelTitle;

    // show image TN
    $("#youTube").append(
      `<a href='${vidURL}' target="_blank"><img class='yt-tn' src='${thumbURL}'></a>`
    );

    // show title
    $("#youTube").append(`<div class='yt-text'><h3>${title}</h3>`);

    // show date and channel title
    $("#youTube").append(`<p class="yt-meta">${date} - ${channelTitle}</p>`);

    // show description
    $("#youTube").append(`<p class="yt-description">${descrip}</p></div>`);
  }
}

// Display dog breeds in menu
function populateBreedMenu(results) {
  let breedList = [];
  let subBreed = "";
  // console.log(results);

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
    $("#breed-list , #breed-list-sticky").append(
      $("<option></option>")
        .val(breedName)
        .html(breedName)
    );
  });
}

// Display dog images
function showDogImages(results) {
  $("#dogApi-images").html("");
  // console.log("inside dogimages --- ", results);

  // itterate array of images
  if (results.status == "success") {
    for (let i = 0; i < results.message.length; i++) {
      $("#dogApi-images").append(
        `<div class="dog-img" style="background-image:url('${
          results.message[i]
        }')"></div>`
      );
    }
  } else {
    $("#dogApi-images").append("Could not load images");
  }
}

function getCleanName(searchWord) {
  // console.log(searchWord);

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
    return dogNameOverride[searchWord];
  }
  // if dog is a sub-breed
  else if (searchWord.includes("-")) {
    // put sub-breed before breed
    searchWord = searchWord
      .replace(" - ", " ") // replace hyphen with space
      .split(" ") // create array with each word as item
      .reverse() // reverse order of array
      .join(" "); // join each item of array into a string with a space between each word
    return searchWord;
  } else {
    return searchWord + " dog";
  }
}

// Event listener for submit btn
function watchForm() {
  $("form").submit(event => {
    event.preventDefault();

    let searchValue = $("#breed-list option:selected").val();

    if (searchValue != "") {
      cleanName = getCleanName(searchValue);
      getWiki(cleanName);
      getBreedImages(searchValue);
      getYoutube(cleanName);
      scrollToContent();
    } else {
      alert("Please choose a breed");
    }
  });
}

// on pull-down menu changes
$("#breed-list, #breed-list-sticky").on("change", function() {
  let searchValue = $(this).val();

  // clear selected on both menus
  $("#breed-list option, #breed-list-sticky option").attr("selected", false);

  // assign 'selected' to searchValue to both menus
  $(`#breed-list-sticky option[value='${searchValue}'], 
     #breed-list option[value='${searchValue}']`).attr("selected", true);
});

function scrollToContent() {
  $("html, body").animate(
    {
      scrollTop: $(".main").offset().top
    },
    900
  );
}

// on load
$(function() {
  watchForm();
  getAllBreeds();
});
