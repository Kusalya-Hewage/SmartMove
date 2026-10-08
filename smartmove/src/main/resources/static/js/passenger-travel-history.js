/* =========================================================
   SMARTMOVE - PASSENGER TRAVEL HISTORY
   ========================================================= */

let passengerId = null;

let allHistory = [];

let filteredHistory = [];


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setupFilters();

        setupRefresh();

        await loadCurrentUser();

    }
);


/* =========================================================
   FETCH WITH TIMEOUT
   ========================================================= */

async function fetchWithTimeout(
    url,
    options = {},
    timeout = 8000
) {

    const controller =
        new AbortController();


    const timer =
        setTimeout(
            function () {

                controller.abort();

            },
            timeout
        );


    try {

        return await fetch(
            url,
            {
                ...options,

                credentials: "include",

                signal:
                controller.signal
            }
        );

    }
    finally {

        clearTimeout(timer);

    }
}


/* =========================================================
   LOAD CURRENT USER
   ========================================================= */

async function loadCurrentUser() {

    showLoading();


    try {

        const response =
            await fetchWithTimeout(
                "/api/users/current-user",
                {
                    method: "GET"
                },
                8000
            );


        if (!response.ok) {

            throw new Error(
                "Please login as a passenger."
            );
        }


        const user =
            await response.json();


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

            window.location.href =
                "/index.html";

            return;
        }


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


        const passengerName =
            user.passengerName ||
            user.fullName ||
            user.username ||
            "Passenger";


        const nameElement =
            document.getElementById(
                "passengerName"
            );


        if (nameElement) {

            nameElement.textContent =
                passengerName;
        }


        await loadHistory();

    }
    catch (error) {

        console.error(
            "User loading error:",
            error
        );


        hideLoading();


        showMessage(
            error.name === "AbortError"
                ? "Server request timed out. Please check Spring Boot."
                : error.message,
            "error"
        );
    }
}


/* =========================================================
   LOAD HISTORY
   ========================================================= */

async function loadHistory() {

    showLoading();

    clearMessage();


    try {

        /*
         * ONLY CALL /api/tickets FIRST.
         */

        const response =
            await fetchWithTimeout(
                "/api/tickets",
                {
                    method: "GET"
                },
                8000
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load ticket history."
            );
        }


        const tickets =
            await response.json();


        console.log(
            "All tickets:",
            tickets
        );


        /*
         * Filter tickets belonging to
         * current passenger.
         */

        const passengerTickets =
            tickets.filter(
                function (ticket) {

                    const id =
                        ticket.passengerId ??
                        ticket.passenger?.passengerId ??
                        ticket.passenger?.id;


                    return String(id)
                        ===
                        String(passengerId);
                }
            );


        /*
         * Create history from tickets.
         */

        allHistory =
            passengerTickets.map(
                function (ticket) {

                    return {

                        ticket: ticket,

                        trip:
                            extractTrip(
                                ticket
                            ),

                        historyStatus:
                            "UPCOMING"
                    };

                }
            );


        /*
         * Determine status using
         * ticket information first.
         */

        allHistory.forEach(
            function (item) {

                item.historyStatus =
                    getJourneyStatus(
                        item.ticket,
                        item.trip
                    );

            }
        );


        /*
         * Render immediately.
         */

        sortHistory();

        applyFilters();


        /*
         * Try to load trip information
         * after the tickets are already shown.
         */

        loadMissingTripDetails();


    }
    catch (error) {

        console.error(
            "History loading error:",
            error
        );


        allHistory = [];

        filteredHistory = [];


        updateSummary();


        hideLoading();


        showEmptyState();


        showMessage(
            error.name === "AbortError"
                ? "The ticket request timed out. Please check your Spring Boot server."
                : error.message ||
                "Unable to load travel history.",
            "error"
        );
    }
}


/* =========================================================
   GET EXISTING TRIP FROM TICKET
   ========================================================= */

function extractTrip(ticket) {

    if (ticket.trip) {

        return ticket.trip;
    }


    return null;
}


/* =========================================================
   LOAD MISSING TRIP DETAILS
   ========================================================= */

async function loadMissingTripDetails() {

    const requests =
        allHistory.map(
            async function (item) {

                if (item.trip) {

                    return;
                }


                const tripId =
                    item.ticket.tripId;


                if (!tripId) {

                    return;
                }


                try {

                    const response =
                        await fetchWithTimeout(
                            "/api/trips/" +
                            encodeURIComponent(
                                tripId
                            ),
                            {
                                method: "GET"
                            },
                            4000
                        );


                    if (!response.ok) {

                        return;
                    }


                    item.trip =
                        await response.json();


                    item.historyStatus =
                        getJourneyStatus(
                            item.ticket,
                            item.trip
                        );


                    /*
                     * Refresh cards after
                     * trip details are received.
                     */

                    sortHistory();

                    applyFilters();

                }
                catch (error) {

                    /*
                     * Do not break the page
                     * if trip details cannot load.
                     */

                    console.warn(
                        "Trip " +
                        tripId +
                        " details unavailable."
                    );
                }

            }
        );


    await Promise.allSettled(
        requests
    );
}


