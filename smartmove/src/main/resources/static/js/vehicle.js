document.addEventListener("DOMContentLoaded", function () {

    console.log("vehicle.js loaded successfully");

    const vehicleForm = document.getElementById("vehicleForm");

    if (vehicleForm) {

        vehicleForm.addEventListener("submit", function (event) {

            event.preventDefault();

            saveVehicle();

        });

    }

    loadVehicles();

});


/* =========================================================
   LOAD VEHICLES
========================================================= */

async function loadVehicles() {

    const tableBody = document.getElementById("vehicleTableBody");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="10" class="loading">
                Loading vehicles...
            </td>
        </tr>
    `;

    try {

        const response = await fetch("/api/vehicles");

        if (!response.ok) {
            throw new Error(
                "Failed to load vehicles. HTTP " + response.status
            );
        }

        const data = await response.json();

        console.log("Vehicles:", data);

        const vehicles = Array.isArray(data)
            ? data
            : (data.content || data.data || []);

        displayVehicles(vehicles);

        updateVehicleCount(vehicles);

        updateRecentVehicles(vehicles);

    } catch (error) {

        console.error("Vehicle loading error:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="error-message">
                    Failed to load vehicles.
                    <br>
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;

        const count = document.getElementById("totalVehicles");

        if (count) {
            count.textContent = "0";
        }
    }
}


/* =========================================================
   DISPLAY VEHICLES
========================================================= */

function displayVehicles(vehicles) {

    const tableBody = document.getElementById("vehicleTableBody");

    if (!tableBody) {
        return;
    }

    if (!vehicles || vehicles.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-table">
                    No vehicles found.
                    <br><br>
                    Click "Add Vehicle" to add a vehicle.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = vehicles.map(vehicle => {

        const id = vehicle.vehicleId ?? vehicle.id ?? "";

        return `
            <tr>

                <td>
                    ${escapeHtml(id)}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(vehicle.registrationNo)}
                    </strong>
                </td>

                <td>
                    ${formatVehicleType(vehicle.vehicleType)}
                </td>

                <td>
                    ${escapeHtml(vehicle.brand)}
                </td>

                <td>
                    ${escapeHtml(vehicle.model)}
                </td>

                <td>
                    ${escapeHtml(vehicle.manufactureYear)}
                </td>

                <td>
                    ${escapeHtml(vehicle.seatingCapacity)}
                </td>

                <td>
                    ${formatDate(vehicle.insuranceExpiry)}
                </td>

                <td>
                    <span class="status-badge ${getStatusClass(vehicle.status)}">
                        ${formatStatus(vehicle.status)}
                    </span>
                </td>

                <td>

                    <div class="action-buttons">

                        <button type="button"
                                class="btn btn-primary btn-sm"
                                onclick="editVehicle('${escapeAttribute(id)}')">
                            Edit
                        </button>

                        <button type="button"
                                class="btn btn-danger btn-sm"
                                onclick="deleteVehicle('${escapeAttribute(id)}')">
                            Delete
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");
}


/* =========================================================
   OPEN ADD VEHICLE MODAL
========================================================= */

function openAddVehicleModal() {

    console.log("Opening Add Vehicle modal");

    const modal = document.getElementById("vehicleModal");
    const form = document.getElementById("vehicleForm");
    const title = document.getElementById("vehicleModalTitle");
    const vehicleId = document.getElementById("vehicleId");
    const status = document.getElementById("status");
    const message = document.getElementById("vehicleFormMessage");

    if (!modal) {

        console.error("vehicleModal not found");

        alert("Vehicle modal was not found.");

        return;
    }

    if (!form) {

        console.error("vehicleForm not found");

        alert("Vehicle form was not found.");

        return;
    }


    form.reset();


    if (vehicleId) {
        vehicleId.value = "";
    }


    if (title) {
        title.textContent = "Add Vehicle";
    }


    if (status) {
        status.value = "ACTIVE";
    }


    if (message) {
        message.textContent = "";
        message.className = "form-message";
    }


    modal.classList.add("show");

    modal.style.display = "flex";


    setTimeout(function () {

        const registrationInput =
            document.getElementById("registrationNo");

        if (registrationInput) {
            registrationInput.focus();
        }

    }, 100);
}


/* =========================================================
   CLOSE VEHICLE MODAL
========================================================= */

