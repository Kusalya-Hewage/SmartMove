/* =========================================================
   SMARTMOVE - TICKET MANAGEMENT
   ========================================================= */


let ticketData = [];

let ticketTrips = [];

let ticketPassengers = [];

let editingTicketId = null;


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const isAdmin = await checkAdmin();

        if (!isAdmin) {
            return;
        }

        setupTicketManagement();

        setupLogout();

        await loadTicketDropdowns();

        await loadTickets();

    }
);


/* =========================================================
   ADMIN CHECK
   ========================================================= */

async function checkAdmin() {

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
            !user.role ||
            user.role.toUpperCase() !== "ADMIN"
        ) {

            window.location.href = "/index.html";

            return false;

        }


        const username =
            document.getElementById(
                "adminUsername"
            );


        if (username) {

            username.textContent =
                user.username ||
                user.name ||
                "Admin";

        }


        return true;

    }
    catch (error) {

        console.error(
            "Admin check failed:",
            error
        );

        window.location.href =
            "/index.html";

        return false;

    }

}


/* =========================================================
   TICKET MANAGEMENT
   ========================================================= */

function setupTicketManagement() {

    const addButton =
        document.getElementById(
            "showTicketFormButton"
        );


    const closeButton =
        document.getElementById(
            "closeTicketFormButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelTicketButton"
        );


    const refreshButton =
        document.getElementById(
            "refreshTicketsButton"
        );


    const form =
        document.getElementById(
            "ticketForm"
        );


    const tripSelect =
        document.getElementById(
            "ticketTripId"
        );


    const searchInput =
        document.getElementById(
            "ticketSearch"
        );


    const statusFilter =
        document.getElementById(
            "ticketStatusFilter"
        );


    const clearButton =
        document.getElementById(
            "clearTicketFiltersButton"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            openTicketForm
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeTicketForm
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeTicketForm
        );

    }


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async function () {

                await loadTicketDropdowns();

                await loadTickets();

            }
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            saveTicket
        );

    }


    if (tripSelect) {

        tripSelect.addEventListener(
            "change",
            updateSelectedTripInformation
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterTickets
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterTickets
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearTicketFilters
        );

    }

}


/* =========================================================
   LOAD TRIPS AND PASSENGERS
   ========================================================= */

async function loadTicketDropdowns() {

    try {

        const [
            tripsResponse,
            passengersResponse
        ] = await Promise.all([

            fetch(
                "/api/trips",
                {
                    method: "GET",
                    credentials: "include"
                }
            ),

            fetch(
                "/api/passengers",
                {
                    method: "GET",
                    credentials: "include"
                }
            )

        ]);


        if (
            !tripsResponse.ok ||
            !passengersResponse.ok
        ) {

            throw new Error(
                "Could not load trips or passengers."
            );

        }


        const tripsData =
            await tripsResponse.json();


        const passengersData =
            await passengersResponse.json();


        ticketTrips =
            Array.isArray(tripsData)
                ? tripsData
                : tripsData.content || [];


        ticketPassengers =
            Array.isArray(passengersData)
                ? passengersData
                : passengersData.content || [];


        populateTicketDropdowns();

    }
    catch (error) {

        console.error(
            "Ticket dropdown error:",
            error
        );

    }

}


/* =========================================================
   POPULATE DROPDOWNS
   ========================================================= */

