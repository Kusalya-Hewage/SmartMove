/* =========================================================
   SMARTMOVE - PASSENGER TRIPS
   SIDEBAR REMOVED
   ========================================================= */


let tripData = [];
let routeData = [];
let vehicleData = [];

let passengerData = null;


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const isPassenger =
            await checkPassenger();

        if (!isPassenger) {
            return;
        }

        setupSearchEvents();

        setupLogout();

        await loadPassenger();

        await loadTripData();
    }
);


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "passengerLogoutButton"
        );

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener(
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

            } catch (error) {

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
            user.role !== "PASSENGER"
        ) {

            alert(
                "Passenger access required."
            );

            window.location.href =
                "/index.html";

            return false;
        }

        sessionStorage.setItem(
            "role",
            user.role
        );

        if (user.id != null) {

            sessionStorage.setItem(
                "userId",
                user.id
            );
        }

        if (user.username) {

            sessionStorage.setItem(
                "username",
                user.username
            );
        }

        if (user.passengerId != null) {

            sessionStorage.setItem(
                "passengerId",
                user.passengerId
            );
        }

        return true;

    } catch (error) {

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
   LOAD PASSENGER
   ========================================================= */

async function loadPassenger() {

    try {

        const passengerId =
            sessionStorage.getItem(
                "passengerId"
            );

        const username =
            sessionStorage.getItem(
                "username"
            );

        const passengerNameElement =
            document.getElementById(
                "passengerName"
            );

        if (!passengerId) {

            if (
                passengerNameElement &&
                username
            ) {

                passengerNameElement.textContent =
                    username;
            }

            return;
        }

        const response =
            await fetch(
                `/api/passengers/${passengerId}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load passenger."
            );
        }

        passengerData =
            await response.json();

        if (passengerNameElement) {

            passengerNameElement.textContent =
                passengerData.fullName ||
                passengerData.name ||
                passengerData.username ||
                username ||
                "Passenger";
        }

    } catch (error) {

        console.error(
            "Passenger loading error:",
            error
        );

        const passengerNameElement =
            document.getElementById(
                "passengerName"
            );

        if (passengerNameElement) {

            passengerNameElement.textContent =
                sessionStorage.getItem(
                    "username"
                ) || "Passenger";
        }
    }
}


/* =========================================================
   LOAD TRIP DATA
   ========================================================= */

async function loadTripData() {

    try {

        showLoading();

        const [
            tripsResponse,
            routesResponse,
            vehiclesResponse
        ] = await Promise.all([

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
            ),

            fetch(
                "/api/vehicles",
                {
                    credentials: "include"
                }
            )
        ]);


        if (!tripsResponse.ok) {

            throw new Error(
                "Failed to load trips."
            );
        }


        tripData =
            await tripsResponse.json();


        if (routesResponse.ok) {

            routeData =
                await routesResponse.json();

        } else {

            routeData = [];
        }


        if (vehiclesResponse.ok) {

            vehicleData =
                await vehiclesResponse.json();

        } else {

            vehicleData = [];
        }


        applyFilters();

    } catch (error) {

        console.error(
            "Trip loading error:",
            error
        );

        showError(
            "Unable to load trips. Please try again."
        );
    }
}


/* =========================================================
   SEARCH EVENTS
   ========================================================= */

function setupSearchEvents() {

    const searchButton =
        document.getElementById(
            "searchTripsButton"
        );

    const searchInput =
        document.getElementById(
            "tripSearch"
        );

    const dateInput =
        document.getElementById(
            "tripDate"
        );

    const routeFilter =
        document.getElementById(
            "routeFilter"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            function () {

                applyFilters();
            }
        );
    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                applyFilters();
            }
        );
    }


    if (dateInput) {

        dateInput.addEventListener(
            "change",
            function () {

                applyFilters();
            }
        );
    }


    if (routeFilter) {

        routeFilter.addEventListener(
            "change",
            function () {

                applyFilters();
            }
        );
    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {

                applyFilters();
            }
        );
    }
}


/* =========================================================
   APPLY FILTERS
   ========================================================= */

function applyFilters() {

    if (!Array.isArray(tripData)) {

        renderTrips([]);

        return;
    }


    const searchInput =
        document.getElementById(
            "tripSearch"
        );

    const dateInput =
        document.getElementById(
            "tripDate"
        );

    const routeFilter =
        document.getElementById(
            "routeFilter"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const searchValue =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedDate =
        dateInput
            ? dateInput.value
            : "";


    const selectedRoute =
        routeFilter
            ? routeFilter.value
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "";


    const filteredTrips =
        tripData.filter(
            function (trip) {

                const route =
                    getRoute(trip.routeId);


                const routeText =
                    route
                        ? (
                            route.routeName ||
                            route.name ||
                            ""
                        ).toLowerCase()
                        : "";


                const tripText =
                    JSON.stringify(trip)
                        .toLowerCase();


                const matchesSearch =
                    !searchValue ||
                    tripText.includes(
                        searchValue
                    ) ||
                    routeText.includes(
                        searchValue
                    );


                const tripDate =
                    getTripDate(trip);


                const matchesDate =
                    !selectedDate ||
                    tripDate === selectedDate;


                const matchesRoute =
                    !selectedRoute ||
                    String(
                        trip.routeId
                    ) === String(
                        selectedRoute
                    );


                const tripStatus =
                    String(
                        trip.status ||
                        ""
                    ).toUpperCase();


                const matchesStatus =
                    !selectedStatus ||
                    tripStatus ===
                    selectedStatus.toUpperCase();


                return (
                    matchesSearch &&
                    matchesDate &&
                    matchesRoute &&
                    matchesStatus
                );
            }
        );


    renderTrips(
        filteredTrips
    );
}


/* =========================================================
   RENDER TRIPS
   ========================================================= */

function renderTrips(trips) {

    const container =
        document.getElementById(
            "tripsContainer"
        );


    if (!container) {
        return;
    }


    updateTripCount(
        trips.length
    );


    if (!trips.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No Trips Found</h3>
                <p>
                    No trips match your current search criteria.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        trips.map(
            function (trip) {

                return createTripCard(
                    trip
                );
            }
        ).join("");
}


/* =========================================================
   CREATE TRIP CARD
   ========================================================= */

function createTripCard(trip) {

    const route =
        getRoute(trip.routeId);

    const vehicle =
        getVehicle(trip.vehicleId);


    const routeName =
        route
            ? (
                route.routeName ||
                route.name ||
                "Unknown Route"
            )
            : "Unknown Route";


    const vehicleName =
        vehicle
            ? (
                vehicle.vehicleNumber ||
                vehicle.registrationNumber ||
                vehicle.number ||
                "Vehicle"
            )
            : "Not Assigned";


    const status =
        trip.status ||
        "AVAILABLE";


    const fare =
        trip.fare ??
        trip.price ??
        0;


    const seats =
        trip.availableSeats ??
        trip.seatsAvailable ??
        trip.capacity ??
        "-";


    const date =
        formatDate(
            trip.tripDate ||
            trip.date ||
            trip.departureDate
        );


    const departureTime =
        formatTime(
            trip.departureTime ||
            trip.startTime ||
            trip.time
        );


    const arrivalTime =
        formatTime(
            trip.arrivalTime ||
            trip.endTime
        );


    return `
        <div class="trip-card">

            <div class="trip-card-header">

                <div class="trip-card-title">
                    ${escapeHtml(routeName)}
                </div>

                <span class="status-badge">
                    ${escapeHtml(status)}
                </span>

            </div>


            <div class="trip-route">
                ${escapeHtml(routeName)}
            </div>


            <div class="trip-details">

                <div class="trip-detail">
                    <span class="trip-detail-label">
                        Date
                    </span>

                    <span class="trip-detail-value">
                        ${escapeHtml(date)}
                    </span>
                </div>


                <div class="trip-detail">
                    <span class="trip-detail-label">
                        Departure
                    </span>

                    <span class="trip-detail-value">
                        ${escapeHtml(departureTime)}
                    </span>
                </div>


                <div class="trip-detail">
                    <span class="trip-detail-label">
                        Arrival
                    </span>

                    <span class="trip-detail-value">
                        ${escapeHtml(arrivalTime)}
                    </span>
                </div>


                <div class="trip-detail">
                    <span class="trip-detail-label">
                        Vehicle
                    </span>

                    <span class="trip-detail-value">
                        ${escapeHtml(vehicleName)}
                    </span>
                </div>


                <div class="trip-detail">
                    <span class="trip-detail-label">
                        Available Seats
                    </span>

                    <span class="trip-detail-value">
                        ${escapeHtml(String(seats))}
                    </span>
                </div>


                <div class="trip-detail">

                    <span class="trip-detail-label">
                        Fare
                    </span>

                    <span class="trip-fare">
                        Rs. ${formatCurrency(fare)}
                    </span>

                </div>

            </div>


            <div class="trip-card-footer">

                <button
                    type="button"
                    class="select-trip-button"
                    onclick="selectTrip(${trip.id})"
                >
                    Select Trip
                </button>

            </div>

        </div>
    `;
}


/* =========================================================
   SELECT TRIP
   ========================================================= */

function selectTrip(tripId) {

    const trip =
        tripData.find(
            function (item) {

                return String(item.id) ===
                    String(tripId);
            }
        );


    if (!trip) {

        alert(
            "Trip information not found."
        );

        return;
    }


    sessionStorage.setItem(
        "selectedTripId",
        trip.id
    );


    sessionStorage.setItem(
        "selectedTrip",
        JSON.stringify(trip)
    );


    window.location.href =
        "/passenger-booking.html";
}


/* =========================================================
   GET ROUTE
   ========================================================= */

function getRoute(routeId) {

    return routeData.find(
        function (route) {

            return String(route.id) ===
                String(routeId);
        }
    ) || null;
}


/* =========================================================
   GET VEHICLE
   ========================================================= */

function getVehicle(vehicleId) {

    return vehicleData.find(
        function (vehicle) {

            return String(vehicle.id) ===
                String(vehicleId);
        }
    ) || null;
}


/* =========================================================
   GET TRIP DATE
   ========================================================= */

function getTripDate(trip) {

    const value =
        trip.tripDate ||
        trip.date ||
        trip.departureDate;


    if (!value) {
        return "";
    }


    if (
        typeof value === "string" &&
        value.length >= 10
    ) {

        return value.substring(
            0,
            10
        );
    }


    try {

        const date =
            new Date(value);

        if (isNaN(date.getTime())) {
            return "";
        }

        return date
            .toISOString()
            .substring(0, 10);

    } catch (error) {

        return "";
    }
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {

        return String(value);
    }


    return date.toLocaleDateString(
        "en-LK",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(value) {

    if (!value) {
        return "-";
    }


    if (
        typeof value === "string" &&
        value.length >= 5
    ) {

        if (
            value.includes(":") &&
            value.length <= 8
        ) {

            return value.substring(
                0,
                5
            );
        }
    }


    try {

        const date =
            new Date(value);


        if (isNaN(date.getTime())) {

            return String(value);
        }


        return date.toLocaleTimeString(
            "en-LK",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch (error) {

        return String(value);
    }
}


/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatCurrency(value) {

    const number =
        Number(value);


    if (isNaN(number)) {
        return "0.00";
    }


    return number.toLocaleString(
        "en-LK",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


/* =========================================================
   UPDATE TRIP COUNT
   ========================================================= */

function updateTripCount(count) {

    const element =
        document.getElementById(
            "tripCount"
        );


    if (!element) {
        return;
    }


    element.textContent =
        `${count} trip${count === 1 ? "" : "s"} found`;
}


/* =========================================================
   SHOW LOADING
   ========================================================= */

function showLoading() {

    const container =
        document.getElementById(
            "tripsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="loading">
            Loading available trips...
        </div>
    `;
}


/* =========================================================
   SHOW ERROR
   ========================================================= */

function showError(message) {

    const container =
        document.getElementById(
            "tripsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="error-state">
            ${escapeHtml(message)}
        </div>
    `;
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}