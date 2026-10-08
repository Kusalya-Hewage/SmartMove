/* =========================================================
   SMARTMOVE - PAYMENT MANAGEMENT
   ========================================================= */


/* =========================================================
   PAYMENT DATA
   ========================================================= */

let allPayments = [];

let allTickets = [];



/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await setupPaymentManagement();

    }
);



/* =========================================================
   INITIAL SETUP
   ========================================================= */

async function setupPaymentManagement() {

    setupPaymentEvents();

    await loadTickets();

    await loadPayments();

}



/* =========================================================
   PAYMENT EVENTS
   ========================================================= */

function setupPaymentEvents() {


    const showButton =
        document.getElementById(
            "showPaymentFormButton"
        );


    if (showButton) {

        showButton.addEventListener(
            "click",
            openNewPaymentForm
        );

    }



    const closeButton =
        document.getElementById(
            "closePaymentFormButton"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePaymentForm
        );

    }



    const cancelButton =
        document.getElementById(
            "cancelPaymentButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closePaymentForm
        );

    }



    const form =
        document.getElementById(
            "paymentForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            savePayment
        );

    }



    const searchInput =
        document.getElementById(
            "paymentSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyPaymentFilters
        );

    }



    const statusFilter =
        document.getElementById(
            "paymentStatusFilter"
        );


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyPaymentFilters
        );

    }



    const clearButton =
        document.getElementById(
            "clearPaymentFilterButton"
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


                applyPaymentFilters();

            }
        );

    }



    const refreshButton =
        document.getElementById(
            "refreshPaymentsButton"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async function () {

                await loadTickets();

                await loadPayments();

            }
        );

    }



    const ticketSelect =
        document.getElementById(
            "paymentTicket"
        );


    if (ticketSelect) {

        ticketSelect.addEventListener(
            "change",
            setTicketAmount
        );

    }

}



/* =========================================================
   LOAD TICKETS
   ========================================================= */

async function loadTickets() {

    try {

        const response =
            await fetch(
                "/api/tickets",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load tickets."
            );

        }


        const data =
            await response.json();


        allTickets =
            Array.isArray(data)
                ? data
                : [];


        populateTicketSelect();


    } catch (error) {

        console.error(
            "Ticket loading error:",
            error
        );


        allTickets = [];

    }

}



/* =========================================================
   POPULATE TICKET SELECT
   ========================================================= */

function populateTicketSelect() {

    const select =
        document.getElementById(
            "paymentTicket"
        );


    if (!select) {

        return;

    }


    select.innerHTML =
        '<option value="">Select Ticket</option>';


    allTickets.forEach(
        function (ticket) {

            const ticketId =
                ticket.ticketId ??
                ticket.id ??
                "";


            if (!ticketId) {

                return;

            }


            const passengerName =
                ticket.passenger &&
                ticket.passenger.fullName
                    ? ticket.passenger.fullName
                    : "Passenger";


            const seat =
                ticket.seatNumber
                    ? " | Seat " +
                    ticket.seatNumber
                    : "";


            const price =
                ticket.ticketPrice != null
                    ? " | Rs. " +
                    Number(
                        ticket.ticketPrice
                    ).toFixed(2)
                    : "";


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                ticketId;


            option.textContent =
                "Ticket #" +
                ticketId +
                " - " +
                passengerName +
                seat +
                price;


            select.appendChild(
                option
            );

        }
    );

}



/* =========================================================
   SET TICKET AMOUNT
   ========================================================= */

function setTicketAmount() {

    const select =
        document.getElementById(
            "paymentTicket"
        );


    const amountInput =
        document.getElementById(
            "paymentAmount"
        );


    if (!select || !amountInput) {

        return;

    }


    const ticketId =
        select.value;


    if (!ticketId) {

        amountInput.value = "";

        return;

    }


    const ticket =
        allTickets.find(
            function (item) {

                return String(
                    item.ticketId ??
                    item.id
                ) === String(ticketId);

            }
        );


    if (!ticket) {

        return;

    }


    if (ticket.ticketPrice != null) {

        amountInput.value =
            Number(
                ticket.ticketPrice
            ).toFixed(2);

    }

}



