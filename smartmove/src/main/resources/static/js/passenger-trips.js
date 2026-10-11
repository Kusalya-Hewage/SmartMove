"use strict";

/* =========================================================
   SMARTMOVE - PASSENGER TRIPS
   ========================================================= */

let tripData = [];
let routeData = [];
let vehicleData = [];
let passengerData = null;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    const authenticated = await checkPassenger();

    if (!authenticated) {
        return;
    }

    setupSearchEvents();

    await loadPassenger();

    await loadTripData();

});


/* =========================================================
   AUTHENTICATION
   ========================================================= */

async function checkPassenger() {

    try {

        const response = await fetch(
            "/api/users/current-user",
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (!response.ok) {
            window.location.href = "/index.html";
            return false;
        }

        const user = await response.json();

        if (
            !user ||
            String(user.role || "").toUpperCase() !== "PASSENGER"
        ) {
            window.location.href = "/index.html";
            return false;
        }

        sessionStorage.setItem("role", "PASSENGER");

        /*
         * In this application's current login response,
         * userId represents the passenger ID for PASSENGER.
         */
        const passengerId =
            user.passengerId ?? user.userId ?? user.id;

        if (passengerId !== undefined && passengerId !== null) {
            sessionStorage.setItem(
                "passengerId",
                String(passengerId)
            );
        }

        if (user.userId !== undefined && user.userId !== null) {
            sessionStorage.setItem(
                "userId",
                String(user.userId)
            );
        }

        if (user.username) {
            sessionStorage.setItem(
                "username",
                user.username
            );
        }

        return true;

    } catch (error) {

        console.error("Passenger authentication error:", error);
        showError("Unable to verify your login. Please log in again.");

        return false;
    }
}


/* =========================================================
   LOAD PASSENGER NAME
   ========================================================= */

async function loadPassenger() {

    const nameElement = document.getElementById("passengerName");

    const username =
        sessionStorage.getItem("username") || "Passenger";

    if (nameElement) {
        nameElement.textContent = username;
    }

    const passengerId =
        sessionStorage.getItem("passengerId");

    if (!passengerId) {
        return;
    }

    try {

        const response = await fetch(
            `/api/passengers/${encodeURIComponent(passengerId)}`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (!response.ok) {
            return;
        }

        passengerData = await response.json();

        const name =
            passengerData.fullName ||
            passengerData.name ||
            `${passengerData.firstName || ""} ${passengerData.lastName || ""}`.trim() ||
            username;

        if (nameElement) {
            nameElement.textContent = name;
        }

        const avatar = document.querySelector(".profile-avatar");

        if (avatar) {
            avatar.textContent =
                name.charAt(0).toUpperCase() || "P";
        }

    } catch (error) {

        console.error("Passenger information loading error:", error);

    }
}


/* =========================================================
   LOAD TRIPS, ROUTES AND VEHICLES
   ========================================================= */

async function loadTripData() {

    showLoading();

    const refreshButton =
        document.getElementById("refreshTripsButton");

    if (refreshButton) {
        refreshButton.disabled = true;
        refreshButton.textContent = "Loading...";
    }

    try {

        const [
            tripsResponse,
            routesResponse,
            vehiclesResponse
        ] = await Promise.all([

            fetch("/api/trips", {
                method: "GET",
                credentials: "include"
            }),

            fetch("/api/routes", {
                method: "GET",
                credentials: "include"
            }),

            fetch("/api/vehicles", {
                method: "GET",
                credentials: "include"
            })

        ]);

        if (!tripsResponse.ok) {
            throw new Error(
                `Unable to load trips. Server returned ${tripsResponse.status}.`
            );
        }

        const tripsResult = await tripsResponse.json();
        tripData = getArrayFromResponse(tripsResult);

        if (routesResponse.ok) {
            routeData = getArrayFromResponse(
                await routesResponse.json()
            );
        } else {
            routeData = [];
            console.warn("Routes could not be loaded.");
        }

        if (vehiclesResponse.ok) {
            vehicleData = getArrayFromResponse(
                await vehiclesResponse.json()
            );
        } else {
            vehicleData = [];
            console.warn("Vehicles could not be loaded.");
        }

        /*
         * Empty API result is different from an API failure.
         */
        applyFilters();

    } catch (error) {

        console.error("Trip loading error:", error);

        showError(error.message || "Unable to load available trips.");

    } finally {

        if (refreshButton) {
            refreshButton.disabled = false;
            refreshButton.textContent = "Refresh";
        }
    }
}


/* =========================================================
   HANDLE API RESPONSE ARRAYS
   Supports an array or a paginated response.
   ========================================================= */

function getArrayFromResponse(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (data && Array.isArray(data.content)) {
        return data.content;
    }

    if (data && Array.isArray(data.data)) {
        return data.data;
    }

    if (data && Array.isArray(data.items)) {
        return data.items;
    }

    return [];
}


/* =========================================================
   SEARCH EVENTS
   ========================================================= */

function setupSearchEvents() {

    const searchButton =
        document.getElementById("searchButton");

    const clearButton =
        document.getElementById("clearSearchButton");

    const refreshButton =
        document.getElementById("refreshTripsButton");

    const sourceInput =
        document.getElementById("sourceSearch");

    const destinationInput =
        document.getElementById("destinationSearch");

    const dateInput =
        document.getElementById("tripDateSearch");

    const statusInput =
        document.getElementById("tripStatusFilter");


    if (searchButton) {
        searchButton.addEventListener("click", applyFilters);
    }

    if (clearButton) {
        clearButton.addEventListener("click", clearSearch);
    }

    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            loadTripData
        );
    }

    if (sourceInput) {
        sourceInput.addEventListener("input", applyFilters);
    }

    if (destinationInput) {
        destinationInput.addEventListener("input", applyFilters);
    }

    if (dateInput) {
        dateInput.addEventListener("change", applyFilters);
    }

    if (statusInput) {
        statusInput.addEventListener("change", applyFilters);
    }
}


