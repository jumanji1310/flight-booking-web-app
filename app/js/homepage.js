"use strict";
/* 
Purpose: To allow users to plan the routes for a trip by selecting the starting country and airport. Users add routes by
clicking on specific routes shown on the map.
Team: 036
Author: Jun Jie Ng
Last Modified: 29/10/20
*/

//creating map
mapboxgl.accessToken = "pk.eyJ1IjoianVtYW5qaTEzMTAiLCJhIjoiY2tmN3g2bmUzMDA3cDJyb2ZkZmxjZDg3MyJ9.8n1TbI-Lz4v_JIJPCmXrRQ";
let map = new  mapboxgl.Map({
	container: 'map',
	zoom: 2,
	style: 'mapbox://styles/mapbox/streets-v9'
});

/* This function extracts the user's input country and sends a webservice request to Airports API with data used in
callback function showAirports*/
function getData(){
    //requesting Airports API with country
    let country = countryInputRef.value;

    //fetch API to center map on selected country
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${country}.json?access_token=pk.eyJ1IjoianVtYW5qaTEzMTAiLCJhIjoiY2tmN3g2bmUzMDA3cDJyb2ZkZmxjZDg3MyJ9.8n1TbI-Lz4v_JIJPCmXrRQ&types=country`)
        .then(response => response.json())
        .then(data => {
            let centerCoords = data.features[0].center;
            map.setZoom(4).panTo(centerCoords);
        });

    //requesting Airports API with country
    let url = "https://eng1003.monash/OpenFlights/airports/";
    let data = {
        country: country,
        callback: "showAirports"
    }
    webServiceRequest(url,data);
}





/* This function displays all airports from a country and request webservice from AllRoutes API to initiate callback function
showAllRoutes.
Input: Airports data of selected country from Airports API*/
function showAirports(airports){
    //displaying airports on dropdown list
    let output = "";
    for (let airport of airports){
        output += `<option value="${airport.airportId}">${airport.name}</option>`
    }
    let airportOptionRef = document.getElementById("airportList");
    airportOptionRef.innerHTML = output;

    //clears all existing airport markers
    if (airportMarkers!==null){
        for (let marker of airportMarkers){
            marker.remove();
        }
    }

    //clearing layers on map
    for (let layer of routeIdList) {
        removeLayerWithId(layer);
    }

    //clearing global airport markers and list 
    airportsList = [];
    airportMarkers = [];

    //displaying airports on map
    for (let airport of airports){
        //adding airport name, coords and id to airports list
        airportsList.push({name: airport.name, id: airport.airportId, coordinates:[airport.longitude,airport.latitude]});
        //displaying airport on map with popup and marker
        let location = airportsList[airports.indexOf(airport)];
        let marker = new mapboxgl.Marker({ "color": "#FF8C00" });
        marker.setLngLat(location.coordinates);

        let popup = new mapboxgl.Popup({ offset: 45, closeButton:false, closeOnClick:false});
        popup.setText(location.name);

        marker.setPopup(popup)

        // Display the marker.
        marker.addTo(map);
        airportMarkers.push(marker);
        // Display the popup.
        popup.addTo(map);
    }
}

//This function runs when the submit button is clicked and sends the selected airport to request data from Routes API
function submitAirport(){
    if (countryInputRef.value.length === 0){
        alert("Please choose a country");
    }
    else if (dateRef.value.length === 0){
        alert("Please choose a date");
    }
    else{
        let airportRef = document.getElementById("airportList");
        let selectedAirportId = airportRef.value;
        let url = "https://eng1003.monash/OpenFlights/routes/";
        let data = {
            sourceAirport: selectedAirportId,
            callback: "displayRoutes"
        }
        webServiceRequest(url,data);
    }
}


/* This function displays the routes from an airport on the map after filtering international routes, duplicate routes and planned routes
Input: Routes data of selected airport from Routes API*/
function displayRoutes(routes) {
    //clearing layers on map
    for (let layer of routeIdList) {
        removeLayerWithId(layer);
    }
    
    //clear route id list and route object
    routeObjectList = [];
    routeIdList = [];

    //notify user if there are no routes from this airport
    if (routes.length === 0) {
        alert("There are no routes from this airport.");
    }
    else {
        //looking over each route from AllRoutes API
        for (let route of routes) {
             let object = {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: { description: ""},
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
            for (let airport of airportsList) {
                if (route.sourceAirportId == airport.id) {
                    object.data.geometry.coordinates.push(airport.coordinates);
                    departureAirport = airport.name;
                }
                else if (route.destinationAirportId == airport.id) {
                    object.data.geometry.coordinates.push(airport.coordinates);
                    destinationAirport = airport.name;
                }
            }
            //extracting number of stops for route
            let stopNum = route.stops;
            //adding route airport description to object
            let routeInfo = `${departureAirport} / ${destinationAirport} / ${stopNum}`;
            object.data.properties.description = routeInfo;

            
            if (destinationAirport.length !== 0) { //routes with international destinations will be filtered as destinationAirport variable will be empty
                //checking if route is unique (different airlines, same pair of airports or already planned route)
                let unique = true;
                for (let routeObject of routeObjectList) {
                    let airportPair = routeObject.data.properties.description.split(" / ");
                    let existingDestination = airportPair[1];
                    let existingDeparture = airportPair[0];
                    if (departureAirport == existingDeparture && destinationAirport == existingDestination) { //checks for repeating routes from different airlines
                        unique = false;
                    }
                    else if (departureAirport == existingDestination && destinationAirport == existingDeparture) { //checks for routes with swapped departure and destination airports
                        unique = false;
                    }
                }
                 //checks for already planned routes
                for (let plannedRoute of selectedRoutes){
                    let plannedDeparture = plannedRoute[0];
                    let plannedDestination  = plannedRoute[1];
                    if (departureAirport == plannedDeparture && destinationAirport == plannedDestination){
                        unique = false;
                        break
                    }
                    else if(departureAirport == plannedDestination && destinationAirport == plannedDeparture){
                        unique = false;
                        break
                    }
                }
                if (unique) { //only adding unique routes
                    let routeId = `routes${routes.indexOf(route)}`;
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
            }
        }
    }
    //adds route on click
    addRouteOnClick();
}


/*This function adds a click event to each route displayed on map. When a route is clicked,
the line turns red and is added to selected routes and global unsavedTrip variable. A webservice request
from the latest destination is then sent to Routes API to repeat the displayRoutes process */
function addRouteOnClick(){
    for (let routeId of routeIdList) {
        map.on('click', routeId, function (e) {
            //clearing existing layers
            for (let layer of routeIdList) {
                removeLayerWithId(layer);
            }
            //turning selected route red
            selectedRouteIndex ++; //incrementing index
            let index = routeIdList.indexOf(routeId);
            let routeIdString = "selectedRoute"+selectedRouteIndex;
            selectedRouteIdList.push(routeIdString);
            map.addLayer({
                id: routeIdString,
                type: "line",
                source: routeObjectList[index],
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "red", "line-width": 6 }
            });
            

            //extracting selected route info
            let selectedDeparture = routeObjectList[index].data.properties.description.split(" / ")[0];
            let selectedDestination = routeObjectList[index].data.properties.description.split(" / ")[1];
            let selectedRouteStops = routeObjectList[index].data.properties.description.split(" / ")[2]
            selectedRoutes.push([selectedDeparture,selectedDestination,selectedRouteStops]); //adding to selected routes
            
            //getting destination and departure airport ids
            let destinationId = "";
            let departureId = "";
            for (let airport of airportsList){
                if (airport.name == selectedDestination){
                    destinationId = airport.id;
                }
                else if(airport.name == selectedDeparture){
                    departureId = airport.id;
                }
            }
            let url = "https://eng1003.monash/OpenFlights/routes/";
            let data = {
                sourceAirport: destinationId,
                callback: "displayRoutes"
            }
            //requesting routes from new airport and displaying results again
            unsavedTrip.addRoute(selectedDeparture,departureId,selectedDestination,destinationId,selectedRouteStops);
            webServiceRequest(url,data);
        });
    }  
}

/* This function removes the newest route from the map and the global unsavedTrip variable.
It then re-displays the routes of the last airport using Routes API */
function undoRoute(){
    if (selectedRouteIndex == -1){
        alert("No route chosen");
    }
    else{ 
        //obtaining previous airport departure id
        let previousDepartureAirport = selectedRoutes[selectedRouteIndex][0];
        let previousDepartureAirportId = 0;
        for (let airport of airportsList){
            if(previousDepartureAirport == airport.name){
                previousDepartureAirportId = airport.id;
            }
        }
        //removing newest route layer
        selectedRouteIndex --;
        let newestRouteId = selectedRouteIdList[selectedRouteIdList.length-1];
        removeLayerWithId(newestRouteId);
        selectedRouteIdList.pop();
        //removing newest route from global unsavedTrip routes list
        let newestRoute = selectedRoutes.pop();
        unsavedTrip.deleteRoute(newestRoute[0],newestRoute[1]);
        //re-requesting from Routes API
        let url = "https://eng1003.monash/OpenFlights/routes/";
        let data = {
            sourceAirport: previousDepartureAirportId,
            callback: "displayRoutes"
        }
        webServiceRequest(url,data);
    }
}

/* This function runs when the "Confirm" button is clicked and saves unsavedTrip to localStorage
to be displayed in Summary page after a redirect */
function confirmPlan(){
    if (selectedRoutes.length == 0){
        alert("Please select a route");
    }
    else{
        //adding date and country to unsavedTrip
        unsavedTrip.tripDate = dateRef.value;
        unsavedTrip.tripCountry = countryInputRef.value;
        //confirmation of trip and uploading to local storage
        if(confirm("Confirm current trip?")){
            updateLocalStorage(unsavedTrip,UNSAVEDTRIP_DATA_KEY);
            window.location = "summary.html"; //redirect to summary page
        }
    }
}

//runs when page loads
//populates list of countries using countries.js
let countriesList = document.getElementById("countriesList");
let countriesOutput = "";
for (let i = 0; i<countryData.length; i++){
    countriesOutput += `<option value="${countryData[i]}">`;
}
countriesList.innerHTML = countriesOutput;


//user input events and references 
let countryInputRef = document.getElementById("countries"); // getting user inputted country
let dateRef = document.getElementById("tripDate"); //getting user inputted date
countryInputRef.addEventListener('input',getData); //setting event listener when input country detected

//all shared variables for tracking values
let airportMarkers = []; //to hold list of airport markers
let airportsList = []; //to hold information of all airports from country

let routeObjectList = [];//holds the route layer source object for each route
let routeIdList = [];//holds the id of each route layer

let selectedRoutes = []; //all routes selected by user
let selectedRouteIndex = -1; //used to update index for layer creation
let selectedRouteIdList = []; //keep track of all selected route index