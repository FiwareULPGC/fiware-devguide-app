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


function getAjaxRequest(url, successCallback, failureCallback) {
  var xmlhttp;

  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  }
  else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
  }

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {

      if (xmlhttp.status == 200) {
        successCallback(xmlhttp.responseText);
      }
      else if (xmlhttp.status == 404) {
        try {
          failureCallback();
        }
       catch (err) {
          failureCallback(xmlhttp.responseText);
        }
      }
      else {
        try {
          failureCallback();
        }
        catch (err) {
          failureCallback(xmlhttp.responseText);
        }
      }
    }
  };
  xmlhttp.open('GET', url, true);
  xmlhttp.setRequestHeader('Fiware-Service', 'tourguide');
  xmlhttp.send();
}


function deleteAjaxRequest(url, successCallback, failureCallback) {
  var xmlhttp;

  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  }
  else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
  }

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
      console.log(xmlhttp.responseText);
      if (xmlhttp.status == 204) {
        successCallback(xmlhttp.responseText);
      }
      else if (xmlhttp.status == 404) {
        try {
          failureCallback();
        }
        catch (err) {
          failureCallback(xmlhttp.responseText);
        }

      }
      else {
        try {
          failureCallback();
        }
        catch (err) {
          failureCallback(xmlhttp.responseText);
        }
      }
    }
  };
  xmlhttp.open('DELETE', url, true);
  xmlhttp.setRequestHeader('Fiware-Service', 'tourguide');
  xmlhttp.send();
}



function postAjaxRequest(url, successCallback, failureCallback, data) {
  var xmlhttp;

  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  }
  else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
  }

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
      if (xmlhttp.status == 201) {
        successCallback(xmlhttp.responseText);
      }
      else if (xmlhttp.status == 404) {
        try {
          failureCallback();
        }
          catch (err) {
          failureCallback(xmlhttp.responseText);
        }
      }
      else {
        try {
          failureCallback();
        }
        catch (err) {
          failureCallback(xmlhttp.responseText);
        }
      }
    }
  };
  xmlhttp.open('POST', url, true);
  xmlhttp.setRequestHeader('Fiware-Service', 'tourguide');
  xmlhttp.setRequestHeader('Content-type', 'application/json');
  xmlhttp.send(JSON.stringify(data));
}


function patchAjaxRequest(url, successCallback, failureCallback, data) {
  console.log('patch debug:');
  console.log('url: ' + url);
  console.log(data);
  var xmlhttp;

  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  }
  else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
  }

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
      if ((xmlhttp.status == 201) || xmlhttp.status == 204) {
        successCallback(xmlhttp.responseText);
      }
      else if (xmlhttp.status == 404) {
        try
        {
          failureCallback();
        }
        catch (err)
        {
          failureCallback(xmlhttp.responseText);
        }
      }
      else {
        try {
          failureCallback();
        }
        catch (err) {
          failureCallback(xmlhttp.responseText);
        }
     }
    }
  };
  xmlhttp.open('PATCH', url, true);
  xmlhttp.setRequestHeader('Fiware-Service', 'tourguide');
  xmlhttp.setRequestHeader('Content-type', 'application/json');
  xmlhttp.send(JSON.stringify(data));
}


Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
  var dd = this.getDate().toString();
  return yyyy + '-' + (mm.length === 2 ? mm : '0' + mm[0]) + '-' +
   (dd[1] ? dd : '0' + dd[0]); // padding
};

