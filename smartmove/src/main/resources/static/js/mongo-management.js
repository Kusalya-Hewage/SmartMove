/* =========================================================
   SMARTMOVE - MONGODB MANAGEMENT
   ========================================================= */

"use strict";

let smartMoveDocuments = [];
let smartMoveReviews = [];
let smartMoveAnnouncements = [];
let smartMoveVehicles = [];


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

        setupMongoTabs();
        setupBackButton();

        setupDocumentEvents();
        setupReviewEvents();
        setupAnnouncementEvents();

        await loadVehicles();
        await loadVehicleDocuments();
        await loadPassengerReviews();
        await loadAnnouncements();

        showHashSection();
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
                    credentials: "include",
                    cache: "no-store"
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
            String(user.role)
                .toUpperCase() !== "ADMIN"
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
   TABS
   ========================================================= */

function setupMongoTabs() {

    const tabs =
        document.querySelectorAll(
            ".mongo-tab"
        );


    tabs.forEach(
        function (tab) {

            tab.addEventListener(
                "click",
                function () {

                    const target =
                        this.getAttribute(
                            "data-target"
                        );


                    if (!target) {
                        return;
                    }


                    showMongoSection(
                        target
                    );


                    window.history.replaceState(
                        null,
                        "",
                        "#" + target
                    );
                }
            );
        }
    );
}


function showMongoSection(
    sectionId
) {

    document
        .querySelectorAll(
            ".mongo-section"
        )
        .forEach(
            function (section) {

                section.classList.remove(
                    "active"
                );
            }
        );


    document
        .querySelectorAll(
            ".mongo-tab"
        )
        .forEach(
            function (tab) {

                tab.classList.remove(
                    "active"
                );
            }
        );


    const selectedSection =
        document.getElementById(
            sectionId
        );


    if (selectedSection) {

        selectedSection.classList.add(
            "active"
        );
    }


    const selectedTab =
        document.querySelector(
            '.mongo-tab[data-target="' +
            sectionId +
            '"]'
        );


    if (selectedTab) {

        selectedTab.classList.add(
            "active"
        );
    }
}


function showHashSection() {

    let sectionId =
        window.location.hash
            .replace("#", "");


    const validSections = [
        "documents",
        "reviews",
        "announcements"
    ];


    if (!validSections.includes(
        sectionId
    )) {

        sectionId =
            "documents";
    }


    showMongoSection(
        sectionId
    );
}


/* =========================================================
   BACK BUTTON
   ========================================================= */

function setupBackButton() {

    const button =
        document.getElementById(
            "backToAdminButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            window.location.href =
                "/admin-dashboard.html";
        }
    );
}


/* =========================================================
   VEHICLES
   ========================================================= */

async function loadVehicles() {

    const select =
        document.getElementById(
            "documentVehicle"
        );


    if (!select) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/vehicles",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load vehicles. HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        smartMoveVehicles =
            Array.isArray(data)
                ? data
                : Array.isArray(data.data)
                    ? data.data
                    : [];


        select.innerHTML =
            '<option value="">Select Vehicle</option>';


        smartMoveVehicles.forEach(
            function (vehicle) {

                const vehicleId =
                    vehicle.vehicleId ??
                    vehicle.id ??
                    vehicle._id;


                const registration =
                    vehicle.registrationNo ??
                    vehicle.registrationNumber ??
                    vehicle.vehicleNo ??
                    vehicle.vehicleNumber ??
                    vehicleId;


                if (
                    vehicleId === null ||
                    vehicleId === undefined
                ) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(vehicleId);


                option.textContent =
                    String(registration);


                select.appendChild(
                    option
                );
            }
        );


    } catch (error) {

        console.error(
            "Load vehicles error:",
            error
        );


        select.innerHTML =
            '<option value="">' +
            'Unable to load vehicles' +
            '</option>';
    }
}


/* =========================================================
   DOCUMENT EVENTS
   ========================================================= */