/* =========================================================
   LOAD PAYMENTS
   ========================================================= */

async function loadPayments() {

    const container =
        document.getElementById(
            "paymentsContent"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        '<div class="loading">Loading payments...</div>';


    try {

        const response =
            await fetch(
                "/api/payments",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load payments."
            );

        }


        const data =
            await response.json();


        allPayments =
            Array.isArray(data)
                ? data
                : [];


        applyPaymentFilters();


    } catch (error) {

        console.error(
            "Payment loading error:",
            error
        );


        container.innerHTML =
            '<div class="error-message">' +
            'Unable to load payments.' +
            '</div>';

    }

}



/* =========================================================
   APPLY PAYMENT FILTERS
   ========================================================= */

function applyPaymentFilters() {

    const searchInput =
        document.getElementById(
            "paymentSearch"
        );


    const statusFilter =
        document.getElementById(
            "paymentStatusFilter"
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
            : "";


    const filtered =
        allPayments.filter(
            function (payment) {

                const transactionReference =
                    String(
                        payment.transactionReference ||
                        ""
                    ).toLowerCase();


                const method =
                    String(
                        payment.paymentMethod ||
                        ""
                    ).toLowerCase();


                const paymentStatus =
                    String(
                        payment.paymentStatus ||
                        ""
                    ).toUpperCase();


                const matchesSearch =
                    !search ||
                    transactionReference.includes(
                        search
                    ) ||
                    method.includes(
                        search
                    );


                const matchesStatus =
                    !status ||
                    paymentStatus === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderPayments(filtered);

}



/* =========================================================
   RENDER PAYMENTS
   ========================================================= */

function renderPayments(payments) {

    const container =
        document.getElementById(
            "paymentsContent"
        );


    if (!container) {

        return;

    }


    updatePaymentSummary(
        payments
    );


    if (
        !payments ||
        payments.length === 0
    ) {

        container.innerHTML =
            '<div class="empty-section">' +
            'No payments found.' +
            '</div>';

        return;

    }


    let html = "";


    html +=
        '<div class="table-container">';


    html +=
        '<table class="payment-table">';


    html +=
        '<thead>';


    html +=
        '<tr>';


    html += "<th>ID</th>";

    html += "<th>Ticket</th>";

    html += "<th>Passenger</th>";

    html += "<th>Amount</th>";

    html += "<th>Method</th>";

    html += "<th>Status</th>";

    html += "<th>Transaction Ref</th>";

    html += "<th>Payment Date</th>";

    html += "<th>Actions</th>";


    html += "</tr>";

    html += "</thead>";

    html += "<tbody>";



    payments.forEach(
        function (payment) {

            const paymentId =
                payment.paymentId ??
                payment.id ??
                "";


            const ticketId =
                payment.ticket &&
                payment.ticket.ticketId != null
                    ? payment.ticket.ticketId
                    : payment.ticketId ??
                    "";


            const passengerName =
                payment.ticket &&
                payment.ticket.passenger &&
                payment.ticket.passenger.fullName
                    ? payment.ticket.passenger.fullName
                    : getPassengerNameFromTicket(
                        ticketId
                    );


            const amount =
                payment.amount != null
                    ? Number(
                        payment.amount
                    ).toFixed(2)
                    : "0.00";


            const method =
                String(
                    payment.paymentMethod ||
                    "-"
                ).toUpperCase();


            const status =
                String(
                    payment.paymentStatus ||
                    "PENDING"
                ).toUpperCase();


            const transactionReference =
                payment.transactionReference ||
                "-";


            const paymentDate =
                formatDateTime(
                    payment.paymentDate
                );


            const statusClass =
                getPaymentStatusClass(
                    status
                );


            html += "<tr>";


            html +=
                "<td>" +
                escapeHtml(paymentId) +
                "</td>";


            html +=
                "<td>" +
                escapeHtml(ticketId || "-") +
                "</td>";


            html +=
                "<td>" +
                escapeHtml(passengerName) +
                "</td>";


            html +=
                "<td>Rs. " +
                escapeHtml(amount) +
                "</td>";


            html +=
                "<td>" +
                escapeHtml(method) +
                "</td>";


            html +=
                '<td>' +
                '<span class="payment-status-badge ' +
                statusClass +
                '">' +
                escapeHtml(status) +
                '</span>' +
                '</td>';


            html +=
                "<td>" +
                escapeHtml(
                    transactionReference
                ) +
                "</td>";


            html +=
                "<td>" +
                escapeHtml(paymentDate) +
                "</td>";


            html +=
                '<td>' +
                '<div class="action-buttons">';


            html +=
                '<button ' +
                'type="button" ' +
                'class="edit-button payment-edit-button" ' +
                'data-id="' +
                escapeHtml(paymentId) +
                '">' +
                'Edit' +
                '</button>';


            html +=
                '<button ' +
                'type="button" ' +
                'class="delete-button payment-delete-button" ' +
                'data-id="' +
                escapeHtml(paymentId) +
                '">' +
                'Delete' +
                '</button>';


            html +=
                '</div>' +
                '</td>';


            html += "</tr>";

        }
    );


    html += "</tbody>";

    html += "</table>";

    html += "</div>";


    container.innerHTML =
        html;



    container
        .querySelectorAll(
            ".payment-edit-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openPaymentEdit(
                            this.dataset.id
                        );

                    }
                );

            }
        );



    container
        .querySelectorAll(
            ".payment-delete-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deletePayment(
                            this.dataset.id
                        );

                    }
                );

            }
        );

}



