
/* =========================================================
   SMARTMOVE - ADMIN DASHBOARD
   ========================================================= */


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


        /* =====================================================
           SIDEBAR NAVIGATION
           ===================================================== */

        setupNavigation();

        setupVehicleNavigation();

        setupDriverNavigation();

        setupRouteNavigation();

        setupRouteStopNavigation();

        setupPassengerNavigation();

        setupTripsNavigation();

        setupTicketsNavigation();

        setupPaymentsNavigation();

        setupMaintenanceNavigation();

        setupFeedbackNavigation();

        setupMongoNavigation();

        setupReportsNavigation();


        /* =====================================================
           OTHER FUNCTIONS
           ===================================================== */

        setupQuickActions();

        setupLogout();

        setupDate();


        /* =====================================================
           DASHBOARD DATA
           ===================================================== */

        await loadDashboardCounts();

    }
);


/* =========================================================
   CHECK ADMIN LOGIN
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


        const usernameElement =
            document.getElementById("adminUsername");


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


        window.location.href = "/index.html";

        return false;

    }

}


/* =========================================================
   NORMAL DASHBOARD NAVIGATION
   ========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".menu-item[data-section]"
        );


    navItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const target =
                        this.getAttribute(
                            "data-section"
                        );


                    if (!target) {
                        return;
                    }


                    setActiveMenu(this);

                    showSection(target);

                }
            );

        }
    );

}


/* =========================================================
   SHOW DASHBOARD SECTION
   ========================================================= */

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(
            ".content-section"
        );


    sections.forEach(
        function (section) {

            section.classList.remove("active");

        }
    );


    const selectedSection =
        document.getElementById(sectionId);


    if (selectedSection) {

        selectedSection.classList.add("active");

    }


    updatePageTitle(sectionId);

}


/* =========================================================
   SET ACTIVE MENU
   ========================================================= */

function setActiveMenu(selectedButton) {

    const buttons =
        document.querySelectorAll(
            ".menu-item"
        );


    buttons.forEach(
        function (button) {

            button.classList.remove("active");

        }
    );


    if (selectedButton) {

        selectedButton.classList.add("active");

    }

}


/* =========================================================
   PAGE TITLE
   ========================================================= */

function updatePageTitle(sectionId) {

    const pageTitle =
        document.getElementById("pageTitle");


    const pageSubtitle =
        document.getElementById("pageSubtitle");


    if (!pageTitle) {
        return;
    }


    const titles = {

        dashboard: [
            "Dashboard",
            "SmartMove Transport Management System"
        ],

        reports: [
            "Reports",
            "SmartMove business reports"
        ]

    };


    const title =
        titles[sectionId];


    if (title) {

        pageTitle.textContent =
            title[0];


        if (pageSubtitle) {

            pageSubtitle.textContent =
                title[1];

        }

    }

}


/* =========================================================
   VEHICLE NAVIGATION
   ========================================================= */

function setupVehicleNavigation() {

    const button =
        document.getElementById(
            "vehiclesMenuButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "/vehicle-management.html";

        }
    );

}


/* =========================================================
   DRIVER NAVIGATION
   ========================================================= */

function setupDriverNavigation() {

    const button =
        document.getElementById(
            "driversMenuButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "/driver-management.html";

        }
    );

}


/* =========================================================
   ROUTE NAVIGATION
   ========================================================= */

function setupRouteNavigation() {

    const button =
        document.getElementById(
            "routesMenuButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "/route-management.html";

        }
    );

}


/* =========================================================
   ROUTE STOP NAVIGATION
   ========================================================= */

function setupRouteStopNavigation() {

    const button =
        document.getElementById(
            "routeStopsMenuButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "/route-stop-management.html";

        }
    );

}


/* =========================================================
   PASSENGER NAVIGATION
   ========================================================= */

function setupPassengerNavigation() {

    const button =
        document.getElementById(
            "passengersMenuButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "/passenger-management.html";

        }
    );

}


