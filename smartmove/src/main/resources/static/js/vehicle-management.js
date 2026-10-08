/* =========================================================
   SMARTMOVE - VEHICLE MANAGEMENT
   ========================================================= */


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let editingVehicleId = null;


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Vehicle Management page loaded."
        );


        const isAdmin =
            await checkAdmin();


        if (!isAdmin) {

            return;

        }


        setupVehicleManagement();

        setupNavigationButtons();

        await loadVehicles();

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


        console.log(
            "Current user response:",
            response.status
        );


        if (!response.ok) {

            window.location.href =
                "/index.html";

            return false;
        }


        const user =
            await response.json();


        console.log(
            "Current logged-in user:",
            user
        );


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
   SETUP VEHICLE MANAGEMENT
   ========================================================= */

function setupVehicleManagement() {

    const addButton =
        document.getElementById(
            "showVehicleFormButton"
        );


    const closeButton =
        document.getElementById(
            "closeVehicleFormButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelVehicleButton"
        );


    const refreshButton =
        document.getElementById(
            "refreshVehiclesButton"
        );


    const form =
        document.getElementById(
            "vehicleForm"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            function () {

                openVehicleForm();

            }
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeVehicleForm
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeVehicleForm
        );

    }


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadVehicles
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            saveVehicle
        );

    }

}


/* =========================================================
   PAGE NAVIGATION BUTTONS
   ========================================================= */

function setupNavigationButtons() {

    const backButton =
        document.getElementById(
            "backDashboardButton"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/admin-dashboard.html";

            }
        );

    }


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
   OPEN ADD VEHICLE FORM
   ========================================================= */

function openVehicleForm() {

    editingVehicleId = null;


    const form =
        document.getElementById(
            "vehicleForm"
        );


    if (form) {

        form.reset();

    }


    document.getElementById(
        "vehicleFormTitle"
    ).textContent =
        "Add Vehicle";


    document.getElementById(
        "saveVehicleButton"
    ).textContent =
        "Save Vehicle";


    document.getElementById(
        "vehicleId"
    ).value =
        "";


    document.getElementById(
        "vehicleStatus"
    ).value =
        "ACTIVE";


    document.getElementById(
        "vehicleFormMessage"
    ).textContent =
        "";


    document.getElementById(
        "vehicleFormPanel"
    ).style.display =
        "block";


    document.getElementById(
        "vehicleFormPanel"
    ).scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   CLOSE FORM
   ========================================================= */

function closeVehicleForm() {

    editingVehicleId = null;


    const panel =
        document.getElementById(
            "vehicleFormPanel"
        );


    if (panel) {

        panel.style.display =
            "none";

    }


    const form =
        document.getElementById(
            "vehicleForm"
        );


    if (form) {

        form.reset();

    }


    const message =
        document.getElementById(
            "vehicleFormMessage"
        );


    if (message) {

        message.textContent =
            "";

    }

}


/* =========================================================
   LOAD VEHICLES
   ========================================================= */

async function loadVehicles() {

    const container =
        document.getElementById(
            "vehiclesContent"
        );


    if (!container) {

        return;

    }


    container.innerHTML =

        `<div class="loading">
            Loading vehicles...
        </div>`;


    try {

        const response =
            await fetch(
                "/api/vehicles",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            window.location.href =
                "/index.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Could not load vehicles."
            );

        }


        const vehicles =
            await response.json();


        console.log(
            "Vehicles:",
            vehicles
        );


        displayVehicles(
            vehicles
        );


    } catch (error) {

        console.error(
            "Load vehicles error:",
            error
        );


        container.innerHTML =

            `<div class="empty-section">
                ${escapeHtml(
                error.message
            )}
            </div>`;

    }

}


/* =========================================================
   DISPLAY VEHICLES
   ========================================================= */

