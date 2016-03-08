'use strict';
/*
 * restaurantsAPI.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>,
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/

//global vars
var map; //map instance
//a proxy should be used if the API is not in the same location as the web app.
var proxyURL = '';

var baseURL = 'http://tourguide/api/orion/';

var reservationsPerDate;
var minTime = '12:30';
var maxTime = '22:30';
var alreadyPartySizeInit = false;

var availabilityTimeCount;
var availableTimeArray;

/* get all restaurants and show it */
function getAllRestaurants() {
  getAjaxRequest(baseURL + 'restaurants/', showRestaurants,
    function() {alert('Could not retrive restaurants');});
}

function getOrganizationRestaurants(organization) {
  var URL = baseURL + 'restaurants/organization/' + organization;
  getAjaxRequest(URL,
    showRestaurants, function() {alert('Could not retrive restaurants');}
    );
}

/*show restaurants from the API response*/
function showRestaurants(restaurants) {
  restaurants = JSON.parse(restaurants);
  //loop over all restaurants
  var restaurantMarks = [];
  var errors = 0;
  for (var i = 0, len = restaurants.length; i < len; i++) {

    var restaurant = restaurants[i];
    var mark = {'name': restaurant.name};

    //get desired attributes
    try {
      mark.address = restaurant.address.streetAddress;
    }
    catch (err) {
      console.log('Cannot get street address for ' + restaurant.name);
    }

    try {
      mark.locality = restaurant.address.addressLocality;
    }
    catch (err) {
      console.log('Cannot get locality address for ' +
        restaurant.name);
    }

    try {
      mark.region = restaurant.address.addressRegion;
    }
    catch (err) {
      console.log('Cannot get region address for ' + restaurant.name);
    }

    try {
      mark.telephone = restaurant.telephone;
    }
    catch (err) {
      console.log('Cannot get telephone for ' + restaurant.name);
    }

    try {
      mark.description = restaurant.description;
    }
    catch (err) {
      console.log('Cannot get description for ' + restaurant.name);
    }

    try {
      mark.ratingValue = restaurant.aggregateRating.ratingValue;
    }
    catch (err) {
      console.log('Cannot get ratingValue for ' + restaurant.name);
    }

    try {
      mark.reviewCount = restaurant.aggregateRating.reviewCount;
    }
    catch (err) {
      console.log('Cannot get reviewCount for ' + restaurant.name);
    }

    mark.coords = [];

    try {
      mark.coords.push(parseFloat(restaurant.geo.latitude));
      if (isNaN(mark.coords[0])) {
        console.log('invalid latitude ' +
          restaurant.geo.latitude +
          ' for restaurant ' + restaurant.name);
        errors = errors + 1;
        continue;
      }
    }
    catch (err) {
      console.log('Cannot get latitude for ' + restaurant.name);
      console.log(err);
      errors = errors + 1;
      continue;
    }

    try {
      mark.coords.push(parseFloat(restaurant.geo.longitude));
      if (isNaN(mark.coords[1])) {
        console.log('invalid longitude ' +
          restaurant.geo.longitude + ' for restaurant ' +
          restaurant.name);
        errors = errors + 1;
        continue;
      }
    }
    catch (err) {
      console.log('Cannot get longitude for ' + restaurant.name);
      console.log(err);
      errors = errors + 1;
      continue;
    }

    restaurantMarks.push(mark);
  }
  //console.log("Errors: "+ errors);

  /* clustering approach */
  var markerClusters = L.markerClusterGroup({showCoverageOnHover: true});
  var markers = [];
  for (var i = 0, len = restaurantMarks.length; i < len; i++) {

    //add mark to map
    restaurantMarks[i].mark = L.marker(restaurantMarks[i].coords);

    var popHTML = document.createElement('DIV');
    popHTML.className = 'markPopUp';

    var restaurantName = document.createElement('B');
    restaurantName.textContent = restaurantMarks[i].name;
    popHTML.appendChild(restaurantName);

    var addressP = document.createElement('P');
    addressP.textContent = 'Address: ' + restaurantMarks[i].address;
    popHTML.appendChild(addressP);

    var phoneP = document.createElement('P');
    phoneP.textContent = 'Phone: ' + restaurantMarks[i].telephone;
    popHTML.appendChild(phoneP);

    var showReviews = document.createElement('A');
    showReviews.textContent = 'Show reviews';
    showReviews.onclick = (function(restaurantName) {
        return function() {
          getAndShowRestaurantReviews(restaurantName);
        }
    })(restaurantMarks[i].name);

    popHTML.appendChild(showReviews);
    popHTML.appendChild(document.createElement('BR'));

    var showReservations = document.createElement('A');
    showReservations.textContent = 'Show reservations';
    showReservations.onclick = (function(restaurantName) {
        return function() {
          getAndShowRestaurantReservations(restaurantName);
        }
    })(restaurantMarks[i].name);

    popHTML.appendChild(showReservations);
    popHTML.appendChild(document.createElement('BR'));


    var createReview = addCreateReviewLink(restaurantMarks[i].name);
    if (null != createReview) {
        popHTML.appendChild(createReview);
        popHTML.appendChild(document.createElement('BR'));
    }

    var createReservation = addCreateReservationLink(restaurantMarks[i].name);
    if (null != createReservation) {
        popHTML.appendChild(createReservation);
    }


    popHTML.appendChild(createReservation);

    restaurantMarks[i].mark.bindPopup(popHTML);

    //reference all mark info for use from leaflet
    restaurantMarks[i].mark.extraInfo = restaurantMarks[i];

    markerClusters.addLayer(restaurantMarks[i].mark);

    //group for make a bbox that contains all markers.
    //Skipped Pascual Berganzo because it is in Colombia
    if (restaurantMarks[i].name != 'Pascual Berganzo') {
      markers.push(restaurantMarks[i].mark);
    }
  }

  //var group = new L.featureGroup(markers);

  //set the view
  //map.fitBounds(group.getBounds().pad(0.5));
  map.addLayer(markerClusters);
}


