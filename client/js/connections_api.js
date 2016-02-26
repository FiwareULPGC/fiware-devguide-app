/*
 * connections_api.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors: 
 *   Jaisiel Santana <jaisiel@gmail.com>,
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/

init_connexions = function(){

  //check if user is logged in
  get_ajax_petition('http://tourguide/client/user',logged_in, not_logged_in);
}


addLoadEvent(init_connexions);




function logged_in(userInfo){
  localStorage.setItem("userInfo", userInfo);
  
  userInfo = JSON.parse(userInfo);
  html = '<ul class="nav navbar-nav pull-right" id="log_out_menu">';
  html += '\n<li class="menu_element" id="hi_user"><p>Hi,'+userInfo["displayName"]+'!</p></li>';
   html += '<li class="menu_element" id="log_out" ><a id="logout_link" href="http://tourguide/logout">Log Out</a></li>';
  html += '</ul>'
  document.getElementById("logged_div").innerHTML = html;
  create_and_show_menu(userInfo);

  logout_link = document.getElementById("logout_link");

  logout_link.onclick=function(){
    console.log("LOGOUT");
    localStorage.removeItem("userInfo");
  };


  return ;
}

function create_and_show_menu(userInfo)
{
  html = '<ul class="nav navbar-nav pull-left" id="logged_menu">';

    //check each menu element

    html += '<li class="menu_element"><a href="index.html">Home</a></li>';

    if( has_role(userInfo, "End user") )
    {
      html += '<li class="menu_element"><a href="myReservations.html">My Reservations</a></li>';
    }

    if( has_role(userInfo, "End user") )
    {
      html += '<li class="menu_element"><a href="myReviews.html">My reviews</a></li>';
    }

    if( has_role(userInfo, "Restaurant Viewer") || has_role(userInfo, "Global manager") || true )//hacked
    {
      if (userInfo.organizations.length > 0)
      {
        html += '<li class="dropdown">';
        html += '<a  id="myOrganizationsButtonLink" class="dropdown-toggle" data-toggle="dropdown" role="button" href="#">';
        html += 'My Organizations <b class="caret"></b></a>\n';
        html += '<ul class ="dropdown-menu  multi-level" aria-labelledby="myOrganizationsButtonLink" role="menu">';

        
        for (var index=0; index < userInfo.organizations.length; index++)
        {
          html += '<li class="dropdown-submenu">';
            html += '<a href="#" tabindex="-1">'+userInfo.organizations[index]["name"]+'</a>';
            html += '<ul class="dropdown-menu">'; 
              html+= '<li>';
                html += '<a tabindex="-1" href="organizationRestaurants.html?organization='+userInfo.organizations[index]["name"]+'" >Restaurants</a>';
              html += '</li>'; 
              html+= '<li>';
                html += '<a tabindex="-1" href="organizationReservations.html?organization='+userInfo.organizations[index]["name"]+'" >Reservations</a>';
              html += '</li>'; 
              html+= '<li>';
                html += '<a tabindex="-1" href="organizationReviews.html?organization='+userInfo.organizations[index]["name"]+'" >Reviews</a>';
              html += '</li>';
            html += '</ul>'; 
          html += '</li>';
        }
       

        html += '</ul>';
        html += '</li>';
      }
    }

  html += '</ul>'
  //insert menu inside logged_div
  document.getElementById("logged_div").innerHTML += html;
}

function has_role(userInfo, role)
{
  for (var index = 0, len = userInfo["roles"].length; index < len; ++index) {
    if (role == userInfo["roles"][index]["name"] )
      return true
  }
return false;
}
function not_logged_in(){
  localStorage.removeItem("userInfo");
  html = '<div id="log_in"><p><a href="http://tourguide/auth">Log in</a></p></div>';
  document.getElementById("logged_div").innerHTML = html;
  return;
}

function show_logout(){


}



function login_needed(action)
{
  if (null !=localStorage.getItem("userInfo"))
  {
    action();
    return;
  }

  setTimeout(function (){
  if (null !=localStorage.getItem("userInfo"))
  {
      action();
      return;
  }
  else{
    show_message('Log in required', 'alert-warning');
  }
}, 500);


}

/* alerType could be alert-warning(default) or alert-danger*/
function show_message(message, alertType)
{

  alertType = typeof alertType !=='undefined' ? alertType : 'alert-warning';

  var alert = document.createElement("DIV");
  alert.setAttribute("class", "alert fade in "+ alertType);
  alert.innerHTML = message;

  var closeButton = document.createElement("BUTTON");
  closeButton.setAttribute("class", "close");
  closeButton.setAttribute("data-dismiss", "alert");
  closeButton.innerHTML='X';
  alert.appendChild(closeButton);

  var navBar =  document.getElementById("top_menu");

  var main_container = document.getElementsByClassName("container-fluid")[0];

  main_container.insertBefore(alert,navBar.nextSibling);
}