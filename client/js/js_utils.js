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

function get_ajax_petition(url, on_success_callback, on_failure_callback) {

  var xhr = new XMLHttpRequest();

  xhr.onload = function(e) {
    if (200 == this.status) {
      on_success_callback(this.response);
    }
    else {
      on_failure_callback(this.response);
    }
  };

  xhr.onerror = function(e) {
    on_failure_callback(this.response);
  };

  xhr.open('GET', url, true);
  xhr.setRequestHeader('Fiware-Service', 'tourguide');
  xhr.send();
}


function delete_ajax_petition(url, on_success_callback, on_failure_callback) {
  var xhr = new XMLHttpRequest();

  xhr.onload = function(e) {
    if (204 == this.status) {
      on_success_callback(this.response);
    }
    else {
      on_failure_callback(this.response);
    }
  };

  xhr.onerror = function(e) {
    on_failure_callback(this.response);
  };

  xhr.open('DELETE', url, true);
  xhr.setRequestHeader('Fiware-Service', 'tourguide');
  xhr.send();
}


function post_ajax_petition(url, on_success_callback, on_failure_callback, data) {
  var xhr = new XMLHttpRequest();


  xhr.onload = function(e) {
    if (200 == this.status) {
      on_success_callback(this.response);
    }
    else {
      on_failure_callback(this.response);
    }
  };

  xhr.onerror = function(e) {
      on_failure_callback(this.response);
  };


  xhr.open('POST', url, true);
  xhr.setRequestHeader('Fiware-Service', 'tourguide');
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(data));
}


function patch_ajax_petition(url, on_success_callback, on_failure_callback, data) {

  var xhr = new XMLHttpRequest();

  xhr.onload = function(e) {
    if ((201 == this.status) || (204 == this.status)) {
      on_success_callback(this.response);
    }
    else {
      on_failure_callback(this.response);
    }
  };

  xhr.onerror = function(e) {
      on_failure_callback(this.response);
  };
  xhr.open('PATCH', url, true);
  xhr.setRequestHeader('Fiware-Service', 'tourguide');
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(data));
}