/* =========================================================
   APPLY FILTERS
   ========================================================= */

function applyFilters() {

    const source =
        getElementValue("sourceSearch").toLowerCase();

    const destination =
        getElementValue("destinationSearch").toLowerCase();

    const selectedDate =
        getElementValue("tripDateSearch");

    const selectedStatus =
        getElementValue("tripStatusFilter").toUpperCase();


    const filteredTrips = tripData.filter(function (trip) {

        const route = getTripRoute(trip);

        const origin =
            getRouteSource(route).toLowerCase();

        const destinationName =
            getRouteDestination(route).toLowerCase();

        const routeName =
            getRouteName(route).toLowerCase();


        const matchesSource =
            !source ||
            origin.includes(source) ||
            routeName.includes(source);

        const matchesDestination =
            !destination ||
            destinationName.includes(destination) ||
            routeName.includes(destination);

        const matchesDate =
            !selectedDate ||
            getTripDate(trip) === selectedDate;

        const status =
            String(trip.status || "SCHEDULED").toUpperCase();

        const matchesStatus =
            !selectedStatus ||
            status === selectedStatus;

        return (
            matchesSource &&
            matchesDestination &&
            matchesDate &&
            matchesStatus
        );
    });

    renderTrips(filteredTrips);
}


/* =========================================================
   CLEAR SEARCH
   ========================================================= */

function clearSearch() {

    setElementValue("sourceSearch", "");
    setElementValue("destinationSearch", "");
    setElementValue("tripDateSearch", "");

    /*
     * Return to the default Scheduled filter.
     */
    setElementValue("tripStatusFilter", "SCHEDULED");

    applyFilters();
}


/* =========================================================
   TRIP IDENTIFIER
   Supports Java entity IDs and older id fields.
   ========================================================= */

function getTripId(trip) {

    return (
        trip.tripId ??
        trip.id ??
        trip.trip_id ??
        ""
    );
}


/* =========================================================
   ROUTE LOOKUP
   ========================================================= */

function getTripRoute(trip) {

    if (trip.route && typeof trip.route === "object") {
        return trip.route;
    }

    const routeId =
        trip.routeId ??
        trip.route_id;

    return routeData.find(function (route) {

        const id =
            route.routeId ??
            route.id ??
            route.route_id;

        return String(id) === String(routeId);

    }) || {};
}


/* =========================================================
   VEHICLE LOOKUP
   ========================================================= */

