/* =========================================================
   SMARTMOVE - PASSENGER PAYMENT
   ========================================================= */

let currentUser = null;
let currentTicket = null;


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    setupNavigation();

    await loadCurrentPassenger();

    await loadTicketDetails();

    setupPaymentForm();

});


/* =========================================================
   LOAD CURRENT USER
   ========================================================= */

async function loadCurrentPassenger() {

    try {

        const response = await fetch("/api/users/current-user", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Unable to get current user.");
        }

        const user = await response.json();

        currentUser = user;

        console.log("Current user:", user);


        /* ---------------------------------------------
           CHECK PASSENGER ROLE
           --------------------------------------------- */

        const role =
            user.role ||
            user.userRole ||
            user.accountType ||
            "";

        if (String(role).toUpperCase() !== "PASSENGER") {

            alert("Please login as a passenger.");

            window.location.href = "/index.html";

            return;
        }


        /* ---------------------------------------------
           PASSENGER NAME
           --------------------------------------------- */

        const passengerNameElement =
            document.getElementById("passengerName");

        if (passengerNameElement) {

            passengerNameElement.textContent =
                user.passengerName ||
                user.fullName ||
                user.username ||
                "Passenger";
        }

    }
    catch (error) {

        console.error(
            "Current passenger error:",
            error
        );

        alert("Please login again.");

        window.location.href = "/index.html";
    }
}


/* =========================================================
   LOAD TICKET
   ========================================================= */

async function loadTicketDetails() {

    try {

        /* ---------------------------------------------
           GET TICKET ID FROM SESSION
           --------------------------------------------- */

        const ticketId =
            sessionStorage.getItem("selectedTicketId");


        console.log(
            "Selected Ticket ID:",
            ticketId
        );


        if (!ticketId) {

            showPaymentError(
                "No selected ticket was found. Please complete a booking first."
            );

            return;
        }


        /* ---------------------------------------------
           GET TICKET FROM BACKEND
           --------------------------------------------- */

        const response = await fetch(
            "/api/tickets/" + encodeURIComponent(ticketId),
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Ticket API error:",
                errorText
            );

            throw new Error(
                "Unable to load ticket details."
            );
        }


        const ticket = await response.json();

        console.log(
            "Ticket details:",
            ticket
        );


        currentTicket = ticket;


        /* ---------------------------------------------
           READ VALUES
           --------------------------------------------- */

        const loadedTicketId =
            ticket.ticketId ??
            ticket.id ??
            ticketId;


        const loadedTripId =
            ticket.tripId ??
            ticket.trip?.tripId ??
            ticket.trip?.id ??
            sessionStorage.getItem("selectedTripId") ??
            "-";


        const loadedSeat =
            ticket.seatNumber ??
            ticket.seat ??
            sessionStorage.getItem("selectedTicketSeat") ??
            "-";


        const loadedAmount =
            ticket.ticketPrice ??
            ticket.price ??
            sessionStorage.getItem("selectedTicketFare") ??
            sessionStorage.getItem("paymentAmount") ??
            0;


        const amountNumber =
            Number(loadedAmount) || 0;


        /* ---------------------------------------------
           SAVE AGAIN TO SESSION
           --------------------------------------------- */

        sessionStorage.setItem(
            "selectedTicketId",
            String(loadedTicketId)
        );

        sessionStorage.setItem(
            "selectedTripId",
            String(loadedTripId)
        );

        sessionStorage.setItem(
            "selectedTicketSeat",
            String(loadedSeat)
        );

        sessionStorage.setItem(
            "selectedTicketFare",
            String(amountNumber)
        );

        sessionStorage.setItem(
            "paymentAmount",
            String(amountNumber)
        );


        /* ---------------------------------------------
           DISPLAY DETAILS
           --------------------------------------------- */

        setText(
            "ticketIdDisplay",
            loadedTicketId
        );


        setText(
            "tripIdDisplay",
            loadedTripId
        );


        setText(
            "seatDisplay",
            loadedSeat
        );


        setText(
            "amountDisplay",
            formatCurrency(amountNumber)
        );


        setInputValue(
            "paymentAmount",
            "Rs. " + amountNumber.toFixed(2)
        );


        console.log(
            "Payment details loaded successfully."
        );

    }
    catch (error) {

        console.error(
            "Load ticket details error:",
            error
        );

        showPaymentError(
            error.message ||
            "Unable to load ticket details."
        );
    }
}


/* =========================================================
   PAYMENT FORM
   ========================================================= */

