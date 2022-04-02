"use strict";
/*
Purpose: Contains classes, functions used across all js and html pages n
Team: 036
Author: Joe Dal Basco, Jun Jie Ng, Grant Lu, Logithan Chandrakumar
Last Modified: 29/10/20
*/

//KEYS
const USER_INDEX_KEY = "currentUserIndex";
const USERLIST_DATA_KEY = "userlistLocalData";
const USER_DATA_KEY = "userLocalData";
const UNSAVEDTRIP_DATA_KEY = "unsavedTripLocalData";
const TRIP_INDEX_KEY = "selectedTripIndex";
const STATUS_KEY = "loginStatus";
const SCHEDULED_KEY = "fromScheduled";
const SAVE_KEY = "guestUser";
//classes
//route class
class Route {
    //constructor
    constructor(departureAirport,departureId,destinationAirport,destinationId,stops){
        this._routeDeparture = departureAirport;
        this._routeDepartureId = departureId;
        this._routeDestination = destinationAirport;
        this._routeDestinationId = destinationId;
        this._stops = stops;
    }
    //assessor
    get routeDeparture(){
        return this._routeDeparture;
    }
    get routeDestination(){
        return this._routeDestination;
    }
    get routeDepartureId(){
        return this._routeDepartureId;
    }
    get routeDestinationId(){
        return this._routeDestinationId;
    }
    get stops(){
        return this._stops;
    }
    //mutators
    set routeDeparture(departureAirport){
        this._routeDeparture = departureAirport;
    }
    set routeDestination(destinationAirport){
        this._routeDestination = destinationAirport;
    }
    set routeDepartureId(id){
        this._routeDepartureId = id;
    }
    set routeDestinationId(id){
        this._routeDestinationId = id;
    }
    //methods
    //fromData function takes the data from the local storage as the parameter and restore back to object
    fromData(data){
        this._routeDeparture = data._routeDeparture;
        this._routeDepartureId = data._routeDepartureId;
        this._routeDestination = data._routeDestination;
        this._routeDestinationId = data._routeDestinationId;
        this._stops = data._stops;
    }
}

//trip class
class Trip {
    //constructor
    constructor(date, name, country, airportName){
        this._tripDate = date;
        this._tripName = name;
        this._tripCountry = country;
        this._tripAirport = airportName;
        this._tripRoutes = [];
    }
    //assessors
    get tripDate(){
        return this._tripDate;
    }
    get tripName(){
        return this._tripName;
    }
    get tripCountry(){
        return this._tripCountry;
    }
    get tripAirport(){
        return this._tripAirport;
    }
    get tripRoutes(){
        return this._tripRoutes;
    }
    //mutators
    set tripDate(date){
        this._tripDate = date;
    }
    set tripName(name){
        this._tripName = name;
    }
    set tripCountry(country){
        this._tripCountry = country;
    }
    set tripRoutes(trips){
        this._tripRoutes = trips;
    }
    //methods
    //addRoute function takes 5 parameters, include: departureAirport, departureId, destinationAirport, destinationId and stop
    //This function creates a new route
    addRoute(departureAirport,departureId,destinationAirport,destinationId,stops){
        let temp_route = new Route(departureAirport,departureId,destinationAirport,destinationId,stops);
        this._tripRoutes.push(temp_route);
    }
    //deleteRoute takes 2 parameters, the departureAirport and destinationAirport.
    //This function delete the corresponding route.
    deleteRoute(departureAirport,destinationAirport){
        for (let i in this._tripRoutes){
            if (this._tripRoutes[i].routeDeparture == departureAirport && this._tripRoutes[i].routeDestination == destinationAirport){
                this._tripRoutes.splice(i,1);
            }
        }
    }
    //fromData function takes the data from the local storage as the parameter and restore back to object
    fromData(data){
        //restoring tripRoutes
        let dataStore = data._tripRoutes;
        this._tripRoutes = [];
        for (let i = 0; i < dataStore.length; i++) {
            let route = new Route();
            route.fromData(dataStore[i]);
            this._tripRoutes.push(route);
        }

        //restore rest of the class
        this._tripDate = data._tripDate;
        this._tripName = data._tripName;
        this._tripCountry = data._tripCountry;
        this._tripAirport = data._tripAirport;
    }
}