/* =========================================================
   TRIPS NAVIGATION
   ========================================================= */

function setupTripsNavigation() {

    const button =
        document.getElementById(
            "tripsMenuButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "/trip-management.html";

        }
    );

}


/* =========================================================
   TICKETS NAVIGATION
   ========================================================= */

function setupTicketsNavigation() {

    const button =
        document.getElementById(
            "ticketsMenuButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "/ticket-management.html";

        }
    );

}


/* =========================================================
   PAYMENTS NAVIGATION
   ========================================================= */

function setupPaymentsNavigation() {

    const button =
        document.getElementById(
            "paymentsMenuButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "/payment-management.html";

        }
    );

}


/* =========================================================
   MAINTENANCE NAVIGATION
   ========================================================= */

function setupMaintenanceNavigation() {

    const button =
        document.getElementById(
            "maintenanceMenuButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "/maintenance-management.html";

        }
    );

}


/* =========================================================
   FEEDBACK NAVIGATION
   ========================================================= */

function setupFeedbackNavigation() {

    const button =
        document.getElementById(
            "feedbackMenuButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "/feedback-management.html";

        }
    );

}


/* =========================================================
   MONGODB NAVIGATION
   ========================================================= */

function setupMongoNavigation() {


    /* =====================================================
       VEHICLE DOCUMENTS
       ===================================================== */

    const documentsButton =
        document.getElementById(
            "documentsMenuButton"
        );


    if (documentsButton) {

        documentsButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "/mongo-management.html#documents";

            }
        );

    }


    /* =====================================================
       PASSENGER REVIEWS
       ===================================================== */

    const reviewsButton =
        document.getElementById(
            "reviewsMenuButton"
        );


    if (reviewsButton) {

        reviewsButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "/mongo-management.html#reviews";

            }
        );

    }


    /* =====================================================
       ANNOUNCEMENTS
       ===================================================== */

    const announcementsButton =
        document.getElementById(
            "announcementsMenuButton"
        );


    if (announcementsButton) {

        announcementsButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "/mongo-management.html#announcements";

            }
        );

    }

}


/* =========================================================
   REPORTS NAVIGATION
   ========================================================= */
/* =========================================================
   REPORTS NAVIGATION
   ========================================================= */

function setupReportsNavigation() {

    const button =
        document.getElementById(
            "reportsMenuButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            window.location.href =
                "/reports-management.html";

        }
    );

}


/* =========================================================
   QUICK ACTIONS
   ========================================================= */

