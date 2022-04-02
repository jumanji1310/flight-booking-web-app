"use strict";
/*
Purpose: To allow user to see a summary of their planned trip and save or cancel it
Team: 036
Author: Jun Jie Ng
Last Modified: 29/10/20
*/

/* This function displays a summary of the planned trip in a table */
function displaySummary(){
    //extracting unsavedTrip route departure and destination
    let departure = unsavedTrip.tripRoutes[0].routeDeparture;
    let destination = unsavedTrip.tripRoutes[unsavedTrip.tripRoutes.length - 1].routeDestination;
    let date = unsavedTrip._tripDate;

    //calculating stops between routes and stops between departure and destination
    let stopsBetweenRoutes = 0;
    let routes = "";
    let routesList = unsavedTrip.tripRoutes;
    for (let i = 0; i < unsavedTrip.tripRoutes.length; i++) {
        stopsBetweenRoutes += Number(routesList[i].stops);
        routes += `<br>${i + 1}) ${routesList[i].routeDeparture} to ${routesList[i].routeDestination}`; //adding routes
    }
    let mainStops = unsavedTrip.tripRoutes.length - 1;
    let totalStops = stopsBetweenRoutes + mainStops;

    //outputting to html
    let summaryTableRef = document.getElementById("summaryTable");
    let output = `<tr>
        <td class="mdl-data-table__cell--non-numeric table_headers">Departure</td>
        <td class="mdl-data-table__cell--non-numeric table_rows">${departure}</td>
        </tr>
        <tr>
        <td class="mdl-data-table__cell--non-numeric table_headers">Destination</td>
        <td class="mdl-data-table__cell--non-numeric table_rows">${destination}</td>
        </tr>
        <tr>
        <td class="mdl-data-table__cell--non-numeric table_headers">Date of Trip</td>
        <td class="mdl-data-table__cell--non-numeric table_rows">${date}</td>
        </tr>
        <tr>
        <td class="mdl-data-table__cell--non-numeric table_headers">Routes</td>
        <td class="mdl-data-table__cell--non-numeric table_rows">${routes}</td>
        </tr>
        <tr>
        <td class="mdl-data-table__cell--non-numeric table_headers">Total Number of Stops</td>
        <td class="mdl-data-table__cell--non-numeric table_rows">${totalStops}</td>
        </tr>`;

    summaryTableRef.innerHTML = output;
}

/* This function cancels the currently planned trip and deletes it from local storage */
function cancel(){
    if (confirm("Currently planned trip will be deleted.")){
        //clears tripRoutes and tripDate
        localStorage.removeItem(UNSAVEDTRIP_DATA_KEY);
        //redirect to homepage
        window.location = "index.html";
    }
}

/* This function saves the trip to current user if logged in and saves after logging in if user is guest*/
function saveTrip(){
    if (loginStatus){
        //adding trip info to current user and clearing unsavedTrip variable
        let tripName = prompt("Please enter a trip name");
        unsavedTrip.tripName = tripName;
        currentUser.addScheduled(unsavedTrip);
        updateLocalStorage(currentUser, USER_DATA_KEY);
        let userIndex = getDataLocalStorage(USER_INDEX_KEY);
        account.userList[userIndex] = currentUser;
        updateLocalStorage(account,USERLIST_DATA_KEY);
        localStorage.removeItem(UNSAVEDTRIP_DATA_KEY);
        checkTripDates();
        window.location = "scheduled.html";
    }
    else{
        let tripName = prompt("Please enter a trip name");
        unsavedTrip.tripName = tripName;
        updateLocalStorage(unsavedTrip,UNSAVEDTRIP_DATA_KEY);
        updateLocalStorage(true, SAVE_KEY);
        alert("You need to login first before saving trip, redirect to login page");
        window.location  = "login.html";
    }
}

//runs on load
displaySummary();