function addCreateReviewLink(restaurantName) {
  var userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (! hasRole(userInfo, 'End user')) {
    return null;
  }

  var createReviewLink = document.createElement('A');
  createReviewLink.textContent = 'Create review';
  createReviewLink.onclick = (function(restaurantName) {
    return function() {
      editNewReview(restaurantName);
    }
  })(restaurantName);

  return createReviewLink;
}



function editNewReview(restaurantName) {

  var userInfo = JSON.parse(localStorage.getItem('userInfo'));
  document.getElementById('popTitle').textContent = restaurantName;
  var reviewForm = document.createElement('FORM');
  reviewForm.name = 'editReviewForm';
  reviewForm.className = 'editReviewForm';

  var reviewLabel = document.createElement('LABEL');
  reviewLabel.textContent = 'Your review: ';
  reviewForm.appendChild(reviewLabel);
  reviewForm.appendChild(document.createElement('BR'));

  var reviewBody = document.createElement('TEXTAREA');
  reviewBody.name = 'reviewBody';
  reviewForm.appendChild(reviewBody);
  reviewForm.appendChild(document.createElement('BR'));

  var ratingLabel = document.createElement('LABEL');
  ratingLabel.textContent = 'Rating value: ';
  reviewForm.appendChild(ratingLabel);

  var ratingValueSelect = document.createElement('SELECT');
  ratingValueSelect.name = 'ratingValue';


  var option;
  for (var i = 0; i <= 5; i++) {
    option = document.createElement('OPTION');
    option.value = i;
    option.textContent = i + ' Star' + (1 != i ? 's' : '');
    ratingValueSelect.appendChild(option);
  }

  reviewForm.appendChild(ratingValueSelect);

  var submit = document.createElement('INPUT');
  submit.type = 'submit';
  submit.value = 'Create Review';
  submit.onclik = (function(restaurantName) {
    return function() {
      createNewReview(restaurantName);
    }
  })(restaurantName);

  reviewForm.appendChild(submit);

  document.getElementById('popContent').innerHTML = '';

  document.getElementById('popContent').appendChild(reviewForm);

  openPopUpWindow();
}



function editReview(reviewId) {
  var userInfo = JSON.parse(localStorage.getItem('userInfo'));
  var URL = baseURL + 'review/' + reviewId;
  getAjaxRequest(URL,
      showEditReview,
       function() {
        window.alert('Cannot get review ' + reviewId);
       });
}


function showEditReview(reviewResponse) {
  reviewResponse = JSON.parse(reviewResponse);
  console.log('Gonna edit review: ');
  console.log(reviewResponse);
  if (reviewResponse.length != 1) {
    window.alert('Error: more than one review received.');
  }

  var review = reviewResponse[0];


  document.getElementById('popTitle').textContent = 'Edit review ' +
    review.name + ' for ' + review.itemReviewed.name;
  var reviewForm = document.createElement('FORM');
  reviewForm.name = 'editReviewForm';
  reviewForm.className = 'editReviewForm';

  var reviewLabel = document.createElement('LABEL');
  reviewLabel.textContent = 'Your review: ';
  reviewForm.appendChild(reviewLabel);
  reviewForm.appendChild(document.createElement('BR'));

  var reviewBody = document.createElement('TEXTAREA');
  reviewBody.name = 'reviewBody';
  reviewForm.appendChild(reviewBody);
  reviewForm.appendChild(document.createElement('BR'));

  var ratingLabel = document.createElement('LABEL');
  ratingLabel.textContent = 'Rating value: ';
  reviewForm.appendChild(ratingLabel);

  var ratingValueSelect = document.createElement('SELECT');
  ratingValueSelect.name = 'ratingValue';

  var option;
  for (var i = 0; i <= 5; i++) {
    option = document.createElement('OPTION');
    option.value = i;
    option.textContent = i + ' Star' + (1 != i ? 's' : '');
    ratingValueSelect.appendChild(option);
  }

  reviewForm.appendChild(ratingValueSelect);

  var submit = document.createElement('INPUT');
  submit.type = 'submit';
  submit.value = 'Update review';
  submit.onclik = (function(reviewName) {
    return function() {
      updateReview(reviewName);
    }
  })(review.name);

  reviewForm.appendChild(submit);

  document.getElementById('popContent').innerHTML = '';
  document.getElementById('popContent').appendChild(reviewForm);


  //mark the selected rating
  var value = review.reviewRating.ratingValue;
  markSelectedValue(ratingValueSelect, value);

  openPopUpWindow();
}