/* =========================================================
   JOURNEY STATUS
   ========================================================= */

function getJourneyStatus(
    ticket,
    trip
) {

    const ticketStatus =
        String(
            ticket?.ticketStatus ||
            ticket?.status ||
            ""
        ).toUpperCase();


    if (
        ticketStatus === "CANCELLED"
    ) {

        return "CANCELLED";
    }


    const tripStatus =
        String(
            trip?.tripStatus ||
            trip?.status ||
            ""
        ).toUpperCase();


    if (
        tripStatus === "COMPLETED"
    ) {

        return "COMPLETED";
    }


    const departure =
        getDepartureDate(
            trip
        );


    if (
        departure &&
        departure.getTime() <= Date.now()
    ) {

        return "COMPLETED";
    }


    return "UPCOMING";
}


/* =========================================================
   DEPARTURE
   ========================================================= */

function getDepartureDate(trip) {

    if (!trip) {

        return null;
    }


    const value =
        trip.departureTime ||
        trip.departureDateTime ||
        trip.departureDate;


    if (!value) {

        return null;
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;
    }


    return date;
}


/* =========================================================
   SORT
   ========================================================= */

function sortHistory() {

    allHistory.sort(
        function (a, b) {

            const aDate =
                getDateValue(
                    a.trip?.departureTime ||
                    a.trip?.departureDateTime ||
                    a.ticket?.bookingDate
                );


            const bDate =
                getDateValue(
                    b.trip?.departureTime ||
                    b.trip?.departureDateTime ||
                    b.ticket?.bookingDate
                );


            return bDate - aDate;

        }
    );
}


/* =========================================================
   FILTER
   ========================================================= */

