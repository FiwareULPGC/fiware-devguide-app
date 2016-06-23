var map; //map instance
var connectionsAPI;
var AJAXRequest;
var drawModule =  (function () {

    var maxRating = 5;
    var alreadyPartySizeInit = false;
    var availabilityTimeCount;
    var availableTimeArray;
    var minTime = {
        hours: 12,
        minutes: 30
    };
    var maxTime = {
        hours: 22,
        minutes: 30
    };
    var viewReservationAction = function () {};
    var viewRestaurantReviewsAction = function () {};
    var createNewReviewAction = function () {};
    var createNewReservationAction = function () {};
    var getReservationsByDateAction = function () {};
    var viewReviewAction = function () {};
    var editReviewAction = function () {};
    var deleteReviewAction = function () {};
    var showEditReviewAction = function () {};
    var updateReviewAction = function () {};


    function setViewReservationAction (action) {
        viewReservationAction = action;
    }

    function setViewRestaurantReviewsAction (action) {
        viewRestaurantReviewsAction = action;
    }

    function setCreateNewReviewAction (action) {
        createNewReviewAction = action;
    }

    function setCreateNewReservationAction (action) {
        createNewReservationAction = action;
    }

    function setViewReviewAction(action) {
        viewReviewAction = action;
    }

    function setEditReviewAction(action) {
        editReviewAction = action;
    }

    function setDeleteReviewAction(action) {
        deleteReviewAction = action;
    }

    function setGetReservationsByDateAction (action) {
        getReservationsByDateAction = action;
    }

    function setShowEditReviewAction(action) {
        showEditReviewAction = action;
    }

    function setUpdateReviewAction(action) {
        updateReviewAction = action;
    }

    function addRestaurantstoMap(restaurants) {
        
        /* add marks with clustering approach */
        var markerClusters = L.markerClusterGroup({showCoverageOnHover: true});
        restaurants.forEach(function(currentMark) {
          addRestaurantMark(currentMark, markerClusters);
        });

        map.addLayer(markerClusters);
    }


    function addRestaurantMark(currentMark, markerCluster) {
    
    //add mark to map
    currentMark.mark = L.marker(currentMark.coords);
    
    var popHTML = generateMarkPopup(currentMark)
    currentMark.mark.bindPopup(popHTML);

    //reference all mark info to be used from leaflet
    currentMark.mark.extraInfo = currentMark;

    markerCluster.addLayer(currentMark.mark);
  }

  function setPopupTitle(title) {
    document.getElementById('popTitle').textContent = title;
  }

  function setPopupContent(contentDiv) {
    //remove previous content
    var content = document.getElementById('popContent');
    content.innerHTML = '';
    content.appendChild(contentDiv);
  }

  function generateMarkPopup(mark) {
    var popHTML = document.createElement('DIV');
    popHTML.className = 'markPopUp';

    var restaurantName = document.createElement('B');
    restaurantName.textContent = mark.name;
    popHTML.appendChild(restaurantName);

    var ratingP = document.createElement('P');
    ratingP.textContent = 'Rating: ' + mark.ratingValue;
    popHTML.appendChild(ratingP);

    var addressP = document.createElement('P');
    addressP.textContent = 'Address: ' + mark.address;
    popHTML.appendChild(addressP);

    var phoneP = document.createElement('P');
    phoneP.textContent = 'Phone: ' + mark.telephone;
    popHTML.appendChild(phoneP);

    var showReviews = document.createElement('A');
    showReviews.textContent = 'Show reviews';
    showReviews.onclick = function () {
      viewRestaurantReviewsAction(mark.name);
    };

    popHTML.appendChild(showReviews);
    popHTML.appendChild(document.createElement('BR'));

    var showReservations = document.createElement('A');
    showReservations.textContent = 'Show reservations';
    showReservations.onclick = function () {
      viewReservationAction(mark.name);
    };

    popHTML.appendChild(showReservations);
    popHTML.appendChild(document.createElement('BR'));

    
    
    var createReview = addCreateReviewLink(mark.name);
    if (null != createReview) {
        popHTML.appendChild(createReview);
        popHTML.appendChild(document.createElement('BR'));
    }
    
    var createReservation = addCreateReservationLink(mark.name);
    if (null != createReservation) {
        popHTML.appendChild(createReservation);
    }
    
    return popHTML;
  }

  /*show restaurant reviews from a API response */
  /* At this moment, show all reviews without pagination */
  function createReviewsDiv(reviewsResponse) {
    reviewsResponse = JSON.parse(reviewsResponse);


    if (reviewsResponse.length < 1) {
      var error = document.createElement('H2');
      error.textContent = 'No reviews are available';
      return error;
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

    //return reviews div
    return reviewList;
  }


  function createReservationsDiv(reservationsResponse) {

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
      time.textContent = 
        utils.fixBookingTime(reservationsResponse[j].startTime);
      row.appendChild(time);

      var diners = document.createElement('TD');
      diners.classList.add('class', 'col-xs-2');
      diners.textContent = reservationsResponse[j].partySize;
      row.appendChild(diners);

      tableBody.appendChild(row);
    }

    reservationsTable.appendChild(tableBody);
    return reservationsTable;
  }



    function addCreateReviewLink(restaurantName) {
        var userInfo = JSON.parse(localStorage.getItem('userInfo'));

        //TODO avoid interdependecy
        if (! connectionsAPI.hasRole(userInfo,
            connectionsAPI.rol.endUser)) {
          return null;
        }

        var createReviewLink = document.createElement('A');
        createReviewLink.textContent = 'Create review';
        createReviewLink.onclick = (function(restaurantName) {
          return function() {
            createAndShowReviewForm(restaurantName);
          };
        })(restaurantName);

        return createReviewLink;
  }


  function createAndShowReviewForm(restaurantName) {
    reviewForm = createReviewForm(restaurantName);
    var title = "Create review for: "+ restaurantName;
    setPopupTitle(title);
    setPopupContent(reviewForm);
    openPopUpWindow();
  }

  function createReviewForm(restaurantName, review) {
    var reviewForm = document.createElement('FORM');
    reviewForm.name = 'editReviewForm';
    reviewForm.className = 'editReviewForm';
    //if (updateResponse) {
    //    
    //    if (updateResponse.length != 1) {
    //      window.alert('Error: more than one review received.');
    //    }
//
    //    review = updateResponse[0];
    //}
    reviewForm.onsubmit = function() {
        var ratingValue = 
            parseInt(document.forms.editReviewForm.ratingValue.value);
        
        var reviewBody = document.forms.editReviewForm.reviewBody.value;
        if (review){
            updateReviewAction(review.name, ratingValue, reviewBody);
        } else {
            createNewReviewAction(restaurantName, ratingValue, reviewBody);
        }
        
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
    submit.name = 'submitReview';
    reviewForm.appendChild(submit);


    return reviewForm;
  }

    function inicializeReviewForm(review) {

         var reviewForm =
            document.forms.namedItem('editReviewForm');

        markSelectedValue(reviewForm.children.ratingValue
            , review.reviewRating.ratingValue);

        reviewForm.children.reviewBody.textContent =
            review.reviewBody;

        reviewForm.submitReview.value = 'Update review';
    }



  function addCreateReservationLink(restaurantName) {
    var userInfo = JSON.parse(localStorage.getItem('userInfo'));

    //TODO avoid interdependecy
    if (! connectionsAPI.hasRole(userInfo,
        connectionsAPI.rol.endUser)) {
      return null;
    }

    var createReservationLink = document.createElement('A');
    createReservationLink.textContent = 'Make a reservation';
    createReservationLink.onclick = (function(restaurantName) {
      return function() {
        createAndShowReservationForm(restaurantName);
      };
    })(restaurantName);

    return createReservationLink;
  }


  function createAndShowReservationForm(restaurantName) {
    reservationForm = createReservationForm(restaurantName);
    var title = "Make reservation for: "+ restaurantName;
    setPopupTitle(title);
    setPopupContent(reservationForm);
    //TODO 
    initReservationForm();
    openPopUpWindow();
  }



  function createReservationForm(restaurantName) {

    reservationsPerDate = null;
    //TODO gonna be removed
    //getReservationsPerDate(restaurantName);
    document.getElementById('popTitle').textContent = 'Reservation for ' +
       restaurantName;

    var reservationForm = document.createElement('FORM');
    reservationForm.name = 'editReservationForm';
    reservationForm.onsubmit = function() {
        //abort if not ready submit
        if (document.getElementById('submitReservation').disabled) {
          return false;
        }

        //get values
        var partySize =
          document.forms.editReservationForm.partySize.valueAsNumber;
        var reservationDatetime =
          new Date(document.forms.editReservationForm.reservationDate.value);
        var reservationTime =
          new Date($('#reservationTime').timepicker('getTime'));

        reservationDatetime.setHours(reservationTime.getHours(),
                                      reservationTime.getMinutes());


        createNewReservationAction(restaurantName, partySize, reservationDatetime);
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

    //document.getElementById('popContent').innerHTML = '';

    //document.getElementById('popContent').appendChild(reservationForm);

    //open
    //openPopUpWindow();

    return reservationForm;
  }


  function initReservationForm() {
        //init elements
    $('#reservationDate').datepicker({
      dateFormat: 'yy-mm-dd',
      minDate: '-0d',//only allow future reservations
      maxDate: '+90d', // 3 month max
      firstDay: 0,
      beforeShowDay: function(date) {
        return dayAvailableForReservation(date, restaurantName);
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
  }


  function dayAvailableForReservation(date, restaurantName) {
    if (date < new Date()) {
      return [false, 'pastDate', ''];
    }
      return [true, 'availableReservations', ''];
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

        var restaurantName = 
            document.getElementById('restaurantName').value;
        while (date.getTime() <= maxDate.getTime()) {
          var time = date.toISOString();
          
          getReservationsByDateAction(restaurantName, time,
            function (response) {
                processOccupancyResponse(response);
                checkEnablereservationTime();
            },
            checkEnablereservationTime
          );
          /*AJAXRequest.get(URL + time,
            processOccupancyResponse,
            checkEnablereservationTime
            );*/

          //add 30 minutes to reservation date
          date.setTime(date.getTime() + 30 * 60 * 1000);
        }
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



  function processOccupancyResponse(restaurantResponse) {
    console.log('processOccupancyResponse CALLED');
    restaurantResponse = JSON.parse(restaurantResponse);
    if (restaurantResponse.length != 1) {
      console.log('ERROR: NOT RETRIEVED EXACTLY ONE RESTAURANT');
    }

    restaurantResponse = restaurantResponse[0];
    console.log('\n------\n');
    console.log("\n\nDEBUG:");
    console.log(restaurantResponse);
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

    console.log("Debug :");
    console.log("capacity: ", capacity, " occupancyLevel: ", occupancyLevel, " nDiners: ", nDiners);
    console.log("time: ", time, " available: ",(capacity - occupancyLevel - nDiners) >= 0 );
    availableTimeArray[new Date(time).toLocaleTimeString()] =
      ((capacity - occupancyLevel - nDiners) >= 0);

    console.log(availableTimeArray);
  }


  function createDisableTimeRanges(dates) {
    console.log('createDisableTimeRanges CALLED');
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
    console.log(availableTimeArray);
    console.log(disableTimeRanges);
    $('#reservationTime').timepicker('option', { 'disableTimeRanges':
                          disableTimeRanges });
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


    function createViewReviewLink(reviewId) {
    return function() {
      viewReviewAction(reviewId);
    };
  }

  function createEditReviewLink(reviewId) {
    return function() {
      showEditReviewAction(reviewId);
    };
  }

  function createDelReviewLink(reviewId) {
    return function() {
        if (!(window.confirm('Delete review?'))) {
            return;
        }
      deleteReviewAction(reviewId);
    };
  }



  function createViewReviewDiv(reviewResponse) {
    reviewResponse = JSON.parse(reviewResponse);
    if (reviewResponse.length != 1) {
      window.alert('Error: more than one review received.');
    }

    var review = reviewResponse[0];

    //document.getElementById('popTitle').textContent = 'Edit review ' +
    //  ' for ' + review.itemReviewed.name;
    //remove previous content
    //var myNode = document.getElementById('popContent');
    //myNode.innerHTML = '';

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

    return reviewElement;
    //myNode.appendChild(reviewElement);

    //  openPopUpWindow();
  }

/*
    function createEditReviewDiv(reviewResponse) {
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

    //openPopUpWindow();
  }
*/



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

  /* aux function that opens the PopUp windows */
  function openPopUpWindow() {
    $('#popWindow').modal('show');
  }

  /*aux function that closes the PopUp window */
  function closePopUpWindow() {
    $('#popWindow').modal('hide');
  }

  return {
    addRestaurantstoMap: addRestaurantstoMap,
    setPopupTitle: setPopupTitle,
    setPopupContent: setPopupContent,
    createReviewsDiv: createReviewsDiv,
    createReservationsDiv: createReservationsDiv,
    createReviewsTable: createReviewsTable,
    createReviewForm: createReviewForm,
    createViewReviewDiv:createViewReviewDiv,
    setViewReservationAction: setViewReservationAction,
    setViewRestaurantReviewsAction: setViewRestaurantReviewsAction,
    setCreateNewReviewAction: setCreateNewReviewAction,
    setCreateNewReservationAction: setCreateNewReservationAction,
    setGetReservationsByDateAction: setGetReservationsByDateAction,
    setViewReviewAction: setViewReviewAction,
    setShowEditReviewAction: setShowEditReviewAction,
    setUpdateReviewAction: setUpdateReviewAction,
    inicializeReviewForm: inicializeReviewForm,
    openPopUpWindow: openPopUpWindow,
    closePopUpWindow: closePopUpWindow
  };
})()