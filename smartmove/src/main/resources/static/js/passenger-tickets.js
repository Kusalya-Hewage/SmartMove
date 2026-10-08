/* =========================================================
   SMARTMOVE - PASSENGER TICKETS
   ========================================================= */

let currentUser = null;

let passengerId = null;

let allTickets = [];

let filteredTickets = [];


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setupNavigation();

        setupFilters();

        setupRefresh();

        setupSearchTripsButton();

        await loadCurrentUser();

    }
);


/* =========================================================
   LOAD CURRENT USER
   ========================================================= */

async function loadCurrentUser() {

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


        /* ---------------------------------------------
           CHECK ROLE
           --------------------------------------------- */

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


        /* ---------------------------------------------
           GET PASSENGER ID
           --------------------------------------------- */

        passengerId =
            user.passengerId ||
            user.userId ||
            user.id ||
            sessionStorage.getItem(
                "passengerId"
            );


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
           PASSENGER NAME
           --------------------------------------------- */

        const passengerName =
            user.passengerName ||
            user.fullName ||
            user.username ||
            "Passenger";


        const passengerNameElement =
            document.getElementById(
                "passengerName"
            );


        if (passengerNameElement) {

            passengerNameElement.textContent =
                passengerName;
        }


        /* ---------------------------------------------
           LOAD TICKETS
           --------------------------------------------- */

        await loadTickets();

    }
    catch (error) {

        console.error(
            "User loading error:",
            error
        );


        showTicketMessage(
            error.message ||
            "Unable to load passenger information.",
            "error"
        );


        hideLoading();
    }
}


/* =========================================================
   LOAD ALL TICKETS
   ========================================================= */

async function loadTickets() {

    showLoading();

    clearTicketMessage();


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

            const errorText =
                await response.text();

            console.error(
                "Ticket API error:",
                errorText
            );

            throw new Error(
                "Unable to load tickets."
            );
        }


        const tickets =
            await response.json();


        console.log(
            "All tickets:",
            tickets
        );


        /* ---------------------------------------------
           FILTER CURRENT PASSENGER
           --------------------------------------------- */

        allTickets =
            tickets.filter(
                function (ticket) {

                    const ticketPassengerId =
                        getPassengerId(
                            ticket
                        );


                    return String(
                        ticketPassengerId
                    ) === String(
                        passengerId
                    );
                }
            );


        console.log(
            "Passenger tickets:",
            allTickets
        );


        /* ---------------------------------------------
           LOAD PAYMENT STATUS
           --------------------------------------------- */

        await loadPaymentStatuses();


        /* ---------------------------------------------
           APPLY FILTER
           --------------------------------------------- */

        applyFilters();

    }
    catch (error) {

        console.error(
            "Ticket loading error:",
            error
        );


        allTickets = [];

        filteredTickets = [];


        updateSummary();


        showTicketMessage(
            error.message ||
            "Unable to load tickets.",
            "error"
        );


        hideLoading();


        showEmptyState();
    }
}


/* =========================================================
   GET PASSENGER ID FROM TICKET
   ========================================================= */

function getPassengerId(ticket) {

    return (
        ticket.passengerId ??
        ticket.passenger?.passengerId ??
        ticket.passenger?.id ??
        null
    );
}


/* =========================================================
   LOAD PAYMENT STATUS
   ========================================================= */

async function loadPaymentStatuses() {

    const requests =
        allTickets.map(
            async function (ticket) {

                const ticketId =
                    ticket.ticketId ??
                    ticket.id;


                if (!ticketId) {

                    ticket.paymentStatus =
                        "UNPAID";

                    return;
                }


                try {

                    const response =
                        await fetch(
                            "/api/payments/ticket/" +
                            encodeURIComponent(
                                ticketId
                            ),
                            {
                                method: "GET",
                                credentials: "include"
                            }
                        );


                    if (
                        response.status === 404
                    ) {

                        ticket.paymentStatus =
                            "UNPAID";

                        return;
                    }


                    if (!response.ok) {

                        ticket.paymentStatus =
                            "UNPAID";

                        return;
                    }


                    const payment =
                        await response.json();


                    ticket.payment =
                        payment;


                    ticket.paymentStatus =
                        payment.paymentStatus ||
                        "UNPAID";

                }
                catch (error) {

                    console.warn(
                        "Payment status could not be loaded for ticket " +
                        ticketId,
                        error
                    );


                    ticket.paymentStatus =
                        "UNPAID";
                }
            }
        );


    await Promise.all(requests);
}


