/* =========================================================
   SMARTMOVE - ROUTE MANAGEMENT
   ========================================================= */


let editingRouteId = null;

let allRoutes = [];


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const isAdmin =
            await checkAdmin();


        if (!isAdmin) {

            return;

        }


        setupEvents();


        await loadRoutes();

    }
);


/* =========================================================
   CHECK ADMIN LOGIN
   ========================================================= */

async function checkAdmin() {

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
            !== "ADMIN"
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

    }
    catch (error) {

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
   SETUP EVENTS
   ========================================================= */

function setupEvents() {


    /* =====================================================
       DASHBOARD
       ===================================================== */

    const dashboardButton =
        document.getElementById(
            "dashboardButton"
        );


    if (dashboardButton) {

        dashboardButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/admin-dashboard.html";

            }
        );

    }


    /* =====================================================
       ADD ROUTE
       ===================================================== */

    const addButton =
        document.getElementById(
            "showRouteFormButton"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            openAddRouteForm
        );

    }


    /* =====================================================
       CLOSE FORM
       ===================================================== */

    const closeButton =
        document.getElementById(
            "closeRouteFormButton"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeRouteForm
        );

    }


    /* =====================================================
       CANCEL
       ===================================================== */

    const cancelButton =
        document.getElementById(
            "cancelRouteButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeRouteForm
        );

    }


    /* =====================================================
       REFRESH
       ===================================================== */

    const refreshButton =
        document.getElementById(
            "refreshRoutesButton"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadRoutes
        );

    }


    /* =====================================================
       FORM
       ===================================================== */

    const form =
        document.getElementById(
            "routeForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            saveRoute
        );

    }


    /* =====================================================
       LOGOUT
       ===================================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );

    }

}


/* =========================================================
   LOAD ROUTES
   ========================================================= */