function viewReview(reviewId) {
  var userInfo = JSON.parse(localStorage.getItem('userInfo'));
  var URL = baseURL + 'review/' + reviewId;
  getAjaxRequest(URL,
      processViewReview,
       function() {
        window.alert('Cannot get review ' + reviewId);
       });
}


function processViewReview(reviewResponse) {
  var reviewResponse = JSON.parse(reviewResponse);
  console.log('Gonna edit review: ');
  console.log(reviewResponse);
  if (reviewResponse.length != 1) {
    window.alert('Error: more than one review received.');
  }

  var review = reviewResponse[0];


  //remove previous content
  var myNode = document.getElementById('popContent');
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }
  /*

  document.getElementById("pop_title").innerHTML ='Review '+ review['name']+
    ' for '+review["itemReviewed"]["name"];
  reviewInfo = '';
  reviewInfo +='\n<div id="reviewInfo">';
  reviewInfo +='\n<h4>Rating: '
    + review['reviewRating']['ratingValue']+'</h4>';
  reviewInfo +='\n<h4>Review text:</h4>';
  reviewInfo +='\n<p">'+review["reviewBody"]+'</p>';
  reviewInfo +='\n</div>';


  */
  var reviewElement = document.createElement('DIV');
  reviewElement.className = 'reviewElement';

  //top container
  var top = document.createElement('DIV');
  top.class = 'review-top';

  //rating
  var rating = document.createElement('DIV');
  rating.class = 'rating-div';

  var ratingLabel = document.createElement('SPAN');
  ratingLabel.className = 'ratingLabel';
  ratingLabel.textContent = 'Rating: ';

  var ratingValue = document.createElement('SPAN');
  ratingValue.className = 'ratingValue';
  ratingValue.textContent = review.reviewRating.ratingValue;

  rating.appendChild(ratingLabel);
  rating.appendChild(ratingValue);
  top.appendChild(rating);

  //author
  var author = document.createElement('DIV');
  author.class = 'author-div';

  var authorLabel = document.createElement('SPAN');
  authorLabel.className = 'authorLabel';
  authorLabel.textContent = 'Author: ';

  var authorValue = document.createElement('SPAN');
  authorValue.className = 'authorValue';
  authorValue.textContent = review.author.name;

  author.appendChild(authorLabel);
  author.appendChild(authorValue);
  top.appendChild(author);


  reviewElement.appendChild(top);


  var hr = document.createElement('HR');
  reviewElement.appendChild(hr);
  //body
  var body = document.createElement('DIV');
  body.class = 'reviewBodyDiv';

  var bodyLabel = document.createElement('SPAN');
  bodyLabel.className = 'bodyLabel';

  var bodyValue = document.createElement('SPAN');
  bodyValue.className = 'bodyValue';
  bodyValue.textContent = review.reviewBody;

  body.appendChild(bodyLabel);
  body.appendChild(bodyValue);
  reviewElement.appendChild(body);


  myNode.appendChild(reviewElement);

  openPopUpWindow();
}


function markSelectedValue(selectObject, value) {
  for (var i = 0; i < selectObject.options.length; i++) {
    if (String(selectObject.options[i].value) == String(value)) {
      selectObject.options[i].selected = true;
    }
    else {
      selectObject.options[i].selected = false;
    }
  }
}



function createNewReview(restaurantName) {
  var ratingValue = parseInt(document.forms.editReviewForm.ratingValue.value);
  var reviewBody = document.forms.editReviewForm.reviewBody.value;


  var data = {
      '@type': 'Review',
      'itemReviewed': {
      '@type': 'Restaurant',
      'name': '' + restaurantName,
      },
      'name': 'Rating description',
      'reviewBody': '' + reviewBody,
      'reviewRating': {
      '@type': 'Rating',
      'ratingValue': ratingValue
      }
    };



  postAjaxRequest(baseURL + 'review/',
    closePopUpWindow,
    function(err) {alert('Cannot add review'); console.log(err);}, data);
}


function updateReview(reviewId) {
  var ratingValue = parseInt(document.forms.editReviewForm.ratingValue.value);
  var reviewBody = document.forms.editReviewForm.reviewBody.value;


  var data = {

      'reviewBody': '' + reviewBody,
      'reviewRating': {
      '@type': 'Rating',
      'ratingValue': ratingValue
      }
    };



  patchAjaxRequest(baseURL + 'review/' + reviewId,
    function() {closePopUpWindow(); location.reload();},
    function(err) {
      alert('Cannot update review'), console.log(err),
      closePopUpWindow();
    }, data);

}



function addCreateReservationLink(restaurantName) {
  var userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (! hasRole(userInfo, 'End user')) {
    return null;
  }

  var createReservationLink = document.createElement('A');
  createReservationLink.textContent = 'Make a reservation';
  createReservationLink.onclick = (function(restaurantName) {
    return function() {
      editNewReservation(restaurantName);
    }
  })(restaurantName);

  return createReservationLink;
}