/* =========================================================
   APPLY FILTERS
   ========================================================= */

function applyFilters() {

    const searchInput =
        document.getElementById(
            "ticketSearch"
        );


    const statusSelect =
        document.getElementById(
            "ticketStatusFilter"
        );


    const searchText =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        statusSelect
            ? statusSelect.value
                .trim()
                .toUpperCase()
            : "";


    filteredTickets =
        allTickets.filter(
            function (ticket) {

                const ticketId =
                    String(
                        ticket.ticketId ??
                        ticket.id ??
                        ""
                    ).toLowerCase();


                const tripId =
                    String(
                        ticket.tripId ??
                        ticket.trip?.tripId ??
                        ticket.trip?.id ??
                        ""
                    ).toLowerCase();


                const seatNumber =
                    String(
                        ticket.seatNumber ??
                        ticket.seat ??
                        ""
                    ).toLowerCase();


                const ticketStatus =
                    String(
                        ticket.ticketStatus ??
                        ticket.status ??
                        ""
                    ).toUpperCase();


                const searchMatches =
                    !searchText ||
                    ticketId.includes(
                        searchText
                    ) ||
                    tripId.includes(
                        searchText
                    ) ||
                    seatNumber.includes(
                        searchText
                    );


                const statusMatches =
                    !status ||
                    ticketStatus === status;


                return (
                    searchMatches &&
                    statusMatches
                );
            }
        );


    updateSummary();

    renderTickets();
}


/* =========================================================
   RENDER TICKETS
   ========================================================= */

function renderTickets() {

    const container =
        document.getElementById(
            "ticketsContainer"
        );


    if (!container) {
        return;
    }


    hideLoading();


    container.innerHTML = "";


    if (
        filteredTickets.length === 0
    ) {

        showEmptyState();

        return;
    }


    hideEmptyState();


    filteredTickets.forEach(
        function (ticket) {

            container.appendChild(
                createTicketCard(ticket)
            );

        }
    );
}


/* =========================================================
   CREATE TICKET CARD
   ========================================================= */

