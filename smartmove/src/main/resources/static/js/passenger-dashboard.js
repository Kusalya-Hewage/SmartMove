
/* =========================================================
   SMARTMOVE - PASSENGER DASHBOARD
   ========================================================= */


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

        setupQuickAccess();

        setupLogout();

        setupDate();

        await loadPassengerInformation();

        await loadDashboardStatistics();

    }
);


/* =========================================================
   CHECK PASSENGER LOGIN
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


        /* =================================================
           SAVE SESSION INFORMATION
           ================================================= */

        sessionStorage.setItem(
            "role",
            "PASSENGER"
        );


        if (user.userId) {

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


        if (user.passengerId) {

            sessionStorage.setItem(
                "passengerId",
                String(user.passengerId)
            );

        }


        return true;

    }
    catch (error) {

        console.error(
            "Passenger authentication error:",
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


    /*
     * Search Trips
     */

    const searchTripsButton =
        document.getElementById(
            "searchTripsButton"
        );


    if (searchTripsButton) {

        searchTripsButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/passenger-trips.html";

            }
        );

    }


    /*
     * Available Trips
     */

    const availableTripsButton =
        document.getElementById(
            "availableTripsButton"
        );


    if (availableTripsButton) {

        availableTripsButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/passenger-trips.html";

            }
        );

    }


    /*
     * My Tickets
     */

    const myTicketsButton =
        document.getElementById(
            "myTicketsButton"
        );


    if (myTicketsButton) {

        myTicketsButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/passenger-tickets.html";

            }
        );

    }


    /*
     * Payments
     */

    const paymentsButton =
        document.getElementById(
            "paymentsButton"
        );


    if (paymentsButton) {

        paymentsButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/passenger-payments.html";

            }
        );

    }


    /*
     * Travel History
     */

    const historyButton =
        document.getElementById(
            "travelHistoryButton"
        );


    if (historyButton) {

        historyButton.addEventListener(
            "click",
            function () {

                alert(
                    "Travel History module will be developed next."
                );

            }
        );

    }


    /*
     * Reviews
     */

    const reviewsButton =
        document.getElementById(
            "myReviewsButton"
        );


    if (reviewsButton) {

        reviewsButton.addEventListener(
            "click",
            function () {

                alert(
                    "My Reviews module will be developed next."
                );

            }
        );

    }


    /*
     * Announcements
     */

    const announcementsButton =
        document.getElementById(
            "announcementsButton"
        );


    if (announcementsButton) {

        announcementsButton.addEventListener(
            "click",
            function () {

                alert(
                    "Announcements module will be developed next."
                );

            }
        );

    }


    /*
     * Profile
     */

    const profileButton =
        document.getElementById(
            "profileButton"
        );


    if (profileButton) {

        profileButton.addEventListener(
            "click",
            function () {

                alert(
                    "Profile module will be developed next."
                );

            }
        );

    }

}


/* =========================================================
   QUICK ACCESS
   ========================================================= */

function setupQuickAccess() {


    /*
     * Find Trip
     */

    const findTripCard =
        document.getElementById(
            "findTripCard"
        );


    if (findTripCard) {

        findTripCard.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/passenger-trips.html";

            }
        );

    }


    /*
     * My Tickets
     */

    const ticketCard =
        document.getElementById(
            "ticketCard"
        );


    if (ticketCard) {

        ticketCard.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/passenger-tickets.html";

            }
        );

    }


    /*
     * Payments
     */

    const paymentCard =
        document.getElementById(
            "paymentCard"
        );


    if (paymentCard) {

        paymentCard.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/passenger-payments.html";

            }
        );

    }


    /*
     * Travel History
     */

    const historyCard =
        document.getElementById(
            "historyCard"
        );


    if (historyCard) {

        historyCard.addEventListener(
            "click",
            function () {

                alert(
                    "Travel History module will be developed next."
                );

            }
        );

    }

}


/* =========================================================
   LOAD PASSENGER INFORMATION
   ========================================================= */

