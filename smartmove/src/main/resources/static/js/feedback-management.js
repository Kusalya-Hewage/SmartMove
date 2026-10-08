
/* =========================================================
   SMARTMOVE - FEEDBACK MANAGEMENT
   ========================================================= */


/* =========================================================
   DATA
   ========================================================= */

let allFeedback = [];


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setupFeedbackEvents();

        await loadFeedback();

    }
);


/* =========================================================
   EVENTS
   ========================================================= */

function setupFeedbackEvents() {

    /* =====================================================
       REFRESH
       ===================================================== */

    const refreshButton =
        document.getElementById(
            "refreshFeedbackButton"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadFeedback
        );

    }


    /* =====================================================
       SEARCH
       ===================================================== */

    const searchInput =
        document.getElementById(
            "feedbackSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFeedbackFilters
        );

    }


    /* =====================================================
       RATING FILTER
       ===================================================== */

    const ratingFilter =
        document.getElementById(
            "feedbackRatingFilter"
        );


    if (ratingFilter) {

        ratingFilter.addEventListener(
            "change",
            applyFeedbackFilters
        );

    }


    /* =====================================================
       CLEAR FILTER
       ===================================================== */

    const clearButton =
        document.getElementById(
            "clearFeedbackFilterButton"
        );


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

                applyFeedbackFilters();

            }
        );

    }


    /* =====================================================
       CLOSE FORM
       ===================================================== */

    const closeButton =
        document.getElementById(
            "closeFeedbackFormButton"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeFeedbackForm
        );

    }


    /* =====================================================
       CANCEL
       ===================================================== */

    const cancelButton =
        document.getElementById(
            "cancelFeedbackButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeFeedbackForm
        );

    }


    /* =====================================================
       FORM SUBMIT
       ===================================================== */

    const form =
        document.getElementById(
            "feedbackForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            updateFeedback
        );

    }

}


/* =========================================================
   LOAD FEEDBACK
   ========================================================= */

async function loadFeedback() {

    const container =
        document.getElementById(
            "feedbackContent"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        '<div class="loading">Loading feedback...</div>';


    try {

        const response =
            await fetch(
                "/api/feedback",
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load feedback."
            );

        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            allFeedback = data;

        } else {

            allFeedback = [];

        }


        applyFeedbackFilters();


    } catch (error) {

        console.error(
            "Feedback loading error:",
            error
        );


        container.innerHTML =
            '<div class="error-message">' +
            'Unable to load feedback.' +
            '</div>';

    }

}


/* =========================================================
   APPLY FILTERS
   ========================================================= */