function setupDocumentEvents() {

    const showButton =
        document.getElementById(
            "showDocumentFormButton"
        );


    const closeButton =
        document.getElementById(
            "closeDocumentFormButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelDocumentButton"
        );


    const form =
        document.getElementById(
            "documentForm"
        );


    const search =
        document.getElementById(
            "documentSearch"
        );


    const typeFilter =
        document.getElementById(
            "documentTypeFilter"
        );


    const clearButton =
        document.getElementById(
            "clearDocumentFilterButton"
        );


    const refreshButton =
        document.getElementById(
            "refreshDocumentsButton"
        );


    if (showButton) {

        showButton.addEventListener(
            "click",
            openDocumentForm
        );
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            hideDocumentForm
        );
    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            hideDocumentForm
        );
    }


    if (form) {

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                await uploadVehicleDocument();
            }
        );
    }


    if (search) {

        search.addEventListener(
            "input",
            filterDocuments
        );
    }


    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            filterDocuments
        );
    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                if (search) {
                    search.value = "";
                }

                if (typeFilter) {
                    typeFilter.value = "";
                }

                filterDocuments();
            }
        );
    }


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadVehicleDocuments
        );
    }
}


/* =========================================================
   DOCUMENT FORM
   ========================================================= */

function openDocumentForm() {

    const panel =
        document.getElementById(
            "documentFormPanel"
        );


    if (panel) {

        panel.style.display =
            "block";


        panel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


function hideDocumentForm() {

    const panel =
        document.getElementById(
            "documentFormPanel"
        );


    const form =
        document.getElementById(
            "documentForm"
        );


    const message =
        document.getElementById(
            "documentMessage"
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
   UPLOAD VEHICLE DOCUMENT
   ========================================================= */

async function uploadVehicleDocument() {

    const vehicle =
        document.getElementById(
            "documentVehicle"
        );


    const documentType =
        document.getElementById(
            "documentType"
        );


    const file =
        document.getElementById(
            "documentFile"
        );


    const description =
        document.getElementById(
            "documentDescription"
        );


    const message =
        document.getElementById(
            "documentMessage"
        );


    const uploadButton =
        document.getElementById(
            "uploadDocumentButton"
        );


    if (!vehicle ||
        !documentType ||
        !file) {

        return;
    }


    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!vehicle.value) {

        showMessage(
            message,
            "Please select a vehicle.",
            true
        );

        return;
    }


    if (!documentType.value) {

        showMessage(
            message,
            "Please select a document type.",
            true
        );

        return;
    }


    if (
        !file.files ||
        file.files.length === 0
    ) {

        showMessage(
            message,
            "Please select a file.",
            true
        );

        return;
    }


    const selectedFile =
        file.files[0];


    // ---------------------------------------------------------
    // FILE SIZE
    // ---------------------------------------------------------

    if (
        selectedFile.size >
        10 * 1024 * 1024
    ) {

        showMessage(
            message,
            "File size must not exceed 10MB.",
            true
        );

        return;
    }


    // ---------------------------------------------------------
    // FILE TYPE
    // ---------------------------------------------------------

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf"
    ];


    const extension =
        selectedFile.name
            .toLowerCase()
            .split(".")
            .pop();


    const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "pdf"
    ];


    if (
        (
            selectedFile.type &&
            !allowedTypes.includes(
                selectedFile.type
            )
        )
        &&
        !allowedExtensions.includes(
            extension
        )
    ) {

        showMessage(
            message,
            "Only JPG, JPEG, PNG and PDF files are allowed.",
            true
        );

        return;
    }


    // ---------------------------------------------------------
    // FORM DATA
    // ---------------------------------------------------------

    const formData =
        new FormData();


    formData.append(
        "vehicleId",
        vehicle.value
    );


    formData.append(
        "documentType",
        documentType.value
    );


    formData.append(
        "file",
        selectedFile
    );


    formData.append(
        "description",
        description
            ? description.value.trim()
            : ""
    );


    // ---------------------------------------------------------
    // BUTTON
    // ---------------------------------------------------------

    if (uploadButton) {

        uploadButton.disabled =
            true;

        uploadButton.textContent =
            "Uploading...";
    }


    try {

        showMessage(
            message,
            "Uploading document...",
            false
        );


        // IMPORTANT:
        // Do NOT set Content-Type here.
        // Browser creates multipart boundary.

        const response =
            await fetch(
                "/api/mongo/vehicle-documents/upload",
                {
                    method: "POST",
                    credentials: "include",
                    body: formData
                }
            );


        const responseText =
            await response.text();


        let result = {};


        try {

            result =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        } catch (parseError) {

            console.error(
                "Server response is not JSON:",
                responseText
            );
        }


        // -----------------------------------------------------
        // ERROR
        // -----------------------------------------------------

        if (!response.ok) {

            console.error(
                "Document upload failed:",
                result
            );


            showMessage(
                message,
                result.message ||
                responseText ||
                "Document upload failed.",
                true
            );


            return;
        }


        if (
            result.success === false
        ) {

            showMessage(
                message,
                result.message ||
                "Document upload failed.",
                true
            );


            return;
        }


        // -----------------------------------------------------
        // SUCCESS
        // -----------------------------------------------------

        showMessage(
            message,
            result.message ||
            "Document uploaded successfully.",
            false
        );


        const form =
            document.getElementById(
                "documentForm"
            );


        if (form) {

            form.reset();
        }


        await loadVehicleDocuments();


        setTimeout(
            function () {

                hideDocumentForm();

            },
            1000
        );


    } catch (error) {

        console.error(
            "Upload document error:",
            error
        );


        showMessage(
            message,
            error.message ||
            "An error occurred while uploading the document.",
            true
        );


    } finally {

        if (uploadButton) {

            uploadButton.disabled =
                false;

            uploadButton.textContent =
                "Upload Document";
        }
    }
}


/* =========================================================
   LOAD VEHICLE DOCUMENTS
   ========================================================= */

async function loadVehicleDocuments() {

    const container =
        document.getElementById(
            "documentsContent"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        '<div class="loading">' +
        'Loading vehicle documents...' +
        '</div>';


    try {

        const response =
            await fetch(
                "/api/mongo/vehicle-documents",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load documents. HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        smartMoveDocuments =
            Array.isArray(data)
                ? data
                : Array.isArray(data.data)
                    ? data.data
                    : [];


        renderDocuments(
            smartMoveDocuments
        );


    } catch (error) {

        console.error(
            "Load vehicle documents error:",
            error
        );


        container.innerHTML =
            '<div class="empty-state">' +
            escapeHtml(
                error.message
            ) +
            '</div>';
    }
}


/* =========================================================
   RENDER DOCUMENTS
   ========================================================= */

function renderDocuments(
    documents
) {

    const container =
        document.getElementById(
            "documentsContent"
        );


    if (!container) {
        return;
    }


    if (
        !documents ||
        documents.length === 0
    ) {

        container.innerHTML =
            '<div class="empty-state">' +
            'No vehicle documents found.' +
            '</div>';

        return;
    }


    let html =
        '<div class="table-container">' +

        '<table class="data-table">' +

        '<thead>' +

        '<tr>' +

        '<th>Registration No</th>' +

        '<th>Document Type</th>' +

        '<th>File</th>' +

        '<th>Description</th>' +

        '<th>Status</th>' +

        '<th>Uploaded Date</th>' +

        '</tr>' +

        '</thead>' +

        '<tbody>';


    documents.forEach(
        function (document) {

            const registrationNo =
                document.registrationNo ??
                "-";


            const documentType =
                document.documentType ??
                "-";


            const fileName =
                document.fileName ??
                "View File";


            const description =
                document.description ??
                "-";


            const status =
                document.status ??
                "ACTIVE";


            const uploadedDate =
                formatDate(
                    document.uploadedDate
                );


            // Backend now returns filePath
            const filePath =
                document.filePath ??
                "";


            let fileHtml =
                escapeHtml(
                    fileName
                );


            if (filePath) {

                fileHtml =
                    '<a ' +
                    'class="file-link" ' +
                    'href="' +
                    escapeAttribute(
                        filePath
                    ) +
                    '" ' +
                    'target="_blank" ' +
                    'rel="noopener noreferrer">' +
                    escapeHtml(
                        fileName
                    ) +
                    '</a>';
            }


            html +=
                '<tr>' +

                '<td>' +
                escapeHtml(
                    registrationNo
                ) +
                '</td>' +

                '<td>' +
                escapeHtml(
                    documentType
                ) +
                '</td>' +

                '<td>' +
                fileHtml +
                '</td>' +

                '<td class="description-cell">' +
                escapeHtml(
                    description
                ) +
                '</td>' +

                '<td>' +
                '<span class="status-badge">' +
                escapeHtml(
                    status
                ) +
                '</span>' +
                '</td>' +

                '<td>' +
                escapeHtml(
                    uploadedDate
                ) +
                '</td>' +

                '</tr>';
        }
    );


    html +=
        '</tbody>' +
        '</table>' +
        '</div>';


    container.innerHTML =
        html;
}


/* =========================================================
   FILTER DOCUMENTS
   ========================================================= */

function filterDocuments() {

    const searchInput =
        document.getElementById(
            "documentSearch"
        );


    const typeFilter =
        document.getElementById(
            "documentTypeFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const type =
        typeFilter
            ? typeFilter.value
                .trim()
                .toLowerCase()
            : "";


    const filtered =
        smartMoveDocuments.filter(
            function (document) {

                const registration =
                    String(
                        document.registrationNo ??
                        ""
                    ).toLowerCase();


                const fileName =
                    String(
                        document.fileName ??
                        ""
                    ).toLowerCase();


                const description =
                    String(
                        document.description ??
                        ""
                    ).toLowerCase();


                const documentType =
                    String(
                        document.documentType ??
                        ""
                    ).toLowerCase();


                return (
                    (
                        !search ||
                        registration.includes(
                            search
                        ) ||
                        fileName.includes(
                            search
                        ) ||
                        description.includes(
                            search
                        )
                    )
                    &&
                    (
                        !type ||
                        documentType === type
                    )
                );
            }
        );


    renderDocuments(
        filtered
    );
}


/* =========================================================
   REVIEW EVENTS
   ========================================================= */

function setupReviewEvents() {

    const refreshButton =
        document.getElementById(
            "refreshReviewsButton"
        );


    const searchInput =
        document.getElementById(
            "reviewSearch"
        );


    const ratingFilter =
        document.getElementById(
            "reviewRatingFilter"
        );


    const clearButton =
        document.getElementById(
            "clearReviewFilterButton"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadPassengerReviews
        );
    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterReviews
        );
    }


    if (ratingFilter) {

        ratingFilter.addEventListener(
            "change",
            filterReviews
        );
    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                if (searchInput) {
                    searchInput.value = "";
                }

                if (ratingFilter) {
                    ratingFilter.value = "";
                }

                filterReviews();
            }
        );
    }
}


