let editingStopId = null;

document.addEventListener("DOMContentLoaded", function () {

    loadRoutes();

    setupEvents();

});


/* =========================
   SETUP EVENTS
   ========================= */

function setupEvents() {

    const routeSelect =
        document.getElementById("routeSelect");

    const addStopButton =
        document.getElementById("addStopButton");

    const closeModalButton =
        document.getElementById("closeModalButton");

    const cancelButton =
        document.getElementById("cancelButton");

    const stopForm =
        document.getElementById("stopForm");

    const backButton =
        document.getElementById("backButton");


    routeSelect.addEventListener(
        "change",
        function () {

            const routeId = this.value;

            if (routeId) {

                loadStops(routeId);

            } else {

                clearStops();

            }

        }
    );


    addStopButton.addEventListener(
        "click",
        function () {

            openAddForm();

        }
    );


    closeModalButton.addEventListener(
        "click",
        closeModal
    );


    cancelButton.addEventListener(
        "click",
        closeModal
    );


    stopForm.addEventListener(
        "submit",
        saveStop
    );


    backButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "/admin-dashboard.html";

        }
    );

}


/* =========================
   LOAD ROUTES
   ========================= */

async function loadRoutes() {

    try {

        const response =
            await fetch("/api/routes", {
                credentials: "include"
            });


        if (!response.ok) {

            throw new Error(
                "Failed to load routes"
            );

        }


        const routes =
            await response.json();


        const routeSelect =
            document.getElementById("routeSelect");

        const formRoute =
            document.getElementById("formRoute");


        routeSelect.innerHTML =
            '<option value="">-- Select Route --</option>';

        formRoute.innerHTML =
            '<option value="">-- Select Route --</option>';


        routes.forEach(function (route) {

            const option =
                document.createElement("option");


            option.value =
                route.routeId;


            option.textContent =
                getRouteName(route);


            routeSelect.appendChild(option);


            const formOption =
                option.cloneNode(true);

            formRoute.appendChild(formOption);

        });


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to load routes.",
            "error"
        );

    }

}


/* =========================
   ROUTE NAME
   ========================= */

function getRouteName(route) {

    if (route.routeName) {

        return route.routeName;

    }


    if (
        route.sourceLocation &&
        route.destinationLocation
    ) {

        return (
            route.sourceLocation +
            " - " +
            route.destinationLocation
        );

    }


    return "Route " + route.routeId;

}


/* =========================
   LOAD STOPS
   ========================= */

async function loadStops(routeId) {

    const tableBody =
        document.getElementById(
            "stopsTableBody"
        );


    tableBody.innerHTML = `
        <tr>
            <td colspan="4"
                class="empty-message">
                Loading stops...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `/api/route-stops/route/${routeId}`,
                {
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load route stops"
            );

        }


        const stops =
            await response.json();


        displayStops(stops);


        const routeSelect =
            document.getElementById(
                "routeSelect"
            );


        const selectedOption =
            routeSelect.options[
                routeSelect.selectedIndex
                ];


        document.getElementById(
            "selectedRouteText"
        ).textContent =
            selectedOption
                ? selectedOption.textContent
                : "Route Stops";


    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="4"
                    class="empty-message">
                    Unable to load route stops.
                </td>
            </tr>
        `;

    }

}


/* =========================
   DISPLAY STOPS
   ========================= */