function editNewReservation(restaurantName) {
  var userInfo = JSON.parse(localStorage.getItem('userInfo'));

  reservationsPerDate = null;

  getReservationsPerDate(restaurantName);
  document.getElementById('popTitle').textContent = 'Reservation for ' +
     restaurantName;
  var reservationForm = '';
  reservationForm += '\n<form name="editReservationForm">';
  reservationForm += '<input type="hidden" name="restaurantName"' +
    ' id="restaurantName" value="' + restaurantName + '">';
  reservationForm += '\nNumber of diners:<br/>';
  reservationForm += '\n<select name="partySize" id="partySize">';
  //reservationForm +='\n<option value="0">0</option>';
  reservationForm += '<option disabled selected> -- select an option --' +
    ' </option>';
  reservationForm += '\n<option value="1">1</option>';
  reservationForm += '\n<option value="2">2</option>';
  reservationForm += '\n<option value="3">3</option>';
  reservationForm += '\n<option value="4">4</option>';
  reservationForm += '\n<option value="5">5</option>';
  reservationForm += '\n<option value="100">100</option>';
  reservationForm += '\n</select>';
  //reservationForm +='\n<input type="number" name="partySize"
  //min="1" max="20">';

  reservationForm += '<br>\nDate:<br>';
  reservationForm += '\n<input id = "reservationDate" disabled> <br>';
  //reservationForm +='\n<input type="datetime-local"
  //name="reservationDate"><br>';
  reservationForm += '\nTime:<br>';
  reservationForm += '\n<input id = "reservationTime" disabled>' +
    ' <div id="loadingTime"><img src="img/loading.gif"/> ' +
    'Calculating availability</div><br>';

  reservationForm += '\n</form>';
  reservationForm += '\n<input type="submit" value="Create reservation"' +
    ' onclick="createNewReservation(\'' + restaurantName + '\')">';
  reservationForm += '\n</form>';


  document.getElementById('popContent').innerHTML = reservationForm;


  //init elements
  $('#reservationDate').datepicker({
    dateFormat: 'yy-mm-dd',
    minDate: '-0d',//only allow future reservations
    maxDate: '+90d', // 3 month max
    firstDay: 0,
    beforeShowDay: function(date) {
      return calcCurrentReservations(date, restaurantName);
    },
    onSelect: initReservationTime //enable select time
  });


  $('#reservationTime').timepicker({
    'timeFormat': 'H:i:s',
    'minTime': minTime + '',
    'maxTime': maxTime + '',
    'disableTimeRanges': [
      ['4pm', '8:01pm']
    ]
  });


  document.getElementById('loadingTime').style.visibility = 'hidden';

  //party_size does not fire initReservatiomTime yet
   alreadyPartySizeInit = false;

  document.getElementById('partySize').addEventListener('change',
                        enableCalendar);

  //open
  openPopUpWindow();
}

function enableCalendar() {
  document.getElementById('reservationDate').disabled = false;
}

function initReservationTime() {
  if (typeof alreadyPartySizeInit === false) {
    //console.log("first init");
    alreadyPartySizeInit = true;
    document.getElementById('partySize').addEventListener('change',
      initReservationTime);
  }
  //console.log("init ")

  document.getElementById('loadingTime').style.visibility = '';

  //call availability for each time
  setTimeAvailability();
}



function setTimeAvailability() {
  //don't allow select time during process
  document.getElementById('reservationTime').disabled = true;
  var day = document.getElementById('reservationDate').value;
  //console.log("day:");
  //console.log(document.getElementById('reservation_date').value);

  //console.log("minTime:");
  //console.log(minTime);
  var maxDate = new Date((day + ' ' + maxTime).replace(/-/g, '/'));
  var date = new Date((day + ' ' + minTime).replace(/-/g, '/'));
  //console.log(date);

  availabilityTimeCount = (maxDate.getTime() -
    date.getTime()) / 1000 / 60 / 30; //get number of steps (30 min)

  availabilityTimeCount++;
  availableTimeArray = {};

  var URL = baseURL + 'restaurant/' +
    document.getElementById('restaurantName').value + '/date/';
  while (date.getTime() <= maxDate.getTime()) {
    var time = date.toISOString();
    //console.log(date);
    //console.log(url+time);
    getAjaxRequest(URL + time,
      processOccupancyResponse,
      function() { console.log('fail');checkEnablereservationTime();}
      );

    //add 30 minutes to reservation date
    date.setTime(date.getTime() + 30 * 60 * 1000);
  }
}


function processOccupancyResponse(restaurantResponse) {
  //console.log("process occupancy response");
  restaurantResponse = JSON.parse(restaurantResponse);
  if (restaurantResponse.length != 1) {
    console.log('ERROR: NOT RETRIEVED EXACTLY ONE RESTAURANT');
  }

  restaurantResponse = restaurantResponse[0];
  //console.log(restaurantResponse);
  var properties = restaurantResponse.additionalProperty;
  var capacity, occupancyLevel, time;

  for (var i = 0; i < properties.length; i++) {
    if ('capacity' == properties[i].name) {
      capacity = properties[i].value;
    }

    if ('occupancyLevels' == properties[i].name) {
      occupancyLevel = properties[i].value;
      time = properties[i].timestamp;
    }
  }


  var nDiners = parseInt(document.getElementById('partySize').value);


  availableTimeArray[new Date(time).toLocaleTimeString()] =
    !((capacity - occupancyLevel - nDiners) < 0);

  checkEnablereservationTime();
}