/* =========================================================
   LOAD REVIEWS
   ========================================================= */

async function loadPassengerReviews() {

    const container =
        document.getElementById(
            "reviewsContent"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        '<div class="loading">' +
        'Loading passenger reviews...' +
        '</div>';


    try {

        const response =
            await fetch(
                "/api/mongo/reviews",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load reviews. HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        smartMoveReviews =
            Array.isArray(data)
                ? data
                : Array.isArray(data.data)
                    ? data.data
                    : [];


        updateReviewSummary(
            smartMoveReviews
        );


        renderReviews(
            smartMoveReviews
        );


    } catch (error) {

        console.error(
            "Load reviews error:",
            error
        );


        container.innerHTML =
            '<div class="empty-state">' +
            escapeHtml(
                error.message
            ) +
            '</div>';
    }
}


/* =========================================================
   REVIEW SUMMARY
   ========================================================= */

function updateReviewSummary(
    reviews
) {

    const totalElement =
        document.getElementById(
            "reviewTotal"
        );


    const averageElement =
        document.getElementById(
            "reviewAverage"
        );


    const fiveStarElement =
        document.getElementById(
            "reviewFiveStar"
        );


    let totalRating = 0;
    let fiveStar = 0;


    reviews.forEach(
        function (review) {

            const rating =
                Number(
                    review.rating
                );


            if (!Number.isNaN(
                rating
            )) {

                totalRating +=
                    rating;
            }


            if (rating === 5) {

                fiveStar++;
            }
        }
    );


    const total =
        reviews.length;


    const average =
        total > 0
            ? (
                totalRating /
                total
            ).toFixed(1)
            : "0.0";


    if (totalElement) {

        totalElement.textContent =
            total;
    }


    if (averageElement) {

        averageElement.textContent =
            average + " / 5";
    }


    if (fiveStarElement) {

        fiveStarElement.textContent =
            fiveStar;
    }
}


/* =========================================================
   RENDER REVIEWS
   ========================================================= */

function renderReviews(
    reviews
) {

    const container =
        document.getElementById(
            "reviewsContent"
        );


    if (!container) {
        return;
    }


    if (
        !reviews ||
        reviews.length === 0
    ) {

        container.innerHTML =
            '<div class="empty-state">' +
            'No passenger reviews found.' +
            '</div>';

        return;
    }


    let html =
        '<div class="table-container">' +

        '<table class="data-table">' +

        '<thead>' +

        '<tr>' +

        '<th>Passenger</th>' +

        '<th>Trip</th>' +

        '<th>Rating</th>' +

        '<th>Comment</th>' +

        '<th>Date</th>' +

        '</tr>' +

        '</thead>' +

        '<tbody>';


    reviews.forEach(
        function (review) {

            const passenger =
                review.passengerName ??
                review.passengerUsername ??
                review.passengerId ??
                "-";


            const trip =
                review.tripId ??
                "-";


            const rating =
                Number(
                    review.rating
                ) || 0;


            const comment =
                review.comment ??
                "-";


            const date =
                formatDate(
                    review.reviewDate
                );


            html +=
                '<tr>' +

                '<td>' +
                escapeHtml(
                    passenger
                ) +
                '</td>' +

                '<td>' +
                escapeHtml(
                    trip
                ) +
                '</td>' +

                '<td>' +
                createStars(
                    rating
                ) +
                '</td>' +

                '<td class="message-cell">' +
                escapeHtml(
                    comment
                ) +
                '</td>' +

                '<td>' +
                escapeHtml(
                    date
                ) +
                '</td>' +

                '</tr>';
        }
    );


    html +=
        '</tbody>' +
        '</table>' +
        '</div>';


    container.innerHTML =
        html;
}


/* =========================================================
   STAR DISPLAY
   ========================================================= */

function createStars(
    rating
) {

    const value =
        Math.max(
            0,
            Math.min(
                5,
                Number(rating) || 0
            )
        );


    let stars = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        stars +=
            i <= value
                ? "★"
                : "☆";
    }


    return (
        '<span class="rating-stars">' +
        stars +
        '</span> ' +
        value
    );
}


/* =========================================================
   FILTER REVIEWS
   ========================================================= */

function filterReviews() {

    const searchInput =
        document.getElementById(
            "reviewSearch"
        );


    const ratingFilter =
        document.getElementById(
            "reviewRatingFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const rating =
        ratingFilter
            ? ratingFilter.value
            : "";


    const filtered =
        smartMoveReviews.filter(
            function (review) {

                const passenger =
                    String(
                        review.passengerName ??
                        review.passengerUsername ??
                        review.passengerId ??
                        ""
                    ).toLowerCase();


                const trip =
                    String(
                        review.tripId ??
                        ""
                    ).toLowerCase();


                const comment =
                    String(
                        review.comment ??
                        ""
                    ).toLowerCase();


                const reviewRating =
                    String(
                        review.rating ??
                        ""
                    );


                return (
                    (
                        !search ||
                        passenger.includes(
                            search
                        ) ||
                        trip.includes(
                            search
                        ) ||
                        comment.includes(
                            search
                        )
                    )
                    &&
                    (
                        !rating ||
                        reviewRating === rating
                    )
                );
            }
        );


    renderReviews(
        filtered
    );
}


/* =========================================================
   ANNOUNCEMENT EVENTS
   ========================================================= */

function setupAnnouncementEvents() {

    const showButton =
        document.getElementById(
            "showAnnouncementFormButton"
        );


    const closeButton =
        document.getElementById(
            "closeAnnouncementFormButton"
        );


    const cancelButton =
        document.getElementById(
            "cancelAnnouncementButton"
        );


    const form =
        document.getElementById(
            "announcementForm"
        );


    const searchInput =
        document.getElementById(
            "announcementSearch"
        );


    const statusFilter =
        document.getElementById(
            "announcementStatusFilter"
        );


    const priorityFilter =
        document.getElementById(
            "announcementPriorityFilter"
        );


    const clearButton =
        document.getElementById(
            "clearAnnouncementFilterButton"
        );


    const refreshButton =
        document.getElementById(
            "refreshAnnouncementsButton"
        );


    if (showButton) {

        showButton.addEventListener(
            "click",
            openAnnouncementForm
        );
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeAnnouncementForm
        );
    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeAnnouncementForm
        );
    }


    if (form) {

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                await saveAnnouncement();
            }
        );
    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterAnnouncements
        );
    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterAnnouncements
        );
    }


    if (priorityFilter) {

        priorityFilter.addEventListener(
            "change",
            filterAnnouncements
        );
    }


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

                if (priorityFilter) {
                    priorityFilter.value = "";
                }

                filterAnnouncements();
            }
        );
    }


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadAnnouncements
        );
    }
}


