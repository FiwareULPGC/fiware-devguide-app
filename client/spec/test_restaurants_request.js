/*var restaurantsAPI = require('../js/restaurantsAPI.js');
var AJAXRequest = require('../js/AJAXRequest.js');
var chai = require('chai');
var assert = require('chai').assert;

var jsdom = require("jsdom").jsdom;
//global.L = require('../addons/leaflet/leaflet.js');
require('mocha-jsdom');

*/
var assert = chai.assert;
var expect = chai.expect;
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


var reviewsJSON = 
  [  
    {
        "@context": "http://schema.org",
        "@type": "Review",
        "author":
        {
            "@type": "Person",
            "name": "user9"
        },
        "dateCreated": "2016-06-08T11:43:54.007Z",
        "itemReviewed":
        {
            "@type": "Restaurant",
            "name": "Elizalde"
        },
        "name": "9bb3d6f09a8ae200f4e5ef34ada808348ff6c800",
        "publisher":
        {
            "@type": "Organization",
            "name": "Bitergia"
        },
        "reviewBody": "Body review",
        "reviewRating":
        {
            "@type": "Rating",
            "ratingValue": 3
        }
    },
    {
        "@context": "http://schema.org",
        "@type": "Review",
        "author":
        {
            "@type": "Person",
            "name": "user4"
        },
        "dateCreated": "2016-06-08T11:43:54.008Z",
        "itemReviewed":
        {
            "@type": "Restaurant",
            "name": "El Txakoli"
        },
        "name": "7683e7fb7915e902eeb7fc98bf146cd2eb9d415c",
        "publisher":
        {
            "@type": "Organization",
            "name": "Bitergia"
        },
        "reviewBody": "Body review",
        "reviewRating":
        {
            "@type": "Rating",
            "ratingValue": 2
        }
    },
    {
        "@context": "http://schema.org",
        "@type": "Review",
        "author":
        {
            "@type": "Person",
            "name": "user1"
        },
        "dateCreated": "2016-06-08T11:43:54.008Z",
        "itemReviewed":
        {
            "@type": "Restaurant",
            "name": "Arabako Txakolina, S.L."
        },
        "name": "2e8027403877193b539518ad53db3d0c860f6f2f",
        "publisher":
        {
            "@type": "Organization",
            "name": "Bitergia"
        },
        "reviewBody": "Body review",
        "reviewRating":
        {
            "@type": "Rating",
            "ratingValue": 1
        }
    }
  ];


describe('Testing restaurant requests', function () {
  before(function() {
    //global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    //global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();

  })

  after(function() {
    //delete global.XMLHttpRequest;
  })

  beforeEach(function() {
    this.xhr = sinon.useFakeXMLHttpRequest();

    this.requests = [];
    this.xhr.onCreate = function(xhr) {
      this.requests.push(xhr);
    }.bind(this);


    map = L.map('map').setView([42.90816007196054, -2.52960205078125], 8);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution:
        '&copy; <a href="http://osm.org/copyright">' +
        'OpenStreetMap</a> contributors'
    }).addTo(map);

 
  });

  afterEach(function() {
    this.xhr.restore();
    map.remove();
    delete map;

  });


    it('Get all restaurants', function(done) {
        //this.timeout(15000);
 
        var previousZoom = map.getZoom();
        map.setZoom(1,false);
        var data = restaurantsJSON;
        var dataJson = JSON.stringify(data);
        var markerClusterLayer;

        restaurantsAPI.getAllRestaurants();
        this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);

        var layerCount = 0;
        for (var layer_id in map._layers) {
          if (map._layers[layer_id]._childCount) {
            layerCount += map._layers[layer_id]._childCount;
            markerClusterLayer = map._layers[layer_id];
          }
        }
        expect(layerCount).to.be.equal(2); //expected 2 restaurants
        map.setZoom(previousZoom,false);
        done();

        //console.log(map);

        var restaurants = 
            markerClusterLayer._childClusters[0].getAllChildMarkers();


        expect(restaurants).to.be.a('array').and.to.have.lengthOf(2);

      restaurants.forEach(function(restaurant) {
        expect(restaurant).to.have.property('_popup');
        expect(restaurant).to.have.property('extraInfo');

        //rest info
        expect(restaurant.extraInfo).to.all.keys('name','address','locality',
          'region','description','telephone', 'ratingValue','reviewCount','coords','mark');

        
      });
  });

    //same as getAllRestaurants
    it('Get organization restaurants', function(done) {
        //this.timeout(15000);
 
        var previousZoom = map.getZoom();
        map.setZoom(1,false);
        var data = restaurantsJSON;
        var dataJson = JSON.stringify(data);
        var markerClusterLayer;

        restaurantsAPI.getOrganizationRestaurants('sampleOrganization');
        this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);

        var layerCount = 0;
        for (var layer_id in map._layers) {
          if (map._layers[layer_id]._childCount) {
            layerCount += map._layers[layer_id]._childCount;
            markerClusterLayer = map._layers[layer_id];
          }
        }
        expect(layerCount).to.be.equal(2); //expected 2 restaurants
        map.setZoom(previousZoom,false);
        done();

        //console.log(map);

        var restaurants = 
            markerClusterLayer._childClusters[0].getAllChildMarkers();


        expect(restaurants).to.be.a('array').and.to.have.lengthOf(2);

      restaurants.forEach(function(restaurant) {
        expect(restaurant).to.have.property('_popup');
        expect(restaurant).to.have.property('extraInfo');

        //rest info
        expect(restaurant.extraInfo).to.all.keys('name','address','locality',
          'region','description','telephone', 'ratingValue','reviewCount','coords','mark');

        
      });




    });

});


describe('Testing restaurant review requests', function () {
  before(function() {
    //global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    //global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();

  })

  after(function() {
    //delete global.XMLHttpRequest;
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
    document.getElementById('popContent').innerHTML = '';

  });


    it('Get restaurant reviews for a restaurant', function(done) {
 
        var data = [];
        data.push(reviewsJSON[0]);
        var dataJson = JSON.stringify(data);
        var markerClusterLayer;

        /*restaurantsAPI.getRestaurantReviews(
          '7683e7fb7915e902eeb7fc98bf146cd2eb9d415c',
          function(){done();},
          function(){done();});
        */
        restaurantsAPI.getRestaurantReviews(
          'Elizalde');
        this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
        expect(1).to.be.equal(1);
        done();
  });


    
});