function setupQuickActions() {


    /* =====================================================
       DRIVERS
       ===================================================== */

    const drivers =
        document.getElementById(
            "manageDriversButton"
        );


    if (drivers) {

        drivers.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/driver-management.html";

            }
        );

    }


    /* =====================================================
       ROUTES
       ===================================================== */

    const routes =
        document.getElementById(
            "manageRoutesButton"
        );


    if (routes) {

        routes.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/route-management.html";

            }
        );

    }


    /* =====================================================
       ROUTE STOPS
       ===================================================== */

    const routeStops =
        document.getElementById(
            "manageRouteStopsButton"
        );


    if (routeStops) {

        routeStops.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/route-stop-management.html";

            }
        );

    }


    /* =====================================================
       MAINTENANCE
       ===================================================== */

    const maintenance =
        document.getElementById(
            "maintenanceButton"
        );


    if (maintenance) {

        maintenance.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/maintenance-management.html";

            }
        );

    }


    /* =====================================================
       FEEDBACK
       ===================================================== */

    const feedback =
        document.getElementById(
            "FeedbackButton"
        );


    if (feedback) {

        feedback.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/feedback-management.html";

            }
        );

    }


    /* =====================================================
       MONGODB DOCUMENTS
       ===================================================== */

    const mongoDocuments =
        document.getElementById(
            "mongoDocumentsQuickAction"
        );


    if (mongoDocuments) {

        mongoDocuments.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/mongo-management.html#documents";

            }
        );

    }


    /* =====================================================
       MONGODB REVIEWS
       ===================================================== */

    const mongoReviews =
        document.getElementById(
            "mongoReviewsQuickAction"
        );


    if (mongoReviews) {

        mongoReviews.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/mongo-management.html#reviews";

            }
        );

    }


    /* =====================================================
       MONGODB ANNOUNCEMENTS
       ===================================================== */

    const mongoAnnouncements =
        document.getElementById(
            "mongoAnnouncementsQuickAction"
        );


    if (mongoAnnouncements) {

        mongoAnnouncements.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/mongo-management.html#announcements";

            }
        );

    }


    /* =====================================================
       DASHBOARD MONGODB BUTTONS
       ===================================================== */

    const dashboardDocuments =
        document.getElementById(
            "mongoDocumentsDashboardButton"
        );


    if (dashboardDocuments) {

        dashboardDocuments.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/mongo-management.html#documents";

            }
        );

    }


    const dashboardReviews =
        document.getElementById(
            "mongoReviewsDashboardButton"
        );


    if (dashboardReviews) {

        dashboardReviews.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/mongo-management.html#reviews";

            }
        );

    }


    const dashboardAnnouncements =
        document.getElementById(
            "mongoAnnouncementsDashboardButton"
        );


    if (dashboardAnnouncements) {

        dashboardAnnouncements.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/mongo-management.html#announcements";

            }
        );

    }


    /* =====================================================
       DATA-OPEN
       ===================================================== */

    const openButtons =
        document.querySelectorAll(
            "[data-open]"
        );


    openButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const target =
                        this.getAttribute(
                            "data-open"
                        );


                    if (!target) {
                        return;
                    }


                    switch (target) {

                        case "vehicles":

                            window.location.href =
                                "/vehicle-management.html";

                            break;


                        case "drivers":

                            window.location.href =
                                "/driver-management.html";

                            break;


                        case "routes":

                            window.location.href =
                                "/route-management.html";

                            break;


                        case "trips":

                            window.location.href =
                                "/trip-management.html";

                            break;


                        case "documents":

                            window.location.href =
                                "/mongo-management.html#documents";

                            break;


                        case "reviews":

                            window.location.href =
                                "/mongo-management.html#reviews";

                            break;


                        case "announcements":

                            window.location.href =
                                "/mongo-management.html#announcements";

                            break;

                    }

                }
            );

        }
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    const button =
        document.getElementById(
            "logoutButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        logout
    );

}


async function logout() {

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

    } finally {

        sessionStorage.clear();

        window.location.href =
            "/index.html";

    }

}


/* =========================================================
   DATE
   ========================================================= */

function setupDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) {
        return;
    }


    const today =
        new Date();


    element.textContent =
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
   DASHBOARD COUNTS
   ========================================================= */

async function loadDashboardCounts() {

    await loadCount(
        "/api/vehicles",
        "vehicleCount"
    );


    await loadCount(
        "/api/drivers",
        "driverCount"
    );


    await loadCount(
        "/api/routes",
        "routeCount"
    );


    await loadCount(
        "/api/passengers",
        "passengerCount"
    );


    await loadCount(
        "/api/trips",
        "tripCount"
    );


    await loadCount(
        "/api/tickets",
        "ticketCount"
    );

}


/* =========================================================
   LOAD ONE COUNT
   ========================================================= */

async function loadCount(
    url,
    elementId
) {

    try {

        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            console.error(
                "Failed to load:",
                url,
                response.status
            );

            return;

        }


        const data =
            await response.json();


        const element =
            document.getElementById(
                elementId
            );


        if (!element) {
            return;
        }


        if (Array.isArray(data)) {

            element.textContent =
                data.length;

        } else {

            element.textContent =
                data.count ?? 0;

        }

    } catch (error) {

        console.error(
            "Dashboard count error:",
            error
        );

    }

}

