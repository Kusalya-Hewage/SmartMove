/* =========================================================
   SMARTMOVE - MAINTENANCE MANAGEMENT
   ========================================================= */

"use strict";


let maintenanceData = [];
let maintenanceVehicles = [];
let editingMaintenanceId = null;


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await checkAdmin();

        setupMaintenanceEvents();

        await loadVehicles();

        await loadMaintenanceRecords();

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
                credentials: "same-origin"
            }
        );


        if (!response.ok) {

            window.location.href =
                "/login.html";

            return false;

        }


        const user =
            await response.json();


        if (
            !user ||
            !user.role ||
            user.role.toUpperCase() !== "ADMIN"
        ) {

            window.location.href =
                "/login.html";

            return false;

        }


        return true;

    }
    catch (error) {

        console.error(
            "Admin check error:",
            error
        );

        window.location.href =
            "/login.html";

        return false;

    }

}


/* =========================================================
   EVENTS
   ========================================================= */

function setupMaintenanceEvents() {


    const showButton =
        document.getElementById(
            "showMaintenanceFormButton"
        );


    const closeButton =
        document.getElementById(
            "closeMaintenanceFormButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelMaintenanceButton"
        );


    const form =
        document.getElementById(
            "maintenanceForm"
        );


    const refreshButton =
        document.getElementById(
            "refreshMaintenanceButton"
        );


    const clearButton =
        document.getElementById(
            "clearMaintenanceFilterButton"
        );


    const searchInput =
        document.getElementById(
            "maintenanceSearch"
        );


    const vehicleFilter =
        document.getElementById(
            "maintenanceVehicleFilter"
        );


    const statusFilter =
        document.getElementById(
            "maintenanceStatusFilter"
        );


    if (showButton) {

        showButton.addEventListener(
            "click",
            openMaintenanceForm
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeMaintenanceForm
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeMaintenanceForm
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            saveMaintenance
        );

    }


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async function () {

                await loadVehicles();

                await loadMaintenanceRecords();

            }
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearMaintenanceFilters
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterMaintenance
        );

    }


    if (vehicleFilter) {

        vehicleFilter.addEventListener(
            "change",
            filterMaintenance
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterMaintenance
        );

    }

}


/* =========================================================
   LOAD VEHICLES
   ========================================================= */

async function loadVehicles() {

    try {

        const response =
            await fetch(
                "/api/vehicles",
                {
                    method: "GET",
                    credentials: "same-origin"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load vehicles."
            );

        }


        const data =
            await response.json();


        maintenanceVehicles =
            Array.isArray(data)
                ? data
                : data.content || [];


        populateVehicleSelects();

    }
    catch (error) {

        console.error(
            "Vehicle loading error:",
            error
        );

        maintenanceVehicles = [];

        populateVehicleSelects();

    }

}


/* =========================================================
   POPULATE VEHICLE SELECTS
   ========================================================= */

function populateVehicleSelects() {

    const formSelect =
        document.getElementById(
            "maintenanceVehicle"
        );


    const filterSelect =
        document.getElementById(
            "maintenanceVehicleFilter"
        );


    if (formSelect) {

        formSelect.innerHTML =
            `
            <option value="">
                Select Vehicle
            </option>
            `;


        maintenanceVehicles.forEach(
            vehicle => {

                const vehicleId =
                    vehicle.vehicleId ??
                    vehicle.id;


                if (
                    vehicleId === null ||
                    vehicleId === undefined
                ) {

                    return;

                }


                const registration =
                    vehicle.registrationNo ??
                    vehicle.registrationNumber ??
                    "Vehicle";


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(vehicleId);


                option.textContent =
                    `${registration} (ID: ${vehicleId})`;


                formSelect.appendChild(
                    option
                );

            }
        );

    }


    if (filterSelect) {

        const currentValue =
            filterSelect.value;


        filterSelect.innerHTML =
            `
            <option value="">
                All Vehicles
            </option>
            `;


        maintenanceVehicles.forEach(
            vehicle => {

                const vehicleId =
                    vehicle.vehicleId ??
                    vehicle.id;


                if (
                    vehicleId === null ||
                    vehicleId === undefined
                ) {

                    return;

                }


                const registration =
                    vehicle.registrationNo ??
                    vehicle.registrationNumber ??
                    "Vehicle";


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(vehicleId);


                option.textContent =
                    registration;


                filterSelect.appendChild(
                    option
                );

            }
        );


        filterSelect.value =
            currentValue;

    }

}


/* =========================================================
   OPEN FORM
   ========================================================= */

