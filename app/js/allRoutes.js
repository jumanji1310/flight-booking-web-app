"use strict";
/*
Purpose: To allow user to search a country from which they can see all the domestic routes in that country on the map, as well as view route info
when clicked on the map.
Team: 036
Author: Jun Jie Ng
Last Modified: 29/10/20
*/


//creating map 
const ACCESS_TOKEN = 'pk.eyJ1IjoiYXJ2aW5ka2F1ciIsImEiOiJjamt0c20wcXIwOTE3M29tbXYyc2M2aXhsIn0.mOrPB0bbVVm9NitiWvz96w';
mapboxgl.accessToken = ACCESS_TOKEN;
let map = new  mapboxgl.Map({
	container: 'map',
	zoom: 2,
	style: 'mapbox://styles/mapbox/streets-v9'
});

/* This function centers the map on the user's input country and sends a webservice request to the Airports API with the data being 
 used in the callback function showAllAirports*/
function getData(){
    //extracting user selected country from html
    let countryRef = document.getElementById("countries");
    let country = countryRef.value;

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
        callback: "showAllAirports"
    }
    webServiceRequest(url,data);
}


/* This function displays all airports from a country and request webservice from AllRoutes API to initiate callback function
showAllRoutes.
Input: Airports data of selected country from Airports API*/
function showAllAirports(airports){
    //clears all existing airport markers
    if (airportMarkers!==null){
        for (let marker of airportMarkers){
            marker.remove();
        }
    }
    //clearing global airport markers and list 
    airportsList = [];
    airportMarkers = [];

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
    //getting all routes from country
    let countryRef = document.getElementById("countries");
    let country = countryRef.value;
    let url = `https://eng1003.monash/OpenFlights/allroutes/`;
    let data = {
        country: country,
        callback: "showAllRoutes"
    }
    webServiceRequest(url, data);
}



/* This function displays the domestic routes of the country
Input: Routes data of selected country from AllRoutes API*/
function showAllRoutes(routes) {
    //clearing existing layers
    for (let layer of routeIdList) {
        removeLayerWithId(layer);
    }
    //clear route id list and route object
    routeObjectList = [];
    routeIdList = [];

    //looking over each route from AllRoutes API
    for (let route of routes) {
        //creating object for current route
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
        //searches for airports of route in global airports list of country and adds coordinates to object.
        //Routes with international destination will have destinationAirport variable empty
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
        //adding route airport description to object
        let routeInfo = `${departureAirport} / ${destinationAirport}`;
        object.data.properties.description = routeInfo;


        if (destinationAirport.length !== 0) { //routes with international destinations will be filtered as destinationAirport variable will be empty
            //checking if route is unique (different airlines or same pair of airports)
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
    //adding popups to each route
    popupOnClick();
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




//runs when page loads
//populates list of countries using countries.js
let countriesList = document.getElementById("countriesList");
let countriesOutput = "";
for (let i = 0; i<countryData.length; i++){
    countriesOutput += `<option value="${countryData[i]}">`;
}
countriesList.innerHTML = countriesOutput;


let airportMarkers = []; //to hold list of airport markers
let airportsList = []; //to hold information of all airports from country

let routeObjectList = [];//holds the route layer source object for each route
let routeIdList = [];//holds the id of each route layer