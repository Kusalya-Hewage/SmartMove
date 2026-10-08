/* =====================================================
   SMARTMOVE - PASSENGER REVIEWS
   ===================================================== */


let currentPassenger = null;

let allTickets = [];

let allTrips = [];

let allRoutes = [];

let myReviews = [];

let eligibleTrips = [];


/* =====================================================
   PAGE INITIALIZATION
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const authenticated =
            await checkPassenger();

        if (!authenticated) {
            return;
        }


        setupLogout();

        setupForm();

        setupRefresh();

        await loadPassenger();

        await loadReviews();

        await loadBookingData();

    }
);


/* =====================================================
   CHECK PASSENGER LOGIN
   ===================================================== */

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
            String(user.role).toUpperCase()
            !== "PASSENGER"
        ) {

            window.location.href =
                "/index.html";

            return false;
        }


        sessionStorage.setItem(
            "role",
            "PASSENGER"
        );


        if (user.userId != null) {

            sessionStorage.setItem(
                "userId",
                String(user.userId)
            );

        }


        if (user.passengerId != null) {

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
            "Authentication error:",
            error
        );

        window.location.href =
            "/index.html";

        return false;
    }
}


/* =====================================================
   LOAD PASSENGER
   ===================================================== */

async function loadPassenger() {

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
        return;
    }


    try {

        const response =
            await fetch(
                "/api/passengers/" +
                encodeURIComponent(
                    passengerId
                ),
                {
                    credentials: "include"
                }
            );


        if (!response.ok) {
            return;
        }


        currentPassenger =
            await response.json();


        const name =
            currentPassenger.fullName ||
            currentPassenger.name ||
            sessionStorage.getItem(
                "username"
            ) ||
            "Passenger";


        const passengerName =
            document.getElementById(
                "passengerName"
            );


        if (passengerName) {

            passengerName.textContent =
                name;

        }

    }
    catch (error) {

        console.error(
            "Passenger loading error:",
            error
        );

    }
}


/* =====================================================
   LOAD MY REVIEWS
   ===================================================== */

async function loadReviews() {

    const loading =
        document.getElementById(
            "reviewsLoading"
        );


    const empty =
        document.getElementById(
            "noReviewsMessage"
        );


    const container =
        document.getElementById(
            "reviewsContainer"
        );


    try {

        if (loading) {

            loading.style.display =
                "block";

        }


        if (empty) {

            empty.style.display =
                "none";

        }


        if (container) {

            container.innerHTML =
                "";

        }


        const response =
            await fetch(
                "/api/mongo/reviews/my",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load reviews."
            );
        }


        const data =
            await response.json();


        myReviews =
            Array.isArray(data)
                ? data
                : [];


        renderReviews();

        updateReviewSummary();

    }
    catch (error) {

        console.error(
            "Review loading error:",
            error
        );


        myReviews = [];


        if (container) {

            container.innerHTML =
                "<div class='empty-state'>" +
                "Unable to load your reviews." +
                "</div>";

        }

    }
    finally {

        if (loading) {

            loading.style.display =
                "none";

        }
    }
}


/* =====================================================
   LOAD TICKETS / TRIPS / ROUTES
   ===================================================== */

async function loadBookingData() {

    try {

        const responses =
            await Promise.all([
                fetch(
                    "/api/tickets",
                    {
                        credentials: "include"
                    }
                ),

                fetch(
                    "/api/trips",
                    {
                        credentials: "include"
                    }
                ),

                fetch(
                    "/api/routes",
                    {
                        credentials: "include"
                    }
                )
            ]);


        const ticketsResponse =
            responses[0];

        const tripsResponse =
            responses[1];

        const routesResponse =
            responses[2];


        allTickets =
            ticketsResponse.ok
                ? await ticketsResponse.json()
                : [];


        allTrips =
            tripsResponse.ok
                ? await tripsResponse.json()
                : [];


        allRoutes =
            routesResponse.ok
                ? await routesResponse.json()
                : [];


        if (!Array.isArray(allTickets)) {
            allTickets = [];
        }


        if (!Array.isArray(allTrips)) {
            allTrips = [];
        }


        if (!Array.isArray(allRoutes)) {
            allRoutes = [];
        }


        buildEligibleTrips();

        renderTripOptions();

        updateCompletedTripCount();

    }
    catch (error) {

        console.error(
            "Booking data loading error:",
            error
        );

        renderTripOptions();

    }
}