function openMaintenanceForm() {

    editingMaintenanceId = null;


    const form =
        document.getElementById(
            "maintenanceForm"
        );


    if (form) {

        form.reset();

    }


    document.getElementById(
        "editMaintenanceId"
    ).value = "";


    document.getElementById(
        "maintenanceFormTitle"
    ).textContent =
        "Add Maintenance";


    document.getElementById(
        "saveMaintenanceButton"
    ).textContent =
        "Save Maintenance";


    document.getElementById(
        "maintenanceStatus"
    ).value =
        "SCHEDULED";


    showFormMessage(
        "",
        ""
    );


    document.getElementById(
        "maintenanceFormPanel"
    ).style.display =
        "block";


    document.getElementById(
        "maintenanceFormPanel"
    ).scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   CLOSE FORM
   ========================================================= */

function closeMaintenanceForm() {

    editingMaintenanceId = null;


    const panel =
        document.getElementById(
            "maintenanceFormPanel"
        );


    const form =
        document.getElementById(
            "maintenanceForm"
        );


    if (panel) {

        panel.style.display =
            "none";

    }


    if (form) {

        form.reset();

    }


    showFormMessage(
        "",
        ""
    );

}


/* =========================================================
   SAVE
   ========================================================= */

async function saveMaintenance(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "editMaintenanceId"
        ).value;


    const vehicleId =
        document.getElementById(
            "maintenanceVehicle"
        ).value;


    const maintenanceDate =
        document.getElementById(
            "maintenanceDate"
        ).value;


    const maintenanceType =
        document.getElementById(
            "maintenanceType"
        ).value.trim();


    const cost =
        Number(
            document.getElementById(
                "maintenanceCost"
            ).value
        );


    const status =
        document.getElementById(
            "maintenanceStatus"
        ).value;


    const description =
        document.getElementById(
            "maintenanceDescription"
        ).value.trim();


    if (!vehicleId) {

        showFormMessage(
            "Please select a vehicle.",
            "error"
        );

        return;

    }


    if (!maintenanceDate) {

        showFormMessage(
            "Please select maintenance date.",
            "error"
        );

        return;

    }


    if (!maintenanceType) {

        showFormMessage(
            "Please enter maintenance type.",
            "error"
        );

        return;

    }


    if (
        Number.isNaN(cost) ||
        cost < 0
    ) {

        showFormMessage(
            "Please enter a valid cost.",
            "error"
        );

        return;

    }


    const payload = {

        vehicle: {
            vehicleId:
                Number(vehicleId)
        },

        maintenanceDate:
        maintenanceDate,

        maintenanceType:
        maintenanceType,

        cost:
        cost,

        status:
        status,

        description:
        description

    };


    const saveButton =
        document.getElementById(
            "saveMaintenanceButton"
        );


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            id
                ? "Updating..."
                : "Saving...";

    }


    try {

        const url =
            id
                ? `/api/maintenance/${id}`
                : "/api/maintenance";


        const method =
            id
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

                    credentials:
                        "same-origin",

                    body:
                        JSON.stringify(
                            payload
                        )
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
                    : result?.message ||
                    result?.error ||
                    "Unable to save maintenance record."
            );

        }


        showFormMessage(
            id
                ? "Maintenance record updated successfully."
                : "Maintenance record added successfully.",
            "success"
        );


        await loadMaintenanceRecords();


        setTimeout(
            closeMaintenanceForm,
            700
        );

    }
    catch (error) {

        console.error(
            "Save maintenance error:",
            error
        );


        showFormMessage(
            error.message ||
            "Unable to save maintenance record.",
            "error"
        );

    }
    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                id
                    ? "Update Maintenance"
                    : "Save Maintenance";

        }

    }

}


/* =========================================================
   LOAD MAINTENANCE
   ========================================================= */