function applyFilters() {

    const searchElement =
        document.getElementById(
            "historySearch"
        );


    const statusElement =
        document.getElementById(
            "historyStatusFilter"
        );


    const search =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        statusElement
            ? statusElement.value
                .toUpperCase()
            : "";


    filteredHistory =
        allHistory.filter(
            function (item) {

                const ticket =
                    item.ticket || {};


                const trip =
                    item.trip || {};


                const ticketId =
                    String(
                        ticket.ticketId ??
                        ticket.id ??
                        ""
                    ).toLowerCase();


                const tripId =
                    String(
                        ticket.tripId ??
                        trip.tripId ??
                        trip.id ??
                        ""
                    ).toLowerCase();


                const seat =
                    String(
                        ticket.seatNumber ??
                        ""
                    ).toLowerCase();


                const route =
                    getRouteText(
                        trip
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    ticketId.includes(search) ||
                    tripId.includes(search) ||
                    seat.includes(search) ||
                    route.includes(search);


                const matchesStatus =
                    !status ||
                    item.historyStatus ===
                    status;


                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );


    updateSummary();

    renderHistory();
}


/* =========================================================
   RENDER
   ========================================================= */

function renderHistory() {

    const container =
        document.getElementById(
            "historyContainer"
        );


    if (!container) {

        return;
    }


    hideLoading();


    container.innerHTML = "";


    if (
        filteredHistory.length === 0
    ) {

        showEmptyState();

        return;
    }


    hideEmptyState();


    filteredHistory.forEach(
        function (item) {

            container.appendChild(
                createHistoryCard(
                    item
                )
            );

        }
    );
}


/* =========================================================
   CREATE CARD
   ========================================================= */

function createHistoryCard(item) {

    const ticket =
        item.ticket || {};


    const trip =
        item.trip || {};


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "history-card";


    const ticketId =
        ticket.ticketId ??
        ticket.id ??
        "-";


    const tripId =
        ticket.tripId ??
        trip.tripId ??
        trip.id ??
        "-";


    const seat =
        ticket.seatNumber ||
        "-";


    const price =
        Number(
            ticket.ticketPrice ??
            ticket.price ??
            0
        );


    const bookingDate =
        ticket.bookingDate ||
        null;


    const departure =
        trip.departureTime ||
        trip.departureDateTime ||
        null;


    const arrival =
        trip.arrivalTime ||
        trip.arrivalDateTime ||
        null;


    const vehicle =
        trip.vehicle?.registrationNo ||
        trip.vehicle?.registrationNumber ||
        trip.registrationNo ||
        "-";


    const route =
        getRouteText(
            trip
        );


    const statusClass =
        String(
            item.historyStatus
        ).toLowerCase();


    card.innerHTML = `

        <div class="history-card-header">

            <div>

                <span>
                    Ticket
                </span>

                <strong>
                    #${escapeHtml(ticketId)}
                </strong>

            </div>


            <span
                class="history-badge ${statusClass}">

                ${escapeHtml(
        item.historyStatus
    )}

            </span>

        </div>


        <div class="history-card-body">


            <div class="history-route">

                ${escapeHtml(route)}

            </div>


            <div class="history-info-grid">


                <div class="history-info">

                    <span>
                        Trip ID
                    </span>

                    <strong>
                        ${escapeHtml(tripId)}
                    </strong>

                </div>


                <div class="history-info">

                    <span>
                        Seat Number
                    </span>

                    <strong>
                        ${escapeHtml(seat)}
                    </strong>

                </div>


                <div class="history-info">

                    <span>
                        Departure
                    </span>

                    <strong>

                        ${escapeHtml(
        formatDateTime(
            departure
        )
    )}

                    </strong>

                </div>


                <div class="history-info">

                    <span>
                        Arrival
                    </span>

                    <strong>

                        ${escapeHtml(
        formatDateTime(
            arrival
        )
    )}

                    </strong>

                </div>


                <div class="history-info">

                    <span>
                        Vehicle
                    </span>

                    <strong>

                        ${escapeHtml(
        vehicle
    )}

                    </strong>

                </div>


                <div class="history-info">

                    <span>
                        Ticket Price
                    </span>

                    <strong>

                        Rs.
                        ${price.toFixed(2)}

                    </strong>

                </div>


            </div>


        </div>


        <div class="history-card-footer">

            Booked:
            ${escapeHtml(
        formatDateTime(
            bookingDate
        )
    )}

        </div>

    `;


    return card;
}


/* =========================================================
   ROUTE TEXT
   ========================================================= */

function getRouteText(trip) {

    const route =
        trip?.route || {};


    const source =
        route.sourceLocation ||
        route.source ||
        trip?.sourceLocation ||
        "-";


    const destination =
        route.destinationLocation ||
        route.destination ||
        trip?.destinationLocation ||
        "-";


    return (
        source +
        " → " +
        destination
    );
}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary() {

    const total =
        allHistory.length;


    const completed =
        allHistory.filter(
            item =>
                item.historyStatus
                === "COMPLETED"
        ).length;


    const upcoming =
        allHistory.filter(
            item =>
                item.historyStatus
                === "UPCOMING"
        ).length;


    const totalAmount =
        allHistory.reduce(
            function (sum, item) {

                if (
                    item.historyStatus
                    === "CANCELLED"
                ) {

                    return sum;
                }


                return sum +
                    Number(
                        item.ticket?.ticketPrice ??
                        0
                    );

            },
            0
        );


    setText(
        "totalJourneyCount",
        total
    );


    setText(
        "completedJourneyCount",
        completed
    );


    setText(
        "upcomingJourneyCount",
        upcoming
    );


    setText(
        "totalTravelAmount",
        "Rs. " +
        totalAmount.toFixed(2)
    );
}


/* =========================================================
   FILTER EVENTS
   ========================================================= */

function setupFilters() {

    const search =
        document.getElementById(
            "historySearch"
        );


    const status =
        document.getElementById(
            "historyStatusFilter"
        );


    const clear =
        document.getElementById(
            "clearHistoryFilterButton"
        );


    if (search) {

        search.addEventListener(
            "input",
            applyFilters
        );
    }


    if (status) {

        status.addEventListener(
            "change",
            applyFilters
        );
    }


    if (clear) {

        clear.addEventListener(
            "click",
            function () {

                if (search) {

                    search.value = "";
                }


                if (status) {

                    status.value = "";
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

    const button =
        document.getElementById(
            "refreshHistoryButton"
        );


    if (!button) {

        return;
    }


    button.addEventListener(
        "click",
        async function () {

            button.disabled = true;

            button.textContent =
                "Loading...";


            await loadHistory();


            button.disabled = false;

            button.textContent =
                "↻ Refresh";

        }
    );
}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    const element =
        document.getElementById(
            "historyLoading"
        );


    if (element) {

        element.style.display =
            "block";
    }
}


function hideLoading() {

    const element =
        document.getElementById(
            "historyLoading"
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
            "noHistoryMessage"
        );


    if (element) {

        element.style.display =
            "block";
    }
}


function hideEmptyState() {

    const element =
        document.getElementById(
            "noHistoryMessage"
        );


    if (element) {

        element.style.display =
            "none";
    }
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
            "historyMessage"
        );


    if (!element) {

        return;
    }


    element.textContent =
        message;


    element.className =
        "history-message " +
        (type || "");
}


function clearMessage() {

    const element =
        document.getElementById(
            "historyMessage"
        );


    if (!element) {

        return;
    }


    element.textContent = "";

    element.className =
        "history-message";
}


/* =========================================================
   HELPERS
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
            value;
    }
}


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


function getDateValue(value) {

    if (!value) {

        return 0;
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return 0;
    }


    return date.getTime();
}


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