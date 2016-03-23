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

  var logOutMenu = document.createElement('UL');
  logOutMenu.classList.add('nav', 'navbar-nav', 'pull-right');
  logOutMenu.id = 'logOutMenu';

  var hiUserLi = document.createElement('LI');
  hiUserLi.id = 'hiUser';
  hiUserLi.className = 'menuElement';

  var hiUserText = document.createElement('P');
  hiUserText.textContent = 'Hi ' + userInfo.displayName + '!';

  hiUserLi.appendChild(hiUserText);
  logOutMenu.appendChild(hiUserLi);


  var logOutLi = document.createElement('LI');
  logOutLi.id = 'logOut';
  logOutLi.className = 'menuElement';

  var logoutLink = document.createElement('A');
  logoutLink.id = 'logOutLink';
  logoutLink.href = 'http://tourguide/logout';
  logoutLink.textContent = 'Log out';


  logoutLink.onclick = function() {
    console.log('LOGOUT');
    localStorage.removeItem('userInfo');
  };

  logOutLi.appendChild(logoutLink);
  logOutMenu.appendChild(logOutLi);

  document.getElementById('loggedDiv').innerHTML = '';

  document.getElementById('loggedDiv').appendChild(logOutMenu);

  createAndShowMenu(userInfo);

  return;
}

function createAndShowMenu(userInfo) {


  //TODO check roles

  var loggedMenu = document.createElement('UL');
  loggedMenu.id = 'loggedMenu';
  loggedMenu.classList.add('nav', 'navbar-nav', 'pull-left');

  var home = document.createElement('LI');
  home.className = 'menuElement';

  var homeLink = document.createElement('A');
  homeLink.href = 'index.html';
  homeLink.textContent = 'Home';

  home.appendChild(homeLink);
  loggedMenu.appendChild(home);

  //check each menu element

  //view organizations restaurants
  if (hasRole(userInfo, 'Restaurant Viewer') ||
      hasRole(userInfo, 'Global manager') || true) {//hacked

    //we should ask before for each organization but the user hasn't yet
    if (userInfo.organizations.length > 0) {

      var myRestaurantsLi = document.createElement('LI');
      myRestaurantsLi.className = 'dropdown';

      var myRestaurantsA = document.createElement('A');
      myRestaurantsA.id = 'myRestaurantsButtonLink';
      myRestaurantsA.className = 'dropdown-toggle';
      myRestaurantsA.setAttribute('data-toggle', 'dropdown');
      myRestaurantsA.setAttribute('role', 'button');
      myRestaurantsA.href = '#';
      myRestaurantsA.textContent = 'My restaurants';

      var caret = document.createElement('B');
      caret.className = 'caret';

      myRestaurantsA.appendChild(caret);
      myRestaurantsLi.appendChild(myRestaurantsA);

      var organizationsMenu = document.createElement('UL');
      organizationsMenu.className = 'dropdown-menu';
      organizationsMenu.setAttribute('aria-labelledby',
                                    'myRestaurantsButtonLink');
      organizationsMenu.setAttribute('role', 'menu');

      for (var index = 0; index < userInfo.organizations.length; index++) {
        var organizationLi = document.createElement('LI');
        organizationLi.setAttribute('role', 'presentation');

        var organizationA = document.createElement('A');
        organizationA.setAttribute('role', 'menuitem');
        organizationA.tabIndex = -1;
        organizationA.href =
          'myRestaurants.html?franchise=' + userInfo.organizations[index].name;
        organizationA.textContent = userInfo.organizations[index].name;

        organizationLi.appendChild(organizationA);
        organizationsMenu.appendChild(organizationA);
      }

      myRestaurantsLi.appendChild(organizationsMenu);

      loggedMenu.appendChild(myRestaurantsLi);
    }


  }

  if (hasRole(userInfo, 'End user')) {
    var myReservations = document.createElement('LI');
    myReservations.className = 'menuElement';

    var myReservationsA = document.createElement('A');
    myReservationsA.href = 'myReservations.html';
    myReservationsA.textContent = 'My reservations';

    myReservations.appendChild(myReservationsA);
    loggedMenu.appendChild(myReservations);
  }

  if (hasRole(userInfo, 'End user')) {
    var myReviews = document.createElement('LI');
    myReviews.className = 'menuElement';

    var myReviewsA = document.createElement('A');
    myReviewsA.href = 'myReviews.html';
    myReviewsA.textContent = 'My reviews';

    myReviews.appendChild(myReviewsA);
    loggedMenu.appendChild(myReviews);
  }



  //insert menu inside logged_div
  document.getElementById('loggedDiv').innerHTML += '';
  document.getElementById('loggedDiv').appendChild(loggedMenu);

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

  var logInMenu = document.createElement('UL');
  logInMenu.classList.add('nav', 'navbar-nav', 'pull-right');
  logInMenu.id = 'logIn';


  var logInLi = document.createElement('LI');
  logInLi.className = 'menuElement';

  var logInA = document.createElement('A');
  logInA.href = 'http://tourguide/auth';
  logInA.textContent = 'Log in';

  logInLi.appendChild(logInA);
  logInMenu.appendChild(logInLi);

  document.getElementById('loggedDiv').innerHTML = '';
  document.getElementById('loggedDiv').appendChild(logInMenu);
  return;
}

function showLogout() {


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
  alert.classList.add('alert', 'fade', 'in', alertType);
  alert.textContent = message;

  var closeButton = document.createElement('BUTTON');
  closeButton.className = 'close';
  closeButton.setAttribute('data-dismiss', 'alert');
  closeButton.textContent = 'X';
  alert.appendChild(closeButton);
  //alert.innerHTML = 'Log in required';

  var navBar = document.getElementById('topMenu');
  //map.appendChild(alert);

  var mainContainer = document.getElementsByClassName('container-fluid')[0];

  mainContainer.insertBefore(alert, navBar.nextSibling);
}