//trip list class
class TripList{
    //constructor
    constructor(){
        this._trips = [];
    }
    //assessors
    get trips(){
        return this._trips;
    }
    //methods
    //addTrip function takes no parameter, it is used to save the unsavedTrip (this unsavedTrip variable is when user is creating a new trip)
    addTrip(){
        this._trips.unshift(unsavedTrip); //unsavedTrip is current unsaved trip
    }
    //deleteTrip function takes index as parameter, this function is called to remove the trip
    deleteTrip(index){
        this._trips.splice(index,1); //removes trip at matching tripName
    }
    //fromData function takes the data from the local storage as the parameter and restore back to object
    fromData(data){
        //restoring trips
        let dataStore = data._trips;
        this._trips = [];
        for (let i = 0; i < dataStore.length; i++){
            let trip = new Trip();
            trip.fromData(dataStore[i]);
            this._trips.push(trip);
        }
    }
}

//user class
class User{
    //constructor
    constructor(email,username,password){
        this._email = email;
        this._username = username;
        this._password = password;
        this._historyTrips = new TripList();
        this._scheduledTrips = new TripList();
    }
    //assessors
    get email(){
        return this._email;
    }
    get username(){
        return this._username;
    }
    get password(){
        return this._password;
    }
    get historyTrips(){
        return this._historyTrips;
    }
    get scheduledTrips(){
        return this._scheduledTrips;
    }
    //methods
    //NEED REVISION
    //addScheduled function takes one parameter trip, this add the trip into the scheduledTrips array
    addScheduled(trip){
        this._scheduledTrips.addTrip(trip);
    }
    //addHistory function takes one parameter trip, this add the trip into the historyTrips array
    addHistory(trip){
        this._historyTrips.addTrip(trip);
    }
    //fromData function takes the data from the local storage as the parameter and restore back to object
    fromData(data){
        let historyData = data._historyTrips;
        this._historyTrips.fromData(historyData);
        let scheduledData = data._scheduledTrips;
        this._scheduledTrips.fromData(scheduledData);
        //restoring rest of class
        this._email = data._email;
        this._username = data._username;
        this._password = data._password;
    }
}

//userList class
class UserList{
    //constructor
    constructor(){
        this._userList = [];
    }
    //assessors
    get userList(){
        return this._userList;
    }
    //methods
    //addUser function takes 3 parameters, include email, username and password. This function generates a new object to create a new user account
    addUser(email,username,password){
        let temp_user = new User(email,username,password);
        this._userList.push(temp_user);       
    }
    //fromData function takes the data from the local storage as the parameter and restore back to object
    fromData(data){
        let dataStore = data._userList;
        this._userList = [];
        for (let i = 0; i < dataStore.length; i++){
            let user = new User();
            user.fromData(dataStore[i]);
            this._userList.push(user);
        }
    }
}

//Used to check if data exists in local storage
//returns: A boolean of whether data exists
function checkIfDataExistsLocalStorage(key){
    let localData = localStorage.getItem(key);
    if (typeof(localData) !== "undefined" && localData !== null && localData !==""){ //checks if data is undefined, null (doesn't exist) or empty
        return true;
    }
    else{
        return false;
    }
}

//sends data to local storage
//Input: data to be stored in local storage and key for data
//paramater data: data to be stored in local storage
function updateLocalStorage(data,key){
    let dataString = JSON.stringify(data); //converting to string
    localStorage.setItem(key,dataString); //sent to local storage
}

//retrieves data from local storage
//Input: key of data
//returns: Parsed data from local storage
function getDataLocalStorage(key){
    let dataRetrieve = localStorage.getItem(key); //getting data from local storage
    let localData= JSON.parse(dataRetrieve); //convert back to object
    return localData;
}

// This function checks whether there is a map layer with id matching
// idToRemove.  If there is, it is removed.
function removeLayerWithId(idToRemove)
{
    let hasPoly = map.getLayer(idToRemove)
    if (hasPoly !== undefined)
    {
        map.removeLayer(idToRemove)
        map.removeSource(idToRemove)
    }
}

//This function is called on the scheduled and trip history page. It sets the trip index key to be displayed on the detailed trips page 
function viewTrip(index,fromScheduled)
{
    updateLocalStorage(index,TRIP_INDEX_KEY);
    updateLocalStorage(fromScheduled,SCHEDULED_KEY);
    window.location = "detailed.HTML";
}


//This functions sorts the scheduled list and history list by date order
function sortByDate(tripList){
    tripList.sort(function(a,b){
        return new Date(b.tripDate) - new Date(a.tripDate);
    });
    updateLocalStorage(currentUser,USER_DATA_KEY); //updates current user to have sorted lists
    return tripList;
}

