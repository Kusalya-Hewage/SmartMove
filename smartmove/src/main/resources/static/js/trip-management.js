/* =========================================================
   SMARTMOVE - TRIP MANAGEMENT
   ========================================================= */


/* =========================================================
   VARIABLES
   ========================================================= */

let editingTripId = null;

let tripRoutes = [];

let tripVehicles = [];

let tripDrivers = [];


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const isAdmin =
            await checkTripAdmin();

        if (!isAdmin) {
            return;
        }


        setupBackButton();

        setupTripManagement();

        await loadTrips();

    }
);


/* =========================================================
   CHECK ADMIN LOGIN
   ========================================================= */

async function checkTripAdmin() {

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
            !user.role ||
            user.role.toUpperCase() !== "ADMIN"
        ) {

            window.location.href =
                "/index.html";

            return false;
        }


        const usernameElement =
            document.getElementById(
                "adminUsername"
            );


        if (usernameElement) {

            usernameElement.textContent =
                user.username || "Admin";
        }


        return true;


    } catch (error) {

        console.error(
            "Admin authentication error:",
            error
        );


        window.location.href =
            "/index.html";


        return false;
    }
}


/* =========================================================
   BACK TO DASHBOARD
   ========================================================= */

function setupBackButton() {

    const button =
        document.getElementById(
            "backToDashboardButton"
        );


    if (button) {

        button.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/admin-dashboard.html";

            }
        );
    }
}


/* =========================================================
   SETUP TRIP MANAGEMENT
   ========================================================= */

function setupTripManagement() {

    const addButton =
        document.getElementById(
            "showTripFormButton"
        );


    const closeButton =
        document.getElementById(
            "closeTripFormButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelTripButton"
        );


    const refreshButton =
        document.getElementById(
            "refreshTripsButton"
        );


    const form =
        document.getElementById(
            "tripForm"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            openTripForm
        );
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeTripForm
        );
    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeTripForm
        );
    }


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadTrips
        );
    }


    if (form) {

        form.addEventListener(
            "submit",
            saveTrip
        );
    }


    loadTripDropdowns();
}


/* =========================================================
   LOAD ROUTES / VEHICLES / DRIVERS
   ========================================================= */

async function loadTripDropdowns() {

    try {

        const [
            routesResponse,
            vehiclesResponse,
            driversResponse
        ] = await Promise.all([

            fetch(
                "/api/routes",
                {
                    method: "GET",
                    credentials: "include"
                }
            ),

            fetch(
                "/api/vehicles",
                {
                    method: "GET",
                    credentials: "include"
                }
            ),

            fetch(
                "/api/drivers",
                {
                    method: "GET",
                    credentials: "include"
                }
            )

        ]);


        if (
            !routesResponse.ok ||
            !vehiclesResponse.ok ||
            !driversResponse.ok
        ) {

            throw new Error(
                "Could not load trip selection data."
            );
        }


        tripRoutes =
            await routesResponse.json();


        tripVehicles =
            await vehiclesResponse.json();


        tripDrivers =
            await driversResponse.json();


        populateTripDropdowns();


    } catch (error) {

        console.error(
            "Trip dropdown loading error:",
            error
        );
    }
}


/* =========================================================
   POPULATE DROPDOWNS
   ========================================================= */

function populateTripDropdowns() {

    const routeSelect =
        document.getElementById(
            "tripRouteId"
        );


    const vehicleSelect =
        document.getElementById(
            "tripVehicleId"
        );


    const driverSelect =
        document.getElementById(
            "tripDriverId"
        );


    if (
        !routeSelect ||
        !vehicleSelect ||
        !driverSelect
    ) {

        return;
    }


    routeSelect.innerHTML =
        `<option value="">
            Select Route
        </option>`;


    vehicleSelect.innerHTML =
        `<option value="">
            Select Vehicle
        </option>`;


    driverSelect.innerHTML =
        `<option value="">
            Select Driver
        </option>`;


    tripRoutes.forEach(
        route => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                route.routeId;


            option.textContent =
                `${route.routeName}
                 (${route.sourceLocation}
                 → ${route.destinationLocation})`;


            routeSelect.appendChild(
                option
            );
        }
    );


    tripVehicles
        .filter(
            vehicle =>
                vehicle.status === "ACTIVE"
        )
        .forEach(
            vehicle => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    vehicle.vehicleId;


                option.textContent =
                    `${vehicle.registrationNo}
                     - ${vehicle.brand || ""}
                     ${vehicle.model || ""}
                     (${vehicle.seatingCapacity} seats)`;


                vehicleSelect.appendChild(
                    option
                );
            }
        );


    tripDrivers
        .filter(
            driver =>
                driver.status === "ACTIVE"
        )
        .forEach(
            driver => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    driver.driverId;


                option.textContent =
                    `${driver.firstName || ""}
                     ${driver.lastName || ""}`;


                driverSelect.appendChild(
                    option
                );
            }
        );
}