function closeVehicleModal() {

    const modal = document.getElementById("vehicleModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    modal.style.display = "none";
}


/* =========================================================
   EDIT VEHICLE
========================================================= */

async function editVehicle(id) {

    if (!id) {
        alert("Invalid vehicle ID.");
        return;
    }

    try {

        const response =
            await fetch(`/api/vehicles/${encodeURIComponent(id)}`);

        if (!response.ok) {
            throw new Error(
                "Failed to load vehicle. HTTP " + response.status
            );
        }

        const vehicle = await response.json();

        openEditVehicleModal(vehicle);

    } catch (error) {

        console.error("Edit vehicle error:", error);

        alert(
            "Could not load vehicle.\n\n" +
            error.message
        );
    }
}


/* =========================================================
   OPEN EDIT MODAL
========================================================= */

function openEditVehicleModal(vehicle) {

    const modal = document.getElementById("vehicleModal");
    const title = document.getElementById("vehicleModalTitle");

    if (!modal) {
        return;
    }


    const id =
        vehicle.vehicleId ??
        vehicle.id ??
        "";


    document.getElementById("vehicleId").value = id;

    document.getElementById("registrationNo").value =
        vehicle.registrationNo ?? "";

    document.getElementById("vehicleType").value =
        vehicle.vehicleType ?? "";

    document.getElementById("brand").value =
        vehicle.brand ?? "";

    document.getElementById("model").value =
        vehicle.model ?? "";

    document.getElementById("manufactureYear").value =
        vehicle.manufactureYear ?? "";

    document.getElementById("seatingCapacity").value =
        vehicle.seatingCapacity ?? "";

    document.getElementById("insuranceExpiry").value =
        formatDateForInput(vehicle.insuranceExpiry);

    document.getElementById("status").value =
        vehicle.status ?? "ACTIVE";


    if (title) {
        title.textContent = "Edit Vehicle";
    }


    const message =
        document.getElementById("vehicleFormMessage");

    if (message) {
        message.textContent = "";
        message.className = "form-message";
    }


    modal.classList.add("show");

    modal.style.display = "flex";
}


/* =========================================================
   SAVE VEHICLE
========================================================= */

async function saveVehicle() {

    const vehicleId =
        document.getElementById("vehicleId").value.trim();

    const registrationNo =
        document.getElementById("registrationNo").value.trim();

    const vehicleType =
        document.getElementById("vehicleType").value;

    const brand =
        document.getElementById("brand").value.trim();

    const model =
        document.getElementById("model").value.trim();

    const manufactureYear =
        document.getElementById("manufactureYear").value;

    const seatingCapacity =
        document.getElementById("seatingCapacity").value;

    const insuranceExpiry =
        document.getElementById("insuranceExpiry").value;

    const status =
        document.getElementById("status").value;


    if (!registrationNo ||
        !vehicleType ||
        !brand ||
        !model ||
        !manufactureYear ||
        !seatingCapacity ||
        !insuranceExpiry ||
        !status) {

        showVehicleMessage(
            "Please fill all required fields.",
            "error"
        );

        return;
    }


    const vehicleData = {

        registrationNo: registrationNo,

        vehicleType: vehicleType,

        brand: brand,

        model: model,

        manufactureYear:
            Number(manufactureYear),

        seatingCapacity:
            Number(seatingCapacity),

        insuranceExpiry:
        insuranceExpiry,

        status: status

    };


    console.log("Vehicle data:", vehicleData);


    const saveButton =
        document.getElementById("saveVehicleButton");


    if (saveButton) {

        saveButton.disabled = true;

        saveButton.textContent = "Saving...";

    }


    try {

        let url = "/api/vehicles";

        let method = "POST";


        if (vehicleId) {

            url =
                `/api/vehicles/${encodeURIComponent(vehicleId)}`;

            method = "PUT";

        }


        const response = await fetch(url, {

            method: method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(vehicleData)

        });


        if (!response.ok) {

            let errorMessage =
                `Failed to save vehicle. HTTP ${response.status}`;

            try {

                const errorData =
                    await response.json();

                if (errorData.message) {
                    errorMessage =
                        errorData.message;
                }

            } catch (error) {
                // Ignore JSON parsing error
            }

            throw new Error(errorMessage);
        }


        const savedVehicle =
            await response.json().catch(() => null);


        console.log(
            "Vehicle saved:",
            savedVehicle
        );


        showVehicleMessage(
            vehicleId
                ? "Vehicle updated successfully."
                : "Vehicle added successfully.",
            "success"
        );


        setTimeout(function () {

            closeVehicleModal();

            loadVehicles();

        }, 700);


    } catch (error) {

        console.error(
            "Save vehicle error:",
            error
        );


        showVehicleMessage(
            error.message,
            "error"
        );


    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent = "Save Vehicle";

        }

    }
}