function createTicketCard(ticket) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "ticket-card";


    const ticketId =
        ticket.ticketId ??
        ticket.id ??
        "-";


    const tripId =
        ticket.tripId ??
        ticket.trip?.tripId ??
        ticket.trip?.id ??
        "-";


    const seatNumber =
        ticket.seatNumber ??
        ticket.seat ??
        "-";


    const ticketPrice =
        Number(
            ticket.ticketPrice ??
            ticket.price ??
            0
        );


    const bookingDate =
        ticket.bookingDate ??
        ticket.createdDate ??
        null;


    const ticketStatus =
        String(
            ticket.ticketStatus ??
            ticket.status ??
            "UNKNOWN"
        ).toUpperCase();


    const paymentStatus =
        String(
            ticket.paymentStatus ??
            "UNPAID"
        ).toUpperCase();


    const statusClass =
        getStatusClass(
            ticketStatus
        );


    const paymentClass =
        getPaymentStatusClass(
            paymentStatus
        );


    const canCancel =
        ticketStatus === "BOOKED";


    card.innerHTML = `

        <div class="ticket-card-header">

            <div class="ticket-title">

                <span>
                    Ticket ID
                </span>

                <strong>
                    #${escapeHtml(ticketId)}
                </strong>

            </div>


            <span
                class="status-badge ${statusClass}">

                ${escapeHtml(ticketStatus)}

            </span>

        </div>


        <div class="ticket-card-body">


            <div class="ticket-info-grid">


                <div class="ticket-info-item">

                    <span>
                        Trip ID
                    </span>

                    <strong>
                        ${escapeHtml(tripId)}
                    </strong>

                </div>


                <div class="ticket-info-item">

                    <span>
                        Seat Number
                    </span>

                    <strong>
                        ${escapeHtml(seatNumber)}
                    </strong>

                </div>


                <div class="ticket-info-item">

                    <span>
                        Ticket Price
                    </span>

                    <strong class="ticket-price">

                        Rs.
                        ${ticketPrice.toFixed(2)}

                    </strong>

                </div>


                <div class="ticket-info-item">

                    <span>
                        Booking Date
                    </span>

                    <strong>

                        ${escapeHtml(
        formatDateTime(
            bookingDate
        )
    )}

                    </strong>

                </div>


            </div>


            <div class="ticket-payment-status">

                <span>
                    Payment Status
                </span>

                <span
                    class="status-badge ${paymentClass}">

                    ${escapeHtml(paymentStatus)}

                </span>

            </div>


        </div>


        <div class="ticket-card-footer">


            <span class="ticket-booking-date">

                Booked:
                ${escapeHtml(
        formatDateTime(
            bookingDate
        )
    )}

            </span>


            <div class="ticket-actions">


                ${
        canCancel
            ? `
                        <button
                            type="button"
                            class="cancel-button"
                            data-ticket-id="${escapeHtml(ticketId)}">

                            Cancel Ticket

                        </button>
                      `
            : ""
    }


            </div>


        </div>

    `;


    /* ---------------------------------------------
       CANCEL BUTTON
       --------------------------------------------- */

    const cancelButton =
        card.querySelector(
            ".cancel-button"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                cancelTicket(
                    ticketId,
                    cancelButton
                );

            }
        );
    }


    return card;
}


/* =========================================================
   CANCEL TICKET
   ========================================================= */

async function cancelTicket(
    ticketId,
    button
) {

    const confirmed =
        window.confirm(
            "Are you sure you want to cancel Ticket #" +
            ticketId +
            "?"
        );


    if (!confirmed) {
        return;
    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "Cancelling...";
    }


    clearTicketMessage();


    try {

        const response =
            await fetch(
                "/api/tickets/" +
                encodeURIComponent(
                    ticketId
                ) +
                "/cancel",
                {
                    method: "PUT",
                    credentials: "include"
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

            console.warn(
                "Cancellation response was not JSON:",
                responseText
            );
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to cancel ticket."
            );
        }


        showTicketMessage(
            "Ticket #" +
            ticketId +
            " was cancelled successfully.",
            "success"
        );


        /* ---------------------------------------------
           REFRESH TICKETS
           --------------------------------------------- */

        await loadTickets();

    }
    catch (error) {

        console.error(
            "Cancel ticket error:",
            error
        );


        showTicketMessage(
            error.message ||
            "Unable to cancel ticket.",
            "error"
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "Cancel Ticket";
        }
    }
}


/* =========================================================
   UPDATE SUMMARY
   ========================================================= */

function updateSummary() {

    const total =
        allTickets.length;


    const booked =
        allTickets.filter(
            function (ticket) {

                return String(
                        ticket.ticketStatus ??
                        ticket.status ??
                        ""
                    ).toUpperCase()
                    === "BOOKED";
            }
        ).length;


    const cancelled =
        allTickets.filter(
            function (ticket) {

                return String(
                        ticket.ticketStatus ??
                        ticket.status ??
                        ""
                    ).toUpperCase()
                    === "CANCELLED";
            }
        ).length;


    const totalAmount =
        allTickets.reduce(
            function (sum, ticket) {

                const status =
                    String(
                        ticket.ticketStatus ??
                        ticket.status ??
                        ""
                    ).toUpperCase();


                const price =
                    Number(
                        ticket.ticketPrice ??
                        ticket.price ??
                        0
                    );


                if (
                    status === "CANCELLED"
                ) {

                    return sum;
                }


                return sum + price;

            },
            0
        );


    setText(
        "ticketCount",
        total
    );


    setText(
        "bookedTicketCount",
        booked
    );


    setText(
        "cancelledTicketCount",
        cancelled
    );


    setText(
        "ticketTotalAmount",
        "Rs. " +
        totalAmount.toFixed(2)
    );
}