function checkEnablereservationTime() {
  if (! --availabilityTimeCount) {
    //process finished enabled it
    //console.log("ALL FINISHED");
    //console.log(available_time_array);
    document.getElementById('reservationTime').disabled = false;
    document.getElementById('loadingTime').style.visibility = 'hidden';
    /*for (var key in available_time_array) {
      if (available_time_array.hasOwnProperty(key))
        console.log(key +"-->"+available_time_array[key]);
    }
    */
  }

  //console.log("finish");
  //console.log(availability_time_count);
  createDisableTimeRanges(availableTimeArray);
}

function createDisableTimeRanges(dates) {
  var disableTimeRanges = [];
  var day;
  var maxRange;
  for (var key in availableTimeArray) {
    if (availableTimeArray.hasOwnProperty(key)) {
      if (!availableTimeArray[key]) {
        day = document.getElementById('reservationDate').value;
        maxRange = (new Date((new Date((day + ' ' +
               maxTime).replace(/-/g, '/'))).getTime() +
              (1000 * 60 * 29))).toLocaleTimeString();
        disableTimeRanges.push([key, maxRange]);
      }
    }
  }
  //console.log("time to disabled");
  //console.log(disableTimeRanges);
  $('#reservationTime').timepicker('option', { 'disableTimeRanges':
                        [disableTimeRanges] });
}

function createNewReservation(restaurantName) {
  var partySize = document.forms.editReservationForm.partySize.value;
  var reservationDate =
    document.forms.editReservationForm.reservation_date.value;


  var reservationDatetime =
    document.forms.editReservationForm.reservationDate.value + 'T' +
    document.forms.editReservationForm.reservationTime.value;



  var data = {
        '@type': 'FoodEstablishmentReservation',
        'partySize': partySize,
        'reservationFor': {
        '@type': 'FoodEstablishment',
        'name': '' + restaurantName
        },
        'startTime': reservationDatetime
      };


  postAjaxRequest(baseURL + 'reservation/',
    closePopUpWindow,
    function(err) {
      alert('Cannot add reservation');
      console.log(err);
    }, data);
}




/*get reviews from a restaurant an show it */
function getAndShowRestaurantReviews(id) {
  var URL = baseURL + 'reviews/restaurant/' + id;
  document.getElementById('popTitle').textContent = id;
  getAjaxRequest(URL,
      showRestaurantReviews,
       function() {
        document.getElementById('popContent').textContent =
          '<h2>Cannot get reviews.</h2>';
        openPopUpWindow();
       });
}



/*show restaurant reviews from a API response */
/* At this moment, show all reviews without pagination */
function showRestaurantReviews(reviewsResponse) {
  reviewsResponse = JSON.parse(reviewsResponse);

  //console.log(reviewsResponse);

  //remove previous content
  var myNode = document.getElementById('popContent');
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }

  if (reviewsResponse.length < 1) {
    document.getElementById('popContent').textContent =
      '<h2>No reviews are available.</h2>';
    openPopUpWindow();
    return;
  }


  var reviewList = document.createElement('DIV');
  reviewList.className = 'reviewList';

  for (var j = 0, lim = reviewsResponse.length; j < lim; j++) {
    var reviewElement = document.createElement('DIV');
    reviewElement.className = 'reviewElement';

    //top container
    var top = document.createElement('DIV');
    top.className = 'review-top';

    //rating
    var rating = document.createElement('DIV');
    rating.className = 'rating-div';

    var ratingLabel = document.createElement('SPAN');
    ratingLabel.className = 'ratingLabel';
    ratingLabel.textContent = 'Rating :';

    var ratingValue = document.createElement('SPAN');
    ratingValue.className = 'ratingValue';
    ratingValue.textContent = reviewsResponse[j].reviewRating.ratingValue;

    rating.appendChild(ratingLabel);
    rating.appendChild(ratingValue);

    top.appendChild(rating);

    //author
    var author = document.createElement('DIV');
    author.className = 'author-div';

    var authorLabel = document.createElement('SPAN');
    authorLabel.className = 'authorLabel';
    authorLabel.textContent = 'Author: ';

    var authorValue = document.createElement('SPAN');
    authorValue.className = 'authorValue';
    authorValue.textContent = reviewsResponse[j].author.name;

    author.appendChild(authorLabel);
    author.appendChild(authorValue);

    top.appendChild(author);

    reviewElement.appendChild(top);

    //date
    /*var review_date = document.createElement("DIV");
    review_date.setAttribute("class", "review_date-div");
    review_date.innerHTML = '<span class="review_date_label">Date:'+
      ' </span> <span class="review_date_value">' +
      reviewsResponse[j][""][""]+
      '</span>';
    reviewElemnt.appendChild(review_date);*/

    var hr = document.createElement('HR');
    reviewElement.appendChild(hr);
    //body
    var body = document.createElement('DIV');
    body.className = 'reviewBodyDiv';

    var bodyLabel = document.createElement('SPAN');
    bodyLabel.className = 'bodyLabel';

    var bodyValue = document.createElement('SPAN');
    bodyValue.className = 'bodyValue';
    bodyValue.textContent = reviewsResponse[j].reviewBody;

    body.appendChild(bodyLabel);
    body.appendChild(bodyValue);

    reviewElement.appendChild(body);

    reviewList.appendChild(reviewElement);
  }

  //render the reviews
  //document.getElementById("pop_content").innerHTML =reviewsHtml;
  myNode.appendChild(reviewList);

  openPopUpWindow();
}