function displayVehicles(
    vehicles
) {

    const container =
        document.getElementById(
            "vehiclesContent"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(vehicles) ||
        vehicles.length === 0
    ) {

        container.innerHTML =

            `<div class="empty-section">
                No registered vehicles found.
            </div>`;

        return;

    }


    let html = `

        <table class="vehicle-table">

            <thead>

                <tr>

                    <th>ID</th>

                    <th>
                        Registration
                    </th>

                    <th>
                        Type
                    </th>

                    <th>
                        Brand
                    </th>

                    <th>
                        Model
                    </th>

                    <th>
                        Year
                    </th>

                    <th>
                        Seats
                    </th>

                    <th>
                        Insurance Expiry
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


    vehicles.forEach(
        function (vehicle) {

            const status =
                vehicle.status || "";


            let statusClass =
                "";


            if (
                status === "ACTIVE"
            ) {

                statusClass =
                    "status-active";

            } else if (
                status === "MAINTENANCE"
            ) {

                statusClass =
                    "status-maintenance";

            } else if (
                status === "INACTIVE"
            ) {

                statusClass =
                    "status-inactive";

            }


            html += `

                <tr>

                    <td>
                        ${safeValue(
                vehicle.vehicleId
            )}
                    </td>


                    <td>
                        ${safeValue(
                vehicle.registrationNo
            )}
                    </td>


                    <td>
                        ${safeValue(
                vehicle.vehicleType
            )}
                    </td>


                    <td>
                        ${safeValue(
                vehicle.brand
            )}
                    </td>


                    <td>
                        ${safeValue(
                vehicle.model
            )}
                    </td>


                    <td>
                        ${safeValue(
                vehicle.manufactureYear
            )}
                    </td>


                    <td>
                        ${safeValue(
                vehicle.seatingCapacity
            )}
                    </td>


                    <td>
                        ${safeValue(
                formatDate(
                    vehicle.insuranceExpiry
                )
            )}
                    </td>


                    <td>

                        <span
                            class="status-badge
                                   ${statusClass}">

                            ${safeValue(status)}

                        </span>

                    </td>


                    <td>

                        <div
                            class="action-buttons">


                            <button
                                class="edit-button"
                                data-id="${vehicle.vehicleId}">

                                Edit

                            </button>


                            <button
                                class="delete-button"
                                data-id="${vehicle.vehicleId}">

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

    `;


    container.innerHTML =
        html;


    /* =====================================================
       EDIT BUTTONS
       ===================================================== */

    const editButtons =
        container.querySelectorAll(
            ".edit-button"
        );


    editButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        this.getAttribute(
                            "data-id"
                        );


                    editVehicle(id);

                }
            );

        }
    );


    /* =====================================================
       DELETE BUTTONS
       ===================================================== */

    const deleteButtons =
        container.querySelectorAll(
            ".delete-button"
        );


    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        this.getAttribute(
                            "data-id"
                        );


                    deleteVehicle(id);

                }
            );

        }
    );

}


/* =========================================================
   SAVE VEHICLE
   ========================================================= */

async function saveVehicle(
    event
) {

    event.preventDefault();


    const vehicleId =
        document.getElementById(
            "vehicleId"
        ).value;


    const vehicle = {

        registrationNo:
            document.getElementById(
                "registrationNo"
            ).value.trim(),


        vehicleType:
        document.getElementById(
            "vehicleType"
        ).value,


        brand:
            document.getElementById(
                "brand"
            ).value.trim(),


        model:
            document.getElementById(
                "model"
            ).value.trim(),


        manufactureYear:
            Number(
                document.getElementById(
                    "manufactureYear"
                ).value
            ),


        seatingCapacity:
            Number(
                document.getElementById(
                    "seatingCapacity"
                ).value
            ),


        insuranceExpiry:
        document.getElementById(
            "insuranceExpiry"
        ).value,


        status:
        document.getElementById(
            "vehicleStatus"
        ).value

    };


    const message =
        document.getElementById(
            "vehicleFormMessage"
        );


    const button =
        document.getElementById(
            "saveVehicleButton"
        );


    button.disabled =
        true;


    button.textContent =
        editingVehicleId
            ? "Updating..."
            : "Saving...";


    try {

        let url =
            "/api/vehicles";


        let method =
            "POST";


        if (editingVehicleId) {

            url =
                "/api/vehicles/" +
                editingVehicleId;


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
                            vehicle
                        )
                }
            );


        let data = null;


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

            data =
                await response.json();

        } else {

            data =
                await response.text();

        }


        if (!response.ok) {

            throw new Error(

                typeof data === "string"
                    ? data
                    : data.message ||
                    data.error ||
                    "Vehicle operation failed."

            );

        }


        message.textContent =
            editingVehicleId
                ? "Vehicle updated successfully."
                : "Vehicle added successfully.";


        message.style.color =
            "#166534";


        await loadVehicles();


        setTimeout(
            function () {

                closeVehicleForm();

            },
            700
        );


    } catch (error) {

        console.error(
            "Save vehicle error:",
            error
        );


        message.textContent =
            error.message;


        message.style.color =
            "#991b1b";


    } finally {

        button.disabled =
            false;


        button.textContent =
            editingVehicleId
                ? "Update Vehicle"
                : "Save Vehicle";

    }

}


/* =========================================================
   EDIT VEHICLE
   ========================================================= */

async function editVehicle(
    vehicleId
) {

    try {

        const response =
            await fetch(
                "/api/vehicles/" +
                vehicleId,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            window.location.href =
                "/index.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Could not load vehicle."
            );

        }


        const vehicle =
            await response.json();


        editingVehicleId =
            vehicle.vehicleId;


        document.getElementById(
            "vehicleId"
        ).value =
            vehicle.vehicleId;


        document.getElementById(
            "registrationNo"
        ).value =
            vehicle.registrationNo || "";


        document.getElementById(
            "vehicleType"
        ).value =
            vehicle.vehicleType || "";


        document.getElementById(
            "brand"
        ).value =
            vehicle.brand || "";


        document.getElementById(
            "model"
        ).value =
            vehicle.model || "";


        document.getElementById(
            "manufactureYear"
        ).value =
            vehicle.manufactureYear || "";


        document.getElementById(
            "seatingCapacity"
        ).value =
            vehicle.seatingCapacity || "";


        document.getElementById(
            "insuranceExpiry"
        ).value =
            convertToDateInput(
                vehicle.insuranceExpiry
            );


        document.getElementById(
            "vehicleStatus"
        ).value =
            vehicle.status || "ACTIVE";


        document.getElementById(
            "vehicleFormTitle"
        ).textContent =
            "Edit Vehicle";


        document.getElementById(
            "saveVehicleButton"
        ).textContent =
            "Update Vehicle";


        document.getElementById(
            "vehicleFormMessage"
        ).textContent =
            "";


        document.getElementById(
            "vehicleFormPanel"
        ).style.display =
            "block";


        document.getElementById(
            "vehicleFormPanel"
        ).scrollIntoView({
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Edit vehicle error:",
            error
        );


        alert(
            error.message
        );

    }

}


/* =========================================================
   DELETE VEHICLE
   ========================================================= */

async function deleteVehicle(
    vehicleId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this vehicle?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/vehicles/" +
                vehicleId,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );


        let data = null;


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

            data =
                await response.json();

        } else {

            data =
                await response.text();

        }


        if (!response.ok) {

            throw new Error(

                typeof data === "string"
                    ? data
                    : data.message ||
                    data.error ||
                    "Could not delete vehicle."

            );

        }


        alert(
            "Vehicle deleted successfully."
        );


        await loadVehicles();


    } catch (error) {

        console.error(
            "Delete vehicle error:",
            error
        );


        alert(
            error.message
        );

    }

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
   SAFE HTML
   ========================================================= */

function safeValue(
    value
) {

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

function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value == null
            ? ""
            : String(value);


    return div.innerHTML;

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    if (
        typeof value === "string" &&
        value.length >= 10
    ) {

        return value.substring(
            0,
            10
        );

    }


    return value;

}


/* =========================================================
   DATE INPUT CONVERSION
   ========================================================= */

function convertToDateInput(
    value
) {

    if (!value) {

        return "";

    }


    if (
        typeof value === "string"
    ) {

        return value.substring(
            0,
            10
        );

    }


    return "";

}