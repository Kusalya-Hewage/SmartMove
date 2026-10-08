/* =========================================================
   SMARTMOVE - PASSENGER BOOKING
   ========================================================= */

let currentUser = null;
let currentPassenger = null;
let selectedTrip = null;


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setupNavigation();

        await loadCurrentPassenger();

        await loadSelectedTrip();

        setupBookingForm();

    }
);


/* =========================================================
   LOAD CURRENT USER
   ========================================================= */

async function loadCurrentPassenger() {

    try {

        const response = await fetch(
            "/api/users/current-user",
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Unable to get current user."
            );
        }


        const user =
            await response.json();


        currentUser = user;


        console.log(
            "Current user:",
            user
        );


        const role =
            user.role ||
            user.userRole ||
            user.accountType ||
            "";


        if (
            String(role).toUpperCase()
            !== "PASSENGER"
        ) {

            alert(
                "Please login as a passenger."
            );

            window.location.href =
                "/index.html";

            return;
        }


        const passengerId =
            user.passengerId ||
            user.userId ||
            user.id;


        if (!passengerId) {

            throw new Error(
                "Passenger ID was not found."
            );
        }


        sessionStorage.setItem(
            "passengerId",
            String(passengerId)
        );


        /* ---------------------------------------------
           LOAD PASSENGER
           --------------------------------------------- */

        try {

            const passengerResponse =
                await fetch(
                    "/api/passengers/" +
                    encodeURIComponent(passengerId),
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );


            if (passengerResponse.ok) {

                currentPassenger =
                    await passengerResponse.json();

                console.log(
                    "Passenger:",
                    currentPassenger
                );
            }

        }
        catch (error) {

            console.warn(
                "Passenger details could not be loaded:",
                error
            );
        }


        /* ---------------------------------------------
           DISPLAY PASSENGER NAME
           --------------------------------------------- */

        const passengerDisplay =
            document.getElementById(
                "passengerDisplay"
            );


        const passengerNameElement =
            document.getElementById(
                "passengerName"
            );


        const name =
            currentPassenger?.name ||
            currentPassenger?.fullName ||
            user.passengerName ||
            user.fullName ||
            user.username ||
            "Passenger";


        if (passengerDisplay) {

            passengerDisplay.value =
                name;
        }


        if (passengerNameElement) {

            passengerNameElement.textContent =
                name;
        }

    }
    catch (error) {

        console.error(
            "Passenger loading error:",
            error
        );

        alert(
            "Please login again."
        );

        window.location.href =
            "/index.html";
    }
}


/* =========================================================
   LOAD SELECTED TRIP
   ========================================================= */

async function loadSelectedTrip() {

    try {

        const tripId =
            sessionStorage.getItem(
                "selectedTripId"
            );


        console.log(
            "Selected Trip ID:",
            tripId
        );


        if (!tripId) {

            showBookingMessage(
                "No trip has been selected.",
                "error"
            );

            disableBookingButton();

            return;
        }


        /* ---------------------------------------------
           LOAD TRIPS
           --------------------------------------------- */

        const response =
            await fetch(
                "/api/trips",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load trips."
            );
        }


        const trips =
            await response.json();


        selectedTrip =
            trips.find(
                function (trip) {

                    const id =
                        trip.tripId ??
                        trip.id;

                    return String(id)
                        === String(tripId);
                }
            );


        if (!selectedTrip) {

            throw new Error(
                "Selected trip could not be found."
            );
        }


        console.log(
            "Selected trip:",
            selectedTrip
        );


        /* ---------------------------------------------
           GET TRIP VALUES
           --------------------------------------------- */

        const actualTripId =
            selectedTrip.tripId ??
            selectedTrip.id;


        const fare =
            Number(
                selectedTrip.fare ??
                selectedTrip.ticketPrice ??
                0
            );


        const availableSeats =
            Number(
                selectedTrip.availableSeats ??
                0
            );


        /* ---------------------------------------------
           SAVE TRIP VALUES
           --------------------------------------------- */

        sessionStorage.setItem(
            "selectedTripId",
            String(actualTripId)
        );


        sessionStorage.setItem(
            "selectedTripFare",
            String(fare)
        );


        sessionStorage.setItem(
            "paymentAmount",
            String(fare)
        );


        /* ---------------------------------------------
           DISPLAY TRIP
           --------------------------------------------- */

        renderTripDetails(
            selectedTrip,
            fare,
            availableSeats
        );


        /* ---------------------------------------------
           CHECK AVAILABLE SEATS
           --------------------------------------------- */

        if (availableSeats <= 0) {

            showBookingMessage(
                "This trip has no available seats.",
                "error"
            );

            disableBookingButton();

            return;
        }


        /* ---------------------------------------------
           LOAD ALREADY BOOKED SEATS
           --------------------------------------------- */

        await loadBookedSeats(
            actualTripId
        );

    }
    catch (error) {

        console.error(
            "Trip loading error:",
            error
        );

        showBookingMessage(
            error.message ||
            "Unable to load trip details.",
            "error"
        );

        disableBookingButton();
    }
}