async function loadPassengerInformation() {

    try {

        let passengerId =
            sessionStorage.getItem(
                "passengerId"
            );


        /*
         * Fall back to userId.
         */

        if (!passengerId) {

            passengerId =
                sessionStorage.getItem(
                    "userId"
                );

        }


        if (!passengerId) {

            console.error(
                "Passenger ID not found."
            );

            return;

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

            console.error(
                "Unable to load passenger information."
            );

            return;

        }


        const passenger =
            await response.json();


        const passengerName =
            passenger.fullName ||
            passenger.name ||
            passenger.firstName ||
            sessionStorage.getItem(
                "username"
            ) ||
            "Passenger";


        /*
         * Header name.
         */

        const passengerNameElement =
            document.getElementById(
                "passengerName"
            );


        if (passengerNameElement) {

            passengerNameElement.textContent =
                passengerName;

        }


        /*
         * Welcome name.
         */

        const welcomePassenger =
            document.getElementById(
                "welcomePassenger"
            );


        if (welcomePassenger) {

            welcomePassenger.textContent =
                "Welcome, " +
                passengerName;

        }


    }
    catch (error) {

        console.error(
            "Passenger information error:",
            error
        );

    }

}


/* =========================================================
   LOAD DASHBOARD STATISTICS
   ========================================================= */

async function loadDashboardStatistics() {

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

            return;

        }


        const tickets =
            await response.json();


        if (
            !Array.isArray(
                tickets
            )
        ) {

            return;

        }


        const passengerId =
            Number(
                sessionStorage.getItem(
                    "passengerId"
                ) ||
                sessionStorage.getItem(
                    "userId"
                )
            );


        /*
         * Passenger tickets.
         */

        const passengerTickets =
            tickets.filter(
                function (ticket) {

                    const ticketPassenger =
                        ticket.passenger;


                    const id =
                        ticketPassenger &&
                        typeof ticketPassenger ===
                        "object"
                            ? (
                                ticketPassenger.passengerId ??
                                ticketPassenger.id
                            )
                            : (
                                ticket.passengerId ??
                                ticket.passenger_id
                            );


                    return Number(id) ===
                        passengerId;

                }
            );


        /*
         * Total tickets.
         */

        const myTicketCount =
            document.getElementById(
                "myTicketCount"
            );


        if (myTicketCount) {

            myTicketCount.textContent =
                passengerTickets.length;

        }


        /*
         * Upcoming tickets.
         */

        let upcomingCount = 0;

        let completedCount = 0;

        let totalSpent = 0;


        passengerTickets.forEach(
            function (ticket) {

                const status =
                    String(
                        ticket.ticketStatus ||
                        ticket.status ||
                        ""
                    ).toUpperCase();


                const price =
                    Number(
                        ticket.ticketPrice ??
                        ticket.price ??
                        0
                    );


                /*
                 * Ignore cancelled tickets
                 * for total spent.
                 */

                if (
                    status !==
                    "CANCELLED"
                ) {

                    totalSpent +=
                        price;

                }


                if (
                    status ===
                    "BOOKED"
                ) {

                    upcomingCount++;

                }


                if (
                    status ===
                    "COMPLETED"
                ) {

                    completedCount++;

                }

            }
        );


        /*
         * Update cards.
         */

        const upcomingTripCount =
            document.getElementById(
                "upcomingTripCount"
            );


        if (upcomingTripCount) {

            upcomingTripCount.textContent =
                upcomingCount;

        }


        const completedTripCount =
            document.getElementById(
                "completedTripCount"
            );


        if (completedTripCount) {

            completedTripCount.textContent =
                completedCount;

        }


        const totalSpentElement =
            document.getElementById(
                "totalSpent"
            );


        if (totalSpentElement) {

            totalSpentElement.textContent =
                "Rs. " +
                totalSpent.toLocaleString(
                    "en-LK",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );

        }

    }
    catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );

    }

}


/* =========================================================
   DATE
   ========================================================= */

function setupDate() {

    const dateElement =
        document.getElementById(
            "currentDate"
        );


    if (!dateElement) {

        return;

    }


    const today =
        new Date();


    dateElement.textContent =
        today.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}


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