async function loadRoutes() {

    const container =
        document.getElementById(
            "routesContent"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `
        <div class="loading">
            Loading routes...
        </div>
    `;


    try {

        const response =
            await fetch(
                "/api/routes",
                {
                    method: "GET",

                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                window.location.href =
                    "/index.html";

                return;

            }


            const errorMessage =
                await readError(
                    response
                );


            throw new Error(
                errorMessage ||
                "Unable to load routes."
            );

        }


        const data =
            await response.json();


        allRoutes =
            Array.isArray(data)
                ? data
                : [];


        displayRoutes(
            allRoutes
        );

    }
    catch (error) {

        console.error(
            "Route loading error:",
            error
        );


        container.innerHTML = `
            <div class="error-message">

                Unable to load routes.

                <br><br>

                ${escapeHtml(
            error.message ||
            "Unknown error"
        )}

            </div>
        `;

    }

}


/* =========================================================
   DISPLAY ROUTES
   ========================================================= */

function displayRoutes(routes) {

    const container =
        document.getElementById(
            "routesContent"
        );


    if (!container) {

        return;

    }


    if (
        !routes ||
        routes.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-message">

                No routes found.

            </div>
        `;

        return;

    }


    let html = "";


    html += `
        <div class="table-container">

            <table>

                <thead>

                    <tr>

                        <th>
                            ID
                        </th>

                        <th>
                            Route Name
                        </th>

                        <th>
                            Source
                        </th>

                        <th>
                            Destination
                        </th>

                        <th>
                            Distance
                        </th>

                        <th>
                            Duration
                        </th>

                        <th>
                            Base Fare
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Actions
                        </th>

                    </tr>

                </thead>

                <tbody>
    `;


    routes.forEach(
        function (route) {


            const id =
                route.routeId ??
                route.id ??
                "";


            const routeName =
                route.routeName ||
                "-";


            const source =
                route.sourceLocation ||
                "-";


            const destination =
                route.destinationLocation ||
                "-";


            const distance =
                route.distanceKm ??
                "-";


            const duration =
                route.estimatedDurationMin ??
                "-";


            const fare =
                route.baseFare ??
                0;


            const status =
                String(
                    route.routeStatus ??
                    route.status ??
                    "ACTIVE"
                ).toUpperCase();


            const statusClass =
                status === "ACTIVE"
                    ? "status-active"
                    : "status-inactive";


            html += `

                <tr>


                    <td>

                        ${escapeHtml(
                id
            )}

                    </td>


                    <td>

                        ${escapeHtml(
                routeName
            )}

                    </td>


                    <td>

                        ${escapeHtml(
                source
            )}

                    </td>


                    <td>

                        ${escapeHtml(
                destination
            )}

                    </td>


                    <td>

                        ${escapeHtml(
                distance
            )}
                        KM

                    </td>


                    <td>

                        ${escapeHtml(
                duration
            )}
                        min

                    </td>


                    <td>

                        Rs.
                        ${formatMoney(
                fare
            )}

                    </td>


                    <td>

                        <span
                                class="status
                                ${statusClass}">

                            ${escapeHtml(
                status
            )}

                        </span>

                    </td>


                    <td>


                        <button
                                type="button"
                                class="edit-button"
                                onclick="editRoute(${id})">

                            Edit

                        </button>


                        <button
                                type="button"
                                class="delete-button"
                                onclick="deleteRoute(${id})">

                            Delete

                        </button>


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
   OPEN ADD ROUTE FORM
   ========================================================= */

function openAddRouteForm() {

    editingRouteId = null;


    const form =
        document.getElementById(
            "routeForm"
        );


    const panel =
        document.getElementById(
            "routeFormPanel"
        );


    const title =
        document.getElementById(
            "routeFormTitle"
        );


    const id =
        document.getElementById(
            "routeId"
        );


    const status =
        document.getElementById(
            "routeStatus"
        );


    const message =
        document.getElementById(
            "routeFormMessage"
        );


    if (form) {

        form.reset();

    }


    if (title) {

        title.textContent =
            "Add Route";

    }


    if (id) {

        id.value = "";

    }


    if (status) {

        status.value =
            "ACTIVE";

    }


    if (message) {

        message.textContent =
            "";

        message.className =
            "form-message";

    }


    if (panel) {

        panel.style.display =
            "block";

    }

}


/* =========================================================
   CLOSE ROUTE FORM
   ========================================================= */

function closeRouteForm() {

    editingRouteId = null;


    const panel =
        document.getElementById(
            "routeFormPanel"
        );


    const form =
        document.getElementById(
            "routeForm"
        );


    const message =
        document.getElementById(
            "routeFormMessage"
        );


    if (panel) {

        panel.style.display =
            "none";

    }


    if (form) {

        form.reset();

    }


    if (message) {

        message.textContent =
            "";

        message.className =
            "form-message";

    }

}


/* =========================================================
   EDIT ROUTE
   ========================================================= */

async function editRoute(id) {

    try {

        const response =
            await fetch(
                `/api/routes/${id}`,
                {
                    method: "GET",

                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            const errorMessage =
                await readError(
                    response
                );


            throw new Error(
                errorMessage ||
                "Unable to load route."
            );

        }


        const route =
            await response.json();


        editingRouteId =
            route.routeId ??
            route.id ??
            id;


        document.getElementById(
            "routeFormTitle"
        ).textContent =
            "Edit Route";


        document.getElementById(
            "routeId"
        ).value =
            editingRouteId;


        document.getElementById(
            "routeName"
        ).value =
            route.routeName ||
            "";


        document.getElementById(
            "sourceLocation"
        ).value =
            route.sourceLocation ||
            "";


        document.getElementById(
            "destinationLocation"
        ).value =
            route.destinationLocation ||
            "";


        document.getElementById(
            "distanceKm"
        ).value =
            route.distanceKm ??
            "";


        document.getElementById(
            "estimatedDurationMin"
        ).value =
            route.estimatedDurationMin ??
            "";


        document.getElementById(
            "baseFare"
        ).value =
            route.baseFare ??
            "";


        document.getElementById(
            "routeStatus"
        ).value =
            route.routeStatus ??
            route.status ??
            "ACTIVE";


        document.getElementById(
            "routeFormMessage"
        ).textContent =
            "";


        document.getElementById(
            "routeFormPanel"
        ).style.display =
            "block";


        window.scrollTo(
            {
                top: 0,
                behavior: "smooth"
            }
        );

    }
    catch (error) {

        console.error(
            "Edit route error:",
            error
        );


        alert(
            "Unable to load route.\n\n" +
            (
                error.message ||
                ""
            )
        );

    }

}


/* =========================================================
   SAVE ROUTE
   ========================================================= */

async function saveRoute(event) {

    event.preventDefault();


    const routeName =
        document.getElementById(
            "routeName"
        ).value.trim();


    const sourceLocation =
        document.getElementById(
            "sourceLocation"
        ).value.trim();


    const destinationLocation =
        document.getElementById(
            "destinationLocation"
        ).value.trim();


    const distanceKm =
        document.getElementById(
            "distanceKm"
        ).value;


    const estimatedDurationMin =
        document.getElementById(
            "estimatedDurationMin"
        ).value;


    const baseFare =
        document.getElementById(
            "baseFare"
        ).value;


    const routeStatus =
        document.getElementById(
            "routeStatus"
        ).value;


    /* =====================================================
       VALIDATION
       ===================================================== */

    if (!routeName) {

        showFormMessage(
            "Route name is required.",
            "error"
        );

        return;

    }


    if (!sourceLocation) {

        showFormMessage(
            "Source location is required.",
            "error"
        );

        return;

    }


    if (!destinationLocation) {

        showFormMessage(
            "Destination location is required.",
            "error"
        );

        return;

    }


    if (!distanceKm) {

        showFormMessage(
            "Distance is required.",
            "error"
        );

        return;

    }


    if (!estimatedDurationMin) {

        showFormMessage(
            "Estimated duration is required.",
            "error"
        );

        return;

    }


    if (!baseFare) {

        showFormMessage(
            "Base fare is required.",
            "error"
        );

        return;

    }


    const data = {

        routeName:
        routeName,

        sourceLocation:
        sourceLocation,

        destinationLocation:
        destinationLocation,

        distanceKm:
            Number(distanceKm),

        estimatedDurationMin:
            Number(
                estimatedDurationMin
            ),

        baseFare:
            Number(baseFare),

        routeStatus:
        routeStatus

    };


    const saveButton =
        document.getElementById(
            "saveRouteButton"
        );


    const wasEditing =
        editingRouteId !== null;


    try {

        if (saveButton) {

            saveButton.disabled =
                true;


            saveButton.textContent =
                wasEditing
                    ? "Updating..."
                    : "Saving...";

        }


        let response;


        /* =================================================
           UPDATE
           ================================================= */

        if (wasEditing) {

            response =
                await fetch(
                    `/api/routes/${editingRouteId}`,
                    {
                        method: "PUT",

                        credentials: "include",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                data
                            )
                    }
                );

        }


        /* =================================================
           CREATE
           ================================================= */

        else {

            response =
                await fetch(
                    "/api/routes",
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                data
                            )
                    }
                );

        }


        if (!response.ok) {

            const errorMessage =
                await readError(
                    response
                );


            throw new Error(
                errorMessage ||
                "Unable to save route."
            );

        }


        showFormMessage(
            wasEditing
                ? "Route updated successfully."
                : "Route added successfully.",
            "success"
        );


        await loadRoutes();


        setTimeout(
            function () {

                closeRouteForm();

            },
            700
        );

    }
    catch (error) {

        console.error(
            "Save route error:",
            error
        );


        showFormMessage(
            error.message ||
            "Unable to save route.",
            "error"
        );

    }
    finally {

        if (saveButton) {

            saveButton.disabled =
                false;


            saveButton.textContent =
                wasEditing
                    ? "Update Route"
                    : "Save Route";

        }

    }

}


/* =========================================================
   DELETE ROUTE
   ========================================================= */

async function deleteRoute(id) {

    const route =
        allRoutes.find(
            function (item) {

                const routeId =
                    item.routeId ??
                    item.id;

                return String(
                    routeId
                ) === String(id);

            }
        );


    let routeName =
        "this route";


    if (route) {

        routeName =
            route.routeName ||
            (
                (
                    route.sourceLocation ||
                    ""
                ) +
                " - " +
                (
                    route.destinationLocation ||
                    ""
                )
            );

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete " +
            routeName +
            "?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/routes/${id}`,
                {
                    method: "DELETE",

                    credentials: "include",

                    headers: {

                        "Accept":
                            "application/json"

                    }
                }
            );


        if (!response.ok) {

            const errorMessage =
                await readError(
                    response
                );


            throw new Error(
                errorMessage ||
                "Unable to delete route."
            );

        }


        alert(
            "Route deleted successfully."
        );


        await loadRoutes();

    }
    catch (error) {

        console.error(
            "Delete route error:",
            error
        );


        alert(
            "Unable to delete route.\n\n" +
            (
                error.message ||
                ""
            )
        );

    }

}


/* =========================================================
   SHOW FORM MESSAGE
   ========================================================= */

function showFormMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "routeFormMessage"
        );


    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.className =
        "form-message " +
        type;

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

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


/* =========================================================
   READ ERROR
   ========================================================= */

async function readError(response) {

    try {

        const text =
            await response.text();


        if (!text) {

            return "";

        }


        try {

            const json =
                JSON.parse(text);


            return (
                json.message ||
                json.error ||
                json.detail ||
                text
            );

        }
        catch {

            return text;

        }

    }
    catch {

        return "";

    }

}


/* =========================================================
   FORMAT MONEY
   ========================================================= */

function formatMoney(value) {

    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

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
   ESCAPE HTML
   ========================================================= */

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