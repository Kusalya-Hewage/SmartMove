/* =========================================================
   SMARTMOVE - REPORTS MANAGEMENT
   ========================================================= */


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let passengers = [];
let selectedReport = "";
let lastReportUrl = "";


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("SMARTMOVE REPORTS JS STARTED");

    setupNavigation();

    setupReportCards();

    setupPassengerReport();

    loadPassengers();

    showReportFromHash();

});


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const backButton =
        document.getElementById("backToAdminButton");

    if (!backButton) {
        return;
    }

    backButton.addEventListener("click", function () {

        window.location.href =
            "/admin-dashboard.html";

    });

}


/* =========================================================
   REPORT CARDS
   ========================================================= */

function setupReportCards() {

    const cards =
        document.querySelectorAll(".report-card");

    console.log(
        "Report cards found:",
        cards.length
    );

    cards.forEach(function (card) {

        card.addEventListener("click", function () {

            const report =
                this.getAttribute("data-report");

            console.log(
                "Report selected:",
                report
            );

            selectedReport = report;

            if (report === "passenger-travel-history") {

                showPassengerSelector();

                return;
            }

            hidePassengerSelector();

            loadReport(report);

        });

    });


    const refreshButton =
        document.getElementById(
            "refreshReportButton"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            function () {

                if (!selectedReport) {

                    showMessage(
                        "Please select a report first."
                    );

                    return;
                }


                if (
                    selectedReport ===
                    "passenger-travel-history"
                ) {

                    const passengerId =
                        document.getElementById(
                            "reportPassengerId"
                        ).value;

                    if (!passengerId) {

                        showMessage(
                            "Please select a passenger."
                        );

                        return;
                    }

                    loadPassengerTravelHistory(
                        passengerId
                    );

                    return;
                }


                loadReport(selectedReport);

            }
        );

    }

}


/* =========================================================
   PASSENGER REPORT SETUP
   ========================================================= */

function setupPassengerReport() {

    const button =
        document.getElementById(
            "loadPassengerReportButton"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            const passengerId =
                document.getElementById(
                    "reportPassengerId"
                ).value;

            if (!passengerId) {

                showMessage(
                    "Please select a passenger."
                );

                return;
            }

            selectedReport =
                "passenger-travel-history";

            loadPassengerTravelHistory(
                passengerId
            );

        }
    );

}


/* =========================================================
   LOAD PASSENGERS
   ========================================================= */

async function loadPassengers() {

    try {

        console.log(
            "Loading passengers..."
        );

        const response =
            await fetch(
                "/api/passengers",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Passenger API returned HTTP " +
                response.status
            );

        }


        passengers =
            await response.json();


        console.log(
            "Passengers loaded:",
            passengers
        );


        populatePassengerSelect();

    }
    catch (error) {

        console.error(
            "Error loading passengers:",
            error
        );

    }

}


/* =========================================================
   POPULATE PASSENGER SELECT
   ========================================================= */

function populatePassengerSelect() {

    const select =
        document.getElementById(
            "reportPassengerId"
        );

    if (!select) {
        return;
    }


    select.innerHTML =
        '<option value="">Select Passenger</option>';


    passengers.forEach(function (passenger) {

        const option =
            document.createElement("option");


        option.value =
            passenger.passengerId ??
            passenger.PASSENGER_ID ??
            passenger.id;


        option.textContent =
            passenger.fullName ??
            passenger.FULL_NAME ??
            (
                "Passenger " +
                option.value
            );


        select.appendChild(option);

    });

}


/* =========================================================
   SHOW PASSENGER SELECTOR
   ========================================================= */

function showPassengerSelector() {

    const selector =
        document.getElementById(
            "passengerSelector"
        );

    if (selector) {

        selector.style.display =
            "flex";

    }

}


/* =========================================================
   HIDE PASSENGER SELECTOR
   ========================================================= */

function hidePassengerSelector() {

    const selector =
        document.getElementById(
            "passengerSelector"
        );

    if (selector) {

        selector.style.display =
            "none";

    }

}


/* =========================================================
   LOAD NORMAL REPORT
   ========================================================= */