/* =====================================================
   GET CURRENT PASSENGER ID
   ===================================================== */

function getCurrentPassengerId() {

    if (
        currentPassenger &&
        currentPassenger.passengerId != null
    ) {

        return Number(
            currentPassenger.passengerId
        );

    }


    const value =
        sessionStorage.getItem(
            "passengerId"
        );


    if (value) {

        return Number(value);

    }


    return null;
}


/* =====================================================
   GET TICKET PASSENGER ID
   ===================================================== */

function getTicketPassengerId(ticket) {

    if (!ticket) {
        return null;
    }


    if (
        ticket.passenger &&
        ticket.passenger.passengerId != null
    ) {

        return Number(
            ticket.passenger.passengerId
        );

    }


    if (ticket.passengerId != null) {

        return Number(
            ticket.passengerId
        );

    }


    return null;
}


/* =====================================================
   GET TICKET TRIP ID
   ===================================================== */

function getTicketTripId(ticket) {

    if (!ticket) {
        return null;
    }


    if (
        ticket.trip &&
        ticket.trip.tripId != null
    ) {

        return Number(
            ticket.trip.tripId
        );

    }


    if (ticket.tripId != null) {

        return Number(
            ticket.tripId
        );

    }


    return null;
}


/* =====================================================
   GET TRIP ID
   ===================================================== */

function getTripId(trip) {

    return (
        trip.tripId ??
        trip.id ??
        null
    );
}


/* =====================================================
   GET ROUTE ID
   ===================================================== */

function getRouteId(trip) {

    if (!trip) {
        return null;
    }


    if (trip.routeId != null) {

        return Number(
            trip.routeId
        );

    }


    if (
        trip.route &&
        trip.route.routeId != null
    ) {

        return Number(
            trip.route.routeId
        );

    }


    if (
        trip.route &&
        trip.route.id != null
    ) {

        return Number(
            trip.route.id
        );

    }


    return null;
}


/* =====================================================
   GET ROUTE
   ===================================================== */

function getRoute(routeId) {

    return allRoutes.find(
        function (route) {

            const id =
                route.routeId ??
                route.id;

            return String(id) ===
                String(routeId);

        }
    );
}


/* =====================================================
   GET TRIP
   ===================================================== */

function getTrip(tripId) {

    return allTrips.find(
        function (trip) {

            return String(
                getTripId(trip)
            ) === String(tripId);

        }
    );
}


/* =====================================================
   TRIP IS COMPLETED
   ===================================================== */

