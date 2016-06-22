var map; //map instance
var connectionsAPI;
var AJAXRequest;
var drawModule =  (function () {

    var viewReservationAction = function () {};
    var viewReviewAction = function () {};


    function setViewReservationAction (action) {
        viewReservationAction = action;
    }

    function setViewReviewAction (action) {
        viewReviewAction = action;
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
      viewReviewAction(mark.name);
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

    
    /*
    var createReview = addCreateReviewLink(mark.name);
    if (null != createReview) {
        popHTML.appendChild(createReview);
        popHTML.appendChild(document.createElement('BR'));
    }

    var createReservation = addCreateReservationLink(mark.name);
    if (null != createReservation) {
        popHTML.appendChild(createReservation);
    }
    */
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
    setViewReservationAction: setViewReservationAction,
    setViewReviewAction: setViewReviewAction,
    openPopUpWindow: openPopUpWindow,
    closePopUpWindow: closePopUpWindow
  };
})()