/* =========================================================
   RENDER TRIP DETAILS
   ========================================================= */

function renderTripDetails(
    trip,
    fare,
    availableSeats
) {

    const tripDetails =
        document.getElementById(
            "tripDetails"
        );


    if (!tripDetails) {
        return;
    }


    const route =
        trip.route ||
        {};


    const vehicle =
        trip.vehicle ||
        {};


    const source =
        route.sourceLocation ||
        route.source ||
        trip.sourceLocation ||
        "-";


    const destination =
        route.destinationLocation ||
        route.destination ||
        trip.destinationLocation ||
        "-";


    const vehicleNumber =
        vehicle.registrationNo ||
        vehicle.registrationNumber ||
        trip.registrationNo ||
        "-";


    const vehicleType =
        vehicle.vehicleType ||
        trip.vehicleType ||
        "-";


    const departure =
        trip.departureTime ||
        trip.departureDateTime ||
        "-";


    const arrival =
        trip.arrivalTime ||
        trip.arrivalDateTime ||
        "-";


    tripDetails.innerHTML = `

        <div class="trip-detail-row">

            <span>Route</span>

            <strong>
                ${escapeHtml(source)}
                →
                ${escapeHtml(destination)}
            </strong>

        </div>


        <div class="trip-detail-row">

            <span>Vehicle</span>

            <strong>
                ${escapeHtml(vehicleNumber)}
                (${escapeHtml(vehicleType)})
            </strong>

        </div>


        <div class="trip-detail-row">

            <span>Departure</span>

            <strong>
                ${escapeHtml(
        formatDateTime(departure)
    )}
            </strong>

        </div>


        <div class="trip-detail-row">

            <span>Arrival</span>

            <strong>
                ${escapeHtml(
        formatDateTime(arrival)
    )}
            </strong>

        </div>


        <div class="trip-detail-row">

            <span>Available Seats</span>

            <strong>
                ${availableSeats}
            </strong>

        </div>


        <div class="trip-detail-row">

            <span>Fare</span>

            <strong>
                Rs.
                ${fare.toFixed(2)}
            </strong>

        </div>

    `;
}


/* =========================================================
   LOAD BOOKED SEATS
   ========================================================= */

async function loadBookedSeats(tripId) {

    try {

        const response =
            await fetch(
                "/api/tickets/trip/" +
                encodeURIComponent(tripId),
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {
            return;
        }


        const tickets =
            await response.json();


        console.log(
            "Booked tickets:",
            tickets
        );


        const bookedSeats =
            tickets
                .filter(
                    ticket =>
                        String(
                            ticket.ticketStatus ||
                            ""
                        ).toUpperCase()
                        === "BOOKED"
                )
                .map(
                    ticket =>
                        String(
                            ticket.seatNumber ||
                            ""
                        ).toUpperCase()
                );


        const seatInput =
            document.getElementById(
                "seatNumber"
            );


        if (seatInput) {

            seatInput.dataset.bookedSeats =
                JSON.stringify(bookedSeats);

        }

    }
    catch (error) {

        console.warn(
            "Could not load booked seats:",
            error
        );
    }
}


/* =========================================================
   BOOKING FORM
   ========================================================= */

function setupBookingForm() {

    const form =
        document.getElementById(
            "bookingForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await createTicket();

        }
    );

}


