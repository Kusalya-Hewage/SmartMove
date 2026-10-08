/* =========================================================
   SMARTMOVE - PASSENGER PROFILE
   ========================================================= */

"use strict";


let originalProfileData = null;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const authenticated =
            await checkPassenger();

        if (!authenticated) {

            return;

        }


        setupNavigation();

        setupForm();

        await loadProfile();

    }
);


/* =========================================================
   CHECK PASSENGER
   ========================================================= */

async function checkPassenger() {

    try {

        const response =
            await fetch(
                "/api/users/current-user",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            window.location.href =
                "/index.html";

            return false;

        }


        const user =
            await response.json();


        if (
            !user ||
            !user.role ||
            user.role.toUpperCase() !==
            "PASSENGER"
        ) {

            window.location.href =
                "/index.html";

            return false;

        }


        if (user.userId) {

            sessionStorage.setItem(
                "userId",
                String(user.userId)
            );

        }


        if (user.passengerId) {

            sessionStorage.setItem(
                "passengerId",
                String(user.passengerId)
            );

        }


        if (user.username) {

            sessionStorage.setItem(
                "username",
                user.username
            );

        }


        return true;

    }
    catch (error) {

        console.error(
            "Passenger check error:",
            error
        );


        window.location.href =
            "/index.html";

        return false;

    }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const backButton =
        document.getElementById(
            "backDashboardButton"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/passenger-dashboard.html";

            }
        );

    }

}


/* =========================================================
   FORM
   ========================================================= */

function setupForm() {

    const form =
        document.getElementById(
            "profileForm"
        );


    const cancelButton =
        document.getElementById(
            "cancelProfileButton"
        );


    if (form) {

        form.addEventListener(
            "submit",
            saveProfile
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            restoreOriginalData
        );

    }

}


/* =========================================================
   LOAD PROFILE
   ========================================================= */

async function loadProfile() {

    try {

        let passengerId =
            sessionStorage.getItem(
                "passengerId"
            );


        if (!passengerId) {

            passengerId =
                sessionStorage.getItem(
                    "userId"
                );

        }


        if (!passengerId) {

            throw new Error(
                "Passenger ID not found."
            );

        }


        const response =
            await fetch(
                "/api/passengers/" +
                encodeURIComponent(
                    passengerId
                ),
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load profile."
            );

        }


        const passenger =
            await response.json();


        originalProfileData =
            JSON.parse(
                JSON.stringify(
                    passenger
                )
            );


        fillProfile(
            passenger
        );

    }
    catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to load profile.",
            "error"
        );

    }

}


/* =========================================================
   FILL PROFILE
   ========================================================= */

function fillProfile(
    passenger
) {

    const passengerId =
        passenger.passengerId ??
        passenger.id ??
        "";


    const fullName =
        passenger.fullName ??
        (
            `${passenger.firstName ?? ""} ${passenger.lastName ?? ""}`
        ).trim();


    const email =
        passenger.email ??
        "";


    const phone =
        passenger.phone ??
        passenger.phoneNumber ??
        "";


    const address =
        passenger.address ??
        "";


    const status =
        passenger.status ??
        "ACTIVE";


    setValue(
        "profilePassengerId",
        passengerId
    );


    setValue(
        "profileFullName",
        fullName
    );


    setValue(
        "profileEmail",
        email
    );


    setValue(
        "profilePhone",
        phone
    );


    setValue(
        "profileAddress",
        address
    );


    setValue(
        "profileStatus",
        status
    );


    setValue(
        "profileUsername",
        sessionStorage.getItem(
            "username"
        ) ||
        email
    );


    setText(
        "profileDisplayName",
        fullName ||
        "Passenger"
    );


    setText(
        "accountPassengerId",
        passengerId ||
        "-"
    );


    setText(
        "accountStatus",
        status ||
        "-"
    );


    const avatar =
        document.querySelector(
            ".profile-avatar-large"
        );


    if (avatar) {

        avatar.textContent =
            getInitial(
                fullName
            );

    }

}


/* =========================================================
   SAVE PROFILE
   ========================================================= */

async function saveProfile(
    event
) {

    event.preventDefault();


    const passengerId =
        document.getElementById(
            "profilePassengerId"
        ).value;


    const fullName =
        document.getElementById(
            "profileFullName"
        ).value.trim();


    const email =
        document.getElementById(
            "profileEmail"
        ).value.trim();


    const phone =
        document.getElementById(
            "profilePhone"
        ).value.trim();


    const address =
        document.getElementById(
            "profileAddress"
        ).value.trim();


    if (!passengerId) {

        showMessage(
            "Passenger ID not found.",
            "error"
        );

        return;

    }


    if (!fullName) {

        showMessage(
            "Please enter your full name.",
            "error"
        );

        return;

    }


    if (!email) {

        showMessage(
            "Please enter your email.",
            "error"
        );

        return;

    }


    if (!phone) {

        showMessage(
            "Please enter your phone number.",
            "error"
        );

        return;

    }


    const payload = {

        fullName:
        fullName,

        email:
        email,

        phone:
        phone,

        address:
        address

    };


    const saveButton =
        document.getElementById(
            "saveProfileButton"
        );


    if (saveButton) {

        saveButton.disabled = true;

        saveButton.textContent =
            "Saving...";

    }


    showMessage(
        "Updating profile...",
        "info"
    );


    try {

        const response =
            await fetch(
                "/api/passengers/" +
                encodeURIComponent(
                    passengerId
                ),
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const result =
            await readResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                typeof result === "string"
                    ? result
                    : result?.message ||
                    result?.error ||
                    "Unable to update profile."
            );

        }


        originalProfileData =
            typeof result === "object" &&
            result !== null
                ? result
                : {
                    fullName:
                    fullName,

                    email:
                    email,

                    phone:
                    phone,

                    address:
                    address
                };


        fillProfile(
            originalProfileData
        );


        showMessage(
            "Profile updated successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Profile update error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to update profile.",
            "error"
        );

    }
    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Save Changes";

        }

    }

}


/* =========================================================
   RESTORE
   ========================================================= */

function restoreOriginalData() {

    if (!originalProfileData) {

        return;

    }


    fillProfile(
        originalProfileData
    );


    showMessage(
        "Changes cancelled.",
        "info"
    );

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "profileMessage"
        );


    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.className =
        "profile-message " +
        type;

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


/* =========================================================
   SET VALUE
   ========================================================= */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value ?? "";

    }

}


/* =========================================================
   SET TEXT
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ?? "";

    }

}


/* =========================================================
   INITIAL
   ========================================================= */

function getInitial(
    name
) {

    if (!name) {

        return "P";

    }


    return String(name)
        .trim()
        .charAt(0)
        .toUpperCase();

}