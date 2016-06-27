var utils = require('../js/utils.js')
var utils_config = {
  'file':'file://'+__dirname+'/config_utils.html',
  'done': function(){}
};
var jsdom = require("jsdom").jsdom;
require('mocha-jsdom')



describe('Testing utils module', function () {
  
  it('capitalizes a string', function() {
    var result = utils.capitalize('foobar');   
    expect(result).to.be.a('string').and.equal('FOOBAR');
  });

  describe('Testing showMessage function', function() {

    beforeEach(function() {

      var doc = jsdom("<div class='container-fluid'>"+
          "<div id='topMenu'></div>" +
          "<div id='sibling1'></div>" +
        "</div>", {});
      global.window = doc.defaultView;
      global.document = window.document;
    });

    afterEach(function() {
      while (window.firstChild) {
        window.removeChild(myNode.firstChild);
      }
      delete global.window;
      delete global.document;
    })


    it('test alert-danger message', function() {
      var message = 'test 1';
      utils.showMessage(message, 'alert-danger');

      var navBar = document.getElementById('topMenu');
      var messageDiv = navBar.nextSibling;
      
      expect(messageDiv).to.have.property('className').that.is.a('string').to.contain('alert').to.contain('fade').to.contain('in').to.contain('alert-danger');
      expect(messageDiv).to.have.property('textContent').that.is.a('string').to.be.equal(message+'X')
    

    })

    it('test alert-warning message', function() {
      var message = 'test 2';
      utils.showMessage(message, 'alert-warning');

      var navBar = document.getElementById('topMenu');
      var messageDiv = navBar.nextSibling;

      expect(messageDiv).to.have.property('className').that.is.a('string').to.contain('alert').to.contain('fade').to.contain('in').to.contain('alert-warning');
      expect(messageDiv).to.have.property('textContent').that.is.a('string').to.be.equal(message+'X')

    })

    it('test default message', function() {
      var message = 'test 3';
      utils.showMessage(message);

      var navBar = document.getElementById('topMenu');
      var messageDiv = navBar.nextSibling;

      expect(messageDiv).to.have.property('className').that.is.a('string').to.contain('alert').to.contain('fade').to.contain('in').to.contain('alert-warning');
      expect(messageDiv).to.have.property('textContent').that.is.a('string').to.be.equal(message+'X')

    })
  })

//TODO change locale
/*
  describe('Testing fixBookingTime', function () {
    
    it('Locale...', function() {
      var expectedDates = [{
        'input': '2015-11-03T17:11:04.676Z',
        'output': '3/11/2015 17:11:04'
      },{
        'input': '2015-1-13T17:11:04.676Z',
        'output': '13/1/2015 17:11:04'
      }];

      var result;
      expectedDates.forEach(function (expectedDate) {
        result = utils.fixBookingTime(expectedDate.input);
        expect(result).to.be.equal(expectedDate.output);
      });

    });

  })
*/

});
  