/* =========================================================
   UPDATE PAYMENT SUMMARY
   ========================================================= */

function updatePaymentSummary(payments) {

    const totalElement =
        document.getElementById(
            "paymentTotal"
        );


    const paidElement =
        document.getElementById(
            "paymentPaidAmount"
        );


    const pendingElement =
        document.getElementById(
            "paymentPendingAmount"
        );


    if (totalElement) {

        totalElement.textContent =
            payments.length;

    }


    let paidAmount = 0;

    let pendingAmount = 0;


    payments.forEach(
        function (payment) {

            const amount =
                Number(
                    payment.amount || 0
                );


            const status =
                String(
                    payment.paymentStatus ||
                    ""
                ).toUpperCase();


            if (status === "PAID") {

                paidAmount += amount;

            }


            if (status === "PENDING") {

                pendingAmount += amount;

            }

        }
    );


    if (paidElement) {

        paidElement.textContent =
            "Rs. " +
            paidAmount.toFixed(2);

    }


    if (pendingElement) {

        pendingElement.textContent =
            "Rs. " +
            pendingAmount.toFixed(2);

    }

}



/* =========================================================
   OPEN NEW PAYMENT FORM
   ========================================================= */

function openNewPaymentForm() {

    const form =
        document.getElementById(
            "paymentForm"
        );


    const panel =
        document.getElementById(
            "paymentFormPanel"
        );


    const title =
        document.getElementById(
            "paymentFormTitle"
        );


    const idInput =
        document.getElementById(
            "editPaymentId"
        );


    const statusInput =
        document.getElementById(
            "paymentStatus"
        );


    if (form) {

        form.reset();

    }


    if (idInput) {

        idInput.value = "";

    }


    if (title) {

        title.textContent =
            "Record Payment";

    }


    if (statusInput) {

        statusInput.value =
            "PENDING";

    }


    clearPaymentMessage();


    if (panel) {

        panel.style.display =
            "block";


        panel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}



/* =========================================================
   OPEN PAYMENT EDIT
   ========================================================= */

function openPaymentEdit(id) {

    const payment =
        allPayments.find(
            function (item) {

                return String(
                    item.paymentId ??
                    item.id
                ) === String(id);

            }
        );


    if (!payment) {

        alert(
            "Payment information not found."
        );

        return;

    }


    const panel =
        document.getElementById(
            "paymentFormPanel"
        );


    const title =
        document.getElementById(
            "paymentFormTitle"
        );


    const idInput =
        document.getElementById(
            "editPaymentId"
        );


    const ticketInput =
        document.getElementById(
            "paymentTicket"
        );


    const amountInput =
        document.getElementById(
            "paymentAmount"
        );


    const methodInput =
        document.getElementById(
            "paymentMethod"
        );


    const statusInput =
        document.getElementById(
            "paymentStatus"
        );


    const referenceInput =
        document.getElementById(
            "transactionReference"
        );


    const dateInput =
        document.getElementById(
            "paymentDate"
        );


    if (title) {

        title.textContent =
            "Edit Payment";

    }


    if (idInput) {

        idInput.value =
            payment.paymentId ??
            payment.id ??
            "";

    }


    const ticketId =
        payment.ticket &&
        payment.ticket.ticketId != null
            ? payment.ticket.ticketId
            : payment.ticketId;


    if (
        ticketInput &&
        ticketId != null
    ) {

        ticketInput.value =
            ticketId;

    }


    if (amountInput) {

        amountInput.value =
            payment.amount != null
                ? Number(
                    payment.amount
                ).toFixed(2)
                : "";

    }


    if (methodInput) {

        methodInput.value =
            payment.paymentMethod ||
            "";

    }


    if (statusInput) {

        statusInput.value =
            payment.paymentStatus ||
            "PENDING";

    }


    if (referenceInput) {

        referenceInput.value =
            payment.transactionReference ||
            "";

    }


    if (dateInput) {

        dateInput.value =
            toDateTimeLocal(
                payment.paymentDate
            );

    }


    clearPaymentMessage();


    if (panel) {

        panel.style.display =
            "block";


        panel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}



/* =========================================================
   SAVE PAYMENT
   ========================================================= */

async function savePayment(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "editPaymentId"
        )?.value || "";


    const ticketId =
        document.getElementById(
            "paymentTicket"
        )?.value || "";


    const amount =
        document.getElementById(
            "paymentAmount"
        )?.value || "";


    const method =
        document.getElementById(
            "paymentMethod"
        )?.value || "";


    const status =
        document.getElementById(
            "paymentStatus"
        )?.value || "PENDING";


    const reference =
        document.getElementById(
            "transactionReference"
        )?.value.trim() || "";


    const paymentDate =
        document.getElementById(
            "paymentDate"
        )?.value || "";



    if (!ticketId) {

        showPaymentMessage(
            "Please select a ticket.",
            "error"
        );

        return;

    }


    if (
        !amount ||
        Number(amount) <= 0
    ) {

        showPaymentMessage(
            "Please enter a valid payment amount.",
            "error"
        );

        return;

    }


    if (!method) {

        showPaymentMessage(
            "Please select a payment method.",
            "error"
        );

        return;

    }



    const paymentData = {

        ticket: {
            ticketId: Number(ticketId)
        },

        amount:
            Number(amount),

        paymentMethod:
        method,

        paymentStatus:
        status,

        transactionReference:
        reference

    };



    if (paymentDate) {

        paymentData.paymentDate =
            paymentDate;

    }



    const saveButton =
        document.getElementById(
            "savePaymentButton"
        );



    try {

        if (saveButton) {

            saveButton.disabled =
                true;


            saveButton.textContent =
                id
                    ? "Updating..."
                    : "Saving...";

        }



        const url =
            id
                ? "/api/payments/" +
                encodeURIComponent(id)
                : "/api/payments";


        const methodType =
            id
                ? "PUT"
                : "POST";



        const response =
            await fetch(
                url,
                {

                    method:
                    methodType,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify(
                            paymentData
                        )

                }
            );



        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Payment operation failed."
            );

        }



        showPaymentMessage(
            id
                ? "Payment updated successfully."
                : "Payment recorded successfully.",
            "success"
        );



        await loadPayments();



        setTimeout(
            function () {

                closePaymentForm();

            },
            800
        );



    } catch (error) {

        console.error(
            "Payment save error:",
            error
        );


        showPaymentMessage(
            error.message ||
            "Unable to save payment.",
            "error"
        );



    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;


            saveButton.textContent =
                id
                    ? "Update Payment"
                    : "Record Payment";

        }

    }

}



