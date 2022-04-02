"use strict";
/*
Purpose: To allow user to view their scheduled trips
Team: 036
Author: Joe Dal Basco
Last Modified: 29/10/20
*/



/* This function displays all the scheduled trips of current user */
function displayScheduledList() {
    if (loginStatus === false) {
        //code to run if no user is logged in
        let notification = `You are not logged in. To view your scheduled trips please log in by clicking the button below.<br> <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onclick="location.href= 'login.html'"> Log In </button>`
        loginNotification.innerHTML = notification;
    }
    else if (currentUser.scheduledTrips.trips.length === 0)
    {
        let messageRef = document.getElementById("noContentToDisplay");
        let output = `No scheduled trips available to display`;
        messageRef.innerHTML = output;
    }
    else if (currentUser.scheduledTrips.trips.length !== 0) {
        //Move trips to correct lists and sort trips by date
        checkTripDates()
        sortByDate(currentUser.scheduledTrips.trips);
        //extracting trip information
        let output = "";
        for (let scheduledTrip of currentUser.scheduledTrips.trips) {
            let departure = scheduledTrip.tripRoutes[0].routeDeparture;
            let destination = scheduledTrip.tripRoutes[scheduledTrip.tripRoutes.length - 1].routeDestination;
            let date = scheduledTrip.tripDate;
            let name = scheduledTrip.tripName;
            //calculating total stops for trip
            let stopsBetweenRoutes = 0;
            for (let tripRoute of scheduledTrip.tripRoutes) {
                stopsBetweenRoutes += Number(tripRoute.stops);
            }
            let mainStops = scheduledTrip.tripRoutes.length - 1;
            let totalStops = stopsBetweenRoutes + mainStops;
            //finding tripIndex for view more page
            let tripIndex = currentUser.scheduledTrips.trips.indexOf(scheduledTrip);
            // Create output content for a trip
            output += `<tr>
                <td class="mdl-data-table__cell--non-numeric table_rows">${name}</td>
                <td class="mdl-data-table__cell--non-numeric table_rows">${departure}</td>
                <td class="mdl-data-table__cell--non-numeric table_rows">${destination}</td>
                <td class="mdl-data-table__cell--non-numeric table_rows">${totalStops}</td>
                <td class="mdl-data-table__cell--non-numeric table_rows">${date}</td>
                <td class="mdl-data-table__cell--non-numeric"><button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onclick="viewTrip(${tripIndex},true)">View More</button></td>
                </tr>`;
        }
        //displaying on html
        let tableRef = document.getElementById("scheduledTripsTableBody");
        tableRef.innerHTML = output;
    }
}

// Code to run on page load
displayScheduledList();