/* =========================================================
   DELETE VEHICLE
========================================================= */

async function deleteVehicle(id) {

    if (!id) {
        alert("Invalid vehicle ID.");
        return;
    }


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
                `/api/vehicles/${encodeURIComponent(id)}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            let message =
                `Failed to delete vehicle. HTTP ${response.status}`;

            try {

                const errorData =
                    await response.json();

                if (errorData.message) {
                    message =
                        errorData.message;
                }

            } catch (error) {
                // Ignore
            }

            throw new Error(message);
        }


        alert("Vehicle deleted successfully.");

        loadVehicles();


    } catch (error) {

        console.error(
            "Delete vehicle error:",
            error
        );

        alert(
            "Could not delete vehicle.\n\n" +
            error.message
        );
    }
}


/* =========================================================
   VEHICLE COUNT
========================================================= */

function updateVehicleCount(vehicles) {

    const count =
        document.getElementById("totalVehicles");

    if (count) {
        count.textContent =
            vehicles.length;
    }
}


/* =========================================================
   RECENT VEHICLES
========================================================= */

function updateRecentVehicles(vehicles) {

    const container =
        document.getElementById("recentVehicles");

    if (!container) {
        return;
    }


    if (!vehicles || vehicles.length === 0) {

        container.innerHTML = `
            <div class="empty-small">
                No vehicles available.
            </div>
        `;

        return;
    }


    const recent =
        vehicles.slice(0, 5);


    container.innerHTML =
        recent.map(vehicle => {

            return `
                <div class="recent-item">

                    <div class="recent-icon">
                        🚍
                    </div>

                    <div class="recent-info">

                        <strong>
                            ${escapeHtml(
                vehicle.registrationNo
            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                vehicle.brand
            )}
                            ${escapeHtml(
                vehicle.model
            )}
                        </span>

                    </div>

                    <span class="status-badge ${getStatusClass(vehicle.status)}">
                        ${formatStatus(vehicle.status)}
                    </span>

                </div>
            `;

        }).join("");
}


/* =========================================================
   MESSAGE
========================================================= */

function showVehicleMessage(message, type) {

    const element =
        document.getElementById("vehicleFormMessage");

    if (!element) {
        return;
    }

    element.textContent = message;

    element.className =
        "form-message " + type;
}


/* =========================================================
   FORMAT VEHICLE TYPE
========================================================= */

function formatVehicleType(type) {

    if (!type) {
        return "-";
    }

    return type
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );
}


/* =========================================================
   FORMAT STATUS
========================================================= */

function formatStatus(status) {

    if (!status) {
        return "-";
    }

    return status
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );
}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status) {

    switch (status) {

        case "ACTIVE":
            return "status-active";

        case "MAINTENANCE":
            return "status-maintenance";

        case "INACTIVE":
            return "status-inactive";

        default:
            return "";

    }
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    try {

        const date =
            new Date(dateValue);

        if (isNaN(date.getTime())) {
            return dateValue;
        }


        return date.toLocaleDateString(
            "en-GB"
        );

    } catch (error) {

        return dateValue;

    }
}


/* =========================================================
   DATE FOR INPUT
========================================================= */

function formatDateForInput(dateValue) {

    if (!dateValue) {
        return "";
    }


    if (
        typeof dateValue === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ) {
        return dateValue;
    }


    try {

        const date =
            new Date(dateValue);

        if (isNaN(date.getTime())) {
            return "";
        }


        return date.toISOString()
            .split("T")[0];

    } catch (error) {

        return "";

    }
}


/* =========================================================
   HTML ESCAPING
========================================================= */

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


/* =========================================================
   ATTRIBUTE ESCAPING
========================================================= */

function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.loadVehicles =
    loadVehicles;

window.openAddVehicleModal =
    openAddVehicleModal;

window.closeVehicleModal =
    closeVehicleModal;

window.editVehicle =
    editVehicle;

window.deleteVehicle =
    deleteVehicle;

window.saveVehicle =
    saveVehicle;