function applyFeedbackFilters() {

    const searchInput =
        document.getElementById(
            "feedbackSearch"
        );


    const ratingFilter =
        document.getElementById(
            "feedbackRatingFilter"
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
        allFeedback.filter(
            function (feedback) {

                const passengerName =
                    getPassengerName(
                        feedback
                    ).toLowerCase();


                const comment =
                    String(
                        feedback.commentText ||
                        feedback.comment ||
                        ""
                    ).toLowerCase();


                const feedbackRating =
                    String(
                        feedback.rating ||
                        ""
                    );


                const matchesSearch =
                    !search ||
                    passengerName.includes(
                        search
                    ) ||
                    comment.includes(
                        search
                    );


                const matchesRating =
                    !rating ||
                    feedbackRating === rating;


                return (
                    matchesSearch &&
                    matchesRating
                );

            }
        );


    renderFeedback(
        filtered
    );

}


/* =========================================================
   GET FEEDBACK ID
   ========================================================= */

function getFeedbackId(feedback) {

    return (
        feedback.feedbackId ??
        feedback.id ??
        ""
    );

}


/* =========================================================
   GET PASSENGER NAME
   ========================================================= */

function getPassengerName(feedback) {

    if (
        feedback.passenger &&
        feedback.passenger.fullName
    ) {

        return feedback.passenger.fullName;

    }


    if (
        feedback.passenger &&
        feedback.passenger.name
    ) {

        return feedback.passenger.name;

    }


    if (feedback.passengerName) {

        return feedback.passengerName;

    }


    if (feedback.fullName) {

        return feedback.fullName;

    }


    return "Passenger";

}


/* =========================================================
   GET TRIP ID
   ========================================================= */

function getTripId(feedback) {

    if (
        feedback.trip &&
        feedback.trip.tripId != null
    ) {

        return feedback.trip.tripId;

    }


    return (
        feedback.tripId ??
        ""
    );

}


/* =========================================================
   RENDER FEEDBACK
   ========================================================= */

function renderFeedback(feedbackList) {

    const container =
        document.getElementById(
            "feedbackContent"
        );


    if (!container) {
        return;
    }


    updateFeedbackSummary(
        feedbackList
    );


    if (
        !feedbackList ||
        feedbackList.length === 0
    ) {

        container.innerHTML =
            '<div class="empty-section">' +
            'No feedback found.' +
            '</div>';

        return;

    }


    let html = "";


    html +=
        '<div class="table-container">';


    html +=
        '<table class="feedback-table">';


    html +=
        '<thead>';


    html +=
        '<tr>';


    html +=
        '<th>ID</th>';


    html +=
        '<th>Passenger</th>';


    html +=
        '<th>Trip</th>';


    html +=
        '<th>Rating</th>';


    html +=
        '<th>Comment</th>';


    html +=
        '<th>Feedback Date</th>';


    html +=
        '<th>Actions</th>';


    html +=
        '</tr>';


    html +=
        '</thead>';


    html +=
        '<tbody>';


    feedbackList.forEach(
        function (feedback) {

            const id =
                getFeedbackId(
                    feedback
                );


            const passengerName =
                getPassengerName(
                    feedback
                );


            const tripId =
                getTripId(
                    feedback
                );


            const rating =
                Number(
                    feedback.rating || 0
                );


            const comment =
                feedback.commentText ||
                feedback.comment ||
                "-";


            const date =
                formatFeedbackDate(
                    feedback.feedbackDate
                );


            html +=
                "<tr>";


            html +=
                "<td>" +
                escapeHtml(id) +
                "</td>";


            html +=
                "<td>" +
                escapeHtml(
                    passengerName
                ) +
                "</td>";


            html +=
                "<td>" +
                escapeHtml(
                    tripId || "-"
                ) +
                "</td>";


            html +=
                '<td>' +
                '<span class="rating-display">' +
                generateStars(rating) +
                '</span>' +
                '<span class="rating-number">' +
                escapeHtml(rating) +
                "/5" +
                '</span>' +
                '</td>';


            html +=
                '<td class="feedback-comment-cell">' +
                escapeHtml(comment) +
                '</td>';


            html +=
                "<td>" +
                escapeHtml(date) +
                "</td>";


            html +=
                '<td>' +
                '<div class="action-buttons">';


            html +=
                '<button ' +
                'type="button" ' +
                'class="edit-button feedback-edit-button" ' +
                'data-id="' +
                escapeHtml(id) +
                '">' +
                'Edit' +
                '</button>';


            html +=
                '<button ' +
                'type="button" ' +
                'class="delete-button feedback-delete-button" ' +
                'data-id="' +
                escapeHtml(id) +
                '">' +
                'Delete' +
                '</button>';


            html +=
                '</div>' +
                '</td>';


            html +=
                "</tr>";

        }
    );


    html +=
        "</tbody>";


    html +=
        "</table>";


    html +=
        "</div>";


    container.innerHTML =
        html;


    /* =====================================================
       EDIT EVENTS
       ===================================================== */

    container
        .querySelectorAll(
            ".feedback-edit-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openFeedbackEdit(
                            this.dataset.id
                        );

                    }
                );

            }
        );


    /* =====================================================
       DELETE EVENTS
       ===================================================== */

    container
        .querySelectorAll(
            ".feedback-delete-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteFeedback(
                            this.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateFeedbackSummary(
    feedbackList
) {

    const totalElement =
        document.getElementById(
            "feedbackTotal"
        );


    const averageElement =
        document.getElementById(
            "feedbackAverageRating"
        );


    const fiveStarElement =
        document.getElementById(
            "feedbackFiveStar"
        );


    if (totalElement) {

        totalElement.textContent =
            feedbackList.length;

    }


    let totalRating = 0;

    let fiveStarCount = 0;


    feedbackList.forEach(
        function (feedback) {

            const rating =
                Number(
                    feedback.rating || 0
                );


            totalRating += rating;


            if (rating === 5) {

                fiveStarCount++;

            }

        }
    );


    const average =
        feedbackList.length > 0
            ? totalRating /
              feedbackList.length
            : 0;


    if (averageElement) {

        averageElement.textContent =
            average.toFixed(1) +
            " / 5";

    }


    if (fiveStarElement) {

        fiveStarElement.textContent =
            fiveStarCount;

    }

}


/* =========================================================
   OPEN EDIT FORM
   ========================================================= */

function openFeedbackEdit(id) {

    const feedback =
        allFeedback.find(
            function (item) {

                return String(
                    getFeedbackId(item)
                ) === String(id);

            }
        );


    if (!feedback) {

        alert(
            "Feedback record not found."
        );

        return;

    }


    const panel =
        document.getElementById(
            "feedbackFormPanel"
        );


    const idInput =
        document.getElementById(
            "editFeedbackId"
        );


    const ratingInput =
        document.getElementById(
            "feedbackRating"
        );


    const commentInput =
        document.getElementById(
            "feedbackComment"
        );


    if (idInput) {

        idInput.value =
            getFeedbackId(
                feedback
            );

    }


    if (ratingInput) {

        ratingInput.value =
            feedback.rating ||
            "5";

    }


    if (commentInput) {

        commentInput.value =
            feedback.commentText ||
            feedback.comment ||
            "";

    }


    clearFeedbackMessage();


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
   UPDATE FEEDBACK
   ========================================================= */

async function updateFeedback(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "editFeedbackId"
        )?.value || "";


    const rating =
        document.getElementById(
            "feedbackRating"
        )?.value || "";


    const comment =
        document.getElementById(
            "feedbackComment"
        )?.value.trim() || "";


    if (!id) {

        showFeedbackMessage(
            "Feedback ID is missing.",
            "error"
        );

        return;

    }


    if (!rating) {

        showFeedbackMessage(
            "Please select a rating.",
            "error"
        );

        return;

    }


    if (!comment) {

        showFeedbackMessage(
            "Comment is required.",
            "error"
        );

        return;

    }


    const feedbackData = {

        rating:
            Number(rating),

        commentText:
            comment

    };


    const saveButton =
        document.getElementById(
            "saveFeedbackButton"
        );


    try {

        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.textContent =
                "Updating...";

        }


        const response =
            await fetch(
                "/api/feedback/" +
                encodeURIComponent(id),
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify(
                            feedbackData
                        )

                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Feedback update failed."
            );

        }


        showFeedbackMessage(
            "Feedback updated successfully.",
            "success"
        );


        await loadFeedback();


        setTimeout(
            function () {

                closeFeedbackForm();

            },
            800
        );


    } catch (error) {

        console.error(
            "Feedback update error:",
            error
        );


        showFeedbackMessage(
            error.message ||
            "Unable to update feedback.",
            "error"
        );


    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Update Feedback";

        }

    }

}


