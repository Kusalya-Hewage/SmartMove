let editingDriverId = null;


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const isAdmin =
            await checkAdmin();

        if (!isAdmin) {
            return;
        }


        setupButtons();

        await loadDrivers();

    }
);


/* =========================================================
   CHECK ADMIN
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
            !user.role ||
            user.role.toUpperCase() !== "ADMIN"
        ) {

            window.location.href =
                "/index.html";

            return false;
        }


        const username =
            document.getElementById(
                "adminUsername"
            );


        if (username) {

            username.textContent =
                user.username || "admin";
        }


        return true;


    } catch (error) {

        console.error(error);

        window.location.href =
            "/index.html";

        return false;
    }
}


/* =========================================================
   BUTTONS
   ========================================================= */

function setupButtons() {

    document
        .getElementById("dashboardButton")
        .addEventListener(
            "click",
            function () {

                window.location.href =
                    "/admin-dashboard.html";
            }
        );


    document
        .getElementById("addDriverButton")
        .addEventListener(
            "click",
            openAddForm
        );


    document
        .getElementById("closeFormButton")
        .addEventListener(
            "click",
            closeForm
        );


    document
        .getElementById("cancelButton")
        .addEventListener(
            "click",
            closeForm
        );


    document
        .getElementById("refreshButton")
        .addEventListener(
            "click",
            loadDrivers
        );


    document
        .getElementById("driverForm")
        .addEventListener(
            "submit",
            saveDriver
        );


    document
        .getElementById("logoutButton")
        .addEventListener(
            "click",
            logout
        );
}


/* =========================================================
   LOAD DRIVERS
   ========================================================= */

async function loadDrivers() {

    const tbody =
        document.getElementById(
            "driverTableBody"
        );


    tbody.innerHTML = `
        <tr>
            <td colspan="10"
                class="loading">
                Loading drivers...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                "/api/drivers",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load drivers."
            );
        }


        const drivers =
            await response.json();


        displayDrivers(drivers);


    } catch (error) {

        tbody.innerHTML = `
            <tr>
                <td colspan="10"
                    class="loading">
                    ${escapeHtml(
            error.message
        )}
                </td>
            </tr>
        `;
    }
}


/* =========================================================
   DISPLAY DRIVERS
   ========================================================= */

function displayDrivers(drivers) {

    const tbody =
        document.getElementById(
            "driverTableBody"
        );


    if (
        !Array.isArray(drivers) ||
        drivers.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="10"
                    class="loading">
                    No drivers registered.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = "";


    drivers.forEach(
        function (driver) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${safe(
                driver.driverId
            )}
                </td>

                <td>
                    ${safe(
                driver.firstName
            )}
                    ${safe(
                driver.lastName
            )}
                </td>

                <td>
                    ${safe(
                driver.nicNumber
            )}
                </td>

                <td>
                    ${safe(
                driver.licenseNumber
            )}
                </td>

                <td>
                    ${formatDate(
                driver.licenseExpiry
            )}
                </td>

                <td>
                    ${safe(
                driver.phone
            )}
                </td>

                <td>
                    ${safe(
                driver.email
            )}
                </td>

                <td>
                    ${formatDate(
                driver.hireDate
            )}
                </td>

                <td>

                    <span class="status">

                        ${safe(
                driver.status
            )}

                    </span>

                </td>

                <td>

                    <button
                            class="edit-button"
                            onclick="editDriver(
                                ${driver.driverId}
                            )">

                        Edit

                    </button>

                    <button
                            class="delete-button"
                            onclick="deleteDriver(
                                ${driver.driverId}
                            )">

                        Delete

                    </button>

                </td>
            `;


            tbody.appendChild(row);

        }
    );
}


/* =========================================================
   OPEN ADD FORM
   ========================================================= */