/*get reservations from a restaurant an show it */
function getAndShowRestaurantReservations(id) {
  var URL = baseURL + 'reservations/restaurant/' + id;
  document.getElementById('popTitle').textContent = id;
  getAjaxRequest(URL,
    showRestaurantReservations,
    function() {
      document.getElementById('popContent').textContent =
        '<h2>Cannot get reservations.</h2>';
       openPopUpWindow();
  });
}



/*show restaurant reservations from a API response */
/* At this moment, only show the reservations without pagination */
function showRestaurantReservations(reservationsResponse) {
  //remove previous content
  var myNode = document.getElementById('popContent');
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }


  reservationsResponse = JSON.parse(reservationsResponse);

  if (reservationsResponse.length < 1) {
    document.getElementById('popContent').textContent =
       '<h2>No reservations are available.</h2>';
    openPopUpWindow();
    return;
  }


  var reservationsTable = document.createElement('DIV');
  reservationsTable.classList.add('table', 'table-fixed', 'table-hover');

  var tableHead = document.createElement('THEAD');

  var row = document.createElement('TR');
  row.className = 'row';

  var underNameHead = document.createElement('TH');
  underNameHead.className = 'col-xs-6';
  underNameHead.textContent = 'Reserved by: ';
  row.appendChild(underNameHead);

  var timeHead = document.createElement('TH');
  timeHead.className = 'col-xs-4';
  timeHead.textContent = 'Resrevation time: ';
  row.appendChild(timeHead);

  var dinersHead = document.createElement('TH');
  dinersHead.className = 'col-xs-2';
  dinersHead.textContent = 'Diners: ';
  row.appendChild(dinersHead);

  tableHead.appendChild(row);
  reservationsTable.appendChild(tableHead);


  var tableBody = document.createElement('TBODY');

  for (var j = 0, lim = reservationsResponse.length; j < lim; j++) {
    var row = document.createElement('TR');
    //row.setAttribute("class","row");
    /*
    var name = document.createElement("TD");
    name.setAttribute("class", "col-xs-4");
    name.innerHTML = reservationsResponse[j]["reservationFor"]["name"];
    row.appendChild(name);
    */


    var underName = document.createElement('TD');
    underName.classList.add('class', 'col-xs-6');
    underName.textContent = reservationsResponse[j].underName.name;
    row.appendChild(underName);

    var time = document.createElement('TD');
    time.classList.add('class', 'col-xs-4');
    time.innerHTML = fixBookingTime(reservationsResponse[j].startTime);
    row.appendChild(time);

    var diners = document.createElement('TD');
    diners.classList.add('class', 'col-xs-2');
    diners.innerHTML = reservationsResponse[j].partySize;
    row.appendChild(diners);


    tableBody.appendChild(row);
  }

  reservationsTable.appendChild(tableBody);
  document.getElementById('popContent').appendChild(reservationsTable);
  openPopUpWindow();
}


function getUserReservation(username) {
  var URL = baseURL + 'reservations/user/' + username;
  getAjaxRequest(URL,
    //create_reservations_list,
    createReservationsTable,
    function() {alert('cannot get your reservations');});
}

function createReservationsList(reservationsResponse) {
  reservationsResponse = JSON.parse(reservationsResponse);

  if (reservationsResponse.length < 1) {
    document.getElementById('reservationsListDiv').textContent =
      '<h2>No reservations are available.</h2>' +
      document.getElementById('reservationsListDiv').textContent;
    return;
  }


  document.getElementById('reservationList').innerHTML = '';
  var cancelReservationURLBase = '';
  for (var j = 0, lim = reservationsResponse.length; j < lim; j++) {
    var reservationHTML = document.createElement('LI');

    var restaurantReservationLabel = document.createElement('SPAN');
    restaurantReservationLabel.className = 'restaurantReservationLabel';
    restaurantReservationLabel.textContent = 'Restaurant: ';

    var restaurantReservationValue = document.createElement('SPAN');
    restaurantReservationValue.className = 'restaurantReservationLabel';
    restaurantReservationValue.textContent =
      reservationsResponse[j].reservationFor.name;

    reservationHTML.appendChild(restaurantReservationLabel);
    reservationHTML.appendChild(restaurantReservationValue);

    var reservationTimeLabel = document.createElement('SPAN');
    reservationTimeLabel.className = 'Time :';
    reservationTimeLabel.textContent = 'reservationTimeLabel';

    var timeValue = document.createElement('SPAN');
    timeValue.className = 'timeValue';
    timeValue.textContent = fixBookingTime(reservationsResponse[j].startTime);

    reservationHTML.appendChild(reservationTimeLabel);
    reservationHTML.appendChild(timeValue);

    var dinersLabel = document.createElement('SPAN');
    dinersLabel.className = 'dinersNumberLabel';
    dinersLabel.textContent = 'Diners: ';

    var dinersValue = document.createElement('SPAN');
    dinersValue.className = 'diners';
    dinersValue.textContent = reservationsResponse[j].partySize;

    reservationHTML.appendChild(dinersLabel);
    reservationHTML.appendChild(dinersValue);

    var cancelReservation = document.createElement('SPAN');
    cancelReservation.className = 'cancelReservation';

    var cancelReservationLink = document.createElement('A');
    cancelReservation.textContent = 'Cancel reservation';
    cancelReservationLink.onclick = (function(reservationId) {
      return function() {
        cancelReservation(reservationId);
      }
    })(reservationsResponse[j].reservationId);

    cancelReservation.appendChild(cancelReservationLink);
    reservationHTML.appendChild(cancelReservation);

    //reservationHTML = reservationHTML.replace("__reservation_id__",
      //reservationsResponse[j]["reservationId"]);
    //console.log(typeof reservationsResponse[j]["reservationId"]);


    document.getElementById('reservationList').appendChild(reservationHTML);
  }
}