/* =========================================================
   CREATE TICKET
   ========================================================= */

async function createTicket() {

    clearBookingMessage();


    /* ---------------------------------------------
       CHECK TRIP
       --------------------------------------------- */

    const tripId =
        sessionStorage.getItem(
            "selectedTripId"
        );


    if (!tripId) {

        showBookingMessage(
            "Trip information is missing.",
            "error"
        );

        return;
    }


    /* ---------------------------------------------
       GET PASSENGER ID
       --------------------------------------------- */

    const passengerId =
        currentUser?.passengerId ||
        sessionStorage.getItem(
            "passengerId"
        );


    if (!passengerId) {

        showBookingMessage(
            "Passenger information is missing.",
            "error"
        );

        return;
    }


    /* ---------------------------------------------
       GET SEAT
       --------------------------------------------- */

    const seatInput =
        document.getElementById(
            "seatNumber"
        );


    if (!seatInput) {

        showBookingMessage(
            "Seat field was not found.",
            "error"
        );

        return;
    }


    const seatNumber =
        seatInput.value
            .trim()
            .toUpperCase();


    if (!seatNumber) {

        showBookingMessage(
            "Please enter a seat number.",
            "error"
        );

        seatInput.focus();

        return;
    }


    /* ---------------------------------------------
       CHECK DUPLICATE SEAT
       --------------------------------------------- */

    let bookedSeats = [];

    try {

        bookedSeats =
            JSON.parse(
                seatInput.dataset.bookedSeats ||
                "[]"
            );

    }
    catch (error) {

        bookedSeats = [];
    }


    if (
        bookedSeats.includes(
            seatNumber
        )
    ) {

        showBookingMessage(
            "Seat " +
            seatNumber +
            " is already booked for this trip.",
            "error"
        );

        seatInput.focus();

        return;
    }


    /* ---------------------------------------------
       GET FARE
       --------------------------------------------- */

    const fare =
        Number(
            selectedTrip?.fare ??
            selectedTrip?.ticketPrice ??
            sessionStorage.getItem(
                "selectedTripFare"
            ) ??
            0
        );


    if (!fare || fare <= 0) {

        showBookingMessage(
            "Invalid ticket price.",
            "error"
        );

        return;
    }


    /* ---------------------------------------------
       BUTTON
       --------------------------------------------- */

    const bookingButton =
        document.getElementById(
            "confirmBookingButton"
        );


    if (bookingButton) {

        bookingButton.disabled = true;

        bookingButton.textContent =
            "Booking...";
    }


    try {

        /* ---------------------------------------------
           REQUEST BODY
           --------------------------------------------- */

        const ticketData = {

            seatNumber: seatNumber,

            ticketPrice: fare

        };


        console.log(
            "Creating ticket:",
            {
                tripId: tripId,
                passengerId: passengerId,
                ticketData: ticketData
            }
        );


        /* ---------------------------------------------
           CALL BACKEND
           --------------------------------------------- */

        const response =
            await fetch(
                "/api/tickets?tripId=" +
                encodeURIComponent(tripId) +
                "&passengerId=" +
                encodeURIComponent(passengerId),
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify(
                            ticketData
                        )
                }
            );


        const responseText =
            await response.text();


        let result = {};

        try {

            result =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        }
        catch (error) {

            console.error(
                "Invalid backend response:",
                responseText
            );
        }


        console.log(
            "Booking response:",
            result
        );


        /* ---------------------------------------------
           BACKEND ERROR
           --------------------------------------------- */

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Booking failed."
            );
        }


        /* ---------------------------------------------
           IMPORTANT:
           GET CREATED TICKET ID
           --------------------------------------------- */

        const ticketId =
            result.ticketId ??
            result.id;


        if (!ticketId) {

            console.error(
                "Backend did not return ticketId:",
                result
            );

            throw new Error(
                "Booking was created, but the ticket ID was not returned."
            );
        }


        /* =================================================
           IMPORTANT FIX
           SAVE TICKET ID BEFORE PAYMENT PAGE
           ================================================= */

        sessionStorage.setItem(
            "selectedTicketId",
            String(ticketId)
        );


        sessionStorage.setItem(
            "selectedTripId",
            String(
                result.tripId ??
                tripId
            )
        );


        sessionStorage.setItem(
            "selectedTicketSeat",
            String(
                result.seatNumber ??
                seatNumber
            )
        );


        sessionStorage.setItem(
            "selectedTicketFare",
            String(
                Number(
                    result.ticketPrice ??
                    fare
                )
            )
        );


        sessionStorage.setItem(
            "paymentAmount",
            String(
                Number(
                    result.ticketPrice ??
                    fare
                )
            )
        );


        /* ---------------------------------------------
           DEBUG
           --------------------------------------------- */

        console.log(
            "Saved selectedTicketId:",
            sessionStorage.getItem(
                "selectedTicketId"
            )
        );


        console.log(
            "Saved selectedTripId:",
            sessionStorage.getItem(
                "selectedTripId"
            )
        );


        console.log(
            "Saved selectedTicketSeat:",
            sessionStorage.getItem(
                "selectedTicketSeat"
            )
        );


        console.log(
            "Saved selectedTicketFare:",
            sessionStorage.getItem(
                "selectedTicketFare"
            )
        );


        /* ---------------------------------------------
           SHOW SUCCESS
           --------------------------------------------- */

        showBookingSuccess(
            ticketId,
            result.seatNumber ??
            seatNumber,
            result.ticketPrice ??
            fare
        );


    }
    catch (error) {

        console.error(
            "Booking error:",
            error
        );


        showBookingMessage(
            error.message ||
            "An unexpected error occurred.",
            "error"
        );


        if (bookingButton) {

            bookingButton.disabled =
                false;

            bookingButton.textContent =
                "Confirm Booking";
        }
    }
}