function getTripVehicle(trip) {

    if (trip.vehicle && typeof trip.vehicle === "object") {
        return trip.vehicle;
    }

    const vehicleId =
        trip.vehicleId ??
        trip.vehicle_id;

    return vehicleData.find(function (vehicle) {

        const id =
            vehicle.vehicleId ??
            vehicle.id ??
            vehicle.vehicle_id;

        return String(id) === String(vehicleId);

    }) || {};
}


/* =========================================================
   ROUTE NAME
   ========================================================= */

function getRouteName(route) {

    if (!route) {
        return "Route information unavailable";
    }

    const name =
        route.routeName ??
        route.name ??
        route.route ??
        "";

    if (name) {
        return String(name);
    }

    const source = getRouteSource(route);
    const destination = getRouteDestination(route);

    if (source && destination) {
        return `${source} - ${destination}`;
    }

    return "Route information unavailable";
}


/* =========================================================
   ROUTE SOURCE
   ========================================================= */

function getRouteSource(route) {

    if (!route) {
        return "";
    }

    const directSource =
        route.sourceLocation ??
        route.source ??
        route.origin ??
        route.startLocation ??
        route.from ??
        route.startPoint ??
        "";

    if (directSource) {
        return String(directSource);
    }

    const routeName = String(
        route.routeName ??
        route.name ??
        ""
    );

    const parts = routeName.split(/\s*(?:-|–|—|→|\bto\b)\s*/i);

    return parts.length >= 2 ? parts[0] : routeName;
}


/* =========================================================
   ROUTE DESTINATION
   ========================================================= */

function getRouteDestination(route) {

    if (!route) {
        return "";
    }

    const directDestination =
        route.destinationLocation ??
        route.destination ??
        route.dest ??
        route.endLocation ??
        route.to ??
        route.endPoint ??
        "";

    if (directDestination) {
        return String(directDestination);
    }

    const routeName = String(
        route.routeName ??
        route.name ??
        ""
    );

    const parts = routeName.split(/\s*(?:-|–|—|→|\bto\b)\s*/i);

    return parts.length >= 2 ? parts.slice(1).join(" - ") : "";
}


/* =========================================================
   VEHICLE NAME
   ========================================================= */

function getVehicleName(vehicle) {

    if (!vehicle || Object.keys(vehicle).length === 0) {
        return "Not assigned";
    }

    return (
        vehicle.registrationNo ??
        vehicle.registrationNumber ??
        vehicle.vehicleNumber ??
        vehicle.number ??
        "Vehicle assigned"
    );
}


/* =========================================================
   TRIP DATE
   ========================================================= */