/* =========================================================
   STATUS CLASS
   ========================================================= */

function getStatusClass(status) {

    switch (String(status).toUpperCase()) {

        case "BOOKED":
            return "booked";

        case "CANCELLED":
            return "cancelled";

        case "PENDING":
            return "pending";

        default:
            return "pending";
    }
}


/* =========================================================
   PAYMENT CLASS
   ========================================================= */

function getPaymentStatusClass(status) {

    switch (String(status).toUpperCase()) {

        case "PAID":
            return "paid";

        case "UNPAID":
            return "unpaid";

        case "PENDING":
            return "pending";

        default:
            return "unpaid";
    }
}


/* =========================================================
   FILTER SETUP
   ========================================================= */

function setupFilters() {

    const searchInput =
        document.getElementById(
            "ticketSearch"
        );


    const statusSelect =
        document.getElementById(
            "ticketStatusFilter"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                applyFilters();

            }
        );
    }


    if (statusSelect) {

        statusSelect.addEventListener(
            "change",
            function () {

                applyFilters();

            }
        );
    }


    const clearButton =
        document.getElementById(
            "clearTicketFilterButton"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                if (searchInput) {

                    searchInput.value = "";
                }


                if (statusSelect) {

                    statusSelect.value = "";
                }


                applyFilters();

            }
        );
    }
}


/* =========================================================
   REFRESH
   ========================================================= */

function setupRefresh() {

    const refreshButton =
        document.getElementById(
            "refreshTicketsButton"
        );


    if (!refreshButton) {
        return;
    }


    refreshButton.addEventListener(
        "click",
        async function () {

            refreshButton.disabled =
                true;

            refreshButton.textContent =
                "Loading...";


            await loadTickets();


            refreshButton.disabled =
                false;

            refreshButton.textContent =
                "↻ Refresh";

        }
    );
}


/* =========================================================
   SEARCH TRIPS BUTTON
   ========================================================= */

function setupSearchTripsButton() {

    const button =
        document.getElementById(
            "searchForTripsButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            window.location.href =
                "/passenger-trips.html";

        }
    );
}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    const element =
        document.getElementById(
            "ticketsLoading"
        );


    if (element) {

        element.style.display =
            "block";
    }
}


function hideLoading() {

    const element =
        document.getElementById(
            "ticketsLoading"
        );


    if (element) {

        element.style.display =
            "none";
    }
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showEmptyState() {

    const element =
        document.getElementById(
            "noTicketsMessage"
        );


    if (element) {

        element.style.display =
            "block";
    }
}


function hideEmptyState() {

    const element =
        document.getElementById(
            "noTicketsMessage"
        );


    if (element) {

        element.style.display =
            "none";
    }
}


/* =========================================================
   MESSAGE
   ========================================================= */

function showTicketMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "ticketMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "ticket-message " +
        (type || "");
}


function clearTicketMessage() {

    const element =
        document.getElementById(
            "ticketMessage"
        );


    if (!element) {
        return;
    }


    element.textContent = "";

    element.className =
        "ticket-message";
}


/* =========================================================
   SET TEXT
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
        value !== undefined
            ? value
            : "0";
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


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);
    }


    return date.toLocaleString(
        "en-LK",
        {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
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


    /* DASHBOARD */

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


    /* SEARCH TRIPS */

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


    /* AVAILABLE TRIPS */

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


    /* MY TICKETS */

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


    /* PAYMENTS */

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


    /* TRAVEL HISTORY */

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


    /* MY REVIEWS */

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


    /* ANNOUNCEMENTS */

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


    /* VEHICLE INFORMATION */

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


    /* PROFILE */

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


    /* LOGOUT */

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