'use strict';
/*
 * restaurantsAPI.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/

/*exported restaurantsAPI */
//global vars
var map; //map instance
var connectionsAPI;
var AJAXRequest;
var restaurantsAPI = (function() {
  var baseURL = 'http://tourguide/api/orion/';

  var reservationsPerDate;
  var minTime = {
    hours: 12,
    minutes: 30
  };
  var maxTime = {
    hours: 22,
    minutes: 30
  };
  var alreadyPartySizeInit = false;
  var availabilityTimeCount;
  var availableTimeArray;
  var maxRating = 5;

  /* get all restaurants and show them */
  function getAllRestaurants(cb, err_cb) {
    AJAXRequest.get(baseURL + 'restaurants/', cb, err_cb);
  }

  function getOrganizationRestaurants(organization, cb, err_cb) {
    var URL = baseURL + 'restaurants/organization/' + organization;
    AJAXRequest.get(URL, cb, err_cb);
  }

  function getRestaurantReviews(name, cb, err_cb) {
    var URL = baseURL + 'reviews/restaurant/' + name;
    AJAXRequest.get(URL, cb, err_cb);
  }


  function getRestaurantReservations(name, cb, err_cb) {
    var URL = baseURL + 'reservations/restaurant/' + name;
    AJAXRequest.get(URL, cb, err_cb);
  }


  /*Simplify the restaurant format using only useful info */
  function simplifyRestaurantsFormat (restaurants) {
    restaurants = JSON.parse(restaurants);
    var convertedRestaurants = [];

    restaurants.forEach(function(restaurant) {
      convertedRestaurants.push(
        convertRestaurant(restaurant)
        );
    });

    return convertedRestaurants;
  }


  //todo what return when error
  function convertRestaurant(restaurant) {
    var convertedRestaurant = {'name': restaurant.name};

    //get desired attributes
    if (restaurant.address) {
      if (restaurant.address.streetAddress) {
        convertedRestaurant.address = restaurant.address.streetAddress;
      }
      else {
        console.log('Cannot get street address for ' + restaurant.name);
      }

      if (restaurant.address.addressLocality) {
        convertedRestaurant.locality = restaurant.address.addressLocality;
      }
      else {
        console.log('Cannot get locality address for ' + restaurant.name);
      }

      if (restaurant.address.addressRegion) {
        convertedRestaurant.region = restaurant.address.addressRegion;
      }
      else {
        console.log('Cannot get region address for ' + restaurant.name);
      }
    }
    else {
      console.log('Cannot get address for ' + restaurant.name);
    }

    if (restaurant.telephone) {
      convertedRestaurant.telephone = restaurant.telephone;
    }
    else {
      console.log('Cannot get telephone for ' + restaurant.name);
    }

    if (restaurant.description) {
      convertedRestaurant.description = restaurant.description;
    }
    else {
      console.log('Cannot get description for ' + restaurant.name);
    }

    if (restaurant.aggregateRating) {
      if (typeof restaurant.aggregateRating.ratingValue === 'number') {
        convertedRestaurant.ratingValue = restaurant.aggregateRating.ratingValue;
      }
      else {
        console.log('Cannot get ratingValue for ' + restaurant.name);
      }

      if (typeof restaurant.aggregateRating.reviewCount === 'number') {
        convertedRestaurant.reviewCount = restaurant.aggregateRating.reviewCount;
      }
      else {
        console.log('Cannot get reviewCount for ' + restaurant.name);
      }
    }
    else {
      console.log('Cannot get aggregate rating for' + restaurant.name);
    }

    convertedRestaurant.coords = [];

    if (restaurant.geo) {
      if (restaurant.geo.latitude) {
        convertedRestaurant.coords.push(parseFloat(restaurant.geo.latitude));
        if (isNaN(convertedRestaurant.coords[0])) {
          console.log('invalid latitude ' + restaurant.geo.latitude +
            ' for restaurant ' + restaurant.name);
          return;
        }
      }
      else {
        console.log('Cannot get latitude for ' + restaurant.name);
        return;
      }

      if (restaurant.geo.longitude) {
        convertedRestaurant.coords.push(parseFloat(restaurant.geo.longitude));
        if (isNaN(convertedRestaurant.coords[1])) {
          console.log('invalid longitude ' + restaurant.geo.longitude +
            ' for restaurant ' + restaurant.name);
          return;
        }
      }
      else {
        console.log('Cannot get longitude for ' + restaurant.name);
        return;
      }
    }
    else {
      console.log('Cannot get coordinates for ' + restaurant.name);
      return;
    }
    return convertedRestaurant;
  }

  
/*
  function createShowRestaurantReviewsLink(restaurantName) {
    return function() {
      getAndShowRestaurantReviews(restaurantName);
    };
  }

  function createShowRestaurantReservationsLink(restaurantName) {
    return function() {
      getAndShowRestaurantReservations(restaurantName);
    };
  }
*/



  function editNewReview(restaurantName) {
    document.getElementById('popTitle').textContent = restaurantName;
    var reviewForm = document.createElement('FORM');
    reviewForm.name = 'editReviewForm';
    reviewForm.className = 'editReviewForm';
    reviewForm.onsubmit = function() {
        createNewReview(restaurantName);
        return false;
    };

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
    for (var i = 0; i <= maxRating; i++) {
      option = document.createElement('OPTION');
      option.value = i;
      option.textContent = i + ' Star' + (1 != i ? 's' : '');
      ratingValueSelect.appendChild(option);
    }

    reviewForm.appendChild(ratingValueSelect);

    var submit = document.createElement('INPUT');
    submit.type = 'submit';
    submit.value = 'Create Review';
    reviewForm.appendChild(submit);

    document.getElementById('popContent').innerHTML = '';

    document.getElementById('popContent').appendChild(reviewForm);

    openPopUpWindow();
  }


  function editReview(reviewId) {
    var URL = baseURL + 'review/' + reviewId;
    AJAXRequest.get(URL,
        showEditReview,
         function() {
          window.alert('Cannot get review ' + reviewId);
         });
  }


  function showEditReview(reviewResponse) {
    reviewResponse = JSON.parse(reviewResponse);
    if (reviewResponse.length != 1) {
      window.alert('Error: more than one review received.');
    }

    var review = reviewResponse[0];

    document.getElementById('popTitle').textContent = 'Edit review ' +
      ' for ' + review.itemReviewed.name;
    var reviewForm = document.createElement('FORM');
    reviewForm.name = 'editReviewForm';
    reviewForm.className = 'editReviewForm';
    reviewForm.onsubmit = function() {
        updateReview(review.name);
        return false;
      };

    var reviewLabel = document.createElement('LABEL');
    reviewLabel.textContent = 'Your review: ';
    reviewForm.appendChild(reviewLabel);
    reviewForm.appendChild(document.createElement('BR'));

    var reviewBody = document.createElement('TEXTAREA');
    reviewBody.name = 'reviewBody';
    reviewBody.textContent = review.reviewBody;
    reviewForm.appendChild(reviewBody);
    reviewForm.appendChild(document.createElement('BR'));

    var ratingLabel = document.createElement('LABEL');
    ratingLabel.textContent = 'Rating value: ';
    reviewForm.appendChild(ratingLabel);

    var ratingValueSelect = document.createElement('SELECT');
    ratingValueSelect.name = 'ratingValue';

    var option;
    for (var i = 0; i <= maxRating; i++) {
      option = document.createElement('OPTION');
      option.value = i;
      option.textContent = i + ' Star' + (1 != i ? 's' : '');
      ratingValueSelect.appendChild(option);
    }

    reviewForm.appendChild(ratingValueSelect);

    var submit = document.createElement('INPUT');
    submit.type = 'submit';
    submit.value = 'Update review';
    reviewForm.appendChild(submit);

    document.getElementById('popContent').innerHTML = '';
    document.getElementById('popContent').appendChild(reviewForm);

    //mark the selected rating
    var value = review.reviewRating.ratingValue;
    markSelectedValue(ratingValueSelect, value);

    openPopUpWindow();
  }


  function viewReview(reviewId) {
    var URL = baseURL + 'review/' + reviewId;
    AJAXRequest.get(URL,
        processViewReview,
         function() {
          window.alert('Cannot get review ' + reviewId);
         });
  }


  function processViewReview(reviewResponse) {
    reviewResponse = JSON.parse(reviewResponse);
    if (reviewResponse.length != 1) {
      window.alert('Error: more than one review received.');
    }

    var review = reviewResponse[0];

    document.getElementById('popTitle').textContent = 'Edit review ' +
      ' for ' + review.itemReviewed.name;
    //remove previous content
    var myNode = document.getElementById('popContent');
    myNode.innerHTML = '';

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


  function createNewReview(restaurantName, ratingValue, reviewBody, cb, err_cb) {
    //var ratingValue = parseInt(document.forms.editReviewForm.ratingValue.value);
    //var reviewBody = document.forms.editReviewForm.reviewBody.value;

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
        'ratingValue': parseInt(ratingValue, 10)
      }
    };

    AJAXRequest.post(baseURL + 'review/',
      cb, err_cb, data);
  }


  function updateReview(reviewId) {
    var ratingValue = parseInt(document.forms.editReviewForm.ratingValue.value);
    var reviewBody = document.forms.editReviewForm.reviewBody.value;

    var data = {
      'reviewBody': '' + reviewBody,
      'reviewRating': parseInt(ratingValue, 10)
    };

    AJAXRequest.patch(baseURL + 'review/' + reviewId,
      function() {closePopUpWindow(); location.reload();},
      function(err) {
        alert('Cannot update review'), console.log(err),
        closePopUpWindow();
      }, data);
  }




  function enableCalendar() {
    document.getElementById('reservationDate').disabled = false;
  }


  function initReservationTime() {
    if (alreadyPartySizeInit === false) {
      alreadyPartySizeInit = true;
      document.getElementById('partySize').addEventListener('change',
        initReservationTime);
    }

    document.getElementById('loadingTime').style.visibility = '';

    //call availability for each time
    setTimeAvailability();
  }


  function setTimeAvailability() {
    //don't allow select time during process
    document.getElementById('reservationTime').disabled = true;
    document.getElementById('submitReservation').disabled = true;
    var day = new Date(document.getElementById('reservationDate').value);

    var maxDate = new Date(day.getTime());
    maxDate.setHours(maxTime.hours, maxTime.minutes);

    var date = new Date(day.getTime());
    date.setHours(minTime.hours, minTime.minutes);

    availabilityTimeCount = (maxDate.getTime() -
      date.getTime()) / 1000 / 60 / 30; //get number of steps (30 min)

    availabilityTimeCount++;
    availableTimeArray = {};

    var URL = baseURL + 'restaurant/' +
      document.getElementById('restaurantName').value + '/date/';
    while (date.getTime() <= maxDate.getTime()) {
      var time = date.toISOString();
      AJAXRequest.get(URL + time,
        processOccupancyResponse,
        checkEnablereservationTime
        );

      //add 30 minutes to reservation date
      date.setTime(date.getTime() + 30 * 60 * 1000);
    }
  }


  function processOccupancyResponse(restaurantResponse) {
    restaurantResponse = JSON.parse(restaurantResponse);
    if (restaurantResponse.length != 1) {
      console.log('ERROR: NOT RETRIEVED EXACTLY ONE RESTAURANT');
    }

    restaurantResponse = restaurantResponse[0];
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

    var nDiners = document.getElementById('partySize').valueAsNumber;

    availableTimeArray[new Date(time).toLocaleTimeString()] =
      ((capacity - occupancyLevel - nDiners) >= 0);


    checkEnablereservationTime();
  }

  function checkEnablereservationTime() {
    if (! --availabilityTimeCount) {
      //process finished enabled it
      document.getElementById('reservationTime').disabled = false;
      document.getElementById('loadingTime').style.visibility = 'hidden';
      if (document.getElementById('reservationTime').value !== '') {
        document.getElementById('submitReservation').disabled = false;
      }

      createDisableTimeRanges(availableTimeArray);
    }
  }

  function createDisableTimeRanges(dates) {
    var disableTimeRanges = [];
    var day;
    var maxRange;
    var maxDate;
    for (var key in availableTimeArray) {
      if (availableTimeArray.hasOwnProperty(key)) {
        if (!availableTimeArray[key]) {
          day = new Date(document.getElementById('reservationDate').value);
          maxDate = day;
          maxDate.setHours(parseInt(key.split(':')[0]),
                           parseInt(key.split(':')[1]));
          maxRange =
            new Date(maxDate.getTime() + (1000 * 60 * 29)).toLocaleTimeString();
          disableTimeRanges.push([key, maxRange]);
        }
      }
    }
    $('#reservationTime').timepicker('option', { 'disableTimeRanges':
                          disableTimeRanges });
  }

  function createNewReservation(restaurantName, partySize, reservationDatetime, cb, err_cb) {
    /*var partySize =
      document.forms.editReservationForm.partySize.valueAsNumber;
    var reservationDatetime =
      new Date(document.forms.editReservationForm.reservationDate.value);
    var reservationTime =
      new Date($('#reservationTime').timepicker('getTime'));

    reservationDatetime.setHours(reservationTime.getHours(),
                                  reservationTime.getMinutes());
  */
    var data = {
      '@type': 'FoodEstablishmentReservation',
      'partySize': partySize,
      'reservationFor': {
        '@type': 'FoodEstablishment',
        'name': '' + restaurantName
      },
      'startTime': reservationDatetime.toISOString()
    };


    AJAXRequest.post(baseURL + 'reservation/',
      cb,
      err_cb, data);
  }


  /*get reviews from a restaurant an show it */
  function getAndShowRestaurantReviews(id) {
    var URL = baseURL + 'reviews/restaurant/' + id;
    document.getElementById('popTitle').textContent = id;
    AJAXRequest.get(URL,
        showRestaurantReviews,
         function() {
          var error = document.createElement('H2');
          error.textContent = 'Cannot get reviews.';
          document.getElementById('popContent').appendChild(error);
          openPopUpWindow();
         });
  }


  /*get reservations from a restaurant an show it */
  function getAndShowRestaurantReservations(id) {
    var URL = baseURL + 'reservations/restaurant/' + id;
    document.getElementById('popTitle').textContent = id;
    AJAXRequest.get(URL,
      showRestaurantReservations,
      function() {
        var error = document.createElement('H2');
        error.textContent = 'Cannot get reservations.';
        document.getElementById('popContent').appendChild(error);
        openPopUpWindow();
    });
  }


  /*show restaurant reservations from a API response */
  /* At this moment, only show the reservations without pagination */
  


  function getUserReservations(username) {
    var URL = baseURL + 'reservations/user/' + username;
    AJAXRequest.get(URL,
      createReservationsTable,
      function() {alert('cannot get your reservations');});
  }

  function createCancelReservationLink(reservationId) {
    return function() {
      cancelReservation(reservationId);
    };
  }

  function createReservationsTable(reservationsResponse) {
    reservationsResponse = JSON.parse(reservationsResponse);

    //clean previous table content
    var myNode = document.getElementById('reservationsTableBody');
    myNode.innerHTML = '';


    if (reservationsResponse.length < 1) {
      var error = document.createElement('TR');
      error.textContent = 'No reservations are available';
      document.getElementById('reservationsTableBody').appendChild(error);
      return;
    }

    //add entries
    reservationsResponse.forEach(createReservationsTableEntry);
  }

  function createReservationsTableEntry(reservation) {
    var row = document.createElement('TR');

    var name = document.createElement('TD');
    name.textContent = reservation.reservationFor.name;
    row.appendChild(name);

    var time = document.createElement('TD');
    time.textContent = fixBookingTime(reservation.startTime);
    row.appendChild(time);

    var diners = document.createElement('TD');
    diners.textContent = reservation.partySize;
    row.appendChild(diners);

    var cancel = document.createElement('TD');

    var cancelLink = document.createElement('A');
    cancelLink.textContent = 'Cancel reservation';
    cancelLink.onclick =
      createCancelReservationLink(reservation.reservationId);
    cancel.appendChild(cancelLink);
    row.appendChild(cancel);

    document.getElementById('reservationsTableBody').appendChild(row);
  }

  function cancelReservation(reservationId) {
    if (!(window.confirm('Delete reservation?'))) {
      return;
    }

    AJAXRequest.del(baseURL + 'reservation/' + reservationId,
        function() {location.reload();},
        function(err) {
          alert('Could not delete the reservation.'); console.log(err);
        });
  }


  function getUserReviews(userName) {
    var URL = baseURL + 'reviews/user/' + userName;
    AJAXRequest.get(URL,
      createReviewsTable,
      function() {alert('cannot get your reviews');});
  }

  function createViewReviewLink(reviewId) {
    return function() {
      viewReview(reviewId);
    };
  }

  function createEditReviewLink(reviewId) {
    return function() {
      editReview(reviewId);
    };
  }

  function createDelReviewLink(reviewId) {
    return function() {
      deleteReview(reviewId);
    };
  }

  function createReviewsTable(reviewsResponse) {
    reviewsResponse = JSON.parse(reviewsResponse);

    //clean previous table content
    var myNode = document.getElementById('reviewsTableBody');
    myNode.innerHTML = '';

    if (reviewsResponse.length < 1) {
      var error = document.createElement('TR');
      error.textContent = 'No reviews are available.';
      document.getElementById('reviewsTableBody').appendChild(error);
      return;
    }

    //add entries
    reviewsResponse.forEach(createReviewsTableEntry);
  }

  function createReviewsTableEntry(review) {
    var row = document.createElement('TR');
    var name = document.createElement('TD');
    name.textContent = review.itemReviewed.name;
    name.className = 'col-xs-4';
    row.appendChild(name);

    var rating = document.createElement('TD');
    rating.textContent = review.reviewRating.ratingValue;
    rating.className = 'col-xs-2';
    row.appendChild(rating);

    var view = document.createElement('TD');
    view.className = 'col-xs-2';

    var viewLink = document.createElement('A');
    viewLink.textContent = 'View review';
    viewLink.onclick = createViewReviewLink(review.name);

    view.appendChild(viewLink);
    row.appendChild(view);

    var edit = document.createElement('TD');
    edit.className = 'col-xs-2';

    var editLink = document.createElement('A');
    editLink.textContent = 'Edit review';
    editLink.onclick = createEditReviewLink(review.name);

    edit.appendChild(editLink);
    row.appendChild(edit);

    var del = document.createElement('TD');
    del.className = 'col-xs-2';

    var delLink = document.createElement('A');
    delLink.textContent = 'Delete review';
    delLink.onclick = createDelReviewLink(review.name);

    del.appendChild(delLink);
    row.appendChild(del);

    document.getElementById('reviewsTableBody').appendChild(row);
  }


  function deleteReview(reviewId) {
    if (!(window.confirm('Delete review?'))) {
      return;
    }

    AJAXRequest.del(baseURL + 'review/' + reviewId,
        function() {location.reload();},
        function(err) {alert('Could not delete the review.');
        console.log(err);});
  }






  function calcCurrentReservations(date, restaurantName) {
    if (date < new Date()) {
      return [false, 'pastDate', ''];
    }

    var stringDate = date.toLocaleDateString();

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
    AJAXRequest.get(URL,
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

  function setMap(newMap) {
    map = newMap;
  }

  return {
    getAllRestaurants: getAllRestaurants,
    getUserReservations: getUserReservations,
    getUserReviews: getUserReviews,
    getOrganizationRestaurants: getOrganizationRestaurants,
    getRestaurantReviews: getRestaurantReviews,
    getRestaurantReservations: getRestaurantReservations,
    createNewReview: createNewReview,
    createNewReservation: createNewReservation,
    simplifyRestaurantsFormat: simplifyRestaurantsFormat,
    setMap: setMap
  };
})();


if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = restaurantsAPI;
    AJAXRequest = require('./AJAXRequest.js');
    connectionsAPI = require('./connectionsAPI.js');

    /* jshint ignore:start */
    //var jsdom = require('jsdom').jsdom;


    //allows to load leaflet
    /*GLOBAL.window = {};
    GLOBAL.document = {
      documentElement: {
        style: {}
      },
      getElementsByTagName: function() { return []; },
      createElement: function() { return {}; },
      getElementById: function() { return []; }
    };*/


    /*GLOBAL.L = require('../addons/leaflet/leaflet.js');
    require(
      '../addons/leaflet/leaflet.markercluster.js');
    */
    /* jshint ignore:end */

     GLOBAL.localStorage = require('localStorage');
  }
}