function getTripDate(trip) {

    const value =
        trip.tripDate ??
        trip.departureDate ??
        trip.date ??
        trip.departureDateTime ??
        trip.departureTime ??
        "";

    if (!value) {
        return "";
    }

    if (Array.isArray(value)) {
        const year = value[0];
        const month = String(value[1] || "").padStart(2, "0");
        const day = String(value[2] || "").padStart(2, "0");

        if (year && month && day) {
            return `${year}-${month}-${day}`;
        }
    }

    return String(value).substring(0, 10);
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(value) {

    if (!value) {
        return "Not specified";
    }

    const dateString = String(value).substring(0, 10);
    const parts = dateString.split("-");

    if (
        parts.length === 3 &&
        parts[0].length === 4
    ) {
        const date = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString("en-LK", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        }
    }

    return dateString;
}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(value) {

    if (!value) {
        return "Not specified";
    }

    if (Array.isArray(value)) {
        const hours = String(value[0] ?? 0).padStart(2, "0");
        const minutes = String(value[1] ?? 0).padStart(2, "0");

        return `${hours}:${minutes}`;
    }

    const text = String(value);

    /*
     * Handles LocalTime values such as 06:30:00
     * and ISO date-time values such as 2026-10-05T06:30:00.
     */
    const match = text.match(/T?(\d{2}):(\d{2})(?::\d{2})?/);

    if (match) {
        return `${match[1]}:${match[2]}`;
    }

    return text;
}


/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatCurrency(value) {

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "0.00";
    }

    return amount.toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


/* =========================================================
   GET AVAILABLE SEATS
   ========================================================= */

function getAvailableSeats(trip, vehicle) {

    const seats =
        trip.availableSeats ??
        trip.seatsAvailable ??
        trip.remainingSeats ??
        trip.availableSeatCount;

    if (
        seats !== undefined &&
        seats !== null &&
        seats !== ""
    ) {
        const number = Number(seats);

        return Number.isFinite(number) ? number : null;
    }

    /*
     * If the API doesn't provide a separate available-seat value,
     * show vehicle/trip capacity as a fallback.
     */
    const capacity =
        trip.capacity ??
        trip.totalSeats ??
        vehicle.capacity ??
        vehicle.seatCapacity ??
        vehicle.seats;

    if (
        capacity !== undefined &&
        capacity !== null &&
        capacity !== ""
    ) {
        const number = Number(capacity);

        return Number.isFinite(number) ? number : null;
    }

    return null;
}


/* =========================================================
   NORMALIZE STATUS CLASS
   ========================================================= */

function getStatusClass(status) {

    const normalized =
        String(status || "").toUpperCase();

    switch (normalized) {

        case "SCHEDULED":
        case "AVAILABLE":
            return "scheduled";

        case "COMPLETED":
            return "completed";

        case "CANCELLED":
            return "cancelled";

        case "IN_PROGRESS":
            return "in-progress";

        default:
            return "unknown";
    }
}


/* =========================================================
   RENDER TRIPS
   ========================================================= */

function renderTrips(trips) {

    const container =
        document.getElementById("tripsContainer");

    if (!container) {
        return;
    }

    const tripCount =
        document.getElementById("tripCount");

    const seatCount =
        document.getElementById("seatCount");


    if (tripCount) {
        tripCount.textContent = String(trips.length);
    }

    let totalAvailableSeats = 0;
    let knownSeatCounts = 0;

    trips.forEach(function (trip) {

        const vehicle = getTripVehicle(trip);
        const seats = getAvailableSeats(trip, vehicle);

        if (seats !== null) {
            totalAvailableSeats += seats;
            knownSeatCounts++;
        }
    });

    if (seatCount) {
        seatCount.textContent =
            knownSeatCounts > 0
                ? String(totalAvailableSeats)
                : "—";
    }


    if (trips.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No Trips Found</h3>
                <p>
                    No trips match your search.
                    Try another route or date, or select All under Status.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        trips.map(createTripCard).join("");


    /*
     * Attach click handlers after rendering.
     * Avoid inline JavaScript in generated HTML.
     */
    container.querySelectorAll(".select-trip-button").forEach(
        function (button) {

            button.addEventListener("click", function () {

                selectTrip(button.dataset.tripId);

            });
        }
    );
}


/* =========================================================
   CREATE TRIP CARD
   ========================================================= */

function createTripCard(trip) {

    const tripId = getTripId(trip);

    const route = getTripRoute(trip);

    const vehicle = getTripVehicle(trip);

    const routeName = getRouteName(route);

    const source = getRouteSource(route);

    const destination = getRouteDestination(route);

    const vehicleName = getVehicleName(vehicle);

    const status =
        String(trip.status || "SCHEDULED").toUpperCase();

    const fare =
        trip.fare ??
        trip.ticketPrice ??
        trip.price ??
        trip.fareAmount ??
        0;

    const seats = getAvailableSeats(trip, vehicle);

    const date = formatDate(getTripDate(trip));

    const departureTime = formatTime(
        trip.departureTime ??
        trip.startTime ??
        trip.departureDateTime
    );

    const arrivalTime = formatTime(
        trip.arrivalTime ??
        trip.endTime ??
        trip.arrivalDateTime
    );

    const statusClass = getStatusClass(status);

    const noSeats =
        seats !== null && seats <= 0;

    const canBook =
        ["SCHEDULED", "AVAILABLE"].includes(status) &&
        !noSeats &&
        tripId !== null &&
        tripId !== undefined &&
        tripId !== "";


    const routeDisplay =
        source && destination
            ? `${escapeHtml(source)} <span class="route-arrow">→</span> ${escapeHtml(destination)}`
            : escapeHtml(routeName);


    return `
        <article class="trip-card">

            <div class="trip-card-header">

                <div class="trip-card-title">
                    ${escapeHtml(routeName)}
                </div>

                <span class="trip-status ${statusClass}">
                    ${escapeHtml(status.replaceAll("_", " "))}
                </span>

            </div>


            <div class="trip-route">
                ${routeDisplay}
            </div>


            <div class="trip-details">

                <div class="trip-detail">
                    <span class="trip-detail-label">Travel Date</span>
                    <span class="trip-detail-value">${escapeHtml(date)}</span>
                </div>

                <div class="trip-detail">
                    <span class="trip-detail-label">Departure</span>
                    <span class="trip-detail-value">${escapeHtml(departureTime)}</span>
                </div>

                <div class="trip-detail">
                    <span class="trip-detail-label">Arrival</span>
                    <span class="trip-detail-value">${escapeHtml(arrivalTime)}</span>
                </div>

                <div class="trip-detail">
                    <span class="trip-detail-label">Vehicle</span>
                    <span class="trip-detail-value">${escapeHtml(vehicleName)}</span>
                </div>

                <div class="trip-detail">
                    <span class="trip-detail-label">Available Seats</span>
                    <span class="trip-detail-value">
                        ${seats === null ? "Not provided" : escapeHtml(String(seats))}
                    </span>
                </div>

                <div class="trip-detail">
                    <span class="trip-detail-label">Ticket Fare</span>
                    <span class="trip-fare">
                        Rs. ${formatCurrency(fare)}
                    </span>
                </div>

            </div>


            <div class="trip-card-footer">

                <button
                    type="button"
                    class="select-trip-button"
                    data-trip-id="${escapeAttribute(String(tripId))}"
                    ${canBook ? "" : "disabled"}
                >
                    ${noSeats ? "No Seats Available" :
        (canBook ? "Select Trip" : "Not Available")}
                </button>

            </div>

        </article>
    `;
}


/* =========================================================
   SELECT TRIP
   ========================================================= */

function selectTrip(tripId) {

    const trip = tripData.find(function (item) {

        return String(getTripId(item)) === String(tripId);

    });

    if (!trip) {

        alert("Trip information could not be found.");

        return;
    }

    const status =
        String(trip.status || "SCHEDULED").toUpperCase();

    if (!["SCHEDULED", "AVAILABLE"].includes(status)) {

        alert("This trip is not available for booking.");

        return;
    }

    const vehicle = getTripVehicle(trip);
    const seats = getAvailableSeats(trip, vehicle);

    if (seats !== null && seats <= 0) {

        alert("No seats are available on this trip.");

        return;
    }

    const tripIdValue = getTripId(trip);

    const fare =
        trip.fare ??
        trip.ticketPrice ??
        trip.price ??
        trip.fareAmount ??
        0;


    /*
     * These values are used by the booking page.
     */
    sessionStorage.setItem(
        "selectedTripId",
        String(tripIdValue)
    );

    sessionStorage.setItem(
        "selectedTripFare",
        String(fare)
    );

    sessionStorage.setItem(
        "selectedTrip",
        JSON.stringify(trip)
    );


    window.location.href =
        "/passenger-booking.html";
}


/* =========================================================
   SHOW LOADING
   ========================================================= */

function showLoading() {

    const container =
        document.getElementById("tripsContainer");

    const tripCount =
        document.getElementById("tripCount");

    const seatCount =
        document.getElementById("seatCount");

    if (tripCount) {
        tripCount.textContent = "0";
    }

    if (seatCount) {
        seatCount.textContent = "—";
    }

    if (container) {

        container.innerHTML = `
            <div class="loading">
                Loading available trips...
            </div>
        `;
    }
}


/* =========================================================
   SHOW ERROR
   ========================================================= */

function showError(message) {

    const container =
        document.getElementById("tripsContainer");

    const tripCount =
        document.getElementById("tripCount");

    const seatCount =
        document.getElementById("seatCount");

    if (tripCount) {
        tripCount.textContent = "0";
    }

    if (seatCount) {
        seatCount.textContent = "—";
    }

    if (container) {

        container.innerHTML = `
            <div class="error-state">
                <strong>Unable to load trips</strong>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    }
}


/* =========================================================
   HELPERS
   ========================================================= */

function getElementValue(id) {

    const element = document.getElementById(id);

    return element ? element.value.trim() : "";
}


function setElementValue(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.value = value;
    }
}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}