function createReservationsTable(reservationsResponse) {
  reservationsResponse = JSON.parse(reservationsResponse);

  //clean previous table content
  var myNode = document.getElementById('reservationsTableBody');
    while (myNode.firstChild) {
      myNode.removeChild(myNode.lastChild);
    }


  if (reservationsResponse.length < 1) {
    document.getElementById('reservationsTableBody').textContent =
      '<tr>No reservations are available.</tr>';
    return;
  }


  var cancelReservationURLBase = '';
  for (var j = 0, lim = reservationsResponse.length; j < lim; j++) {
    var row = document.createElement('TR');

    var name = document.createElement('TD');
    name.textContent = reservationsResponse[j].reservationFor.name;
    row.appendChild(name);

    var time = document.createElement('TD');
    time.textContent = fixBookingTime(reservationsResponse[j].startTime);
    row.appendChild(time);

    var diners = document.createElement('TD');
    diners.textContent = reservationsResponse[j].partySize;
    row.appendChild(diners);

    var cancel = document.createElement('TD');

    var cancelLink = document.createElement('A');
    cancelLink.textContent = 'Cancel reservation';
    cancelLink.onclick = (function(reservationId) {
      return function() {
        cancelReservation(reservationId);
      }
    })(reservationsResponse[j].reservationId);

    cancel.appendChild(cancelLink);
    row.appendChild(cancel);

    document.getElementById('reservationsTableBody').appendChild(row);
  }
}




function cancelReservation(reservationId) {
  //alert("atemp to cancel "+ reservation_id);
  if (!(window.confirm('Delete reservation?'))) {
    return;
  }

  deleteAjaxRequest(baseURL + 'reservation/' + reservationId,
      function() {location.reload();},
      function(err) {
        alert('Could not delete the reservation.'); console.log(err);
       /*location.reload();*/
      });
}



function getUserReviews(username) {
  var URL = baseURL + 'reviews/user/' + username;
  getAjaxRequest(URL,
    //create_reviews_list,
    createReviewsTable,
    function() {alert('cannot get your reviews');});
}

/* gonna be delete */
/*
function createReviewsList(reviewsResponse) {
  reviewsResponse = JSON.parse(reviewsResponse);
  //console.log(reviewsResponse);

  if (reviewsResponse.length < 1) {
    document.getElementById('reviewsListDiv').innerHTML =
      '<h2>No reviews are available.</h2>' +
       document.getElementById('reviewsListDiv').innerHTML;
    return;
  }


  document.getElementById('reviewList').innerHTML = '';
  var cancelReservationURLBase = '';
  for (var j = 0, lim = reviewsResponse.length; j < lim; j++) {
    var reservationHTML = '<li>' +
      '<span class="restaurantReviewLabel">Restaurant: </span>' +
        ' <span class="restaurantReviewLabel">' +
        reviewsResponse[j].itemReviewed.name +
      '</span>\n' +
      '<span class="reviewRatingValue">Rating: </span>' +
      ' <span class="ratingValue">' +
         reviewsResponse[j].reviewRating.ratingValue +
      '</span>\n' +
      '<span class="viewReview"><a href="javascript:viewReview(' +
      '\'' + reviewsResponse[j].name + '\'' + ')">' +
      ' View review </a>' +
      '</span>\n' +
      '<span class="editReview"><a href="javascript:editReview(' +
      '\'' + reviewsResponse[j].name + '\'' +
      ')"> Edit review </a>' +
      '</span>\n' +
      '<span class="deleteReview"><a href="javascript:deleteReview(' +
      '\'' + reviewsResponse[j].name + '\'' +
      ')"> Delete review </a>' +
      '</span>\n' +
      '</li>';

    //reviewHTML =
    //reviewHTML.replace("__review_id__",reviewsResponse[j]["reviewId"]);
    //console.log(typeof reviewsResponse[j]["reviewId"]);

    document.getElementById('reviewList').innerHTML += reservationHTML;
  }
}
*/

