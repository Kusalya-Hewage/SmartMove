// ==========================================
// API BASE URL
// ==========================================

const API_BASE_URL = "";


// ==========================================
// API REQUEST
// ==========================================

async function apiRequest(url, options = {}) {

    const response = await fetch(
        API_BASE_URL + url,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );


    // ==========================================
    // HANDLE ERROR
    // ==========================================

    if (!response.ok) {

        let message =
            `Request failed: ${response.status}`;


        try {

            const errorData =
                await response.json();


            if (errorData.message) {

                message =
                    errorData.message;
            }

        } catch (error) {

            console.error(
                "Error reading error response:",
                error
            );
        }


        throw new Error(message);
    }


    // ==========================================
    // NO CONTENT
    // ==========================================

    if (response.status === 204) {

        return null;
    }


    // ==========================================
    // READ RESPONSE
    // ==========================================

    const text =
        await response.text();


    if (!text) {

        return null;
    }


    // ==========================================
    // PARSE JSON
    // ==========================================

    try {

        return JSON.parse(text);

    } catch (error) {

        return text;
    }
}