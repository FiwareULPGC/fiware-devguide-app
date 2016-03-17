'use strict';
/*
 * js_utils.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>,
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/


function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  }
  else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    };
  }
}

  
function prepareXHR(method, url, failure_callback) {
  var xhr = new XMLHttpRequest();
  
  xhr.onerror = function(e) {
    failure_callback(this.response);
  };

  xhr.open(method, url, true);
  xhr.setRequestHeader('Fiware-Service', 'tourguide');

  return xhr;
}

function get_ajax_petition(url, on_success_callback, on_failure_callback) {
  var xhr = prepareXHR('GET', url, on_failure_callback);

  xhr.onload = function(e) {
    if (200 == this.status) {
      on_success_callback(this.response);
    }
    else {
      on_failure_callback(this.response);
    }
  };

  xhr.send();
}


function delete_ajax_petition(url, on_success_callback, on_failure_callback) {
  var xhr = prepareXHR('DELETE', url, on_failure_callback);

  xhr.onload = function(e) {
    if (204 == this.status) {
      on_success_callback(this.response);
    }
    else {
      on_failure_callback(this.response);
    }
  };

  xhr.send();
}


function post_ajax_petition(url, on_success_callback, on_failure_callback, data) {
  var xhr = prepareXHR('POST', url, on_failure_callback);

  xhr.onload = function(e) {
    if (200 == this.status) {
      on_success_callback(this.response);
    }
    else {
      on_failure_callback(this.response);
    }
  };
  
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(data));
}


function patch_ajax_petition(url, on_success_callback, on_failure_callback, data) {
  var xhr = prepareXHR('PATCH', url, on_failure_callback);

  xhr.onload = function(e) {
    if ((201 == this.status) || (204 == this.status)) {
      on_success_callback(this.response);
    }
    else {
      on_failure_callback(this.response);
    }
  };

  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(data));
}

Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
  var dd = this.getDate().toString();
  return yyyy + '-' + (mm.length === 2 ? mm : '0' + mm[0]) + '-' +
   (dd[1] ? dd : '0' + dd[0]); // padding
};