async function loadReport(report) {

    const reportUrls = {

        "most-used-routes":
            "/api/reports/most-used-routes",

        "revenue-by-route":
            "/api/reports/revenue-by-route",

        "revenue-by-month":
            "/api/reports/revenue-by-month",

        "vehicle-maintenance-cost":
            "/api/reports/vehicle-maintenance-cost",

        "driver-performance":
            "/api/reports/driver-performance",

        "route-ratings":
            "/api/reports/route-ratings",

        "payment-summary":
            "/api/reports/payment-summary"

    };


    const titles = {

        "most-used-routes":
            "Most Used Routes",

        "revenue-by-route":
            "Revenue by Route",

        "revenue-by-month":
            "Revenue by Month",

        "vehicle-maintenance-cost":
            "Vehicle Maintenance Cost",

        "driver-performance":
            "Driver Performance",

        "route-ratings":
            "Route Ratings",

        "payment-summary":
            "Payment Summary"

    };


    const descriptions = {

        "most-used-routes":
            "Shows ticket usage for each route.",

        "revenue-by-route":
            "Shows revenue generated by each route.",

        "revenue-by-month":
            "Shows ticket payment revenue by month.",

        "vehicle-maintenance-cost":
            "Shows maintenance costs for each vehicle.",

        "driver-performance":
            "Shows driver trip performance.",

        "route-ratings":
            "Shows passenger ratings for each route.",

        "payment-summary":
            "Shows payment methods, statuses and amounts."

    };


    const url =
        reportUrls[report];


    if (!url) {

        showMessage(
            "Unknown report selected."
        );

        return;
    }


    selectedReport = report;

    lastReportUrl = url;


    setReportHeader(
        titles[report] || "Report",
        descriptions[report] || ""
    );


    showLoading();


    try {

        console.log(
            "Loading report:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        console.log(
            "Report HTTP status:",
            response.status
        );


        const responseText =
            await response.text();


        console.log(
            "Report response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status +
                ": " +
                responseText
            );

        }


        let data;


        try {

            data =
                JSON.parse(responseText);

        }
        catch (jsonError) {

            throw new Error(
                "Server did not return valid JSON."
            );

        }


        renderReport(
            data,
            report
        );

    }
    catch (error) {

        console.error(
            "Report loading error:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================================================
   PASSENGER TRAVEL HISTORY
   ========================================================= */

async function loadPassengerTravelHistory(
    passengerId
) {

    const url =
        "/api/reports/passenger-travel-history/" +
        encodeURIComponent(passengerId);


    lastReportUrl = url;


    setReportHeader(
        "Passenger Travel History",
        "Travel history for the selected passenger."
    );


    showLoading();


    try {

        console.log(
            "Loading passenger report:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const responseText =
            await response.text();


        console.log(
            "Passenger report response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status +
                ": " +
                responseText
            );

        }


        let data =
            JSON.parse(responseText);


        renderReport(
            data,
            "passenger-travel-history"
        );

    }
    catch (error) {

        console.error(
            "Passenger report error:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================================================
   REPORT HEADER
   ========================================================= */

function setReportHeader(
    title,
    description
) {

    const titleElement =
        document.getElementById(
            "reportTitle"
        );


    const descriptionElement =
        document.getElementById(
            "reportDescription"
        );


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (descriptionElement) {

        descriptionElement.textContent =
            description;

    }

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    const result =
        document.getElementById(
            "reportResult"
        );


    if (!result) {
        return;
    }


    result.innerHTML = `
        <div class="empty-state">

            <div class="empty-icon">
                ...
            </div>

            <h3>Loading Report</h3>

            <p>
                Please wait while the report
                data is loaded.
            </p>

        </div>
    `;

}


/* =========================================================
   RENDER REPORT
   ========================================================= */

function renderReport(
    data,
    reportType
) {

    const result =
        document.getElementById(
            "reportResult"
        );


    if (!result) {
        return;
    }


    if (
        data === null ||
        data === undefined
    ) {

        showMessage(
            "No data returned."
        );

        return;

    }


    if (
        Array.isArray(data) &&
        data.length === 0
    ) {

        result.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    R
                </div>

                <h3>No Data Found</h3>

                <p>
                    There is no data available
                    for this report.
                </p>

            </div>
        `;

        return;

    }


    if (Array.isArray(data)) {

        renderTable(
            data,
            reportType
        );

        return;

    }


    if (
        typeof data === "object"
    ) {

        renderTable(
            [data],
            reportType
        );

        return;

    }


    result.innerHTML = `
        <div class="report-value">
            ${escapeHtml(String(data))}
        </div>
    `;

}


/* =========================================================
   RENDER TABLE
   ========================================================= */

function renderTable(
    data,
    reportType
) {

    const result =
        document.getElementById(
            "reportResult"
        );


    if (!data || data.length === 0) {

        showMessage(
            "No report data available."
        );

        return;

    }


    const columns =
        getColumns(
            data
        );


    let html = `
        <div class="table-container">

            <table class="report-table">

                <thead>

                    <tr>
    `;


    columns.forEach(function (column) {

        html += `
            <th>
                ${formatColumnName(column)}
            </th>
        `;

    });


    html += `
                    </tr>

                </thead>

                <tbody>
    `;


    data.forEach(function (row) {

        html += "<tr>";


        columns.forEach(function (column) {

            const value =
                row[column];


            html += `
                <td>
                    ${formatCellValue(
                value,
                column,
                reportType
            )}
                </td>
            `;

        });


        html += "</tr>";

    });


    html += `
                </tbody>

            </table>

        </div>
    `;


    result.innerHTML =
        html;

}


/* =========================================================
   GET TABLE COLUMNS
   ========================================================= */

function getColumns(data) {

    const columnSet =
        new Set();


    data.forEach(function (row) {

        Object.keys(row).forEach(
            function (key) {

                columnSet.add(key);

            }
        );

    });


    return Array.from(columnSet);

}


/* =========================================================
   FORMAT COLUMN NAME
   ========================================================= */

function formatColumnName(column) {

    return column
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, function (letter) {
            return letter.toUpperCase();
        });

}


/* =========================================================
   FORMAT CELL VALUE
   ========================================================= */

function formatCellValue(
    value,
    column,
    reportType
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "-";

    }


    if (
        typeof value === "number"
    ) {

        const columnUpper =
            column.toUpperCase();


        if (
            columnUpper.includes("REVENUE") ||
            columnUpper.includes("AMOUNT") ||
            columnUpper.includes("COST") ||
            columnUpper.includes("PRICE") ||
            columnUpper.includes("FARE")
        ) {

            return "Rs. " +
                Number(value)
                    .toLocaleString(
                        "en-LK",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );

        }


        if (
            columnUpper.includes("RATING")
        ) {

            return Number(value)
                .toFixed(2);

        }


        return Number(value)
            .toLocaleString();

    }


    if (
        typeof value === "string"
    ) {

        return escapeHtml(value);

    }


    return escapeHtml(
        JSON.stringify(value)
    );

}


/* =========================================================
   SHOW MESSAGE
   ========================================================= */

function showMessage(message) {

    const result =
        document.getElementById(
            "reportResult"
        );


    if (!result) {
        return;
    }


    result.innerHTML = `
        <div class="empty-state">

            <div class="empty-icon">
                !
            </div>

            <h3>Report</h3>

            <p>
                ${escapeHtml(message)}
            </p>

        </div>
    `;

}


/* =========================================================
   SHOW ERROR
   ========================================================= */

function showError(message) {

    const result =
        document.getElementById(
            "reportResult"
        );


    if (!result) {
        return;
    }


    result.innerHTML = `
        <div style="
            padding:25px;
            margin:20px 0;
            border-radius:10px;
            background:#fff0f0;
            border:1px solid #e0a0a0;
        ">

            <h3>
                Report Error
            </h3>

            <p>
                ${escapeHtml(message)}
            </p>

            <p>
                Open the browser Console
                (F12) for more details.
            </p>

        </div>
    `;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   HASH NAVIGATION
   ========================================================= */

function showReportFromHash() {

    const hash =
        window.location.hash;


    if (!hash) {
        return;
    }


    const report =
        hash.substring(1);


    const validReports = [

        "most-used-routes",

        "revenue-by-route",

        "revenue-by-month",

        "passenger-travel-history",

        "vehicle-maintenance-cost",

        "driver-performance",

        "route-ratings",

        "payment-summary"

    ];


    if (
        !validReports.includes(report)
    ) {

        return;

    }


    const card =
        document.querySelector(
            `.report-card[data-report="${report}"]`
        );


    if (card) {

        card.click();

    }

}