//This function dynamically change the navigation bar in the page depending on the login status of the user
//The function takes the global variable loginStatus to determine the appropriate html block to be used
function navigationBarDisplay()
{   
    let outputRef = document.getElementById("navigationBarDisplay")
    let htmlBlock = "";;
    htmlBlock += `<div class="mdl-layout__header-row">`+`<a class="mdl-navigation__link" href="index.html"><img src='img/bigLogo.png' width='100' height='50'></a>`;
    htmlBlock += `<div class="mdl-layout-spacer"></div>`+`<nav class="mdl-navigation">`;
    if (loginStatus)
    {
        //THE CSS WILL REQUIRED THIS LINE TO FIX
        htmlBlock += `<a class="mdl-navigation__link" href="allRoutes.html">All Routes</a>`;
        htmlBlock += `<a class="mdl-navigation__link" href="scheduled.html">Scheduled Trips</a>`;
        htmlBlock += `<a class="mdl-navigation__link" href="history.html">History of Trips</a>`;
        htmlBlock += `<a class="mdl-navigation__link" onclick="logout()">Logout</a>`; //removed href="login.html" and replaced with onclick function - Joe
    }
    else
    {
        htmlBlock += `<a class="mdl-navigation__link" href="login.html">Login</a>`;
    }
    htmlBlock += `</nav>`+`</div>`;

    outputRef.innerHTML = htmlBlock;
}

function logout() //added logout function - Joe
{
    //account = getDataLocalStorage(USERLIST_DATA_KEY);
    //let index = getDataLocalStorage(USER_INDEX_KEY);
    account._userList[index] = currentUser;
    updateLocalStorage(account,USERLIST_DATA_KEY);
    loginStatus = false;
    updateLocalStorage(loginStatus,STATUS_KEY);
    alert("You have successfully logout");
    window.location = "index.html";
}

//this function checks the date of scheduled trips for each user and moves to history if past current date
function checkTripDates(){
    let userList = account.userList;
    //looping through each user
    for (let user of userList){
        if (user.scheduledTrips.trips.length !==0){
            //looping over each scheduled trip
            for (let trip of user.scheduledTrips.trips){
                let currentDate = new Date()
                let scheduledTripDate = new Date(trip.tripDate);
                if (currentDate > scheduledTripDate){ 
                    let tripIndex = user.scheduledTrips.trips.indexOf(trip);
                    let removedTrip = user.scheduledTrips.trips.splice(tripIndex,1)[0];
                    user.historyTrips.trips.push(removedTrip);
                }
            }
        }
    }
    updateLocalStorage(account,USERLIST_DATA_KEY);
    let localData = getDataLocalStorage(USERLIST_DATA_KEY);
    let index =getDataLocalStorage(USER_INDEX_KEY);
    updateLocalStorage(localData._userList[index],USER_DATA_KEY);
}
//global variables
let account = new UserList();
let currentUser = new User();
let tripList = new TripList();
let unsavedTrip  = new Trip();
let loginStatus = false;
let index = 0;
//Onload functions

//check if local storage is available
if (typeof(Storage) !== "undefined"){
    if (checkIfDataExistsLocalStorage(USERLIST_DATA_KEY))
    {
        //restoring local date to global unsavedTrip variable
        let localData = getDataLocalStorage(USERLIST_DATA_KEY);
        account.fromData(localData);
    }
    //restoring unsavedTrip data from homepage
    if (checkIfDataExistsLocalStorage(UNSAVEDTRIP_DATA_KEY)){
        //restoring local date to global unsavedTrip variable
        let localData = getDataLocalStorage(UNSAVEDTRIP_DATA_KEY);
        unsavedTrip.fromData(localData);
    }
    //restoring currentUser data
    if (checkIfDataExistsLocalStorage(USER_DATA_KEY)){
        let currentUserData = getDataLocalStorage(USER_DATA_KEY);
        currentUser.fromData(currentUserData);
    }
    if (checkIfDataExistsLocalStorage(STATUS_KEY)){
        loginStatus = getDataLocalStorage(STATUS_KEY);
    }
    if (checkIfDataExistsLocalStorage(TRIP_INDEX_KEY)){
        index = getDataLocalStorage(TRIP_INDEX_KEY);
    }
}
else{
    alert("localStorage is not supported by current browser");
}