/* =========================================================
   OPEN FORM
   ========================================================= */

function openTripForm() {

    editingTripId = null;


    const form =
        document.getElementById(
            "tripForm"
        );


    if (!form) {
        return;
    }


    form.reset();


    document.getElementById(
        "tripId"
    ).value = "";


    document.getElementById(
        "tripFormTitle"
    ).textContent =
        "Schedule Trip";


    document.getElementById(
        "saveTripButton"
    ).textContent =
        "Schedule Trip";


    document.getElementById(
        "tripStatus"
    ).value =
        "SCHEDULED";


    document.getElementById(
        "tripFormMessage"
    ).textContent =
        "";


    document.getElementById(
        "tripFormPanel"
    ).style.display =
        "block";
}


/* =========================================================
   CLOSE FORM
   ========================================================= */

function closeTripForm() {

    editingTripId = null;


    const panel =
        document.getElementById(
            "tripFormPanel"
        );


    const form =
        document.getElementById(
            "tripForm"
        );


    if (panel) {

        panel.style.display =
            "none";
    }


    if (form) {

        form.reset();
    }


    const message =
        document.getElementById(
            "tripFormMessage"
        );


    if (message) {

        message.textContent = "";
    }
}


/* =========================================================
   LOAD TRIPS
   ========================================================= */

