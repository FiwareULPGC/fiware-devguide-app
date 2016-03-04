'use strict';
/*
 * connectionsAPI.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>,
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/

var initConnections = function() {
  //check if user is logged in
  getAjaxRequest('http://tourguide/client/user', loggedIn, notLoggedIn);
};


addLoadEvent(initConnections);


function loggedIn(userInfo) {
  localStorage.setItem('userInfo', userInfo);

  userInfo = JSON.parse(userInfo);
  var html = '<ul class="nav navbar-nav pull-right" id="log_out_menu">';
  html += '\n<li class="menuElement" id="hiUser"><p>Hi,' +
    userInfo.displayName + '!</p></li>';
  html += '<li class="menuElement" id="logOut" ><a id="logoutLink" ' +
    'href="http://tourguide/logout">Log Out</a></li>';
  html += '</ul>';
  document.getElementById('loggedDiv').innerHTML = html;
  createAndShowMenu(userInfo);
  //show_roles();
  //hide_roles();

  var logoutLink = document.getElementById('logoutLink');

  logoutLink.onclick = function() {
    console.log('LOGOUT');
    localStorage.removeItem('userInfo');
  };

  return;
}

function createAndShowMenu(userInfo) {
  var html = '<ul class="nav navbar-nav pull-left" id="loggedMenu">';

  //check each menu element
  //TODO check roles

  console.log(userInfo);
  html += '<li class="menuElement"><a href="index.html">Home</a></li>';

  //check each menu element

  //view organizations restaurants
  if (hasRole(userInfo, 'Restaurant Viewer') ||
      hasRole(userInfo, 'Global manager') || true) {//hacked
    //we should ask before for each organization but the user hasn't yet
    if (userInfo.organizations.length > 0) {

      html += '<li class="dropdown">\n';
      html += '<a  id="myRestaurantsButtonLink" class="dropdown-toggle" ' +
        'data-toggle="dropdown" role="button" href="#">';
      html += 'My restaurants <b class="caret"></b></a>\n';
      html += '<ul class ="dropdown-menu" ' +
        'aria-labelledby="myRestaurantsButtonLink" role="menu">';
        //html += '<li role="presentation">';
      for (var index = 0; index < userInfo.organizations.length; index++) {
        html += '<li role="presentation">';
          html += '<a href="myRestaurants.html?franchise=' +
            userInfo.organizations[index].name +
            '" tabindex="-1" role="menuitem">' +
            userInfo.organizations[index].name + '</a>';
        html += '</li>';
      }

      html += '</ul>';
      html += '</li>';
    }
  }

  if (hasRole(userInfo, 'End user')) {
    html += '<li class="menuElement"><a href="myReservations.html">' +
      'My Reservations</a></li>';
  }

  if (hasRole(userInfo, 'End user')) {
    html += '<li class="menuElement"><a href="myReviews.html">My reviews' +
      '</a></li>';
  }

  html += '</ul>';
  //insert menu inside logged_div
  document.getElementById('loggedDiv').innerHTML += html;
}

function hasRole(userInfo, role) {
  for (var index = 0, len = userInfo.roles.length; index < len; ++index) {
    if (role == userInfo.roles[index].name) {
      return true;
    }
  }
  return false;
}

function notLoggedIn() {
  localStorage.removeItem('userInfo');
  var html = '<div id="logIn"><p><a href="http://tourguide/auth">Log in</a>' +
    '</p></div>';
  document.getElementById('loggedDiv').innerHTML = html;
  return;
}

function showLogout() {


}

function showRoles() {
  var roles = JSON.parse(localStorage.getItem('userInfo')).roles;

  var html = '<p> You have the roles: </p>';
  html += '\n<ul>';


  for (var i = 0, len = roles.length; i < len; i++) {
    html += '\n<li>' + roles[i].name + '</li>';
  }

  html += '\n</ul>';

  document.getElementById('rolesDiv').innerHTML = html;
  document.getElementById('rolesDiv').style.display = 'block';

  return;
}

function hideRoles() {
  document.getElementById('rolesDiv').innerHTML = '';
  document.getElementById('rolesDiv').style.display = 'none';
  return;
}


function loginNeeded(action) {
  if (null != localStorage.getItem('userInfo')) {
    action();
    return;
  }

  setTimeout(function() {
    if (null != localStorage.getItem('userInfo')) {
        action();
        return;
    }
    else {
      showMessage('Log in required', 'alert-warning');
    }
  }, 500);
}

/* alerType could be alert-warning(default) or alert-danger*/
function showMessage(message, alertType) {
  alertType = typeof alertType !== 'undefined' ? alertType : 'alert-warning';

  var alert = document.createElement('DIV');
  alert.setAttribute('class', 'alert fade in ' + alertType);
  alert.innerHTML = message;

  var closeButton = document.createElement('BUTTON');
  closeButton.setAttribute('class', 'close');
  closeButton.setAttribute('data-dismiss', 'alert');
  closeButton.innerHTML = 'X';
  alert.appendChild(closeButton);
  //alert.innerHTML = 'Log in required';

  var navBar = document.getElementById('top_menu');
  //map.appendChild(alert);

  var mainContainer = document.getElementsByClassName('container-fluid')[0];

  mainContainer.insertBefore(alert, navBar.nextSibling);
}