function populateTicketDropdowns() {

    const tripSelect =
        document.getElementById(
            "ticketTripId"
        );


    const passengerSelect =
        document.getElementById(
            "ticketPassengerId"
        );


    if (
        !tripSelect ||
        !passengerSelect
    ) {

        return;

    }


    tripSelect.innerHTML =
        `<option value="">Select Trip</option>`;


    passengerSelect.innerHTML =
        `<option value="">Select Passenger</option>`;


    ticketTrips.forEach(
        trip => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                trip.tripId;


            const routeName =
                trip.route?.routeName ||
                trip.routeName ||
                "Trip";


            const date =
                formatDate(
                    trip.tripDate
                );


            const time =
                formatTime(
                    trip.departureTime
                );


            const fare =
                trip.fare ?? 0;


            const seats =
                trip.availableSeats ?? 0;


            option.textContent =
                `${routeName} | ${date} ${time} | Rs. ${fare} | ${seats} seats`;


            tripSelect.appendChild(
                option
            );

        }
    );


    ticketPassengers.forEach(
        passenger => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                passenger.passengerId;


            const name =
                passenger.fullName ||
                `${passenger.firstName || ""} ${passenger.lastName || ""}`.trim();


            option.textContent =
                `${name} - ${passenger.email || ""}`;


            passengerSelect.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   OPEN TICKET FORM
   ========================================================= */

function openTicketForm() {

    editingTicketId = null;


    document
        .getElementById("ticketForm")
        .reset();


    document
        .getElementById("ticketId")
        .value = "";


    document
        .getElementById("ticketFormTitle")
        .textContent = "Book Ticket";


    document
        .getElementById("saveTicketButton")
        .textContent = "Book Ticket";


    document
        .getElementById("ticketStatus")
        .value = "BOOKED";


    document
        .getElementById("ticketPrice")
        .value = "";


    document
        .getElementById("selectedTripInformation")
        .textContent =
        "Select a trip to view its details.";


    document
        .getElementById("ticketFormMessage")
        .textContent = "";


    document
        .getElementById("ticketFormPanel")
        .style.display = "block";


    document
        .getElementById("ticketFormPanel")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================================
   CLOSE TICKET FORM
   ========================================================= */

function closeTicketForm() {

    editingTicketId = null;


    document
        .getElementById("ticketFormPanel")
        .style.display = "none";


    document
        .getElementById("ticketForm")
        .reset();


    document
        .getElementById("ticketFormMessage")
        .textContent = "";

}


/* =========================================================
   UPDATE TRIP INFORMATION
   ========================================================= */

function updateSelectedTripInformation() {

    const tripId =
        document
            .getElementById("ticketTripId")
            .value;


    const priceInput =
        document
            .getElementById("ticketPrice");


    const information =
        document
            .getElementById(
                "selectedTripInformation"
            );


    if (!tripId) {

        priceInput.value = "";

        information.textContent =
            "Select a trip to view its details.";

        return;

    }


    const trip =
        ticketTrips.find(
            item =>
                Number(item.tripId) ===
                Number(tripId)
        );


    if (!trip) {

        priceInput.value = "";

        information.textContent =
            "Trip information not found.";

        return;

    }


    const routeName =
        trip.route?.routeName ||
        trip.routeName ||
        "Trip";


    const fare =
        trip.fare ?? 0;


    const seats =
        trip.availableSeats ?? 0;


    priceInput.value =
        fare;


    information.textContent =
        `${routeName} | ${formatDate(trip.tripDate)} | Departure ${formatTime(trip.departureTime)} | Available seats: ${seats}`;

}


/* =========================================================
   SAVE TICKET
   ========================================================= */

async function saveTicket(event) {

    event.preventDefault();


    const ticketId =
        document
            .getElementById("ticketId")
            .value;


    const tripId =
        document
            .getElementById("ticketTripId")
            .value;


    const passengerId =
        document
            .getElementById("ticketPassengerId")
            .value;


    const seatNumber =
        document
            .getElementById("ticketSeatNumber")
            .value
            .trim()
            .toUpperCase();


    const ticketPrice =
        Number(
            document
                .getElementById("ticketPrice")
                .value
        );


    const ticketStatus =
        document
            .getElementById("ticketStatus")
            .value;


    const button =
        document
            .getElementById(
                "saveTicketButton"
            );


    if (!tripId) {

        showTicketMessage(
            "Please select a trip.",
            true
        );

        return;

    }


    if (!passengerId) {

        showTicketMessage(
            "Please select a passenger.",
            true
        );

        return;

    }


    if (!seatNumber) {

        showTicketMessage(
            "Please enter a seat number.",
            true
        );

        return;

    }


    if (
        !ticketPrice ||
        ticketPrice < 0
    ) {

        showTicketMessage(
            "Invalid ticket price.",
            true
        );

        return;

    }


    const ticket = {

        trip: {
            tripId: Number(tripId)
        },

        passenger: {
            passengerId: Number(passengerId)
        },

        seatNumber: seatNumber,

        ticketPrice: ticketPrice

    };


    if (ticketId) {

        ticket.ticketStatus =
            ticketStatus;

    }


    button.disabled = true;


    button.textContent =
        ticketId
            ? "Updating..."
            : "Booking...";


    try {

        const url =
            ticketId
                ? "/api/tickets/" + ticketId
                : "/api/tickets";


        const method =
            ticketId
                ? "PUT"
                : "POST";


        const response =
            await fetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify(ticket)

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
                    : result.message ||
                    result.error ||
                    "Ticket operation failed."
            );

        }


        showTicketMessage(
            ticketId
                ? "Ticket updated successfully."
                : "Ticket booked successfully.",
            false
        );


        await loadTickets();


        setTimeout(
            closeTicketForm,
            700
        );

    }
    catch (error) {

        showTicketMessage(
            error.message,
            true
        );

    }
    finally {

        button.disabled = false;


        button.textContent =
            ticketId
                ? "Update Ticket"
                : "Book Ticket";

    }

}


/* =========================================================
   LOAD TICKETS
   ========================================================= */