/* =========================================================
   OPEN ANNOUNCEMENT FORM
   ========================================================= */

function openAnnouncementForm() {

    const panel =
        document.getElementById(
            "announcementFormPanel"
        );


    const title =
        document.getElementById(
            "announcementFormTitle"
        );


    const form =
        document.getElementById(
            "announcementForm"
        );


    const id =
        document.getElementById(
            "announcementId"
        );


    if (form) {
        form.reset();
    }


    if (id) {
        id.value = "";
    }


    if (title) {

        title.textContent =
            "Add Announcement";
    }


    if (panel) {

        panel.style.display =
            "block";


        panel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


function closeAnnouncementForm() {

    const panel =
        document.getElementById(
            "announcementFormPanel"
        );


    const form =
        document.getElementById(
            "announcementForm"
        );


    if (panel) {

        panel.style.display =
            "none";
    }


    if (form) {

        form.reset();
    }


    const id =
        document.getElementById(
            "announcementId"
        );


    if (id) {

        id.value = "";
    }
}


/* =========================================================
   LOAD ANNOUNCEMENTS
   ========================================================= */

async function loadAnnouncements() {

    const container =
        document.getElementById(
            "announcementsContent"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        '<div class="loading">' +
        'Loading announcements...' +
        '</div>';


    try {

        const response =
            await fetch(
                "/api/mongo/announcements",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load announcements. HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        smartMoveAnnouncements =
            Array.isArray(data)
                ? data
                : Array.isArray(data.data)
                    ? data.data
                    : [];


        renderAnnouncements(
            smartMoveAnnouncements
        );


    } catch (error) {

        console.error(
            "Load announcements error:",
            error
        );


        container.innerHTML =
            '<div class="empty-state">' +
            escapeHtml(
                error.message
            ) +
            '</div>';
    }
}


/* =========================================================
   SAVE ANNOUNCEMENT
   ========================================================= */

async function saveAnnouncement() {

    const id =
        getValue(
            "announcementId"
        );


    const messageBox =
        document.getElementById(
            "announcementMessageBox"
        );


    const announcement = {

        title:
            getValue(
                "announcementTitle"
            ).trim(),

        message:
            getValue(
                "announcementMessage"
            ).trim(),

        type:
            getValue(
                "announcementType"
            ) || "GENERAL",

        priority:
            getValue(
                "announcementPriority"
            ) || "LOW",

        publishDate:
            getValue(
                "announcementPublishDate"
            ) || null,

        expiryDate:
            getValue(
                "announcementExpiryDate"
            ) || null,

        routeId:
            getValue(
                "announcementRouteId"
            ) || null,

        tripId:
            getValue(
                "announcementTripId"
            ) || null,

        status:
            getValue(
                "announcementStatus"
            ) || "ACTIVE"
    };


    if (!announcement.title) {

        showMessage(
            messageBox,
            "Please enter an announcement title.",
            true
        );

        return;
    }


    if (!announcement.message) {

        showMessage(
            messageBox,
            "Please enter an announcement message.",
            true
        );

        return;
    }


    try {

        showMessage(
            messageBox,
            "Saving announcement...",
            false
        );


        let url =
            "/api/mongo/announcements";


        let method =
            "POST";


        if (id) {

            url =
                "/api/mongo/announcements/" +
                encodeURIComponent(id);


            method =
                "PUT";
        }


        const response =
            await fetch(
                url,
                {
                    method: method,

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            announcement
                        )
                }
            );


        const responseText =
            await response.text();


        let result = {};


        try {

            result =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        } catch (error) {

            console.error(
                "Invalid server response:",
                responseText
            );
        }


        if (!response.ok) {

            showMessage(
                messageBox,
                result.message ||
                responseText ||
                "Unable to save announcement.",
                true
            );

            return;
        }


        showMessage(
            messageBox,
            result.message ||
            "Announcement saved successfully.",
            false
        );


        await loadAnnouncements();


        setTimeout(
            closeAnnouncementForm,
            800
        );


    } catch (error) {

        console.error(
            "Save announcement error:",
            error
        );


        showMessage(
            messageBox,
            error.message ||
            "Unable to save announcement.",
            true
        );
    }
}


/* =========================================================
   RENDER ANNOUNCEMENTS
   ========================================================= */

function renderAnnouncements(
    announcements
) {

    const container =
        document.getElementById(
            "announcementsContent"
        );


    if (!container) {
        return;
    }


    if (
        !announcements ||
        announcements.length === 0
    ) {

        container.innerHTML =
            '<div class="empty-state">' +
            'No announcements found.' +
            '</div>';

        return;
    }


    let html =
        '<div class="table-container">' +

        '<table class="data-table">' +

        '<thead>' +

        '<tr>' +

        '<th>Title</th>' +

        '<th>Message</th>' +

        '<th>Type</th>' +

        '<th>Priority</th>' +

        '<th>Publish Date</th>' +

        '<th>Expiry Date</th>' +

        '<th>Status</th>' +

        '<th>Actions</th>' +

        '</tr>' +

        '</thead>' +

        '<tbody>';


    announcements.forEach(
        function (announcement) {

            const id =
                getDocumentId(
                    announcement
                );


            html +=
                '<tr>' +

                '<td>' +
                escapeHtml(
                    announcement.title ??
                    "-"
                ) +
                '</td>' +

                '<td class="message-cell">' +
                escapeHtml(
                    announcement.message ??
                    "-"
                ) +
                '</td>' +

                '<td>' +
                escapeHtml(
                    announcement.type ??
                    "-"
                ) +
                '</td>' +

                '<td>' +
                escapeHtml(
                    announcement.priority ??
                    "-"
                ) +
                '</td>' +

                '<td>' +
                escapeHtml(
                    formatDate(
                        announcement.publishDate
                    )
                ) +
                '</td>' +

                '<td>' +
                escapeHtml(
                    formatDate(
                        announcement.expiryDate
                    )
                ) +
                '</td>' +

                '<td>' +
                escapeHtml(
                    announcement.status ??
                    "-"
                ) +
                '</td>' +

                '<td>' +

                '<button ' +
                'type="button" ' +
                'class="action-button edit-button" ' +
                'data-id="' +
                escapeAttribute(id) +
                '">' +
                'Edit' +
                '</button>' +

                '</td>' +

                '</tr>';
        }
    );


    html +=
        '</tbody>' +
        '</table>' +
        '</div>';


    container.innerHTML =
        html;


    container
        .querySelectorAll(
            ".edit-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        editAnnouncement(
                            this.getAttribute(
                                "data-id"
                            )
                        );
                    }
                );
            }
        );
}