/* =========================================================
   DELETE FEEDBACK
   ========================================================= */

async function deleteFeedback(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this feedback?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/feedback/" +
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
                "Feedback deletion failed."
            );

        }


        alert(
            "Feedback deleted successfully."
        );


        await loadFeedback();


    } catch (error) {

        console.error(
            "Feedback deletion error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete feedback."
        );

    }

}


/* =========================================================
   CLOSE FORM
   ========================================================= */

function closeFeedbackForm() {

    const panel =
        document.getElementById(
            "feedbackFormPanel"
        );


    const form =
        document.getElementById(
            "feedbackForm"
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
            "editFeedbackId"
        );


    if (idInput) {

        idInput.value = "";

    }


    clearFeedbackMessage();

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showFeedbackMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "feedbackFormMessage"
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
   CLEAR MESSAGE
   ========================================================= */

function clearFeedbackMessage() {

    const element =
        document.getElementById(
            "feedbackFormMessage"
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
   GENERATE STARS
   ========================================================= */

function generateStars(rating) {

    let stars = "";


    for (let i = 1; i <= 5; i++) {

        stars +=
            i <= rating
                ? "★"
                : "☆";

    }


    return escapeHtml(stars);

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatFeedbackDate(value) {

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


    return (
        String(
            date.getDate()
        ).padStart(2, "0") +
        "/" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "/" +
        date.getFullYear()
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