/* =========================================================
   SHOW BOOKING SUCCESS
   ========================================================= */

function showBookingSuccess(
    ticketId,
    seatNumber,
    amount
) {

    const bookingForm =
        document.getElementById(
            "bookingForm"
        );


    const successCard =
        document.getElementById(
            "bookingSuccessCard"
        );


    if (bookingForm) {

        bookingForm.style.display =
            "none";
    }


    if (successCard) {

        successCard.style.display =
            "block";
    }


    const message =
        document.getElementById(
            "successMessage"
        );


    const successTicketId =
        document.getElementById(
            "successTicketId"
        );


    const successSeat =
        document.getElementById(
            "successSeat"
        );


    const successAmount =
        document.getElementById(
            "successAmount"
        );


    if (message) {

        message.textContent =
            "Your ticket has been booked successfully.";
    }


    if (successTicketId) {

        successTicketId.textContent =
            ticketId;
    }


    if (successSeat) {

        successSeat.textContent =
            seatNumber;
    }


    if (successAmount) {

        successAmount.textContent =
            "Rs. " +
            Number(amount).toFixed(2);
    }


    /* ---------------------------------------------
       PAYMENT BUTTON
       --------------------------------------------- */

    const payButton =
        document.getElementById(
            "payTicketButton"
        );


    if (payButton) {

        payButton.onclick =
            function () {

                const savedTicketId =
                    sessionStorage.getItem(
                        "selectedTicketId"
                    );


                if (!savedTicketId) {

                    alert(
                        "Ticket information is missing."
                    );

                    return;
                }


                window.location.href =
                    "/passenger-payment.html";
            };
    }


    /* ---------------------------------------------
       VIEW TICKETS BUTTON
       --------------------------------------------- */

    const viewTicketsButton =
        document.getElementById(
            "viewTicketsButton"
        );


    if (viewTicketsButton) {

        viewTicketsButton.onclick =
            function () {

                window.location.href =
                    "/passenger-tickets.html";
            };
    }


    /* ---------------------------------------------
       DASHBOARD BUTTON
       --------------------------------------------- */

    const returnDashboardButton =
        document.getElementById(
            "returnDashboardButton"
        );


    if (returnDashboardButton) {

        returnDashboardButton.onclick =
            function () {

                window.location.href =
                    "/passenger-dashboard.html";
            };
    }
}