function isCompletedTrip(trip) {

    if (!trip) {
        return false;
    }


    const status =
        String(
            trip.tripStatus ??
            trip.status ??
            ""
        ).toUpperCase();


    if (
        status === "CANCELLED" ||
        status === "CANCELED" ||
        status === "SUSPENDED"
    ) {

        return false;

    }


    if (
        status === "COMPLETED" ||
        status === "FINISHED"
    ) {

        return true;

    }


    /*
     * Use date/time when status has not
     * been changed to COMPLETED.
     */

    const dateValue =
        trip.arrivalDateTime ??
        trip.arrivalTime ??
        trip.endDateTime ??
        trip.endTime ??
        trip.departureDateTime ??
        trip.departureTime ??
        trip.tripDate;


    if (!dateValue) {

        return false;

    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    return date.getTime()
        < Date.now();
}


/* =====================================================
   CHECK TICKET CANCELLATION
   ===================================================== */

function isCancelledTicket(ticket) {

    const status =
        String(
            ticket.ticketStatus ??
            ticket.status ??
            ""
        ).toUpperCase();


    return (
        status === "CANCELLED" ||
        status === "CANCELED"
    );
}


/* =====================================================
   BUILD ELIGIBLE TRIPS
   ===================================================== */

function buildEligibleTrips() {

    const passengerId =
        getCurrentPassengerId();


    if (!passengerId) {

        eligibleTrips = [];

        return;
    }


    const reviewedTripIds =
        new Set(
            myReviews
                .map(
                    function (review) {

                        return String(
                            review.tripId
                        );

                    }
                )
        );


    const result = [];


    allTickets.forEach(
        function (ticket) {

            const ticketPassengerId =
                getTicketPassengerId(
                    ticket
                );


            if (
                String(ticketPassengerId)
                !== String(passengerId)
            ) {

                return;
            }


            if (
                isCancelledTicket(
                    ticket
                )
            ) {

                return;
            }


            const tripId =
                getTicketTripId(
                    ticket
                );


            if (!tripId) {
                return;
            }


            const trip =
                getTrip(tripId);


            if (!trip) {
                return;
            }


            if (
                !isCompletedTrip(
                    trip
                )
            ) {

                return;
            }


            if (
                reviewedTripIds.has(
                    String(tripId)
                )
            ) {

                return;
            }


            const exists =
                result.some(
                    function (item) {

                        return String(
                            item.tripId
                        ) === String(
                            tripId
                        );

                    }
                );


            if (exists) {
                return;
            }


            const routeId =
                getRouteId(trip);


            result.push({
                tripId: Number(tripId),
                routeId: routeId,
                trip: trip
            });

        }
    );


    eligibleTrips =
        result;
}


/* =====================================================
   RENDER TRIP OPTIONS
   ===================================================== */

function renderTripOptions() {

    const select =
        document.getElementById(
            "reviewTrip"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        "<option value=''>" +
        "Select a completed trip" +
        "</option>";


    if (
        !eligibleTrips ||
        eligibleTrips.length === 0
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value = "";

        option.textContent =
            "No completed trips available for review";


        select.appendChild(
            option
        );


        select.disabled = true;

        return;
    }


    select.disabled = false;


    eligibleTrips.forEach(
        function (item) {

            const trip =
                item.trip;


            const route =
                getRoute(
                    item.routeId
                );


            const source =
                route?.sourceLocation ||
                route?.source ||
                "Unknown source";


            const destination =
                route?.destinationLocation ||
                route?.destination ||
                "Unknown destination";


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item.tripId;


            option.dataset.routeId =
                item.routeId || "";


            option.textContent =
                "Trip " +
                item.tripId +
                " - " +
                source +
                " → " +
                destination;


            select.appendChild(
                option
            );

        }
    );
}


/* =====================================================
   UPDATE COMPLETED TRIP COUNT
   ===================================================== */

function updateCompletedTripCount() {

    const element =
        document.getElementById(
            "completedTripCount"
        );


    if (element) {

        element.textContent =
            eligibleTrips.length;

    }
}


/* =====================================================
   FORM SETUP
   ===================================================== */

function setupForm() {

    const form =
        document.getElementById(
            "reviewForm"
        );


    const clearButton =
        document.getElementById(
            "clearReviewButton"
        );


    if (form) {

        form.addEventListener(
            "submit",
            submitReview
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearReviewForm
        );

    }
}


/* =====================================================
   SUBMIT REVIEW
   ===================================================== */

async function submitReview(event) {

    event.preventDefault();


    clearMessage();


    const tripSelect =
        document.getElementById(
            "reviewTrip"
        );


    const commentElement =
        document.getElementById(
            "reviewComment"
        );


    const submitButton =
        document.getElementById(
            "submitReviewButton"
        );


    const selectedTripId =
        tripSelect.value;


    const selectedOption =
        tripSelect.options[
            tripSelect.selectedIndex
            ];


    const routeId =
        selectedOption?.dataset?.routeId;


    const ratingElement =
        document.querySelector(
            "input[name='rating']:checked"
        );


    const comment =
        commentElement.value.trim();


    if (!selectedTripId) {

        showMessage(
            "Please select a completed trip.",
            "error"
        );

        return;
    }


    if (!routeId) {

        showMessage(
            "Route information is not available.",
            "error"
        );

        return;
    }


    if (!ratingElement) {

        showMessage(
            "Please select a rating.",
            "error"
        );

        return;
    }


    if (!comment) {

        showMessage(
            "Please enter your comment.",
            "error"
        );

        return;
    }


    const rating =
        Number(
            ratingElement.value
        );


    try {

        submitButton.disabled = true;

        submitButton.textContent =
            "Submitting...";


        const response =
            await fetch(
                "/api/mongo/reviews",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            tripId:
                                Number(
                                    selectedTripId
                                ),

                            routeId:
                                Number(
                                    routeId
                                ),

                            rating:
                            rating,

                            comment:
                            comment
                        })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to submit review."
            );

        }


        showMessage(
            "Review submitted successfully.",
            "success"
        );


        clearReviewForm();


        await loadReviews();


        await loadBookingData();

    }
    catch (error) {

        console.error(
            "Review submission error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to submit review.",
            "error"
        );

    }
    finally {

        submitButton.disabled =
            false;

        submitButton.textContent =
            "Submit Review";

    }
}