/* =========================================================
   EDIT ANNOUNCEMENT
   ========================================================= */

function editAnnouncement(
    id
) {

    const announcement =
        smartMoveAnnouncements.find(
            function (item) {

                return String(
                    getDocumentId(item)
                ) === String(id);
            }
        );


    if (!announcement) {
        return;
    }


    const panel =
        document.getElementById(
            "announcementFormPanel"
        );


    if (!panel) {
        return;
    }


    panel.style.display =
        "block";


    setValue(
        "announcementId",
        getDocumentId(
            announcement
        )
    );


    setValue(
        "announcementTitle",
        announcement.title
    );


    setValue(
        "announcementMessage",
        announcement.message
    );


    setValue(
        "announcementType",
        announcement.type ||
        "GENERAL"
    );


    setValue(
        "announcementPriority",
        announcement.priority ||
        "LOW"
    );


    setValue(
        "announcementPublishDate",
        formatDateTimeLocal(
            announcement.publishDate
        )
    );


    setValue(
        "announcementExpiryDate",
        formatDateTimeLocal(
            announcement.expiryDate
        )
    );


    setValue(
        "announcementRouteId",
        announcement.routeId ||
        ""
    );


    setValue(
        "announcementTripId",
        announcement.tripId ||
        ""
    );


    setValue(
        "announcementStatus",
        announcement.status ||
        "ACTIVE"
    );


    const title =
        document.getElementById(
            "announcementFormTitle"
        );


    if (title) {

        title.textContent =
            "Edit Announcement";
    }


    panel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   FILTER ANNOUNCEMENTS
   ========================================================= */

function filterAnnouncements() {

    const search =
        getValue(
            "announcementSearch"
        )
            .trim()
            .toLowerCase();


    const status =
        getValue(
            "announcementStatusFilter"
        )
            .trim()
            .toLowerCase();


    const priority =
        getValue(
            "announcementPriorityFilter"
        )
            .trim()
            .toLowerCase();


    const filtered =
        smartMoveAnnouncements.filter(
            function (announcement) {

                const title =
                    String(
                        announcement.title ??
                        ""
                    ).toLowerCase();


                const message =
                    String(
                        announcement.message ??
                        ""
                    ).toLowerCase();


                const announcementStatus =
                    String(
                        announcement.status ??
                        ""
                    ).toLowerCase();


                const announcementPriority =
                    String(
                        announcement.priority ??
                        ""
                    ).toLowerCase();


                return (
                    (
                        !search ||
                        title.includes(search) ||
                        message.includes(search)
                    )
                    &&
                    (
                        !status ||
                        announcementStatus === status
                    )
                    &&
                    (
                        !priority ||
                        announcementPriority === priority
                    )
                );
            }
        );


    renderAnnouncements(
        filtered
    );
}


/* =========================================================
   HELPERS
   ========================================================= */

function getDocumentId(item) {

    if (!item) {
        return "";
    }


    return (
        item.id ??
        item._id ??
        item.announcementId ??
        ""
    );
}


function getValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return element.value || "";
}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    element.value =
        value ?? "";
}


function showMessage(
    element,
    message,
    isError
) {

    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.classList.remove(
        "success",
        "error"
    );


    element.classList.add(
        isError
            ? "error"
            : "success"
    );
}


function formatDate(
    value
) {

    if (!value) {
        return "-";
    }


    try {

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
            "en-LK"
        );

    } catch (error) {

        return String(value);
    }
}


function formatDateTimeLocal(
    value
) {

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


function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
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


function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );
}


/* =========================================================
   GLOBAL ACCESS
   ========================================================= */

window.uploadVehicleDocument =
    uploadVehicleDocument;

window.loadVehicleDocuments =
    loadVehicleDocuments;

window.loadPassengerReviews =
    loadPassengerReviews;

window.loadAnnouncements =
    loadAnnouncements;

window.editAnnouncement =
    editAnnouncement;