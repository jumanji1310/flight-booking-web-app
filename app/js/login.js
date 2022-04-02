"use strict";
/*
Purpose: To allow user to login and access their previous trips and scheduled trips
Team: 036
Author: Grant Lu
Last Modified: 29/10/20
*/

/* This function accesses the information inputted by user and checks it against existing users before logging in */
function logIn()
{   //Get inputs from the HTML
    let userRef = document.getElementById("userNameInput");
    let passRef = document.getElementById("passwordInput");
    //Assign Variables
    let failed = true;
    account;
    let username = userRef.value;
    let password = passRef.value;
    for (let user of account.userList)
    {
        let index = account.userList.indexOf(user);
        //NEED TO FIX THE ACCESS TO THE USER INFO FOR PASSWORD CHECK
        if (user.username === username || user.email === username)
        {
            let correctPassword = user.password;
            if (password === correctPassword) //successful login
            {   
                failed = false;
                loginStatus = true;
                //save the unsaved trips when login page accessed as guest
                let fromGuest = getDataLocalStorage(SAVE_KEY);
                if (fromGuest){
                    user.addScheduled(unsavedTrip);
                    localStorage.removeItem(UNSAVEDTRIP_DATA_KEY);
                }
                //Login (Assign index key to extract user account information for other pages)
                currentUser = user;
                updateLocalStorage(index,USER_INDEX_KEY);
                updateLocalStorage(loginStatus,STATUS_KEY);
                updateLocalStorage(account,USERLIST_DATA_KEY);
                updateLocalStorage(currentUser,USER_DATA_KEY);
                checkTripDates();
                window.location = "index.html";
                return;
            }
            else
            {
                failed = true;
            }
        }
        else
        {
            failed = true;
        }
    }

    if (failed)
    {
        alert("The email address or username, and/or password you've entered are incorrect");
    }
}

