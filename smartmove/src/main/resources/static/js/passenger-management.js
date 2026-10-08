/* =========================================================
   SMARTMOVE - PASSENGER MANAGEMENT
   ========================================================= */


let allPassengers = [];


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


        setupNavigation();

        setupPassengerEvents();

        await loadPassengers();

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
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const backButton =
        document.getElementById(
            "backToAdminButton"
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

}


/* =========================================================
   PASSENGER EVENTS
   ========================================================= */

function setupPassengerEvents() {


    /* =====================================================
       REFRESH
       ===================================================== */

    const refreshButton =
        document.getElementById(
            "refreshPassengersButton"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadPassengers
        );

    }


    /* =====================================================
       SEARCH
       ===================================================== */

    const searchInput =
        document.getElementById(
            "passengerSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyPassengerFilters
        );

    }


    /* =====================================================
       STATUS FILTER
       ===================================================== */

    const statusFilter =
        document.getElementById(
            "passengerStatusFilter"
        );


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyPassengerFilters
        );

    }


    /* =====================================================
       CLEAR FILTER
       ===================================================== */

    const clearButton =
        document.getElementById(
            "clearPassengerFilterButton"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                if (searchInput) {

                    searchInput.value = "";

                }


                if (statusFilter) {

                    statusFilter.value = "";

                }


                applyPassengerFilters();

            }
        );

    }


    /* =====================================================
       CLOSE EDIT FORM
       ===================================================== */

    const closeButton =
        document.getElementById(
            "closePassengerFormButton"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePassengerForm
        );

    }


    /* =====================================================
       CANCEL EDIT
       ===================================================== */

    const cancelButton =
        document.getElementById(
            "cancelPassengerButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closePassengerForm
        );

    }


    /* =====================================================
       EDIT FORM SUBMIT
       ===================================================== */

    const passengerForm =
        document.getElementById(
            "passengerForm"
        );


    if (passengerForm) {

        passengerForm.addEventListener(
            "submit",
            updatePassenger
        );

    }


    /* =====================================================
       TABLE ACTIONS
       ===================================================== */

    const passengersContent =
        document.getElementById(
            "passengersContent"
        );


    if (passengersContent) {

        passengersContent.addEventListener(
            "click",
            handlePassengerTableClick
        );

    }

}


/* =========================================================
   HANDLE TABLE BUTTONS
   ========================================================= */

function handlePassengerTableClick(event) {

    const button =
        event.target.closest(
            "button[data-action]"
        );


    if (!button) {

        return;

    }


    const action =
        button.dataset.action;


    const id =
        button.dataset.id;


    if (!id) {

        return;

    }


    if (action === "edit") {

        openPassengerEdit(
            id
        );

    }


    if (action === "delete") {

        deletePassenger(
            id
        );

    }

}


/* =========================================================
   LOAD PASSENGERS
   ========================================================= */

