/*
Purpose: To allow user to view more information of selected trip
Team: 036
Author: Grant Lu and Logithan Chandrakumar
Last Modified: 29/10/20
*/

"use strict";
//defining map
const ACCESS_TOKEN = 'pk.eyJ1IjoiYXJ2aW5ka2F1ciIsImEiOiJjamt0c20wcXIwOTE3M29tbXYyc2M2aXhsIn0.mOrPB0bbVVm9NitiWvz96w';
mapboxgl.accessToken = ACCESS_TOKEN;
let map = new  mapboxgl.Map({
	container: 'map',
	zoom: 3,
	style: 'mapbox://styles/mapbox/streets-v9'
});


/* This function centers the map on the user's selected country and sends a webservice request to the Airports API with the data being 
 used in the callback function routeDisplay*/
function getData()
{
    let country =trip.tripCountry; 
    //fetch API to center map on selected country
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${country}.json?access_token=pk.eyJ1IjoianVtYW5qaTEzMTAiLCJhIjoiY2tmN3g2bmUzMDA3cDJyb2ZkZmxjZDg3MyJ9.8n1TbI-Lz4v_JIJPCmXrRQ&types=country`)
        .then(response => response.json())
        .then(data => {
            let centerCoords = data.features[0].center;
            map.setZoom(4).panTo(centerCoords);
    });

    //display the routes on map
    //requesting Airports API with country
    let url = "https://eng1003.monash/OpenFlights/airports/";  
    let data = {
        country: country,
        callback: "routeDisplay"
    }
    webServiceRequest(url,data);
}

/* This function displays all routes of selected trip on the map 
Input: Airports data of selected country from Airports API*/
function routeDisplay(airports) {
    let routesArray = trip.tripRoutes;
    let airportList = [];

    for (let airport of airports) {
        airportList.push({
            airportName: airport.name,
            airportCoordination: [airport.longitude, airport.latitude]
        });


    }

    for (let route of routesArray) {
        let object = {
            type: "geojson",
            data: {
                type: "Feature",
                properties: { description: "" },
                geometry: {
                    type: "LineString",
                    coordinates: []
                }
            }
        };
        //searches for airports of route in global airports list of country and adds coordinates to object
        //routes with international destination will have destinationAirport variable empty
        let departureAirport = "";
        let destinationAirport = "";

        for (let airport of airportList) {
            if (route.routeDeparture == airport.airportName) {
                object.data.geometry.coordinates.push(airport.airportCoordination);
                departureAirport = airport.airportName;
                airportCordsList.push([airport.airportCoordination, airport.airportName]);
            }
            else if (route.routeDestination == airport.airportName) {
                object.data.geometry.coordinates.push(airport.airportCoordination);
                destinationAirport = airport.airportName;
                airportCordsList.push([airport.airportCoordination, airport.airportName]);
            }
        }
        let routeInfo = `${departureAirport} / ${destinationAirport}`;
        object.data.properties.description = routeInfo;

        let routeId = `routes${routesArray.indexOf(route)}`;
        routeIdList.push(routeId); //adding route id to global route list
        routeObjectList.push(object); //adding object to global route object list
        map.addLayer({
            id: routeId,
            type: "line",
            source: object,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#888", "line-width": 6 }
        });
    }
    airportMapDisplay();
    popupOnClick();
}

/* This function displays all the airports visited during the selected trip */
function airportMapDisplay() {
    //Check self (airportCordsList), it filters out the repeating ones, and return unique list
    let uniqueCords = airportCordsList.filter((value, index, array)=>{
        return array.indexOf(value) === index;
    });

    for (let cords of uniqueCords) {
        //displaying airport on map with popup and marker
        let marker = new mapboxgl.Marker({ "color": "#FF8C00" });
        marker.setLngLat(cords[0]);

        let popup = new mapboxgl.Popup({ offset: 45, closeButton: false, closeOnClick: false });
        popup.setText(cords[1]);

        marker.setPopup(popup)

        // Display the marker.
        marker.addTo(map);

        // Display the popup.
        popup.addTo(map);
    }

}



//Creates a popup for each route when clicked that displays the two airports it connects
function popupOnClick(){
    //defining popup
    let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    //setting click events for each route 
    for (let i=0; i<routeIdList.length; i++) {
        map.on('click', routeIdList[i], function (e) {
            let description = routeObjectList[i].data.properties.description;
            popup
                .setLngLat(e.lngLat)
                .setHTML(description)
                .addTo(map);
        });
    }  
}

/* This function displays information about the input trip in a table on the HTML
Input: A trip with routes */
function displayRouteDetail(trip) {
    //Assign the info into the variables
    let name = trip.tripName;
    let departure = trip.tripRoutes[0].routeDeparture;
    let destinationIndex = trip.tripRoutes.length - 1;
    let destination = trip.tripRoutes[destinationIndex].routeDestination;
    let date = trip._tripDate;

    //calculating stops between routes and stops between departure and destination
    let stopsBetweenRoutes = 0;
    let routes = "";
    let routesList = trip.tripRoutes;
    for (let i = 0; i < trip.tripRoutes.length; i++) {
        stopsBetweenRoutes += Number(routesList[i].stops);
        routes += `<br>${i + 1}) ${routesList[i].routeDeparture} to ${routesList[i].routeDestination}`;
    }
    let mainStops = routesList.length - 1;
    let totalStops = stopsBetweenRoutes + mainStops;

    //display details to the table
    let output = `  <tr>
                        <td class="mdl-data-table__cell--non-numeric table_headers">Trip Name</td>
                        <td class="mdl-data-table__cell--non-numeric table_rows">${name}</td>
                    </tr>
                    <tr>
                        <td class="mdl-data-table__cell--non-numeric table_headers">Departure</td>
                        <td class="mdl-data-table__cell--non-numeric table_rows">${departure}</td>
                    </tr>
                    <tr>
                        <td class="mdl-data-table__cell--non-numeric table_headers">Destination</td>
                        <td class="mdl-data-table__cell--non-numeric table_rows">${destination}</td>
                    </tr >
                    <tr>
                        <td class="mdl-data-table__cell--non-numeric table_headers">Date of Trip</td>
                        <td class="mdl-data-table__cell--non-numeric table_rows">${date}</td>
                    </tr>
                    <tr>
                        <td class="mdl-data-table__cell--non-numeric table_headers">Routes</td>
                        <td class="mdl-data-table__cell--non-numeric table_rows">${routes}</td>
                        </tr>
                    <tr>
                        <td class="mdl-data-table__cell--non-numeric table_headers">Total Stops</td>
                        <td class="mdl-data-table__cell--non-numeric table_rows">${totalStops}</td>
                    </tr>`;
    let detailedTableRef = document.getElementById("detailedTable");
    detailedTableRef.innerHTML = output;
}

/* This function displays the delete button when the current page is accessed from the scheduled trips page */
function displayDeleteButton(){
    let isFromScheduled = getDataLocalStorage(SCHEDULED_KEY);
    if (isFromScheduled){
        let deleteButtonRef = document.getElementById("deleteButton");
        deleteButtonRef.innerHTML = `   <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onclick="deleteTrip()">
                                            Delete Trip
                                        </button>`
    }
}

/* This function deletes the currently viewed trip when the delete button is clicked */
function deleteTrip()
{   
    if (confirm("Delete trip?")){
        let tripIndex = getDataLocalStorage(TRIP_INDEX_KEY); //Retrieved data
        currentUser.scheduledTrips.deleteTrip(tripIndex);
        updateLocalStorage(currentUser,USER_DATA_KEY); //Need check for the variables
        let userIndex = getDataLocalStorage(USER_INDEX_KEY);
        account.userList[userIndex] = currentUser;
        updateLocalStorage(account,USERLIST_DATA_KEY);
        window.location = "scheduled.html";
    }
}


//runs on page load
//accesses trip data depending on previous page
let scheduledOrHistory = getDataLocalStorage(SCHEDULED_KEY);
let trip = "";
if (scheduledOrHistory === true)
{
    trip = currentUser.scheduledTrips.trips[index];
}
else if (scheduledOrHistory === false)
{
    trip = currentUser.historyTrips.trips[index];
}

//declaring empty lists for tracking
let airportCordsList = [];
let routeIdList = [];//adding route id to global route list
let routeObjectList = [];

displayRouteDetail(trip);
map.on("load",getData);
displayDeleteButton();