function openAddForm() {

    editingDriverId = null;


    document.getElementById(
        "driverForm"
    ).reset();


    document.getElementById(
        "formTitle"
    ).textContent =
        "Add Driver";


    document.getElementById(
        "saveButton"
    ).textContent =
        "Save Driver";


    document.getElementById(
        "driverFormCard"
    ).style.display =
        "block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   CLOSE FORM
   ========================================================= */

function closeForm() {

    editingDriverId = null;


    document.getElementById(
        "driverFormCard"
    ).style.display =
        "none";


    document.getElementById(
        "driverForm"
    ).reset();


    document.getElementById(
        "formMessage"
    ).textContent =
        "";
}


/* =========================================================
   SAVE / UPDATE DRIVER
   ========================================================= */

async function saveDriver(event) {

    event.preventDefault();


    const driver = {

        firstName:
            document.getElementById(
                "firstName"
            ).value.trim(),

        lastName:
            document.getElementById(
                "lastName"
            ).value.trim(),

        nicNumber:
            document.getElementById(
                "nicNumber"
            ).value.trim(),

        licenseNumber:
            document.getElementById(
                "licenseNumber"
            ).value.trim(),

        licenseExpiry:
        document.getElementById(
            "licenseExpiry"
        ).value,

        phone:
            document.getElementById(
                "phone"
            ).value.trim(),

        email:
            document.getElementById(
                "email"
            ).value.trim(),

        dateOfBirth:
        document.getElementById(
            "dateOfBirth"
        ).value,

        hireDate:
        document.getElementById(
            "hireDate"
        ).value,

        status:
        document.getElementById(
            "status"
        ).value
    };


    const message =
        document.getElementById(
            "formMessage"
        );


    const saveButton =
        document.getElementById(
            "saveButton"
        );


    try {

        saveButton.disabled = true;

        saveButton.textContent =
            editingDriverId
                ? "Updating..."
                : "Saving...";


        let url =
            "/api/drivers";

        let method =
            "POST";


        if (editingDriverId) {

            url =
                "/api/drivers/"
                + editingDriverId;

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
                        JSON.stringify(driver)
                }
            );


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text ||
                "Driver operation failed."
            );
        }


        alert(
            editingDriverId
                ? "Driver updated successfully."
                : "Driver added successfully."
        );


        closeForm();

        await loadDrivers();


    } catch (error) {

        message.textContent =
            error.message;

        message.style.color =
            "#b91c1c";


    } finally {

        saveButton.disabled =
            false;

        saveButton.textContent =
            editingDriverId
                ? "Update Driver"
                : "Save Driver";
    }
}


/* =========================================================
   EDIT DRIVER
   ========================================================= */

async function editDriver(id) {

    try {

        const response =
            await fetch(
                "/api/drivers/"
                + id,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load driver."
            );
        }


        const driver =
            await response.json();


        editingDriverId =
            driver.driverId;


        document.getElementById(
            "firstName"
        ).value =
            driver.firstName || "";


        document.getElementById(
            "lastName"
        ).value =
            driver.lastName || "";


        document.getElementById(
            "nicNumber"
        ).value =
            driver.nicNumber || "";


        document.getElementById(
            "licenseNumber"
        ).value =
            driver.licenseNumber || "";


        document.getElementById(
            "licenseExpiry"
        ).value =
            toInputDate(
                driver.licenseExpiry
            );


        document.getElementById(
            "phone"
        ).value =
            driver.phone || "";


        document.getElementById(
            "email"
        ).value =
            driver.email || "";


        document.getElementById(
            "dateOfBirth"
        ).value =
            toInputDate(
                driver.dateOfBirth
            );


        document.getElementById(
            "hireDate"
        ).value =
            toInputDate(
                driver.hireDate
            );


        document.getElementById(
            "status"
        ).value =
            driver.status || "ACTIVE";


        document.getElementById(
            "formTitle"
        ).textContent =
            "Edit Driver";


        document.getElementById(
            "saveButton"
        ).textContent =
            "Update Driver";


        document.getElementById(
            "driverFormCard"
        ).style.display =
            "block";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        alert(error.message);
    }
}


/* =========================================================
   DELETE DRIVER
   ========================================================= */

async function deleteDriver(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this driver?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/drivers/"
                + id,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text ||
                "Unable to delete driver."
            );
        }


        alert(
            "Driver deleted successfully."
        );


        await loadDrivers();


    } catch (error) {

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

        console.error(error);

    } finally {

        sessionStorage.clear();

        window.location.href =
            "/index.html";
    }
}


/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(value) {

    if (!value) {
        return "-";
    }

    return String(value).substring(
        0,
        10
    );
}


function toInputDate(value) {

    if (!value) {
        return "";
    }

    return String(value).substring(
        0,
        10
    );
}


function safe(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "-";
    }

    return escapeHtml(
        String(value)
    );
}


function escapeHtml(value) {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}