function setupPaymentForm() {

    const form =
        document.getElementById("paymentForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await processPayment();
        }
    );


    /* ---------------------------------------------
       BACK BUTTON
       --------------------------------------------- */

    const backButton =
        document.getElementById(
            "backToBookingButton"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/passenger-booking.html";
            }
        );
    }


    /* ---------------------------------------------
       VIEW TICKET BUTTON
       --------------------------------------------- */

    const viewTicketButton =
        document.getElementById(
            "viewTicketButton"
        );


    if (viewTicketButton) {

        viewTicketButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/passenger-tickets.html";
            }
        );
    }
}


/* =========================================================
   PROCESS PAYMENT
   ========================================================= */

async function processPayment() {

    const paymentMethodElement =
        document.getElementById(
            "paymentMethod"
        );


    const payButton =
        document.getElementById(
            "payNowButton"
        );


    const paymentMethod =
        paymentMethodElement
            ? paymentMethodElement.value
            : "";


    /* ---------------------------------------------
       VALIDATE PAYMENT METHOD
       --------------------------------------------- */

    if (!paymentMethod) {

        showPaymentError(
            "Please select a payment method."
        );

        return;
    }


    /* ---------------------------------------------
       GET TICKET ID
       --------------------------------------------- */

    const ticketId =
        sessionStorage.getItem(
            "selectedTicketId"
        );


    if (!ticketId) {

        showPaymentError(
            "Ticket information is missing."
        );

        return;
    }


    /* ---------------------------------------------
       GET AMOUNT
       --------------------------------------------- */

    const amount =
        currentTicket?.ticketPrice ??
        currentTicket?.price ??
        sessionStorage.getItem(
            "selectedTicketFare"
        ) ??
        sessionStorage.getItem(
            "paymentAmount"
        );


    const amountNumber =
        Number(amount);


    if (!amountNumber || amountNumber <= 0) {

        showPaymentError(
            "Invalid payment amount."
        );

        return;
    }


    /* ---------------------------------------------
       DISABLE BUTTON
       --------------------------------------------- */

    if (payButton) {

        payButton.disabled = true;

        payButton.textContent =
            "Processing...";
    }


    clearPaymentMessage();


    try {

        /* ---------------------------------------------
           GENERATE TRANSACTION REFERENCE
           --------------------------------------------- */

        const transactionReference =
            "SM-" +
            Date.now() +
            "-" +
            Math.floor(
                1000 + Math.random() * 9000
            );


        /* ---------------------------------------------
           PAYMENT REQUEST
           --------------------------------------------- */

        const paymentData = {

            amount: amountNumber,

            paymentDate:
                new Date().toISOString(),

            paymentMethod:
            paymentMethod,

            paymentStatus:
                "PAID",

            transactionReference:
            transactionReference
        };


        console.log(
            "Payment request:",
            paymentData
        );


        /* ---------------------------------------------
           SAVE PAYMENT TO ORACLE
           --------------------------------------------- */

        const response = await fetch(
            "/api/payments?ticketId=" +
            encodeURIComponent(ticketId),
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials: "include",

                body:
                    JSON.stringify(
                        paymentData
                    )
            }
        );


        const responseText =
            await response.text();


        let result = {};

        try {

            result =
                responseText
                    ? JSON.parse(responseText)
                    : {};

        }
        catch (error) {

            console.error(
                "Invalid backend response:",
                responseText
            );
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Payment could not be completed."
            );
        }


        console.log(
            "Payment saved:",
            result
        );


        /* ---------------------------------------------
           SAVE PAYMENT INFORMATION
           --------------------------------------------- */

        if (result.paymentId) {

            sessionStorage.setItem(
                "lastPaymentId",
                String(result.paymentId)
            );
        }


        if (result.transactionReference) {

            sessionStorage.setItem(
                "lastTransactionReference",
                result.transactionReference
            );
        }


        sessionStorage.setItem(
            "lastPaidTicketId",
            String(ticketId)
        );


        sessionStorage.setItem(
            "lastPaymentAmount",
            String(amountNumber)
        );


        /* ---------------------------------------------
           SHOW SUCCESS
           --------------------------------------------- */

        showPaymentSuccess(
            ticketId,
            amountNumber,
            paymentMethod,
            transactionReference
        );


    }
    catch (error) {

        console.error(
            "Payment error:",
            error
        );

        showPaymentError(
            error.message ||
            "Payment failed."
        );


        if (payButton) {

            payButton.disabled = false;

            payButton.textContent =
                "Pay Now";
        }
    }
}


