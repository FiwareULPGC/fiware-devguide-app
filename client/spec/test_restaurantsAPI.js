var restaurantsAPI = require('../js/restaurantsAPI.js')
var chai = require('chai');
var assert = require('chai').assert;

chai.should();


var restaurantsJSON = [{
        "@context": "http://schema.org",
        "@type": "Restaurant1",
        "additionalProperty":
        [
            {
                "value": 10,
                "name": "capacity",
                "@type": "PropertyValue"
            },
            {
                "value": 1,
                "name": "occupancyLevels",
                "@type": "PropertyValue",
                "timestamp": "2016-05-31T06:52:18.169Z"
            }
        ],
        "address":
        {
            "streetAddress": "Street 1",
            "addressRegion": "Region 1",
            "addressLocality": "Locality 1",
            "postalCode": "11111",
            "@type": "PostalAddress"
        },
        "aggregateRating":
        {
            "reviewCount": 1,
            "ratingValue": 1
        },
        "department": "Franchise1",
        "description": "Restaurant description 1",
        "geo":
        {
            "@type": "GeoCoordinates",
            "latitude": "42.8404625",
            "longitude": "-2.5123277"
        },
        "name": "Retaurant1",
        "priceRange": 1,
        "telephone": "111 111 111"
    },
    {
        "@context": "http://schema.org",
        "@type": "Restaurant",
        "additionalProperty":
        [
            {
                "value": 20,
                "name": "capacity",
                "@type": "PropertyValue"
            },
            {
                "value": 2,
                "name": "occupancyLevels",
                "@type": "PropertyValue",
                "timestamp": "2016-05-31T06:52:18.169Z"
            }
        ],
        "address":
        {
            "streetAddress": "Street 2",
            "addressRegion": "Region 2",
            "addressLocality": "Locality 2",
            "postalCode": "22222",
            "@type": "PostalAddress"
        },
        "aggregateRating":
        {
            "reviewCount": 2,
            "ratingValue": 2
        },
        "department": "Franchise2",
        "description": "Restaurant description 2",
        "geo":
        {
            "@type": "GeoCoordinates",
            "latitude": "42.8538811",
            "longitude": "-2.7006836"
        },
        "name": "Restaurant2",
        "priceRange": 2,
        "telephone": "222 222 222",
        "url": "http://www.restaurant2.com/"
    }
];


describe('Testing restaurantsAPI', function () {
  before(function() {
    //global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
  })

  after(function() {
    delete global.XMLHttpRequest;
  })

  beforeEach(function() {
    this.xhr = sinon.useFakeXMLHttpRequest();

    this.requests = [];
    this.xhr.onCreate = function(xhr) {
      this.requests.push(xhr);
    }.bind(this);
  });

  afterEach(function() {
    this.xhr.restore();
  });


    it('Simplify restaurants format', function() {
        
        var expectedResult = [
            {
              "address": "Street 1",
              "coords": [
                42.8404625,
                -2.5123277
              ],
              "description": "Restaurant description 1",
              "locality": "Locality 1",
              "name": "Retaurant1",
              "ratingValue": 1,
              "region": "Region 1",
              "reviewCount": 1,
              "telephone": "111 111 111"
            },
            {
              "address": "Street 2",
              "coords": [
                42.8538811,
                -2.7006836
              ],
              "description": "Restaurant description 2",
              "locality": "Locality 2",
              "name": "Restaurant2",
              "ratingValue": 2,
              "region": "Region 2",
              "reviewCount": 2,
              "telephone": "222 222 222"
            }
        ];

        var result =
            restaurantsAPI.simplifyRestaurantsFormat(
                JSON.stringify(restaurantsJSON));

        expect(result).to.be.deep.equal(expectedResult);

    });


    it('Create a reservation', function() {
      
      var partySize = 1;
      var restaurantName = 'exampleRestaurant';
      var reservationDatetime = new Date();
      
      var data = {
        '@type': 'FoodEstablishmentReservation',
        'partySize': partySize,
        'reservationFor': {
          '@type': 'FoodEstablishment',
          'name': '' + restaurantName
        },
        'startTime': reservationDatetime.toISOString()
      };

      var dataJson = JSON.stringify(data);

      restaurantsAPI.createNewReservation(restaurantName,partySize,reservationDatetime, function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        }, data);
        this.requests[0].requestBody.should.equal(dataJson);
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/reservation/');
        this.requests[0].method.should.equal( 'POST');
    });


    it('Cancel a reservation', function() {
      
      var reservationId = '1';
      
      restaurantsAPI.cancelReservation(reservationId, function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        });
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/reservation/'+reservationId);
        this.requests[0].method.should.equal( 'DELETE');
    });


    it('Create a review', function() {
      
      var restaurantName = '1';
      var ratingValue = '5';
      var reviewBody = 'review body test';
      
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

      var dataJson = JSON.stringify(data);

      restaurantsAPI.createNewReview(restaurantName,ratingValue,reviewBody, function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        }, data);
        this.requests[0].requestBody.should.equal(dataJson);
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/review/');
        this.requests[0].method.should.equal( 'POST');
    });


    it('Update a review', function() {
      
      var reviewId = '1';
      var ratingValue = '5';
      var reviewBody = 'review body test';
      var data = {
        'reviewBody': '' + reviewBody,
        'reviewRating': parseInt(ratingValue, 10)
      };

      var dataJson = JSON.stringify(data);

      restaurantsAPI.updateReview(reviewId,ratingValue,reviewBody, function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        }, data);
        this.requests[0].requestBody.should.equal(dataJson);
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/review/'+reviewId);
        this.requests[0].method.should.equal( 'PATCH');
    });


    it('Delete a review', function() {
      
      var reviewId = '1';
      
      restaurantsAPI.deleteReview(reviewId, function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        });
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/review/'+reviewId);
        this.requests[0].method.should.equal( 'DELETE');
    });

/*
    it('PATcH. Should send given data as JSON body', function() {
      var data = { hello: 'world' };
      var dataJson = JSON.stringify(data);

      AJAXRequest.patch('http://example.com', function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        }, data);
        this.requests[0].requestBody.should.equal(dataJson);
    });

*/

})