function createReviewsTable(reviewsResponse) {
  reviewsResponse = JSON.parse(reviewsResponse);

  if (reviewsResponse.length < 1) {
    document.getElementById('reviewsTableBody').textContent =
      '<tr>No reviews are available.</tr>';
    return;
  }

  //clean previous table content
  var myNode = document.getElementById('reviewsTableBody');
    while (myNode.firstChild) {
      myNode.removeChild(myNode.lastChild);
    }
  var cancelReservationURLBase = '';
  for (var j = 0, lim = reviewsResponse.length; j < lim; j++) {

    var row = document.createElement('TR');

    var name = document.createElement('TD');
    name.innerHTML = reviewsResponse[j].itemReviewed.name;
    name.className = 'col-xs-4';
    row.appendChild(name);

    var rating = document.createElement('TD');
    rating.innerHTML = reviewsResponse[j].reviewRating.ratingValue;
    rating.className = 'col-xs-2';
    row.appendChild(rating);


    var view = document.createElement('TD');
    view.className = 'col-xs-2';

    var viewLink = document.createElement('A');
    viewLink.textContent = 'View review';
    viewLink.onclick = (function(reviewId) {
      return function() {
        viewReview(reviewId);
      }
    })(reviewsResponse[j].name);

    view.appendChild(viewLink);
    row.appendChild(view);

    var edit = document.createElement('TD');
    edit.className = 'col-xs-2';

    var editLink = document.createElement('A');
    editLink.textContent = 'Edit review';
    editLink.onclick = (function(reviewId) {
      return function() {
        editReview(reviewId);
      }
    })(reviewsResponse[j].name);

    edit.appendChild(editLink);
    row.appendChild(edit);

    var del = document.createElement('TD');
    del.className = 'col-xs-2';

    var delLink = document.createElement('A');
    delLink.textContent = 'Delete review';
    delLink.onclick = (function(reviewId) {
      return function() {
        deleteReview(reviewId);
      }
    })(reviewsResponse[j].name);

    del.appendChild(delLink);
    row.appendChild(del);

    document.getElementById('reviewsTableBody').appendChild(row);
  }
}



function deleteReview(reviewId) {
  if (!(window.confirm('Delete review?'))) {
    return;
  }

  deleteAjaxRequest(baseURL + 'review/' + reviewId,
      function() {location.reload();},
      function(err) {alert('Could not delete the review.');
      console.log(err); /*location.reload();*/});
}


/* aux function that open the PopUp windows */
function openPopUpWindow() {
  /*
  document.getElementById("pop_window").className =
    document.getElementById("pop_window").className.replace('hidden', '');
  document.getElementById("pop_window").className =
    document.getElementById("pop_window").className.replace('  ', ' ');
  */
  $('#popWindow').modal('show');
}

/*aux function that close the PopUp window */
function closePopUpWindow() {
  /*
  if (! (document.getElementById("pop_window").className.indexOf('hidden')
      > -1 ) )
    document.getElementById("pop_window").className =
      document.getElementById("pop_window").className + ' hidden';
  */
  $('#popWindow').modal('hide');
}

/* axu function, it change the format date to print reservations */
function fixBookingTime(bookingTime) {
  var d = new Date(bookingTime);
  return '' + d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}





/*
var reservations_per_date = {
'2016-02-24': 2,
'2016-02-25': 10,
'2016-02-23': 7,
'2016-02-29': -1,
'2016-02-30': 9
};

*/


function calcCurrentReservations(date, restaurantName) {
  if (date < new Date()) {
    return [false, 'pastDate', ''];
  }

  var stringDate = date.toLocaleDateString();
  //console.log(string_date);
  //console.log(reservations_per_date)
  date = date.yyyymmdd();
  //console.log(date);

  if ('undefined' === typeof(reservationsPerDate[stringDate])) {
    return [true, 'availableReservations', ''];
  }

  if (0 > reservationsPerDate[stringDate]) {
    return [false, 'notAllowed fullReservations',
        'No reservations allowed for this day'];
  }

  if (5 > reservationsPerDate[stringDate]) {
    return [true, 'availableReservations', reservationsPerDate[date]];
  }

  if (10 > reservationsPerDate[stringDate]) {
    return [true, 'lastReservations', reservationsPerDate[date]];
  }

 return [false, 'fullReservations', 'Full reservations'];
}

function getReservationsPerDate(restaurantName) {
  var URL = baseURL + 'reservations/restaurant/' + restaurantName;
  getAjaxRequest(URL,
      setReservationsPerDateVar,
       function() {
        reservationsPerDate = [];
       });
}



function setReservationsPerDateVar(reservationsResponse) {
  reservationsResponse = JSON.parse(reservationsResponse);
  reservationsPerDate = [];
  if (reservationsResponse.length < 1) {
    return;
  }

  var dateDay;
  var j;
  var lim;
  for (j = 0, lim = reservationsResponse.length; j < lim; j++) {

    dateDay = new Date(reservationsResponse[j].startTime);
    dateDay = '' + dateDay.toLocaleDateString();

    if ('undefined' === typeof(reservationsPerDate[dateDay])) {
      reservationsPerDate[dateDay] = 1;
    }
    else {
      reservationsPerDate[dateDay] =
        reservationsPerDate[dateDay] + 1;
    }
  }
}