async function loadTrips() {

    const container =
        document.getElementById(
            "tripsContent"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        `<div class="loading">
            Loading trips...
        </div>`;


    try {

        const response =
            await fetch(
                "/api/trips",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            if (response.status === 401) {

                window.location.href =
                    "/index.html";

                return;
            }


            throw new Error(
                "Could not load trips."
            );
        }


        const trips =
            await response.json();


        displayTrips(
            trips
        );


    } catch (error) {

        container.innerHTML =
            `<div class="empty-section">
                ${escapeHtml(
                error.message
            )}
            </div>`;
    }
}


/* =========================================================
   DISPLAY TRIPS
   ========================================================= */

function displayTrips(trips) {

    const container =
        document.getElementById(
            "tripsContent"
        );


    if (
        !Array.isArray(trips) ||
        trips.length === 0
    ) {

        container.innerHTML =
            `<div class="empty-section">
                No trips found.
            </div>`;

        return;
    }


    let html = `

        <div style="overflow-x:auto;">

            <table class="trip-table">

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Route</th>

                        <th>Vehicle</th>

                        <th>Driver</th>

                        <th>Date</th>

                        <th>Departure</th>

                        <th>Arrival</th>

                        <th>Seats</th>

                        <th>Fare</th>

                        <th>Status</th>

                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

    `;


    trips.forEach(
        trip => {

            const routeName =
                trip.route?.routeName
                ||
                trip.routeName
                ||
                getRouteName(
                    trip.routeId
                );


            const vehicleName =
                trip.vehicle?.registrationNo
                ||
                trip.registrationNo
                ||
                getVehicleName(
                    trip.vehicleId
                );


            const driverName =
                getTripDriverName(
                    trip
                );


            const status =
                trip.tripStatus
                ||
                "SCHEDULED";


            const statusClass =
                getTripStatusClass(
                    status
                );


            html += `

                <tr>

                    <td>
                        ${safeValue(
                trip.tripId
            )}
                    </td>


                    <td>
                        ${safeValue(
                routeName
            )}
                    </td>


                    <td>
                        ${safeValue(
                vehicleName
            )}
                    </td>


                    <td>
                        ${safeValue(
                driverName
            )}
                    </td>


                    <td>
                        ${safeValue(
                formatDate(
                    trip.tripDate
                )
            )}
                    </td>


                    <td>
                        ${safeValue(
                formatTime(
                    trip.departureTime
                )
            )}
                    </td>


                    <td>
                        ${safeValue(
                formatTime(
                    trip.arrivalTime
                )
            )}
                    </td>


                    <td>
                        ${safeValue(
                trip.availableSeats
            )}
                    </td>


                    <td>
                        Rs.
                        ${safeValue(
                trip.fare
            )}
                    </td>


                    <td>

                        <span
                            class="trip-status-badge
                            ${statusClass}">

                            ${safeValue(
                status
            )}

                        </span>

                    </td>


                    <td>

                        <div class="action-buttons">

                            <button
                                    type="button"
                                    class="edit-button"
                                    onclick="editTrip(${trip.tripId})">

                                Edit

                            </button>


                            <button
                                    type="button"
                                    class="delete-button"
                                    onclick="deleteTrip(${trip.tripId})">

                                Delete

                            </button>

                        </div>

                    </td>

                </tr>

            `;
        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML =
        html;
}


/* =========================================================
   SAVE TRIP
   ========================================================= */

async function saveTrip(event) {

    event.preventDefault();


    const tripId =
        document.getElementById(
            "tripId"
        ).value;


    const routeId =
        document.getElementById(
            "tripRouteId"
        ).value;


    const vehicleId =
        document.getElementById(
            "tripVehicleId"
        ).value;


    const driverId =
        document.getElementById(
            "tripDriverId"
        ).value;


    const tripDate =
        document.getElementById(
            "tripDate"
        ).value;


    const departureTime =
        document.getElementById(
            "departureTime"
        ).value;


    const arrivalTime =
        document.getElementById(
            "arrivalTime"
        ).value;


    if (
        !routeId ||
        !vehicleId ||
        !driverId
    ) {

        showTripMessage(
            "Please select route, vehicle and driver.",
            true
        );

        return;
    }


    if (
        !tripDate ||
        !departureTime
    ) {

        showTripMessage(
            "Trip date and departure time are required.",
            true
        );

        return;
    }


    if (arrivalTime) {

        if (
            arrivalTime <= departureTime
        ) {

            showTripMessage(
                "Arrival time must be later than departure time.",
                true
            );

            return;
        }
    }


    const trip = {

        route: {
            routeId:
                Number(routeId)
        },

        vehicle: {
            vehicleId:
                Number(vehicleId)
        },

        driver: {
            driverId:
                Number(driverId)
        },

        tripDate:
        tripDate,

        departureTime:
            buildDateTime(
                tripDate,
                departureTime
            ),

        arrivalTime:
            buildDateTime(
                tripDate,
                arrivalTime
            ),

        fare:
            Number(
                document.getElementById(
                    "tripFare"
                ).value
            ),

        tripStatus:
        document.getElementById(
            "tripStatus"
        ).value
    };


    const button =
        document.getElementById(
            "saveTripButton"
        );


    button.disabled = true;


    button.textContent =
        tripId
            ? "Updating..."
            : "Scheduling...";


    try {

        let url =
            "/api/trips";


        let method =
            "POST";


        if (tripId) {

            url =
                "/api/trips/"
                + tripId;


            method =
                "PUT";
        }


        const response =
            await fetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify(
                            trip
                        )
                }
            );


        const contentType =
            response.headers.get(
                "content-type"
            );


        let result;


        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            result =
                await response.json();

        } else {

            result =
                await response.text();
        }


        if (!response.ok) {

            throw new Error(

                typeof result === "string"

                    ? result

                    : result.message
                    ||
                    result.error
                    ||
                    "Trip operation failed."
            );
        }


        showTripMessage(

            tripId
                ? "Trip updated successfully."
                : "Trip scheduled successfully.",

            false
        );


        await loadTrips();


        setTimeout(
            closeTripForm,
            700
        );


    } catch (error) {

        showTripMessage(
            error.message,
            true
        );


    } finally {

        button.disabled = false;


        button.textContent =
            tripId
                ? "Update Trip"
                : "Schedule Trip";
    }
}


/* =========================================================
   EDIT TRIP
   ========================================================= */

async function editTrip(tripId) {

    try {

        const response =
            await fetch(
                "/api/trips/"
                + tripId,
                {
                    method: "GET",

                    credentials:
                        "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not load trip."
            );
        }


        const trip =
            await response.json();


        editingTripId =
            tripId;


        document.getElementById(
            "tripId"
        ).value =
            trip.tripId;


        const routeId =
            trip.routeId
            ||
            trip.route?.routeId;


        const vehicleId =
            trip.vehicleId
            ||
            trip.vehicle?.vehicleId;


        const driverId =
            trip.driverId
            ||
            trip.driver?.driverId;


        document.getElementById(
            "tripRouteId"
        ).value =
            routeId || "";


        document.getElementById(
            "tripVehicleId"
        ).value =
            vehicleId || "";


        document.getElementById(
            "tripDriverId"
        ).value =
            driverId || "";


        document.getElementById(
            "tripDate"
        ).value =
            extractDate(
                trip.tripDate
            );


        document.getElementById(
            "departureTime"
        ).value =
            extractTime(
                trip.departureTime
            );


        document.getElementById(
            "arrivalTime"
        ).value =
            extractTime(
                trip.arrivalTime
            );


        document.getElementById(
            "tripFare"
        ).value =
            trip.fare || "";


        document.getElementById(
            "tripStatus"
        ).value =
            trip.tripStatus
            ||
            "SCHEDULED";


        document.getElementById(
            "tripFormTitle"
        ).textContent =
            "Edit Trip";


        document.getElementById(
            "saveTripButton"
        ).textContent =
            "Update Trip";


        document.getElementById(
            "tripFormMessage"
        ).textContent =
            "";


        document.getElementById(
            "tripFormPanel"
        ).style.display =
            "block";


        document
            .getElementById(
                "tripFormPanel"
            )
            .scrollIntoView({
                behavior: "smooth"
            });


    } catch (error) {

        alert(
            error.message
        );
    }
}


