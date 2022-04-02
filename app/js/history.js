"use strict";
/*
Purpose: To allow user to view their past trips
Team: 036
Author: Joe Dal Basco
Last Modified: 29/10/20
*/

/* This function displays all the past trips of current user */
function displayTripHistoryList(){
    if (loginStatus === false) {
        //code to run if no user is logged in
        let notification = `You are not logged in. To view your history of trips please log in by clicking the button below.<br> <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onclick="location.href= 'login.html'"> Log In </button>`
        loginNotification.innerHTML = notification;
    }
    else if(currentUser.historyTrips.trips.length === 0)
    {
        let messageRef = document.getElementById("noContentToDisplay");
        let output = `No history trips available to display`;
        messageRef.innerHTML = output;

    }
    else if (currentUser.historyTrips.trips.length !== 0){
        //sort trips by date
        checkTripDates()
        sortByDate(currentUser.historyTrips.trips);        
        //extracting trip information
        let output = "";
        for (let historyTrip of currentUser.historyTrips.trips) {
            let departure = historyTrip.tripRoutes[0].routeDeparture;
            let destination = historyTrip.tripRoutes[historyTrip.tripRoutes.length - 1].routeDestination;
            let date = historyTrip.tripDate;
            let name = historyTrip.tripName;
            //calculating total stops for trip
            let stopsBetweenRoutes = 0;
            for (let tripRoute of historyTrip.tripRoutes) {
                stopsBetweenRoutes += Number(tripRoute.stops);
            }
            let mainStops = historyTrip.tripRoutes.length - 1;
            let totalStops = stopsBetweenRoutes + mainStops;
            //finding tripIndex for view more page
            let tripIndex = currentUser.historyTrips.trips.indexOf(historyTrip);
            output += `<tr>
                <td class="mdl-data-table__cell--non-numeric table_rows">${name}</td>
                <td class="mdl-data-table__cell--non-numeric table_rows">${departure}</td>
                <td class="mdl-data-table__cell--non-numeric table_rows">${destination}</td>
                <td class="mdl-data-table__cell--non-numeric table_rows">${totalStops}</td>
                <td class="mdl-data-table__cell--non-numeric table_rows">${date}</td>
                <td class="mdl-data-table__cell--non-numeric"><button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onclick="viewTrip(${tripIndex},false)">View More</button></td>
                </tr>`;
        }
        //displaying on html
        let tableRef = document.getElementById("tripsHistoryTableBody");
        tableRef.innerHTML = output;
    }

}


// Code to run on page load

displayTripHistoryList();