/* =====================================================
   RENDER REVIEWS
   ===================================================== */

function renderReviews() {

    const container =
        document.getElementById(
            "reviewsContainer"
        );


    const empty =
        document.getElementById(
            "noReviewsMessage"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (
        !myReviews ||
        myReviews.length === 0
    ) {

        if (empty) {

            empty.style.display =
                "block";

        }

        return;
    }


    if (empty) {

        empty.style.display =
            "none";

    }


    myReviews
        .slice()
        .sort(
            function (a, b) {

                return new Date(
                        b.reviewDate
                    ) -
                    new Date(
                        a.reviewDate
                    );

            }
        )
        .forEach(
            function (review) {

                const trip =
                    getTrip(
                        review.tripId
                    );


                const route =
                    getRoute(
                        review.routeId
                    );


                const source =
                    route?.sourceLocation ||
                    route?.source ||
                    "Unknown source";


                const destination =
                    route?.destinationLocation ||
                    route?.destination ||
                    "Unknown destination";


                const stars =
                    "★".repeat(
                        Number(
                            review.rating || 0
                        )
                    );


                const date =
                    formatDate(
                        review.reviewDate
                    );


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "review-item";


                item.innerHTML =
                    "<div class='review-top'>" +

                    "<div>" +

                    "<div class='review-trip'>" +

                    "Trip " +
                    escapeHtml(
                        review.tripId
                    ) +
                    " - " +
                    escapeHtml(
                        source
                    ) +
                    " → " +
                    escapeHtml(
                        destination
                    ) +

                    "</div>" +

                    "</div>" +

                    "<div class='review-date'>" +

                    escapeHtml(
                        date
                    ) +

                    "</div>" +

                    "</div>" +

                    "<div class='review-stars'>" +

                    escapeHtml(
                        stars
                    ) +

                    " (" +
                    escapeHtml(
                        review.rating
                    ) +
                    "/5)" +

                    "</div>" +

                    "<p class='review-comment'>" +

                    escapeHtml(
                        review.comment
                    ) +

                    "</p>" +

                    "</div>";


                container.appendChild(
                    item
                );

            }
        );
}


/* =====================================================
   REVIEW SUMMARY
   ===================================================== */

function updateReviewSummary() {

    const countElement =
        document.getElementById(
            "reviewCount"
        );


    const averageElement =
        document.getElementById(
            "averageRating"
        );


    if (countElement) {

        countElement.textContent =
            myReviews.length;

    }


    if (averageElement) {

        if (
            myReviews.length === 0
        ) {

            averageElement.textContent =
                "0.0 / 5";

        } else {

            const total =
                myReviews.reduce(
                    function (
                        sum,
                        review
                    ) {

                        return sum +
                            Number(
                                review.rating || 0
                            );

                    },
                    0
                );


            const average =
                total /
                myReviews.length;


            averageElement.textContent =
                average.toFixed(1) +
                " / 5";
        }
    }
}


/* =====================================================
   CLEAR FORM
   ===================================================== */

function clearReviewForm() {

    const form =
        document.getElementById(
            "reviewForm"
        );


    if (form) {

        form.reset();

    }


    clearMessage();
}


/* =====================================================
   MESSAGE
   ===================================================== */

function showMessage(
    message,
    type
) {

    const box =
        document.getElementById(
            "reviewMessage"
        );


    if (!box) {
        return;
    }


    box.textContent =
        message;


    box.className =
        "message-box " +
        type;
}


function clearMessage() {

    const box =
        document.getElementById(
            "reviewMessage"
        );


    if (!box) {
        return;
    }


    box.textContent =
        "";


    box.className =
        "message-box";
}


/* =====================================================
   REFRESH
   ===================================================== */

function setupRefresh() {

    const button =
        document.getElementById(
            "refreshReviewsButton"
        );


    if (button) {

        button.addEventListener(
            "click",
            async function () {

                await loadReviews();

                await loadBookingData();

            }
        );

    }
}


/* =====================================================
   LOGOUT
   ===================================================== */

function setupLogout() {

    const button =
        document.getElementById(
            "passengerLogoutButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
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

        }
    );
}


/* =====================================================
   DATE FORMAT
   ===================================================== */

function formatDate(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
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