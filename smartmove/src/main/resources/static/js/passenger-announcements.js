/* =========================================================
   SMARTMOVE - PASSENGER ANNOUNCEMENTS
   MongoDB
   ========================================================= */

let currentUser = null;
let allAnnouncements = [];
let filteredAnnouncements = [];


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setupNavigation();
        setupFilters();
        setupRefresh();

        await loadCurrentUser();

    }
);


/* =========================================================
   CURRENT USER
   ========================================================= */

async function loadCurrentUser() {

    try {

        const response =
            await fetch(
                "/api/users/current-user",
                {
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to get current user."
            );
        }


        currentUser =
            await response.json();


        const role =
            currentUser.role ||
            currentUser.userRole ||
            currentUser.accountType ||
            "";


        if (
            String(role).toUpperCase()
            !== "PASSENGER"
        ) {

            window.location.href =
                "/index.html";

            return;
        }


        const name =
            currentUser.passengerName ||
            currentUser.fullName ||
            currentUser.username ||
            "Passenger";


        const nameElement =
            document.getElementById(
                "passengerName"
            );


        if (nameElement) {

            nameElement.textContent =
                name;
        }


        await loadAnnouncements();

    }
    catch (error) {

        console.error(
            error
        );


        showMessage(
            error.message,
            "error"
        );


        hideLoading();
    }
}


/* =========================================================
   LOAD ANNOUNCEMENTS
   ========================================================= */

async function loadAnnouncements() {

    showLoading();


    try {

        const response =
            await fetch(
                "/api/mongo/announcements",
                {
                    credentials: "include"
                }
            );


        if (!response.ok) {

            const text =
                await response.text();

            console.error(
                "Announcement response:",
                text
            );

            throw new Error(
                "Unable to load announcements."
            );
        }


        const announcements =
            await response.json();


        console.log(
            "MongoDB announcements:",
            announcements
        );


        /* ---------------------------------------------
           ACTIVE ANNOUNCEMENTS
           --------------------------------------------- */

        allAnnouncements =
            announcements.filter(
                announcement =>
                    isAnnouncementActive(
                        announcement
                    )
            );


        /* SORT BY PRIORITY + DATE */

        allAnnouncements.sort(
            (a, b) => {

                const priorityDifference =
                    getPriorityValue(
                        b.priority
                    ) -
                    getPriorityValue(
                        a.priority
                    );


                if (
                    priorityDifference !== 0
                ) {

                    return priorityDifference;
                }


                return (
                    new Date(
                        b.publishDate || 0
                    ) -
                    new Date(
                        a.publishDate || 0
                    )
                );
            }
        );


        applyFilters();

    }
    catch (error) {

        console.error(
            "Announcement error:",
            error
        );


        allAnnouncements = [];

        updateSummary();

        showMessage(
            error.message ||
            "Unable to load announcements.",
            "error"
        );


        hideLoading();

        showEmptyState();
    }
}


/* =========================================================
   ACTIVE ANNOUNCEMENT
   ========================================================= */

function isAnnouncementActive(
    announcement
) {

    const status =
        String(
            announcement.status ||
            ""
        ).toUpperCase();


    if (
        status &&
        status !== "ACTIVE"
    ) {

        return false;
    }


    const now =
        new Date();


    const publishDate =
        announcement.publishDate
            ? new Date(
                announcement.publishDate
            )
            : null;


    const expiryDate =
        announcement.expiryDate
            ? new Date(
                announcement.expiryDate
            )
            : null;


    if (
        publishDate &&
        !Number.isNaN(
            publishDate.getTime()
        ) &&
        publishDate > now
    ) {

        return false;
    }


    if (
        expiryDate &&
        !Number.isNaN(
            expiryDate.getTime()
        ) &&
        expiryDate < now
    ) {

        return false;
    }


    return true;
}


/* =========================================================
   FILTER
   ========================================================= */

function applyFilters() {

    const search =
        document.getElementById(
            "announcementSearch"
        );


    const type =
        document.getElementById(
            "announcementTypeFilter"
        );


    const searchValue =
        search
            ? search.value
                .trim()
                .toLowerCase()
            : "";


    const typeValue =
        type
            ? type.value
                .toUpperCase()
            : "";


    filteredAnnouncements =
        allAnnouncements.filter(
            announcement => {

                const title =
                    String(
                        announcement.title ||
                        ""
                    ).toLowerCase();


                const message =
                    String(
                        announcement.message ||
                        ""
                    ).toLowerCase();


                const announcementType =
                    String(
                        announcement.announcementType ||
                        ""
                    ).toUpperCase();


                const matchesSearch =
                    !searchValue ||
                    title.includes(
                        searchValue
                    ) ||
                    message.includes(
                        searchValue
                    );


                const matchesType =
                    !typeValue ||
                    announcementType ===
                    typeValue;


                return (
                    matchesSearch &&
                    matchesType
                );
            }
        );


    updateSummary();

    renderAnnouncements();
}


/* =========================================================
   RENDER
   ========================================================= */

function renderAnnouncements() {

    const container =
        document.getElementById(
            "announcementsContainer"
        );


    if (!container) {
        return;
    }


    hideLoading();

    container.innerHTML = "";


    if (
        filteredAnnouncements.length === 0
    ) {

        showEmptyState();

        return;
    }


    hideEmptyState();


    filteredAnnouncements.forEach(
        announcement => {

            container.appendChild(
                createAnnouncementCard(
                    announcement
                )
            );

        }
    );
}


