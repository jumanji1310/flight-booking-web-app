"use strict";
/*
Purpose: To allow user to create an account to store trip information
Team: 036
Author: Grant Lu
Last Modified: 29/10/20
*/



/* This function allows user to create an account for the web app with corresponding email, username and password */
function signUp() {
    //Get inputs from the HTML
    let usernameRef = document.getElementById("newUserNameInput");
    let emailRef = document.getElementById("newEmailInput");
    let newPasswordRef = document.getElementById("newPasswordInput");
    let confirmPasswordRef = document.getElementById("confirmPasswordInput");
    //Assign Variables
    let newPassword = newPasswordRef.value;
    let confirmPassword = confirmPasswordRef.value;
    let newEmail = emailRef.value;
    let newUsername = usernameRef.value;
    //Check user filled in all required feilds
    if (account != null || account != "undefined")
    {
        if (newPassword === "" || confirmPasswordRef === "" || newEmail === ""|| newUsername === "")
        {   
            alert("Please enter all required information");
            return;
        }
            //Check Email in correct format
        if (newEmail.search("@") === -1)
        {
            alert("Please enter a valid email address");
            return;
        }
    
        //Check Existence
        for (let i = 0; i < account.userList.length; i++) 
        {
            //Check if username already exist in class
            if (newUsername === account.userList[i].username) 
            {
                alert("Please choose a different username.\nThe username you entered had been used");
                return;
            }
            //Check if email already exist in class
            else if (newEmail === account.userList[i].email) 
            {
                alert("Please choose a different email.\nThe email you entered had been used");
                return;
            }
        }
    
    }
    
    //Check password (more than 8 characters + confirm password)
    //password needs to be more than 8 characters
    if (newPassword != confirmPassword) {
        //Alert for difference
        alert("Confirm password is different with password entered")
        return;
    }
    else if (newPassword.length < 8) {
        //Alert for not satisfy password criteria
        alert("Password needs to be more than 8 characters")
        return;
    }
    else {
        //Add a new user account into UserList (Global Variale: account)
        account.addUser(newEmail, newUsername, newPassword);
        updateLocalStorage(account,USERLIST_DATA_KEY);
        alert("The account has been successfully created");
        window.location = "login.html";
    }
}