/* =========================================================
   DELETE PAYMENT
   ========================================================= */

async function deletePayment(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this payment?"
        );


    if (!confirmed) {

        return;

    }



    try {

        const response =
            await fetch(
                "/api/payments/" +
                encodeURIComponent(id),
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
                "Payment deletion failed."
            );

        }


        alert(
            "Payment deleted successfully."
        );


        await loadPayments();



    } catch (error) {

        console.error(
            "Payment deletion error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete payment."
        );

    }

}



/* =========================================================
   CLOSE PAYMENT FORM
   ========================================================= */

function closePaymentForm() {

    const panel =
        document.getElementById(
            "paymentFormPanel"
        );


    const form =
        document.getElementById(
            "paymentForm"
        );


    if (panel) {

        panel.style.display =
            "none";

    }


    if (form) {

        form.reset();

    }


    const idInput =
        document.getElementById(
            "editPaymentId"
        );


    if (idInput) {

        idInput.value = "";

    }


    const title =
        document.getElementById(
            "paymentFormTitle"
        );


    if (title) {

        title.textContent =
            "Record Payment";

    }


    clearPaymentMessage();

}



/* =========================================================
   PAYMENT MESSAGE
   ========================================================= */

function showPaymentMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "paymentFormMessage"
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
   CLEAR PAYMENT MESSAGE
   ========================================================= */