/* =========================================================
   SHOW PAYMENT SUCCESS
   ========================================================= */

function showPaymentSuccess(
    ticketId,
    amount,
    paymentMethod,
    transactionReference
) {

    const form =
        document.getElementById(
            "paymentForm"
        );


    const successCard =
        document.getElementById(
            "paymentSuccessCard"
        );


    const successMessage =
        document.getElementById(
            "paymentSuccessMessage"
        );


    if (form) {

        form.style.display = "none";
    }


    if (successCard) {

        successCard.style.display =
            "block";
    }


    if (successMessage) {

        successMessage.textContent =
            "Payment completed successfully for Ticket #" +
            ticketId +
            " — Rs. " +
            Number(amount).toFixed(2) +
            " via " +
            paymentMethod +
            ".";
    }
}


/* =========================================================
   ERROR MESSAGE
   ========================================================= */

function showPaymentError(message) {

    const element =
        document.getElementById(
            "paymentMessage"
        );


    if (!element) {
        return;
    }


    element.textContent = message;

    element.className =
        "payment-message error";
}


/* =========================================================
   CLEAR MESSAGE
   ========================================================= */

function clearPaymentMessage() {

    const element =
        document.getElementById(
            "paymentMessage"
        );


    if (!element) {
        return;
    }


    element.textContent = "";

    element.className =
        "payment-message";
}


/* =========================================================
   TEXT HELPER
   ========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        value !== null &&
        value !== undefined &&
        value !== ""
            ? value
            : "-";
}


/* =========================================================
   INPUT HELPER
   ========================================================= */

function setInputValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.value =
        value !== null &&
        value !== undefined
            ? value
            : "";
}


/* =========================================================
   CURRENCY
   ========================================================= */

function formatCurrency(amount) {

    const number =
        Number(amount) || 0;


    return "Rs. " +
        number.toFixed(2);
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {


    const dashboardButton =
        document.getElementById(
            "dashboardButton"
        );

    if (dashboardButton) {

        dashboardButton.onclick = function () {

            window.location.href =
                "/passenger-dashboard.html";
        };
    }


    const searchTripsButton =
        document.getElementById(
            "searchTripsButton"
        );

    if (searchTripsButton) {

        searchTripsButton.onclick = function () {

            window.location.href =
                "/passenger-trips.html";
        };
    }


    const availableTripsButton =
        document.getElementById(
            "availableTripsButton"
        );

    if (availableTripsButton) {

        availableTripsButton.onclick = function () {

            window.location.href =
                "/passenger-trips.html";
        };
    }


    const myTicketsButton =
        document.getElementById(
            "myTicketsButton"
        );

    if (myTicketsButton) {

        myTicketsButton.onclick = function () {

            window.location.href =
                "/passenger-tickets.html";
        };
    }


    const paymentsButton =
        document.getElementById(
            "paymentsButton"
        );

    if (paymentsButton) {

        paymentsButton.onclick = function () {

            window.location.href =
                "/passenger-payment.html";
        };
    }


    const travelHistoryButton =
        document.getElementById(
            "travelHistoryButton"
        );

    if (travelHistoryButton) {

        travelHistoryButton.onclick = function () {

            window.location.href =
                "/passenger-travel-history.html";
        };
    }


    const myReviewsButton =
        document.getElementById(
            "myReviewsButton"
        );

    if (myReviewsButton) {

        myReviewsButton.onclick = function () {

            window.location.href =
                "/passenger-reviews.html";
        };
    }


    const announcementsButton =
        document.getElementById(
            "announcementsButton"
        );

    if (announcementsButton) {

        announcementsButton.onclick = function () {

            window.location.href =
                "/passenger-announcements.html";
        };
    }


    const vehicleInfoButton =
        document.getElementById(
            "vehicleInfoButton"
        );

    if (vehicleInfoButton) {

        vehicleInfoButton.onclick = function () {

            window.location.href =
                "/passenger-vehicle-information.html";
        };
    }


    const profileButton =
        document.getElementById(
            "profileButton"
        );

    if (profileButton) {

        profileButton.onclick = function () {

            window.location.href =
                "/passenger-profile.html";
        };
    }


    const logoutButton =
        document.getElementById(
            "passengerLogoutButton"
        );

    if (logoutButton) {

        logoutButton.onclick = async function () {

            try {

                await fetch(
                    "/api/users/logout",
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

            }
            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );
            }


            sessionStorage.clear();

            window.location.href =
                "/index.html";
        };
    }
}