/* =========================================================
   CARD
   ========================================================= */

function createAnnouncementCard(
    announcement
) {

    const card =
        document.createElement("div");


    card.className =
        "announcement-card";


    const title =
        announcement.title ||
        "Announcement";


    const type =
        announcement.announcementType ||
        "GENERAL";


    const message =
        announcement.message ||
        "";


    const priority =
        String(
            announcement.priority ||
            "LOW"
        ).toUpperCase();


    const routeId =
        announcement.routeId ??
        "-";


    const tripId =
        announcement.tripId ??
        "-";


    const publishDate =
        announcement.publishDate ||
        null;


    const expiryDate =
        announcement.expiryDate ||
        null;


    const priorityClass =
        "priority-" +
        priority.toLowerCase();


    card.innerHTML = `

        <div class="announcement-card-header">

            <div class="announcement-title">

                <h3>
                    ${escapeHtml(title)}
                </h3>

                <span class="announcement-type">

                    ${escapeHtml(type)}

                </span>

            </div>


            <span class="priority-badge ${priorityClass}">

                ${escapeHtml(priority)}

            </span>

        </div>


        <div class="announcement-body">


            <div class="announcement-message-text">

                ${escapeHtml(message)}

            </div>


            <div class="announcement-info">


                <div class="announcement-info-item">

                    <span>
                        Route ID
                    </span>

                    <strong>
                        ${escapeHtml(routeId)}
                    </strong>

                </div>


                <div class="announcement-info-item">

                    <span>
                        Trip ID
                    </span>

                    <strong>
                        ${escapeHtml(tripId)}
                    </strong>

                </div>


                <div class="announcement-info-item">

                    <span>
                        Published
                    </span>

                    <strong>

                        ${escapeHtml(
        formatDateTime(
            publishDate
        )
    )}

                    </strong>

                </div>


                <div class="announcement-info-item">

                    <span>
                        Expires
                    </span>

                    <strong>

                        ${escapeHtml(
        formatDateTime(
            expiryDate
        )
    )}

                    </strong>

                </div>


            </div>


        </div>


        <div class="announcement-footer">

            SmartMove Travel Announcement

        </div>

    `;


    return card;
}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary() {

    const total =
        allAnnouncements.length;


    const highPriority =
        allAnnouncements.filter(
            announcement =>
                String(
                    announcement.priority ||
                    ""
                ).toUpperCase()
                === "HIGH"
        ).length;


    setText(
        "announcementCount",
        total
    );


    setText(
        "highPriorityCount",
        highPriority
    );


    setText(
        "activeAnnouncementCount",
        total
    );
}


/* =========================================================
   PRIORITY VALUE
   ========================================================= */

function getPriorityValue(
    priority
) {

    switch (
        String(
            priority || ""
        ).toUpperCase()
        ) {

        case "HIGH":
            return 3;

        case "MEDIUM":
            return 2;

        case "LOW":
            return 1;

        default:
            return 0;
    }
}


/* =========================================================
   FILTER SETUP
   ========================================================= */

function setupFilters() {

    const search =
        document.getElementById(
            "announcementSearch"
        );


    const type =
        document.getElementById(
            "announcementTypeFilter"
        );


    if (search) {

        search.addEventListener(
            "input",
            applyFilters
        );
    }


    if (type) {

        type.addEventListener(
            "change",
            applyFilters
        );
    }


    const clear =
        document.getElementById(
            "clearAnnouncementFilterButton"
        );


    if (clear) {

        clear.addEventListener(
            "click",
            function () {

                if (search) {
                    search.value = "";
                }

                if (type) {
                    type.value = "";
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
            "refreshAnnouncementsButton"
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


            await loadAnnouncements();


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
            "announcementsLoading"
        );


    if (element) {
        element.style.display =
            "block";
    }
}


function hideLoading() {

    const element =
        document.getElementById(
            "announcementsLoading"
        );


    if (element) {
        element.style.display =
            "none";
    }
}


/* =========================================================
   EMPTY
   ========================================================= */

function showEmptyState() {

    const element =
        document.getElementById(
            "noAnnouncementsMessage"
        );


    if (element) {

        element.style.display =
            "block";
    }
}


function hideEmptyState() {

    const element =
        document.getElementById(
            "noAnnouncementsMessage"
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
            "announcementMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        "announcement-message " +
        (type || "");
}


/* =========================================================
   HELPER
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


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


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const links = {

        dashboardButton:
            "/passenger-dashboard.html",

        searchTripsButton:
            "/passenger-trips.html",

        availableTripsButton:
            "/passenger-trips.html",

        myTicketsButton:
            "/passenger-tickets.html",

        paymentsButton:
            "/passenger-payment.html",

        travelHistoryButton:
            "/passenger-travel-history.html",

        myReviewsButton:
            "/passenger-reviews.html",

        announcementsButton:
            "/passenger-announcements.html",

        vehicleInfoButton:
            "/passenger-vehicle-information.html",

        profileButton:
            "/passenger-profile.html"

    };


    Object.keys(links).forEach(
        id => {

            const button =
                document.getElementById(id);


            if (button) {

                button.onclick =
                    function () {

                        window.location.href =
                            links[id];
                    };
            }
        }
    );


    const logout =
        document.getElementById(
            "passengerLogoutButton"
        );


    if (logout) {

        logout.onclick =
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

                    console.error(error);
                }


                sessionStorage.clear();


                window.location.href =
                    "/index.html";
            };
    }
}