function clearPaymentMessage() {

    const element =
        document.getElementById(
            "paymentFormMessage"
        );


    if (!element) {

        return;

    }


    element.textContent =
        "";


    element.className =
        "form-message";

}



/* =========================================================
   GET PASSENGER NAME
   ========================================================= */

function getPassengerNameFromTicket(
    ticketId
) {

    const ticket =
        allTickets.find(
            function (item) {

                return String(
                    item.ticketId ??
                    item.id
                ) === String(ticketId);

            }
        );


    if (!ticket) {

        return "-";

    }


    if (
        ticket.passenger &&
        ticket.passenger.fullName
    ) {

        return ticket.passenger.fullName;

    }


    if (
        ticket.passenger &&
        ticket.passenger.name
    ) {

        return ticket.passenger.name;

    }


    return "Passenger";

}



/* =========================================================
   PAYMENT STATUS CLASS
   ========================================================= */

function getPaymentStatusClass(status) {

    switch (status) {

        case "PAID":

            return "payment-status-paid";


        case "PENDING":

            return "payment-status-pending";


        case "FAILED":

            return "payment-status-failed";


        case "REFUNDED":

            return "payment-status-refunded";


        default:

            return "payment-status-pending";

    }

}



/* =========================================================
   FORMAT DATE TIME
   ========================================================= */

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


    return date.toLocaleString();

}



/* =========================================================
   DATE -> DATETIME LOCAL
   ========================================================= */

function toDateTimeLocal(value) {

    if (!value) {

        return "";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    const hours =
        String(
            date.getHours()
        ).padStart(2, "0");


    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, "0");


    return (
        year +
        "-" +
        month +
        "-" +
        day +
        "T" +
        hours +
        ":" +
        minutes
    );

}



/* =========================================================
   HTML ESCAPE
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