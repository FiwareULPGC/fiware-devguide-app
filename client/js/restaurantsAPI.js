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

//global vars
var map; //map instance
var Tourguide = Tourguide || {};
(function(app) {
  //proxy should be used if the API is not in the same location as the web app.
  var proxyURL = '';

  var baseURL = proxyURL + 'http://tourguide/api/orion/';

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

  /* get all restaurants and show it */
  function getAllRestaurants() {
    Tourguide.AJAXRequest.get(baseURL + 'restaurants/', showRestaurants,
      function() {alert('Could not retrive restaurants');});
  }

  function getOrganizationRestaurants(organization) {
    var URL = baseURL + 'restaurants/organization/' + organization;
    Tourguide.AJAXRequest.get(URL,
      showRestaurants, function() {alert('Could not retrive restaurants');}
      );
  }


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

  /*show restaurants from the API response*/
  function showRestaurants(restaurants) {
    restaurants = JSON.parse(restaurants);
    //loop over all restaurants
    var restaurantMarks = [];
    var errors = 0;
    var i, len; //iterators
    for (i = 0, len = restaurants.length; i < len; i++) {

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

    /* clustering approach */
    var markerClusters = L.markerClusterGroup({showCoverageOnHover: true});
    var markers = [];
    for (i = 0, len = restaurantMarks.length; i < len; i++) {
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
      showReviews.onclick =
        createShowRestaurantReviewsLink(restaurantMarks[i].name);
      /*(function(restaurantName) {
          return function() {
            getAndShowRestaurantReviews(restaurantName);
          };
      })(restaurantMarks[i].name);*/

      popHTML.appendChild(showReviews);
      popHTML.appendChild(document.createElement('BR'));

      var showReservations = document.createElement('A');
      showReservations.textContent = 'Show reservations';
      showReservations.onclick =
        createShowRestaurantReservationsLink(restaurantMarks[i].name);
      /*(function(restaurantName) {
          return function() {
            getAndShowRestaurantReservations(restaurantName);
          };
      })(restaurantMarks[i].name);*/

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

    map.addLayer(markerClusters);
  }


  function addCreateReviewLink(restaurantName) {
    var userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (! Tourguide.connectionsAPI.hasRole(userInfo, 'End user')) {
      return null;
    }

    var createReviewLink = document.createElement('A');
    createReviewLink.textContent = 'Create review';
    createReviewLink.onclick = (function(restaurantName) {
      return function() {
        editNewReview(restaurantName);
      };
    })(restaurantName);

    return createReviewLink;
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
    reviewForm.appendChild(submit);

    document.getElementById('popContent').innerHTML = '';

    document.getElementById('popContent').appendChild(reviewForm);

    openPopUpWindow();
  }



  function editReview(reviewId) {
    var URL = baseURL + 'review/' + reviewId;
    Tourguide.AJAXRequest.get(URL,
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
      review.name + ' for ' + review.itemReviewed.name;
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
    Tourguide.AJAXRequest.get(URL,
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
      review.name + ' for ' + review.itemReviewed.name;
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
        'ratingValue': parseInt(ratingValue, 10)
      }
    };

    Tourguide.AJAXRequest.post(baseURL + 'review/',
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
        'ratingValue': parseInt(ratingValue, 10)
      }
    };


    Tourguide.AJAXRequest.patch(baseURL + 'review/' + reviewId,
      function() {closePopUpWindow(); location.reload();},
      function(err) {
        alert('Cannot update review'), console.log(err),
        closePopUpWindow();
      }, data);

  }


  function addCreateReservationLink(restaurantName) {
    var userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (! Tourguide.connectionsAPI.hasRole(userInfo, 'End user')) {
      return null;
    }

    var createReservationLink = document.createElement('A');
    createReservationLink.textContent = 'Make a reservation';
    createReservationLink.onclick = (function(restaurantName) {
      return function() {
        editNewReservation(restaurantName);
      };
    })(restaurantName);

    return createReservationLink;
  }


  function editNewReservation(restaurantName) {

    reservationsPerDate = null;

    getReservationsPerDate(restaurantName);
    document.getElementById('popTitle').textContent = 'Reservation for ' +
       restaurantName;

    var reservationForm = document.createElement('FORM');
    reservationForm.name = 'editReservationForm';
    reservationForm.onsubmit = function() {
        //abort if not ready submit
        if (document.getElementById('submitReservation').disabled) {
          return false;
        }
        createNewReservation(restaurantName);
        return false;
      };

    var name = document.createElement('INPUT');
    name.type = 'hidden';
    name.name = 'restaurantName';
    name.id = 'restaurantName';
    name.value = restaurantName;
    reservationForm.appendChild(name);

    var dinersLabel = document.createElement('SPAN');
    dinersLabel.textContent = 'Number of diners';
    reservationForm.appendChild(dinersLabel);

    reservationForm.appendChild(document.createElement('BR'));
    reservationForm.appendChild(document.createElement('BR'));
    var nDiners = document.createElement('INPUT');
    nDiners.name = 'partySize';
    nDiners.id = 'partySize';
    nDiners.type = 'number';
    nDiners.setAttribute('min', '1');
    reservationForm.appendChild(nDiners);

    reservationForm.appendChild(document.createElement('BR'));

    var dateLabel = document.createElement('SPAN');
    dateLabel.textContent = 'Date';
    reservationForm.appendChild(dateLabel);

    reservationForm.appendChild(document.createElement('BR'));

    var reservationDate = document.createElement('INPUT');
    reservationDate.type = 'date';
    reservationDate.id = 'reservationDate';
    reservationDate.disabled = true;
    reservationForm.appendChild(reservationDate);

    reservationForm.appendChild(document.createElement('BR'));

    var timeLabel = document.createElement('SPAN');
    timeLabel.textContent = 'Time:';
    reservationForm.appendChild(timeLabel);

    reservationForm.appendChild(document.createElement('BR'));

    var reservationTime = document.createElement('INPUT');
    reservationTime.type = 'time';
    reservationTime.id = 'reservationTime';
    reservationTime.disabled = true;
    reservationForm.appendChild(reservationTime);

    reservationForm.appendChild(document.createElement('BR'));

    var loadingTime = document.createElement('DIV');
    loadingTime.id = 'loadingTime';
    loadingTime.textContent = 'Calculating availability';
    loadingTime.style.visibility = 'hidden';

    var loadingTimeImg = document.createElement('IMG');
    loadingTimeImg.src = 'img/loading.gif';
    loadingTime.appendChild(loadingTimeImg);

    reservationForm.appendChild(loadingTime);

    var submit = document.createElement('INPUT');
    submit.type = 'submit';
    submit.id = 'submitReservation';
    submit.value = 'Create Reservation';
    submit.disabled = true;
    reservationForm.appendChild(submit);


    document.getElementById('popContent').innerHTML = '';

    document.getElementById('popContent').appendChild(reservationForm);


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
      'minTime': minTime.hours + ':' + minTime.minutes,
      'maxTime': maxTime.hours + ':' + maxTime.minutes,
      'disableTimeRanges': [
        ['4pm', '8:01pm']
      ]
    });

    $('#reservationTime').on('changeTime', function() {
        if (document.getElementById('reservationTime').value !== '') {
          document.getElementById('submitReservation').disabled = false;
        }
      }
    );




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
      Tourguide.AJAXRequest.get(URL + time,
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
    }
    createDisableTimeRanges(availableTimeArray);
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
          maxDate.setHours(maxTime.hours, maxTime.minutes);
          maxRange =
            new Date(maxDate.getTime() + (1000 * 60 * 29)).toLocaleTimeString();
          disableTimeRanges.push([key, maxRange]);
        }
      }
    }
    $('#reservationTime').timepicker('option', { 'disableTimeRanges':
                          [disableTimeRanges] });
  }

  function createNewReservation(restaurantName) {
    var partySize =
      document.forms.editReservationForm.partySize.valueAsNumber;
    var reservationDatetime =
      new Date(document.forms.editReservationForm.reservationDate.value);
    var reservationTime =
      new Date($('#reservationTime').timepicker('getTime'));

    reservationDatetime.setHours(reservationTime.getHours(),
                                  reservationTime.getMinutes());

    var data = {
      '@type': 'FoodEstablishmentReservation',
      'partySize': partySize,
      'reservationFor': {
        '@type': 'FoodEstablishment',
        'name': '' + restaurantName
      },
      'startTime': reservationDatetime.toISOString()
    };


    Tourguide.AJAXRequest.post(baseURL + 'reservation/',
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
    Tourguide.AJAXRequest.get(URL,
        showRestaurantReviews,
         function() {
          var error = document.createElement('H2');
          error.textContent = 'Cannot get reviews.';
          document.getElementById('popContent').appendChild(error);
          openPopUpWindow();
         });
  }



  /*show restaurant reviews from a API response */
  /* At this moment, show all reviews without pagination */
  function showRestaurantReviews(reviewsResponse) {
    reviewsResponse = JSON.parse(reviewsResponse);

    //remove previous content
    var myNode = document.getElementById('popContent');
    myNode.innerHTML = '';

    if (reviewsResponse.length < 1) {
      var error = document.createElement('H2');
      error.textContent = 'No reviews are available';
      document.getElementById('popContent').appendChild(error);
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
    myNode.appendChild(reviewList);

    openPopUpWindow();
  }


  /*get reservations from a restaurant an show it */
  function getAndShowRestaurantReservations(id) {
    var URL = baseURL + 'reservations/restaurant/' + id;
    document.getElementById('popTitle').textContent = id;
    Tourguide.AJAXRequest.get(URL,
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
  function showRestaurantReservations(reservationsResponse) {
    //remove previous content
    var myNode = document.getElementById('popContent');
    myNode.innerHTML = '';

    reservationsResponse = JSON.parse(reservationsResponse);

    if (reservationsResponse.length < 1) {
      var error = document.createElement('H2');
      error.textContent = 'No reservations are available.';
      document.getElementById('popContent').appendChild(error);
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
      row = document.createElement('TR'); //defined previously

      var underName = document.createElement('TD');
      underName.classList.add('class', 'col-xs-6');
      underName.textContent = reservationsResponse[j].underName.name;
      row.appendChild(underName);

      var time = document.createElement('TD');
      time.classList.add('class', 'col-xs-4');
      time.textContent = fixBookingTime(reservationsResponse[j].startTime);
      row.appendChild(time);

      var diners = document.createElement('TD');
      diners.classList.add('class', 'col-xs-2');
      diners.textContent = reservationsResponse[j].partySize;
      row.appendChild(diners);

      tableBody.appendChild(row);
    }

    reservationsTable.appendChild(tableBody);
    document.getElementById('popContent').appendChild(reservationsTable);
    openPopUpWindow();
  }


  function getUserReservations(username) {
    var URL = baseURL + 'reservations/user/' + username;
    Tourguide.AJAXRequest.get(URL,
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
      cancelLink.onclick =
        createCancelReservationLink(reservationsResponse[j].reservationId);
      /*(function(reservationId) {
        return function() {
          cancelReservation(reservationId);
        };
      })(reservationsResponse[j].reservationId);*/

      cancel.appendChild(cancelLink);
      row.appendChild(cancel);

      document.getElementById('reservationsTableBody').appendChild(row);
    }
  }



  function cancelReservation(reservationId) {
    if (!(window.confirm('Delete reservation?'))) {
      return;
    }

    Tourguide.AJAXRequest.del(baseURL + 'reservation/' + reservationId,
        function() {location.reload();},
        function(err) {
          alert('Could not delete the reservation.'); console.log(err);
         /*location.reload();*/
        });
  }


  function getUserReviews(userName) {
    var URL = baseURL + 'reviews/user/' + userName;
    Tourguide.AJAXRequest.get(URL,
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

    if (reviewsResponse.length < 1) {
      var error = document.createElement('TR');
      error.textContent = 'No reviews are available.';
      document.getElementById('reviewsTableBody').appendChild(error);
      return;
    }

    //clean previous table content
    var myNode = document.getElementById('reviewsTableBody');
    myNode.innerHTML = '';

    for (var j = 0, lim = reviewsResponse.length; j < lim; j++) {

      var row = document.createElement('TR');

      var name = document.createElement('TD');
      name.textContent = reviewsResponse[j].itemReviewed.name;
      name.className = 'col-xs-4';
      row.appendChild(name);

      var rating = document.createElement('TD');
      rating.textContent = reviewsResponse[j].reviewRating.ratingValue;
      rating.className = 'col-xs-2';
      row.appendChild(rating);


      var view = document.createElement('TD');
      view.className = 'col-xs-2';

      var viewLink = document.createElement('A');
      viewLink.textContent = 'View review';
      viewLink.onclick = createViewReviewLink(reviewsResponse[j].name);
      /*(function(reviewId) {
        return function() {
          viewReview(reviewId);
        };
      })(reviewsResponse[j].name);
      */

      view.appendChild(viewLink);
      row.appendChild(view);

      var edit = document.createElement('TD');
      edit.className = 'col-xs-2';

      var editLink = document.createElement('A');
      editLink.textContent = 'Edit review';
      editLink.onclick = createEditReviewLink(reviewsResponse[j].name);
      /*
      (function(reviewId) {
        return function() {
          editReview(reviewId);
        };
      })(reviewsResponse[j].name);
    */
      edit.appendChild(editLink);
      row.appendChild(edit);

      var del = document.createElement('TD');
      del.className = 'col-xs-2';

      var delLink = document.createElement('A');
      delLink.textContent = 'Delete review';
      delLink.onclick = createDelReviewLink(reviewsResponse[j].name);
      /*(function(reviewId) {
        return function() {
          deleteReview(reviewId);
        };
      })(reviewsResponse[j].name);
    */
      del.appendChild(delLink);
      row.appendChild(del);

      document.getElementById('reviewsTableBody').appendChild(row);
    }
  }



  function deleteReview(reviewId) {
    if (!(window.confirm('Delete review?'))) {
      return;
    }

    Tourguide.AJAXRequest.del(baseURL + 'review/' + reviewId,
        function() {location.reload();},
        function(err) {alert('Could not delete the review.');
        console.log(err); /*location.reload();*/});
  }


  /* aux function that opens the PopUp windows */
  function openPopUpWindow() {
    $('#popWindow').modal('show');
  }

  /*aux function that closes the PopUp window */
  function closePopUpWindow() {
    $('#popWindow').modal('hide');
  }

  /* aux function, it change the format date to print reservations */
  function fixBookingTime(bookingTime) {
    var d = new Date(bookingTime);
    return '' + d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
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
    Tourguide.AJAXRequest.get(URL,
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

  app.restaurantsAPI = {
    getAllRestaurants: getAllRestaurants,
    getUserReservations: getUserReservations,
    getUserReviews: getUserReviews,
    getOrganizationRestaurants: getOrganizationRestaurants/*,
    getAndShowRestaurantReviews: getAndShowRestaurantReviews,
    getAndShowRestaurantReservations: getAndShowRestaurantReservations,
    editNewReview: editNewReview,
    createNewReview: createNewReview,
    updateReview: updateReview*/
  };
})(Tourguide);