function displayStops(stops) {

    const tableBody =
        document.getElementById(
            "stopsTableBody"
        );


    if (!stops || stops.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4"
                    class="empty-message">
                    No stops found for this route.
                </td>
            </tr>
        `;

        return;

    }


    stops.sort(function (a, b) {

        return a.stopSequence -
            b.stopSequence;

    });


    tableBody.innerHTML = "";


    stops.forEach(function (stop) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <span class="sequence">
                    ${escapeHtml(
            stop.stopSequence
        )}
                </span>
            </td>

            <td>
                ${escapeHtml(
            stop.stopId
        )}
            </td>

            <td>
                ${escapeHtml(
            stop.stopName
        )}
            </td>

            <td>

                <button
                    class="edit-button"
                    onclick="editStop(${stop.stopId})">
                    Edit
                </button>

                <button
                    class="delete-button"
                    onclick="deleteStop(${stop.stopId})">
                    Delete
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


/* =========================
   OPEN ADD FORM
   ========================= */

function openAddForm() {

    const routeId =
        document.getElementById(
            "routeSelect"
        ).value;


    if (!routeId) {

        showMessage(
            "Please select a route first.",
            "error"
        );

        return;

    }


    editingStopId = null;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add Route Stop";


    document.getElementById(
        "stopForm"
    ).reset();


    document.getElementById(
        "formRoute"
    ).value = routeId;


    document.getElementById(
        "formMessage"
    ).textContent = "";


    document.getElementById(
        "stopModal"
    ).classList.add("show");

}


/* =========================
   EDIT STOP
   ========================= */

async function editStop(stopId) {

    try {

        const response =
            await fetch(
                `/api/route-stops/${stopId}`,
                {
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load stop"
            );

        }


        const stop =
            await response.json();


        editingStopId =
            stop.stopId;


        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit Route Stop";


        document.getElementById(
            "stopId"
        ).value =
            stop.stopId;


        const routeId =
            stop.routeId ||
            (
                stop.route
                    ? stop.route.routeId
                    : ""
            );


        document.getElementById(
            "formRoute"
        ).value =
            routeId;


        document.getElementById(
            "stopName"
        ).value =
            stop.stopName || "";


        document.getElementById(
            "stopSequence"
        ).value =
            stop.stopSequence || "";


        document.getElementById(
            "formMessage"
        ).textContent = "";


        document.getElementById(
            "stopModal"
        ).classList.add("show");


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to load stop.",
            "error"
        );

    }

}


/* =========================
   SAVE STOP
   ========================= */

async function saveStop(event) {

    event.preventDefault();


    const routeId =
        document.getElementById(
            "formRoute"
        ).value;


    const stopName =
        document.getElementById(
            "stopName"
        ).value.trim();


    const stopSequence =
        document.getElementById(
            "stopSequence"
        ).value;


    const formMessage =
        document.getElementById(
            "formMessage"
        );


    if (!routeId) {

        formMessage.textContent =
            "Please select a route.";

        return;

    }


    if (!stopName) {

        formMessage.textContent =
            "Please enter stop name.";

        return;

    }


    if (!stopSequence) {

        formMessage.textContent =
            "Please enter stop sequence.";

        return;

    }


    const data = {

        routeId: Number(routeId),

        stopName: stopName,

        stopSequence:
            Number(stopSequence)

    };


    try {

        let response;


        if (editingStopId) {

            response =
                await fetch(
                    `/api/route-stops/${editingStopId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body:
                            JSON.stringify(data)
                    }
                );

        } else {

            response =
                await fetch(
                    "/api/route-stops",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body:
                            JSON.stringify(data)
                    }
                );

        }


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to save stop"
            );

        }


        closeModal();


        showMessage(
            editingStopId
                ? "Route stop updated successfully."
                : "Route stop added successfully.",
            "success"
        );


        const selectedRoute =
            document.getElementById(
                "routeSelect"
            ).value;


        if (selectedRoute) {

            await loadStops(
                selectedRoute
            );

        }


    } catch (error) {

        console.error(error);

        formMessage.textContent =
            "Unable to save route stop.";

    }

}


/* =========================
   DELETE STOP
   ========================= */

async function deleteStop(stopId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this stop?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/route-stops/${stopId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to delete stop"
            );

        }


        showMessage(
            "Route stop deleted successfully.",
            "success"
        );


        const routeId =
            document.getElementById(
                "routeSelect"
            ).value;


        if (routeId) {

            await loadStops(routeId);

        }


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to delete route stop.",
            "error"
        );

    }

}


/* =========================
   CLOSE MODAL
   ========================= */

function closeModal() {

    editingStopId = null;


    document.getElementById(
        "stopModal"
    ).classList.remove("show");


    document.getElementById(
        "stopForm"
    ).reset();


    document.getElementById(
        "formMessage"
    ).textContent = "";

}


/* =========================
   CLEAR STOPS
   ========================= */

function clearStops() {

    document.getElementById(
        "selectedRouteText"
    ).textContent =
        "Select a route to view its stops";


    document.getElementById(
        "stopsTableBody"
    ).innerHTML = `
        <tr>
            <td colspan="4"
                class="empty-message">
                Select a route
            </td>
        </tr>
    `;

}


/* =========================
   MESSAGE
   ========================= */

function showMessage(message, type) {

    const messageElement =
        document.getElementById(
            "message"
        );


    messageElement.textContent =
        message;


    messageElement.className =
        type === "success"
            ? "success-message"
            : "error-message";


    setTimeout(function () {

        messageElement.textContent = "";

        messageElement.className = "";

    }, 3000);

}


/* =========================
   ESCAPE HTML
   ========================= */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}