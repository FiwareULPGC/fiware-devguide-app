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

  /*var reservationsPerDate;
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
*/
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

  function getRestaurantReservationsByDate(restaurantName, time,
    cb, err_cb) {

    var URL = 
      baseURL + 'restaurant/' + restaurantName + '/date/' + time;
      AJAXRequest.get(URL, cb, err_cb);
  }


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



  function getReview(reviewId, cb, err_cb) {
    var URL = baseURL + 'review/' + reviewId;
    AJAXRequest.get(URL, cb, err_cb);
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


  function updateReview(reviewId, ratingValue, reviewBody, cb, err_cb) {
    //var ratingValue = parseInt(document.forms.editReviewForm.ratingValue.value);
    //var reviewBody = document.forms.editReviewForm.reviewBody.value;

    var data = {
      'reviewBody': '' + reviewBody,
      'reviewRating': parseInt(ratingValue, 10)
    };

    /*AJAXRequest.patch(baseURL + 'review/' + reviewId,
      function() {closePopUpWindow(); location.reload();},
      function(err) {
        alert('Cannot update review'), console.log(err),
        closePopUpWindow();
      }, data);
  */
    var url = baseURL + 'review/' + reviewId;
    AJAXRequest.patch(url, cb, err_cb, data);
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


//  /*get reviews from a restaurant an show it */
//  function getAndShowRestaurantReviews(id) {
//    var URL = baseURL + 'reviews/restaurant/' + id;
//    document.getElementById('popTitle').textContent = id;
//    AJAXRequest.get(URL,
//        showRestaurantReviews,
//         function() {
//          var error = document.createElement('H2');
//          error.textContent = 'Cannot get reviews.';
//          document.getElementById('popContent').appendChild(error);
//          openPopUpWindow();
//         });
//  }
//
//
//  /*get reservations from a restaurant an show it */
//  function getAndShowRestaurantReservations(id) {
//    var URL = baseURL + 'reservations/restaurant/' + id;
//    document.getElementById('popTitle').textContent = id;
//    AJAXRequest.get(URL,
//      showRestaurantReservations,
//      function() {
//        var error = document.createElement('H2');
//        error.textContent = 'Cannot get reservations.';
//        document.getElementById('popContent').appendChild(error);
//        openPopUpWindow();
//    });
//  }
//

  /*show restaurant reservations from a API response */
  /* At this moment, only show the reservations without pagination */
  


  function getUserReservations(username, cb, err_cb) {
    var URL = baseURL + 'reservations/user/' + username;
    AJAXRequest.get(URL,
      cb,
      err_cb);
  }




  function cancelReservation(reservationId, cb, err_cb) {
   
   /*
    if (!(window.confirm('Delete reservation?'))) {
      return;
    }
  */
    var URL = baseURL + 'reservation/' + reservationId;

    AJAXRequest.del(URL, cb, err_cb);
  }


  function getUserReviews(userName, cb, err_cb) {
    var URL = baseURL + 'reviews/user/' + userName;
    AJAXRequest.get(URL, cb, err_cb);

    /*AJAXRequest.get(URL,
      createReviewsTable,
      function() {alert('cannot get your reviews');});
  */
  }

/*
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
*/

  function deleteReview(reviewId, cb, err_cb) {
    //TODO move to drawModule
    /*if (!(window.confirm('Delete review?'))) {
      return;
    }*/
    var url = baseURL + 'review/' + reviewId;
    AJAXRequest.del(url, cb, err_cb);
  }





/*TODO TO BE DELETED  
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

*/
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
    getRestaurantReservationsByDate: getRestaurantReservationsByDate,
    getReview: getReview,
    createNewReview: createNewReview,
    createNewReservation: createNewReservation,
    updateReview: updateReview,
    deleteReview: deleteReview,
    cancelReservation: cancelReservation,
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