async function loadMaintenanceRecords() {

    const content =
        document.getElementById(
            "maintenanceContent"
        );


    if (content) {

        content.innerHTML =
            `
            <div class="loading">
                Loading maintenance records...
            </div>
            `;

    }


    try {

        const response =
            await fetch(
                "/api/maintenance",
                {
                    method: "GET",
                    credentials: "same-origin"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Unable to load maintenance records (${response.status}).`
            );

        }


        const data =
            await response.json();


        maintenanceData =
            Array.isArray(data)
                ? data
                : data.content || [];


        updateSummary();


        filterMaintenance();

    }
    catch (error) {

        console.error(
            "Maintenance loading error:",
            error
        );


        maintenanceData = [];


        updateSummary();


        if (content) {

            content.innerHTML =
                `
                <div class="error-section">
                    ${escapeHtml(
                    error.message
                )}
                </div>
                `;

        }

    }

}


/* =========================================================
   FILTER
   ========================================================= */

function filterMaintenance() {

    const search =
        document.getElementById(
            "maintenanceSearch"
        )?.value
            .trim()
            .toLowerCase() || "";


    const vehicleFilter =
        document.getElementById(
            "maintenanceVehicleFilter"
        )?.value || "";


    const statusFilter =
        document.getElementById(
            "maintenanceStatusFilter"
        )?.value || "";


    const filtered =
        maintenanceData.filter(
            maintenance => {

                const type =
                    String(
                        maintenance.maintenanceType ??
                        ""
                    ).toLowerCase();


                const description =
                    String(
                        maintenance.description ??
                        ""
                    ).toLowerCase();


                const vehicleId =
                    getVehicleId(
                        maintenance
                    );


                const status =
                    String(
                        maintenance.status ??
                        ""
                    ).toUpperCase();


                const matchesSearch =
                    !search ||
                    type.includes(search) ||
                    description.includes(search);


                const matchesVehicle =
                    !vehicleFilter ||
                    String(vehicleId) ===
                    String(vehicleFilter);


                const matchesStatus =
                    !statusFilter ||
                    status ===
                    String(
                        statusFilter
                    ).toUpperCase();


                return (
                    matchesSearch &&
                    matchesVehicle &&
                    matchesStatus
                );

            }
        );


    displayMaintenance(
        filtered
    );

}


/* =========================================================
   DISPLAY
   ========================================================= */

function displayMaintenance(records) {

    const content =
        document.getElementById(
            "maintenanceContent"
        );


    if (!content) {

        return;

    }


    if (
        !records ||
        records.length === 0
    ) {

        content.innerHTML =
            `
            <div class="empty-section">
                No maintenance records found.
            </div>
            `;

        return;

    }


    let html = `

        <div class="table-container">

            <table class="maintenance-table">

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Vehicle</th>

                        <th>Maintenance Date</th>

                        <th>Type</th>

                        <th>Cost</th>

                        <th>Status</th>

                        <th>Description</th>

                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

    `;


    records.forEach(
        maintenance => {

            const id =
                maintenance.maintenanceId ??
                maintenance.id ??
                "";


            const vehicleName =
                getVehicleName(
                    maintenance
                );


            const date =
                formatDate(
                    maintenance.maintenanceDate
                );


            const type =
                maintenance.maintenanceType ??
                "-";


            const cost =
                Number(
                    maintenance.cost ??
                    0
                );


            const status =
                String(
                    maintenance.status ??
                    "SCHEDULED"
                ).toUpperCase();


            const description =
                maintenance.description ??
                "-";


            html += `

                <tr>

                    <td>
                        ${safeValue(id)}
                    </td>

                    <td>
                        ${safeValue(vehicleName)}
                    </td>

                    <td>
                        ${safeValue(date)}
                    </td>

                    <td>
                        ${safeValue(type)}
                    </td>

                    <td>
                        Rs. ${cost.toFixed(2)}
                    </td>

                    <td>

                        <span
                            class="maintenance-status-badge ${getStatusClass(status)}">

                            ${safeValue(status)}

                        </span>

                    </td>

                    <td class="description-cell">

                        ${safeValue(description)}

                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                    type="button"
                                    class="edit-button"
                                    onclick="editMaintenance(${id})">

                                Edit

                            </button>


                            <button
                                    type="button"
                                    class="delete-button"
                                    onclick="deleteMaintenance(${id})">

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


    content.innerHTML =
        html;

}


/* =========================================================
   EDIT
   ========================================================= */

function editMaintenance(id) {

    const record =
        maintenanceData.find(
            item =>
                Number(
                    item.maintenanceId ??
                    item.id
                ) === Number(id)
        );


    if (!record) {

        alert(
            "Maintenance record not found."
        );

        return;

    }


    editingMaintenanceId =
        id;


    const vehicleId =
        getVehicleId(
            record
        );


    document.getElementById(
        "editMaintenanceId"
    ).value =
        id;


    document.getElementById(
        "maintenanceVehicle"
    ).value =
        vehicleId || "";


    document.getElementById(
        "maintenanceDate"
    ).value =
        formatDateInput(
            record.maintenanceDate
        );


    document.getElementById(
        "maintenanceType"
    ).value =
        record.maintenanceType ||
        "";


    document.getElementById(
        "maintenanceCost"
    ).value =
        record.cost ??
        "";


    document.getElementById(
        "maintenanceStatus"
    ).value =
        record.status ||
        "SCHEDULED";


    document.getElementById(
        "maintenanceDescription"
    ).value =
        record.description ||
        "";


    document.getElementById(
        "maintenanceFormTitle"
    ).textContent =
        "Edit Maintenance";


    document.getElementById(
        "saveMaintenanceButton"
    ).textContent =
        "Update Maintenance";


    showFormMessage(
        "",
        ""
    );


    const panel =
        document.getElementById(
            "maintenanceFormPanel"
        );


    panel.style.display =
        "block";


    panel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   DELETE
   ========================================================= */

async function deleteMaintenance(id) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this maintenance record?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/maintenance/${id}`,
                {
                    method: "DELETE",
                    credentials: "same-origin"
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
                    : result?.message ||
                    result?.error ||
                    "Unable to delete maintenance record."
            );

        }


        alert(
            "Maintenance record deleted successfully."
        );


        await loadMaintenanceRecords();

    }
    catch (error) {

        console.error(
            "Delete maintenance error:",
            error
        );


        alert(
            error.message
        );

    }

}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary() {

    const total =
        maintenanceData.length;


    const completed =
        maintenanceData.filter(
            item =>
                String(
                    item.status ??
                    ""
                ).toUpperCase() ===
                "COMPLETED"
        ).length;


    const totalCost =
        maintenanceData.reduce(
            (
                sum,
                item
            ) => {

                return (
                    sum +
                    Number(
                        item.cost ??
                        0
                    )
                );

            },
            0
        );


    const totalElement =
        document.getElementById(
            "maintenanceTotal"
        );


    const completedElement =
        document.getElementById(
            "maintenanceCompleted"
        );


    const costElement =
        document.getElementById(
            "maintenanceTotalCost"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (completedElement) {

        completedElement.textContent =
            completed;

    }


    if (costElement) {

        costElement.textContent =
            `Rs. ${totalCost.toFixed(2)}`;

    }

}


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

function clearMaintenanceFilters() {

    document.getElementById(
        "maintenanceSearch"
    ).value =
        "";


    document.getElementById(
        "maintenanceVehicleFilter"
    ).value =
        "";


    document.getElementById(
        "maintenanceStatusFilter"
    ).value =
        "";


    filterMaintenance();

}


/* =========================================================
   VEHICLE ID
   ========================================================= */

function getVehicleId(record) {

    return (
        record.vehicleId ??
        record.vehicle?.vehicleId ??
        record.vehicle?.id ??
        ""
    );

}


/* =========================================================
   VEHICLE NAME
   ========================================================= */

function getVehicleName(record) {

    if (record.vehicle) {

        return (
            record.vehicle.registrationNo ??
            record.vehicle.registrationNumber ??
            `Vehicle ${record.vehicle.vehicleId ?? ""}`
        );

    }


    const vehicleId =
        record.vehicleId;


    if (!vehicleId) {

        return "-";

    }


    const vehicle =
        maintenanceVehicles.find(
            item =>
                Number(
                    item.vehicleId ??
                    item.id
                ) === Number(vehicleId)
        );


    if (!vehicle) {

        return `Vehicle ${vehicleId}`;

    }


    return (
        vehicle.registrationNo ??
        vehicle.registrationNumber ??
        `Vehicle ${vehicleId}`
    );

}


/* =========================================================
   STATUS CLASS
   ========================================================= */

function getStatusClass(status) {

    switch (
        String(status)
            .toUpperCase()
        ) {

        case "IN_PROGRESS":

            return "maintenance-status-in-progress";


        case "COMPLETED":

            return "maintenance-status-completed";


        case "CANCELLED":

            return "maintenance-status-cancelled";


        default:

            return "maintenance-status-scheduled";

    }

}


/* =========================================================
   FORM MESSAGE
   ========================================================= */

function showFormMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "maintenanceFormMessage"
        );


    if (!element) {

        return;

    }


    element.textContent =
        message;


    if (!message) {

        element.className =
            "form-message";

        return;

    }


    element.className =
        `form-message ${type}`;

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
   DATE
   ========================================================= */

function formatDate(value) {

    if (!value) {

        return "-";

    }


    return String(value)
        .substring(
            0,
            10
        );

}


function formatDateInput(value) {

    if (!value) {

        return "";

    }


    return String(value)
        .substring(
            0,
            10
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
   GLOBAL FUNCTIONS
   ========================================================= */

window.editMaintenance =
    editMaintenance;

window.deleteMaintenance =
    deleteMaintenance;