
var map; //map instance
var connectionsAPI;
var AJAXRequest;
var drawModule;

var clientLogic = (function (){

  function showAllRestaurants() {
    restaurantsAPI.getAllRestaurants(
      function (response) { //success
        var restaurants = 
          restaurantsAPI.simplifyRestaurantsFormat(response);
        drawModule.addRestaurantstoMap(restaurants);
      }, 
      function (response) { //error
        alert('Could not retrieve restaurants');
        if (response) {
          console.log(response);
        }
      }
    )
  }

  function showOrganizationRestaurants(organization) {
    restaurantsAPI.getOrganizationRestaurants(
      organization,
      function (response) { //success
        var restaurants = simplifyRestaurantsFormat(response);
        drawModule.addRestaurantstoMap(restaurants);
      }, 
      function (response) { //error
        alert('Could not retrieve restaurants');
        if (response) {
          console.log(response);
        }
      }
    )
  }


  function showRestaurantReviews(name) {

    restaurantsAPI.getRestaurantReviews(name,
      function(response) {
        reviewsDiv = drawModule.createReviewsDiv(response);
        drawModule.setPopupTitle(name);
        drawModule.setPopupContent(reviewsDiv);
        drawModule.openPopUpWindow();
      },
      function() {
        var error = document.createElement('H2');
        error.textContent = 'Cannot get reviews.';
        document.getElementById('popContent').appendChild(error);
        openPopUpWindow();
      }
    );
  }

  function showRestaurantReservations(name) {

    restaurantsAPI.getRestaurantReservations(name,
      function(response) {
        reservationsDiv = drawModule.createReservationsDiv(response);
        drawModule.setPopupTitle(name);
        drawModule.setPopupContent(reservationsDiv);
        drawModule.openPopUpWindow();
      },
      function() {
        var error = document.createElement('H2');
        error.textContent = 'Cannot get reservations.';
        document.getElementById('popContent').appendChild(error);
        openPopUpWindow();
      }
    );
  }

  function createNewReview(name, rating, description) {

    restaurantsAPI.createNewReview(name, rating, description,
      drawModule.closePopUpWindow,
      function(err) {
        alert('Cannot add review'); 
        console.log(err);
      }
    );
  }


  function createNewReservation(name, partySize, time) {

    restaurantsAPI.createNewReservation(name, partySize, time,
      drawModule.closePopUpWindow,
      function(err) {
        alert('Cannot add reservation'); 
        console.log(err);
      }
    );
  }







  return {
    showAllRestaurants : showAllRestaurants,
    showOrganizationRestaurants: showOrganizationRestaurants,
    showRestaurantReviews: showRestaurantReviews,
    showRestaurantReservations: showRestaurantReservations,
    createNewReview: createNewReview,
    createNewReservation: createNewReservation
  }
})()