async function loadPassengers() {

    const container =
        document.getElementById(
            "passengersContent"
        );


    const total =
        document.getElementById(
            "passengerTotal"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `
        <div class="loading">

            Loading passengers...

        </div>
    `;


    if (total) {

        total.textContent =
            "Loading...";

    }


    try {

        const response =
            await fetch(
                "/api/passengers",
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
                await readBackendError(
                    response
                );


            throw new Error(
                errorMessage ||
                "Failed to load passengers."
            );

        }


        const data =
            await response.json();


        allPassengers =
            Array.isArray(data)
                ? data
                : [];


        applyPassengerFilters();

    }
    catch (error) {

        console.error(
            "Passenger loading error:",
            error
        );


        container.innerHTML = `
            <div class="error-message">

                Unable to load passengers.

                <br><br>

                ${escapeHtml(
            error.message ||
            "Unknown error"
        )}

            </div>
        `;


        if (total) {

            total.textContent =
                "0 passengers";

        }

    }

}


/* =========================================================
   APPLY SEARCH AND STATUS FILTER
   ========================================================= */

function applyPassengerFilters() {

    const searchInput =
        document.getElementById(
            "passengerSearch"
        );


    const statusFilter =
        document.getElementById(
            "passengerStatusFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        statusFilter
            ? statusFilter.value
                .toUpperCase()
            : "";


    const filteredPassengers =
        allPassengers.filter(
            function (passenger) {


                const name =
                    getPassengerName(
                        passenger
                    ).toLowerCase();


                const email =
                    String(
                        passenger.email ||
                        ""
                    ).toLowerCase();


                const phone =
                    String(
                        passenger.phone ||
                        ""
                    ).toLowerCase();


                const passengerStatus =
                    String(
                        passenger.status ||
                        ""
                    ).toUpperCase();


                const matchesSearch =
                    !search ||
                    name.includes(
                        search
                    ) ||
                    email.includes(
                        search
                    ) ||
                    phone.includes(
                        search
                    );


                const matchesStatus =
                    !status ||
                    passengerStatus ===
                    status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderPassengers(
        filteredPassengers
    );

}


/* =========================================================
   GET PASSENGER ID
   ========================================================= */

function getPassengerId(passenger) {

    if (!passenger) {

        return "";

    }


    return (
        passenger.passengerId ??
        passenger.id ??
        ""
    );

}


/* =========================================================
   GET PASSENGER NAME
   ========================================================= */

function getPassengerName(passenger) {

    if (!passenger) {

        return "Unknown Passenger";

    }


    return (
        passenger.fullName ||
        passenger.name ||
        "Unknown Passenger"
    );

}


/* =========================================================
   RENDER PASSENGERS
   ========================================================= */

function renderPassengers(
    passengers
) {

    const container =
        document.getElementById(
            "passengersContent"
        );


    const total =
        document.getElementById(
            "passengerTotal"
        );


    if (!container) {

        return;

    }


    /* =====================================================
       UPDATE TOTAL
       ===================================================== */

    if (total) {

        total.textContent =
            passengers.length +
            (
                passengers.length === 1
                    ? " passenger"
                    : " passengers"
            );

    }


    /* =====================================================
       EMPTY
       ===================================================== */

    if (
        !passengers ||
        passengers.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-section">

                No passengers found.

            </div>

        `;

        return;

    }


    /* =====================================================
       TABLE
       ===================================================== */

    let html = `

        <div class="table-container">

            <table class="passenger-table">

                <thead>

                    <tr>

                        <th>
                            ID
                        </th>

                        <th>
                            Full Name
                        </th>

                        <th>
                            Email
                        </th>

                        <th>
                            Phone
                        </th>

                        <th>
                            Address
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


    passengers.forEach(
        function (passenger) {


            const id =
                getPassengerId(
                    passenger
                );


            const name =
                getPassengerName(
                    passenger
                );


            const email =
                passenger.email ||
                "-";


            const phone =
                passenger.phone ||
                "-";


            const address =
                passenger.address ||
                "-";


            const status =
                String(
                    passenger.status ||
                    "ACTIVE"
                ).toUpperCase();


            let statusClass =
                "passenger-status-active";


            let statusText =
                "Active";


            if (
                status === "SUSPENDED"
            ) {

                statusClass =
                    "passenger-status-suspended";

                statusText =
                    "Suspended";

            }


            html += `

                <tr>


                    <td>

                        ${escapeHtml(
                id
            )}

                    </td>


                    <td>

                        <strong class="passenger-name">

                            ${escapeHtml(
                name
            )}

                        </strong>

                    </td>


                    <td>

                        ${escapeHtml(
                email
            )}

                    </td>


                    <td>

                        ${escapeHtml(
                phone
            )}

                    </td>


                    <td>

                        <span class="address-text">

                            ${escapeHtml(
                address
            )}

                        </span>

                    </td>


                    <td>

                        <span
                                class="
                                passenger-status-badge
                                ${statusClass}">

                            ${escapeHtml(
                statusText
            )}

                        </span>

                    </td>


                    <td>

                        <div class="action-buttons">


                            <button
                                    type="button"
                                    class="edit-action-button"
                                    data-action="edit"
                                    data-id="${escapeHtml(
                id
            )}">

                                Edit

                            </button>


                            <button
                                    type="button"
                                    class="delete-action-button"
                                    data-action="delete"
                                    data-id="${escapeHtml(
                id
            )}">

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
   OPEN EDIT FORM
   ========================================================= */

function openPassengerEdit(id) {

    const passenger =
        allPassengers.find(
            function (item) {

                return String(
                    getPassengerId(
                        item
                    )
                ) === String(id);

            }
        );


    if (!passenger) {

        alert(
            "Passenger information not found."
        );

        return;

    }


    const idInput =
        document.getElementById(
            "editPassengerId"
        );


    const fullNameInput =
        document.getElementById(
            "passengerFullName"
        );


    const emailInput =
        document.getElementById(
            "passengerEmail"
        );


    const phoneInput =
        document.getElementById(
            "passengerPhone"
        );


    const statusInput =
        document.getElementById(
            "passengerStatus"
        );


    const addressInput =
        document.getElementById(
            "passengerAddress"
        );


    const message =
        document.getElementById(
            "passengerFormMessage"
        );


    const formPanel =
        document.getElementById(
            "passengerFormPanel"
        );


    /* =====================================================
       FILL FORM
       ===================================================== */

    if (idInput) {

        idInput.value =
            getPassengerId(
                passenger
            );

    }


    if (fullNameInput) {

        fullNameInput.value =
            passenger.fullName ||
            passenger.name ||
            "";

    }


    if (emailInput) {

        emailInput.value =
            passenger.email ||
            "";

    }


    if (phoneInput) {

        phoneInput.value =
            passenger.phone ||
            "";

    }


    if (statusInput) {

        statusInput.value =
            String(
                passenger.status ||
                "ACTIVE"
            ).toUpperCase();

    }


    if (addressInput) {

        addressInput.value =
            passenger.address ||
            "";

    }


    if (message) {

        message.textContent =
            "";

        message.className =
            "form-message";

    }


    if (formPanel) {

        formPanel.style.display =
            "block";


        formPanel.scrollIntoView(
            {
                behavior:
                    "smooth",

                block:
                    "start"
            }
        );

    }

}


/* =========================================================
   CLOSE EDIT FORM
   ========================================================= */

function closePassengerForm() {

    const panel =
        document.getElementById(
            "passengerFormPanel"
        );


    const form =
        document.getElementById(
            "passengerForm"
        );


    const message =
        document.getElementById(
            "passengerFormMessage"
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
   UPDATE PASSENGER
   ========================================================= */

async function updatePassenger(
    event
) {

    event.preventDefault();


    const idElement =
        document.getElementById(
            "editPassengerId"
        );


    const fullNameElement =
        document.getElementById(
            "passengerFullName"
        );


    const emailElement =
        document.getElementById(
            "passengerEmail"
        );


    const phoneElement =
        document.getElementById(
            "passengerPhone"
        );


    const statusElement =
        document.getElementById(
            "passengerStatus"
        );


    const addressElement =
        document.getElementById(
            "passengerAddress"
        );


    const saveButton =
        document.getElementById(
            "savePassengerButton"
        );


    const id =
        idElement
            ? idElement.value.trim()
            : "";


    const fullName =
        fullNameElement
            ? fullNameElement.value.trim()
            : "";


    const email =
        emailElement
            ? emailElement.value.trim()
            : "";


    const phone =
        phoneElement
            ? phoneElement.value.trim()
            : "";


    const status =
        statusElement
            ? statusElement.value
            : "ACTIVE";


    const address =
        addressElement
            ? addressElement.value.trim()
            : "";


    /* =====================================================
       VALIDATION
       ===================================================== */

    if (!id) {

        showFormMessage(
            "Passenger ID is missing.",
            "error"
        );

        return;

    }


    if (!fullName) {

        showFormMessage(
            "Full name is required.",
            "error"
        );

        return;

    }


    if (!email) {

        showFormMessage(
            "Email is required.",
            "error"
        );

        return;

    }


    if (!phone) {

        showFormMessage(
            "Phone number is required.",
            "error"
        );

        return;

    }


    /* =====================================================
       REQUEST BODY
       ===================================================== */

    const passengerData = {

        fullName:
        fullName,

        email:
        email,

        phone:
        phone,

        status:
        status,

        address:
        address

    };


    try {

        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.textContent =
                "Updating...";

        }


        const response =
            await fetch(
                "/api/passengers/" +
                encodeURIComponent(id),
                {

                    method:
                        "PUT",

                    credentials:
                        "include",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            passengerData
                        )

                }
            );


        if (!response.ok) {

            const errorMessage =
                await readBackendError(
                    response
                );


            throw new Error(
                errorMessage ||
                "Passenger update failed."
            );

        }


        showFormMessage(
            "Passenger updated successfully.",
            "success"
        );


        await loadPassengers();


        setTimeout(
            function () {

                closePassengerForm();

            },
            800
        );

    }
    catch (error) {

        console.error(
            "Passenger update error:",
            error
        );


        showFormMessage(
            error.message ||
            "Unable to update passenger.",
            "error"
        );

    }
    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Update Passenger";

        }

    }

}


/* =========================================================
   DELETE PASSENGER
   ========================================================= */

async function deletePassenger(id) {

    const passenger =
        allPassengers.find(
            function (item) {

                return String(
                    getPassengerId(
                        item
                    )
                ) === String(id);

            }
        );


    const passengerName =
        passenger
            ? getPassengerName(
                passenger
            )
            : "this passenger";


    const confirmed =
        confirm(
            "Are you sure you want to delete " +
            passengerName +
            "?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/passengers/" +
                encodeURIComponent(id),
                {

                    method:
                        "DELETE",

                    credentials:
                        "include",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        if (!response.ok) {

            const errorMessage =
                await readBackendError(
                    response
                );


            throw new Error(
                errorMessage ||
                "Passenger deletion failed."
            );

        }


        alert(
            "Passenger deleted successfully."
        );


        await loadPassengers();

    }
    catch (error) {

        console.error(
            "Passenger deletion error:",
            error
        );


        alert(
            "Unable to delete passenger.\n\n" +
            (
                error.message ||
                "Unknown error"
            )
        );

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
            "passengerFormMessage"
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
   BACKEND ERROR
   ========================================================= */

async function readBackendError(
    response
) {

    try {

        const text =
            await response.text();


        if (!text) {

            return "";

        }


        try {

            const json =
                JSON.parse(
                    text
                );


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