async function loadTickets() {

    const container =
        document.getElementById(
            "ticketsContent"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        `<div class="loading">Loading tickets...</div>`;


    try {

        const response =
            await fetch(
                "/api/tickets",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            if (
                response.status === 401
            ) {

                window.location.href =
                    "/index.html";

                return;

            }


            throw new Error(
                "Could not load tickets."
            );

        }


        const data =
            await response.json();


        ticketData =
            Array.isArray(data)
                ? data
                : data.content || [];


        filterTickets();

    }
    catch (error) {

        container.innerHTML =
            `<div class="empty-section">${escapeHtml(error.message)}</div>`;

    }

}


/* =========================================================
   FILTER TICKETS
   ========================================================= */

function filterTickets() {

    const searchInput =
        document.getElementById(
            "ticketSearch"
        );


    const statusFilter =
        document.getElementById(
            "ticketStatusFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "";


    const filtered =
        ticketData.filter(
            ticket => {

                const ticketId =
                    String(
                        ticket.ticketId || ""
                    ).toLowerCase();


                const seat =
                    String(
                        ticket.seatNumber || ""
                    ).toLowerCase();


                const passengerName =
                    getTicketPassengerName(
                        ticket
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    ticketId.includes(search) ||
                    seat.includes(search) ||
                    passengerName.includes(search);


                const status =
                    ticket.ticketStatus || "";


                const matchesStatus =
                    !selectedStatus ||
                    status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    displayTickets(filtered);

}


/* =========================================================
   DISPLAY TICKETS
   ========================================================= */

function displayTickets(tickets) {

    const container =
        document.getElementById(
            "ticketsContent"
        );


    const total =
        document.getElementById(
            "ticketTotal"
        );


    if (total) {

        total.textContent =
            tickets.length +
            " ticket" +
            (
                tickets.length === 1
                    ? ""
                    : "s"
            );

    }


    if (
        !Array.isArray(tickets) ||
        tickets.length === 0
    ) {

        container.innerHTML =
            `<div class="empty-section">No tickets found.</div>`;

        return;

    }


    let html = `

        <div class="table-wrapper">

            <table class="ticket-table">

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Passenger</th>

                        <th>Trip</th>

                        <th>Travel Date</th>

                        <th>Seat</th>

                        <th>Price</th>

                        <th>Booking Date</th>

                        <th>Status</th>

                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

    `;


    tickets.forEach(
        ticket => {

            const passenger =
                getTicketPassengerName(
                    ticket
                );


            const trip =
                getTicketTrip(
                    ticket
                );


            const routeName =
                trip?.route?.routeName ||
                trip?.routeName ||
                "-";


            const tripDate =
                trip?.tripDate ||
                ticket.tripDate ||
                "-";


            const status =
                ticket.ticketStatus ||
                "BOOKED";


            const statusClass =
                getTicketStatusClass(
                    status
                );


            html += `

                <tr>

                    <td>
                        ${safeValue(
                ticket.ticketId
            )}
                    </td>

                    <td>
                        ${safeValue(
                passenger
            )}
                    </td>

                    <td>
                        ${safeValue(
                routeName
            )}
                    </td>

                    <td>
                        ${safeValue(
                formatDate(
                    tripDate
                )
            )}
                    </td>

                    <td>
                        ${safeValue(
                ticket.seatNumber
            )}
                    </td>

                    <td>
                        Rs. ${safeValue(
                ticket.ticketPrice
            )}
                    </td>

                    <td>
                        ${safeValue(
                formatDate(
                    ticket.bookingDate
                )
            )}
                    </td>

                    <td>

                        <span
                                class="ticket-status-badge ${statusClass}">

                            ${safeValue(status)}

                        </span>

                    </td>

                    <td>

                        <div class="action-buttons">

                            ${
                status === "BOOKED"
                    ? `

                                    <button
                                            type="button"
                                            class="edit-button"
                                            onclick="editTicket(${ticket.ticketId})">

                                        Edit

                                    </button>

                                    <button
                                            type="button"
                                            class="delete-button"
                                            onclick="cancelTicket(${ticket.ticketId})">

                                        Cancel

                                    </button>

                                    `
                    : ""
            }


                            <button
                                    type="button"
                                    class="delete-button"
                                    onclick="deleteTicket(${ticket.ticketId})">

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
   EDIT TICKET
   ========================================================= */

async function editTicket(ticketId) {

    try {

        const response =
            await fetch(
                "/api/tickets/" + ticketId,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not load ticket."
            );

        }


        const ticket =
            await response.json();


        editingTicketId =
            ticket.ticketId;


        document
            .getElementById("ticketId")
            .value =
            ticket.ticketId;


        const tripId =
            ticket.tripId ||
            ticket.trip?.tripId;


        const passengerId =
            ticket.passengerId ||
            ticket.passenger?.passengerId;


        document
            .getElementById("ticketTripId")
            .value =
            tripId || "";


        document
            .getElementById(
                "ticketPassengerId"
            )
            .value =
            passengerId || "";


        document
            .getElementById(
                "ticketSeatNumber"
            )
            .value =
            ticket.seatNumber || "";


        document
            .getElementById(
                "ticketPrice"
            )
            .value =
            ticket.ticketPrice ?? "";


        document
            .getElementById(
                "ticketStatus"
            )
            .value =
            ticket.ticketStatus ||
            "BOOKED";


        document
            .getElementById(
                "ticketFormTitle"
            )
            .textContent =
            "Edit Ticket";


        document
            .getElementById(
                "saveTicketButton"
            )
            .textContent =
            "Update Ticket";


        updateSelectedTripInformation();


        document
            .getElementById(
                "ticketFormMessage"
            )
            .textContent = "";


        document
            .getElementById(
                "ticketFormPanel"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "ticketFormPanel"
            )
            .scrollIntoView({
                behavior: "smooth"
            });

    }
    catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================================
   CANCEL TICKET
   ========================================================= */

async function cancelTicket(ticketId) {

    const confirmed =
        confirm(
            "Are you sure you want to cancel this ticket?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/tickets/" + ticketId,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify({
                            ticketStatus:
                                "CANCELLED"
                        })

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
                    : result.message ||
                    result.error ||
                    "Could not cancel ticket."
            );

        }


        alert(
            "Ticket cancelled successfully."
        );


        await loadTickets();

    }
    catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================================
   DELETE TICKET
   ========================================================= */

async function deleteTicket(ticketId) {

    const confirmed =
        confirm(
            "Are you sure you want to permanently delete this ticket?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/tickets/" + ticketId,
                {
                    method: "DELETE",
                    credentials: "include"
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
                    : result.message ||
                    result.error ||
                    "Could not delete ticket."
            );

        }


        alert(
            "Ticket deleted successfully."
        );


        await loadTickets();

    }
    catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

function clearTicketFilters() {

    document
        .getElementById(
            "ticketSearch"
        )
        .value = "";


    document
        .getElementById(
            "ticketStatusFilter"
        )
        .value = "";


    filterTickets();

}


/* =========================================================
   GET PASSENGER NAME
   ========================================================= */

function getTicketPassengerName(ticket) {

    if (ticket.passenger) {

        return (
            ticket.passenger.fullName ||
            `${ticket.passenger.firstName || ""} ${ticket.passenger.lastName || ""}`
        ).trim();

    }


    if (ticket.passengerName) {

        return ticket.passengerName;

    }


    const passengerId =
        ticket.passengerId;


    if (!passengerId) {

        return "-";

    }


    const passenger =
        ticketPassengers.find(
            item =>
                Number(
                    item.passengerId
                ) ===
                Number(
                    passengerId
                )
        );


    if (!passenger) {

        return passengerId;

    }


    return (
        passenger.fullName ||
        `${passenger.firstName || ""} ${passenger.lastName || ""}`
    ).trim();

}


/* =========================================================
   GET TRIP
   ========================================================= */

function getTicketTrip(ticket) {

    if (ticket.trip) {

        return ticket.trip;

    }


    const tripId =
        ticket.tripId;


    if (!tripId) {

        return null;

    }


    return (
        ticketTrips.find(
            trip =>
                Number(
                    trip.tripId
                ) ===
                Number(
                    tripId
                )
        ) || null
    );

}


/* =========================================================
   STATUS CLASS
   ========================================================= */

function getTicketStatusClass(status) {

    switch (
        String(status).toUpperCase()
        ) {

        case "CANCELLED":

            return "ticket-status-cancelled";


        case "COMPLETED":

            return "ticket-status-completed";


        default:

            return "ticket-status-booked";

    }

}


/* =========================================================
   SHOW FORM MESSAGE
   ========================================================= */

function showTicketMessage(
    message,
    error
) {

    const element =
        document.getElementById(
            "ticketFormMessage"
        );


    element.textContent =
        message;


    element.className =
        error
            ? "form-message error-message"
            : "form-message success-message";

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
   LOGOUT
   ========================================================= */

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
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

            }
            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }


            window.location.href =
                "/index.html";

        }
    );

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

    return value
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
   FORMAT DATE
   ========================================================= */

function formatDate(value) {

    if (!value) {

        return "-";

    }


    return String(value)
        .substring(0, 10);

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(value) {

    if (!value) {

        return "--:--";

    }


    return String(value)
        .substring(0, 5);

}