/* =========================================================
   DISABLE BOOKING BUTTON
   ========================================================= */

function disableBookingButton() {

    const button =
        document.getElementById(
            "confirmBookingButton"
        );


    if (button) {

        button.disabled = true;
    }
}


/* =========================================================
   BOOKING MESSAGE
   ========================================================= */

function showBookingMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "bookingMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "booking-message " +
        (type || "");
}


/* =========================================================
   CLEAR MESSAGE
   ========================================================= */

function clearBookingMessage() {

    const element =
        document.getElementById(
            "bookingMessage"
        );


    if (!element) {
        return;
    }


    element.textContent = "";

    element.className =
        "booking-message";
}


/* =========================================================
   DATE / TIME
   ========================================================= */

function formatDateTime(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (Number.isNaN(
        date.getTime()
    )) {

        return String(value);
    }


    return date.toLocaleString();
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
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

        dashboardButton.onclick =
            function () {

                window.location.href =
                    "/passenger-dashboard.html";
            };
    }


    const searchTripsButton =
        document.getElementById(
            "searchTripsButton"
        );

    if (searchTripsButton) {

        searchTripsButton.onclick =
            function () {

                window.location.href =
                    "/passenger-trips.html";
            };
    }


    const availableTripsButton =
        document.getElementById(
            "availableTripsButton"
        );

    if (availableTripsButton) {

        availableTripsButton.onclick =
            function () {

                window.location.href =
                    "/passenger-trips.html";
            };
    }


    const myTicketsButton =
        document.getElementById(
            "myTicketsButton"
        );

    if (myTicketsButton) {

        myTicketsButton.onclick =
            function () {

                window.location.href =
                    "/passenger-tickets.html";
            };
    }


    const paymentsButton =
        document.getElementById(
            "paymentsButton"
        );

    if (paymentsButton) {

        paymentsButton.onclick =
            function () {

                window.location.href =
                    "/passenger-payment.html";
            };
    }


    const travelHistoryButton =
        document.getElementById(
            "travelHistoryButton"
        );

    if (travelHistoryButton) {

        travelHistoryButton.onclick =
            function () {

                window.location.href =
                    "/passenger-travel-history.html";
            };
    }


    const myReviewsButton =
        document.getElementById(
            "myReviewsButton"
        );

    if (myReviewsButton) {

        myReviewsButton.onclick =
            function () {

                window.location.href =
                    "/passenger-reviews.html";
            };
    }


    const announcementsButton =
        document.getElementById(
            "announcementsButton"
        );

    if (announcementsButton) {

        announcementsButton.onclick =
            function () {

                window.location.href =
                    "/passenger-announcements.html";
            };
    }


    const vehicleInfoButton =
        document.getElementById(
            "vehicleInfoButton"
        );

    if (vehicleInfoButton) {

        vehicleInfoButton.onclick =
            function () {

                window.location.href =
                    "/passenger-vehicle-information.html";
            };
    }


    const profileButton =
        document.getElementById(
            "profileButton"
        );

    if (profileButton) {

        profileButton.onclick =
            function () {

                window.location.href =
                    "/passenger-profile.html";
            };
    }


    const logoutButton =
        document.getElementById(
            "passengerLogoutButton"
        );

    if (logoutButton) {

        logoutButton.onclick =
            async function () {

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