/* =========================================================
   DELETE TRIP
   ========================================================= */

async function deleteTrip(tripId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this trip?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/trips/"
                + tripId,
                {
                    method: "DELETE",

                    credentials:
                        "include"
                }
            );


        const contentType =
            response.headers.get(
                "content-type"
            );


        let result;


        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            result =
                await response.json();

        } else {

            result =
                await response.text();
        }


        if (!response.ok) {

            throw new Error(

                typeof result === "string"

                    ? result

                    : result.message
                    ||
                    result.error
                    ||
                    "Could not delete trip."
            );
        }


        alert(
            "Trip deleted successfully."
        );


        await loadTrips();


    } catch (error) {

        alert(
            error.message
        );
    }
}


/* =========================================================
   GET ROUTE NAME
   ========================================================= */

function getRouteName(routeId) {

    const route =
        tripRoutes.find(
            item =>
                Number(item.routeId)
                ===
                Number(routeId)
        );


    if (!route) {

        return routeId || "-";
    }


    return route.routeName;
}


/* =========================================================
   GET VEHICLE NAME
   ========================================================= */

function getVehicleName(vehicleId) {

    const vehicle =
        tripVehicles.find(
            item =>
                Number(item.vehicleId)
                ===
                Number(vehicleId)
        );


    if (!vehicle) {

        return vehicleId || "-";
    }


    return vehicle.registrationNo;
}


/* =========================================================
   GET DRIVER NAME
   ========================================================= */

function getTripDriverName(trip) {

    if (trip.driver) {

        return (

            `${trip.driver.firstName || ""}
             ${trip.driver.lastName || ""}`

        ).trim();
    }


    if (trip.driverName) {

        return trip.driverName;
    }


    const driverId =
        trip.driverId;


    if (!driverId) {

        return "-";
    }


    const driver =
        tripDrivers.find(
            item =>
                Number(item.driverId)
                ===
                Number(driverId)
        );


    if (!driver) {

        return driverId;
    }


    return (

        `${driver.firstName || ""}
         ${driver.lastName || ""}`

    ).trim();
}


/* =========================================================
   TRIP STATUS CLASS
   ========================================================= */

function getTripStatusClass(status) {

    switch (
        String(status).toUpperCase()
        ) {

        case "ONGOING":

            return "trip-status-ongoing";


        case "COMPLETED":

            return "trip-status-completed";


        case "CANCELLED":

            return "trip-status-cancelled";


        default:

            return "trip-status-scheduled";
    }
}


/* =========================================================
   BUILD DATE TIME
   ========================================================= */

function buildDateTime(date, time) {

    if (!date || !time) {

        return null;
    }


    return date
        + "T"
        + time
        + ":00";
}


/* =========================================================
   EXTRACT DATE
   ========================================================= */

function extractDate(value) {

    if (!value) {

        return "";
    }


    return String(value)
        .substring(0, 10);
}


/* =========================================================
   EXTRACT TIME
   ========================================================= */

function extractTime(value) {

    if (!value) {

        return "";
    }


    const text =
        String(value);


    const timePart =
        text.includes("T")
            ? text.split("T")[1]
            : text.split(" ")[1];


    if (!timePart) {

        return "";
    }


    return timePart
        .substring(0, 5);
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(value) {

    if (!value) {

        return "-";
    }


    const date =
        extractDate(value);


    if (!date) {

        return "-";
    }


    const parts =
        date.split("-");


    if (parts.length !== 3) {

        return date;
    }


    return (
        parts[2]
        + "/"
        + parts[1]
        + "/"
        + parts[0]
    );
}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(value) {

    if (!value) {

        return "-";
    }


    const time =
        extractTime(value);


    return time || value;
}


/* =========================================================
   SAFE VALUE
   ========================================================= */

function safeValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";
    }


    return escapeHtml(
        String(value)
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

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


/* =========================================================
   FORM MESSAGE
   ========================================================= */

function showTripMessage(
    message,
    isError
) {

    const element =
        document.getElementById(
            "tripFormMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.style.color =
        isError
            ? "#991b1b"
            : "#166534";
}