"use strict";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupRegistration();

    }
);


/* =========================================================
   LOGIN FORM
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        handleLogin
    );

}


/* =========================================================
   LOGIN
   ========================================================= */

async function handleLogin(event) {

    event.preventDefault();


    const username =
        document.getElementById(
            "username"
        ).value.trim();


    const password =
        document.getElementById(
            "password"
        ).value;


    const selectedRole =
        document.getElementById(
            "role"
        ).value;


    if (!selectedRole) {

        showLoginMessage(
            "Please select a role.",
            "error"
        );

        return;

    }


    loginButton.disabled =
        true;

    loginButton.textContent =
        "Logging in...";


    try {

        const response =
            await fetch(
                "/api/users/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify({
                            username:
                            username,

                            password:
                            password,

                            role:
                            selectedRole
                        })
                }
            );


        const data =
            await readResponse(
                response
            );


        console.log(
            "Login response:",
            data
        );


        if (!response.ok) {

            const message =
                typeof data === "string"
                    ? data
                    : (
                        data?.message ||
                        data?.error ||
                        "Invalid username or password."
                    );


            showLoginMessage(
                message,
                "error"
            );

            return;

        }


        const backendRole =
            String(
                data?.role || ""
            ).toUpperCase();


        if (
            !backendRole
        ) {

            showLoginMessage(
                "Login response does not contain a valid role.",
                "error"
            );

            return;

        }


        if (
            selectedRole !==
            backendRole
        ) {

            showLoginMessage(
                "Selected role does not match your account role.",
                "error"
            );

            return;

        }


        /* =================================================
           SAVE SESSION INFORMATION
           ================================================= */

        if (
            data.userId !== null &&
            data.userId !== undefined
        ) {

            sessionStorage.setItem(
                "userId",
                String(
                    data.userId
                )
            );

        }


        if (
            data.username
        ) {

            sessionStorage.setItem(
                "username",
                data.username
            );

        }


        sessionStorage.setItem(
            "role",
            backendRole
        );


        /* =================================================
           ADMIN
           ================================================= */

        if (
            backendRole ===
            "ADMIN"
        ) {

            showLoginMessage(
                "Login successful. Opening Admin Dashboard...",
                "success"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "/admin-dashboard.html";

                },
                300
            );


            return;

        }


        /* =================================================
           PASSENGER
           ================================================= */

        if (
            backendRole ===
            "PASSENGER"
        ) {

            if (
                data.userId !== null &&
                data.userId !== undefined
            ) {

                sessionStorage.setItem(
                    "passengerId",
                    String(
                        data.userId
                    )
                );

            }


            sessionStorage.setItem(
                "username",
                data.username || username
            );


            showLoginMessage(
                "Login successful. Opening Passenger Dashboard...",
                "success"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "/passenger-dashboard.html";

                },
                300
            );


            return;

        }


        showLoginMessage(
            "Unknown user role.",
            "error"
        );

    }
    catch (error) {

        console.error(
            "Login error:",
            error
        );


        showLoginMessage(
            "Cannot connect to server.",
            "error"
        );

    }
    finally {

        loginButton.disabled =
            false;

        loginButton.textContent =
            "Login";

    }

}


/* =========================================================
   REGISTRATION SETUP
   ========================================================= */

function setupRegistration() {

    const showRegisterButton =
        document.getElementById(
            "showRegisterButton"
        );


    const backToLoginButton =
        document.getElementById(
            "backToLoginButton"
        );


    const registerRole =
        document.getElementById(
            "registerRole"
        );


    const registerForm =
        document.getElementById(
            "registerForm"
        );


    if (
        showRegisterButton
    ) {

        showRegisterButton.addEventListener(
            "click",
            showRegisterPanel
        );

    }


    if (
        backToLoginButton
    ) {

        backToLoginButton.addEventListener(
            "click",
            showLoginPanel
        );

    }


    if (
        registerRole
    ) {

        registerRole.addEventListener(
            "change",
            updateRegisterFields
        );

    }


    if (
        registerForm
    ) {

        registerForm.addEventListener(
            "submit",
            registerUser
        );

    }

}


/* =========================================================
   SHOW REGISTER PANEL
   ========================================================= */

function showRegisterPanel() {

    const loginPanel =
        document.getElementById(
            "loginPanel"
        );


    const registerPanel =
        document.getElementById(
            "registerPanel"
        );


    if (loginPanel) {

        loginPanel.style.display =
            "none";

    }


    if (registerPanel) {

        registerPanel.style.display =
            "block";

    }


    clearLoginMessage();

    clearRegisterMessage();

}


/* =========================================================
   SHOW LOGIN PANEL
   ========================================================= */

function showLoginPanel() {

    const loginPanel =
        document.getElementById(
            "loginPanel"
        );


    const registerPanel =
        document.getElementById(
            "registerPanel"
        );


    if (registerPanel) {

        registerPanel.style.display =
            "none";

    }


    if (loginPanel) {

        loginPanel.style.display =
            "block";

    }


    clearRegisterMessage();

    clearLoginMessage();

}


/* =========================================================
   UPDATE REGISTER FIELDS
   ========================================================= */

function updateRegisterFields() {

    const role =
        document.getElementById(
            "registerRole"
        ).value;


    const adminFields =
        document.getElementById(
            "adminRegisterFields"
        );


    const passengerFields =
        document.getElementById(
            "passengerRegisterFields"
        );


    const usernameInput =
        document.getElementById(
            "registerUsername"
        );


    const fullNameInput =
        document.getElementById(
            "registerFullName"
        );


    const emailInput =
        document.getElementById(
            "registerEmail"
        );


    const phoneInput =
        document.getElementById(
            "registerPhone"
        );


    if (
        role ===
        "ADMIN"
    ) {

        if (adminFields) {

            adminFields.style.display =
                "block";

        }


        if (passengerFields) {

            passengerFields.style.display =
                "none";

        }


        if (usernameInput) {

            usernameInput.required =
                true;

        }


        if (fullNameInput) {

            fullNameInput.required =
                false;

        }


        if (emailInput) {

            emailInput.required =
                false;

        }


        if (phoneInput) {

            phoneInput.required =
                false;

        }

    }
    else if (
        role ===
        "PASSENGER"
    ) {

        if (adminFields) {

            adminFields.style.display =
                "none";

        }


        if (passengerFields) {

            passengerFields.style.display =
                "block";

        }


        if (usernameInput) {

            usernameInput.required =
                false;

        }


        if (fullNameInput) {

            fullNameInput.required =
                true;

        }


        if (emailInput) {

            emailInput.required =
                true;

        }


        if (phoneInput) {

            phoneInput.required =
                true;

        }

    }
    else {

        if (adminFields) {

            adminFields.style.display =
                "none";

        }


        if (passengerFields) {

            passengerFields.style.display =
                "none";

        }

    }

}


/* =========================================================
   REGISTER USER
   ========================================================= */

async function registerUser(event) {

    event.preventDefault();


    const role =
        document.getElementById(
            "registerRole"
        ).value;


    const username =
        document.getElementById(
            "registerUsername"
        ).value.trim();


    const fullName =
        document.getElementById(
            "registerFullName"
        ).value.trim();


    const email =
        document.getElementById(
            "registerEmail"
        ).value.trim();


    const phone =
        document.getElementById(
            "registerPhone"
        ).value.trim();


    const address =
        document.getElementById(
            "registerAddress"
        ).value.trim();


    const password =
        document.getElementById(
            "registerPassword"
        ).value;


    const confirmPassword =
        document.getElementById(
            "registerConfirmPassword"
        ).value;


    const registerButton =
        document.getElementById(
            "registerButton"
        );


    /* =================================================
       VALIDATION
       ================================================= */

    if (!role) {

        showRegisterMessage(
            "Please select a registration role.",
            "error"
        );

        return;

    }


    if (
        role ===
        "ADMIN" &&
        !username
    ) {

        showRegisterMessage(
            "Please enter an admin username.",
            "error"
        );

        return;

    }


    if (
        role ===
        "PASSENGER"
    ) {

        if (!fullName) {

            showRegisterMessage(
                "Please enter your full name.",
                "error"
            );

            return;

        }


        if (!email) {

            showRegisterMessage(
                "Please enter your email.",
                "error"
            );

            return;

        }


        if (!phone) {

            showRegisterMessage(
                "Please enter your phone number.",
                "error"
            );

            return;

        }

    }


    if (
        password.length < 6
    ) {

        showRegisterMessage(
            "Password must contain at least 6 characters.",
            "error"
        );

        return;

    }


    if (
        password !==
        confirmPassword
    ) {

        showRegisterMessage(
            "Passwords do not match.",
            "error"
        );

        return;

    }


    const payload = {

        username:
            role === "PASSENGER"
                ? email
                : username,

        email:
            role === "PASSENGER"
                ? email
                : null,

        password:
        password,

        role:
        role,

        fullName:
            role === "PASSENGER"
                ? fullName
                : null,

        phone:
            role === "PASSENGER"
                ? phone
                : null,

        address:
            role === "PASSENGER"
                ? address
                : null

    };


    registerButton.disabled =
        true;

    registerButton.textContent =
        "Registering...";


    showRegisterMessage(
        "Creating your account...",
        "info"
    );


    try {

        const response =
            await fetch(
                "/api/users/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const data =
            await readResponse(
                response
            );


        console.log(
            "Registration response:",
            data
        );


        if (!response.ok) {

            const message =
                typeof data === "string"
                    ? data
                    : (
                        data?.message ||
                        data?.error ||
                        "Registration failed."
                    );


            throw new Error(
                message
            );

        }


        showRegisterMessage(
            "Registration successful. You can now login.",
            "success"
        );


        document
            .getElementById(
                "registerForm"
            )
            .reset();


        updateRegisterFields();


        setTimeout(
            function () {

                showLoginPanel();

            },
            1500
        );

    }
    catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showRegisterMessage(
            error.message ||
            "Unable to register.",
            "error"
        );

    }
    finally {

        registerButton.disabled =
            false;

        registerButton.textContent =
            "Register";

    }

}


/* =========================================================
   SHOW LOGIN MESSAGE
   ========================================================= */

function showLoginMessage(
    message,
    type
) {

    if (!loginMessage) {

        return;

    }


    loginMessage.textContent =
        message;


    loginMessage.className =
        type;

}


/* =========================================================
   SHOW REGISTER MESSAGE
   ========================================================= */

function showRegisterMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "registerMessage"
        );


    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.className =
        type;

}


/* =========================================================
   CLEAR LOGIN MESSAGE
   ========================================================= */

function clearLoginMessage() {

    if (!loginMessage) {

        return;

    }


    loginMessage.textContent =
        "";

    loginMessage.className =
        "";

}


/* =========================================================
   CLEAR REGISTER MESSAGE
   ========================================================= */

function clearRegisterMessage() {

    const element =
        document.getElementById(
            "registerMessage"
        );


    if (!element) {

        return;

    }


    element.textContent =
        "";

    element.className =
        "";

}


/* =========================================================
   READ RESPONSE
   ========================================================= */

async function readResponse(
    response
) {

    const contentType =
        response.headers.get(
            "content-type"
        );


    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {

        return await response.json();

    }


    return await response.text();

}