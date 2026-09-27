// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://zkavcbepyykiislrhnze.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Sce3qe6R5jfLZ-8W4U6HXA_f07s-1L4";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// ADMIN ELEMENTS
// ==========================================

const businessForm =
    document.getElementById("businessForm");

const logoFileInput =
    document.getElementById("logoFile");

const fileName =
    document.getElementById("fileName");


// ==========================================
// LOGO FILE NAME
// ==========================================

if (logoFileInput) {

    logoFileInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            if (file) {

                fileName.textContent =
                    file.name;

            } else {

                fileName.textContent =
                    "No logo selected";

            }

        }
    );

}


// ==========================================
// CREATE BUSINESS
// ==========================================

if (businessForm) {

    businessForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const result =
                document.getElementById("result");


            const businessName =
                document
                    .getElementById("businessName")
                    .value
                    .trim();


            const googleReviewUrl =
                document
                    .getElementById("googleReviewUrl")
                    .value
                    .trim();


            const instagramUrl =
                document
                    .getElementById("instagramUrl")
                    .value
                    .trim();


            const logoFile =
                logoFileInput &&
                logoFileInput.files.length
                    ? logoFileInput.files[0]
                    : null;


            // ==================================
            // VALIDATION
            // ==================================

            if (!businessName) {

                result.innerHTML = `
                    <div class="error-result">
                        <strong>Business name required</strong>
                        <span>Please enter your business name.</span>
                    </div>
                `;

                return;
            }


            if (!googleReviewUrl) {

                result.innerHTML = `
                    <div class="error-result">
                        <strong>Google review link required</strong>
                        <span>Please enter your Google review link.</span>
                    </div>
                `;

                return;
            }


            if (!instagramUrl) {

                result.innerHTML = `
                    <div class="error-result">
                        <strong>Instagram link required</strong>
                        <span>Please enter your Instagram page.</span>
                    </div>
                `;

                return;
            }


            // ==================================
            // GENERATE BUSINESS ID
            // ==================================

            const businessId =
                Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase();


            let logoUrl = null;


            // ==================================
            // UPLOAD LOGO
            // ==================================

            if (logoFile) {

                result.innerHTML = `
                    <div class="loading-result">
                        <div class="loading-spinner"></div>
                        <p>Uploading business logo...</p>
                    </div>
                `;


                const safeFileName =
                    logoFile.name.replace(
                        /[^\w\.-]/g,
                        "_"
                    );


                const filePath =
                    `${businessId}/${Date.now()}-${safeFileName}`;


                const {
                    error: uploadError
                } =
                    await supabaseClient
                        .storage
                        .from("logos")
                        .upload(
                            filePath,
                            logoFile,
                            {
                                cacheControl: "3600",
                                upsert: false,
                                contentType:
                                    logoFile.type
                            }
                        );


                if (uploadError) {

                    console.error(
                        "Logo upload error:",
                        uploadError
                    );


                    result.innerHTML = `
                        <div class="error-result">
                            <strong>Logo upload failed</strong>
                            <span>${uploadError.message}</span>
                        </div>
                    `;

                    return;

                }


                const {
                    data: publicUrlData
                } =
                    supabaseClient
                        .storage
                        .from("logos")
                        .getPublicUrl(
                            filePath
                        );


                logoUrl =
                    publicUrlData.publicUrl;

            }


            // ==================================
            // SAVE BUSINESS
            // ==================================

            result.innerHTML = `
                <div class="loading-result">
                    <div class="loading-spinner"></div>
                    <p>Creating your review page...</p>
                </div>
            `;


            const {
                error
            } =
                await supabaseClient
                    .from("businesses")
                    .insert([
                        {
                            business_id:
                                businessId,

                            business_name:
                                businessName,

                            logo_url:
                                logoUrl,

                            google_review_url:
                                googleReviewUrl,

                            instagram_url:
                                instagramUrl
                        }
                    ]);


            if (error) {

                console.error(
                    "Business creation error:",
                    error
                );


                result.innerHTML = `
                    <div class="error-result">
                        <strong>Business creation failed</strong>
                        <span>${error.message}</span>
                    </div>
                `;

                return;

            }


            // ==================================
            // CREATE REVIEW PAGE URL
            // ==================================

            const reviewPage =
                `${window.location.origin}${window.location.pathname
                    .replace("admin.html", "")}review.html?id=${businessId}`;


            // ==================================
            // SUCCESS
            // ==================================

            result.innerHTML = `

                <div class="created-result">

                    <div class="created-top">

                        <div class="created-icon">
                            ✓
                        </div>

                        <div>

                            <div class="created-title">
                                BUSINESS CREATED
                            </div>

                            <div class="created-label">
                                Your NFC customer page is ready.
                            </div>

                        </div>

                    </div>


                    <div class="created-divider"></div>


                    <div class="created-section-label">
                        CUSTOMER REVIEW PAGE
                    </div>


                    <div class="created-link-box">

                        <input
                            type="text"
                            id="reviewPageLink"
                            value="${reviewPage}"
                            readonly
                        >

                        <button
                            type="button"
                            id="copyReviewPage"
                        >
                            COPY
                        </button>

                    </div>


                    <div class="created-actions">

                        <a
                            href="${reviewPage}"
                            target="_blank"
                            class="open-review-page"
                        >
                            OPEN PAGE
                            <span>↗</span>
                        </a>


                        <button
                            type="button"
                            id="copyNfcLink"
                            class="nfc-link-button"
                        >
                            COPY NFC LINK
                            <span>⌁</span>
                        </button>

                    </div>


                    <div class="nfc-ready">

                        <div class="nfc-ready-icon">
                            ⌁
                        </div>

                        <div>

                            <strong>
                                NFC READY
                            </strong>

                            <span>
                                Program your NFC card with this link.
                            </span>

                        </div>

                    </div>

                </div>

            `;


            // ==================================
            // COPY REVIEW PAGE
            // ==================================

            const copyReviewPage =
                document.getElementById(
                    "copyReviewPage"
                );


            if (copyReviewPage) {

                copyReviewPage.addEventListener(
                    "click",
                    async function () {

                        await copyText(
                            reviewPage
                        );


                        copyReviewPage.textContent =
                            "COPIED ✓";


                        setTimeout(
                            function () {

                                copyReviewPage.textContent =
                                    "COPY";

                            },
                            1800
                        );

                    }
                );

            }


            // ==================================
            // COPY NFC LINK
            // ==================================

            const copyNfcLink =
                document.getElementById(
                    "copyNfcLink"
                );


            if (copyNfcLink) {

                copyNfcLink.addEventListener(
                    "click",
                    async function () {

                        await copyText(
                            reviewPage
                        );


                        copyNfcLink.innerHTML =
                            "NFC LINK COPIED ✓";


                        setTimeout(
                            function () {

                                copyNfcLink.innerHTML =
                                    'COPY NFC LINK <span>⌁</span>';

                            },
                            1800
                        );

                    }
                );

            }

        }
    );

}


// ==========================================
// CUSTOMER PAGE VARIABLES
// ==========================================

let googleReviewUrl = "";

let instagramUrl = "";

let selectedRating = 0;


// ==========================================
// LOAD BUSINESS
// ==========================================

async function loadBusiness() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const businessId =
        params.get("id");


    if (!businessId) {

        showBusinessError(
            "No business ID found."
        );

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("businesses")
            .select("*")
            .eq(
                "business_id",
                businessId
            )
            .single();


    if (error) {

        console.error(
            "Business error:",
            error
        );


        showBusinessError(
            "Business not found"
        );

        return;

    }


    // ==================================
    // BUSINESS NAME
    // ==================================

    const name =
        document.getElementById(
            "businessName"
        );


    if (name) {

        name.textContent =
            data.business_name;

    }


    // ==================================
    // BUSINESS LOGO
    // ==================================

    const logo =
        document.getElementById(
            "businessLogo"
        );


    if (logo) {

        if (data.logo_url) {

            logo.src =
                data.logo_url;

            logo.style.display =
                "block";

        } else {

            logo.style.display =
                "none";

        }

    }


    // ==================================
    // GOOGLE
    // ==================================

    if (data.google_review_url) {

        googleReviewUrl =
            data.google_review_url;

    }


    // ==================================
    // INSTAGRAM
    // ==================================

    if (data.instagram_url) {

        instagramUrl =
            data.instagram_url;

        setupInstagram(
            data.instagram_url
        );

    } else {

        const instagramSection =
            document.getElementById(
                "instagramSection"
            );


        if (instagramSection) {

            instagramSection.style.display =
                "none";

        }

    }

}


// ==========================================
// INSTAGRAM
// ==========================================

function setupInstagram(url) {

    const button =
        document.getElementById(
            "instagramButton"
        );


    const username =
        document.getElementById(
            "instagramUsername"
        );


    if (button) {

        button.href =
            url;

    }


    if (username) {

        try {

            const parsed =
                new URL(url);


            let path =
                parsed.pathname
                    .replace(
                        /^\/+/,
                        ""
                    )
                    .replace(
                        /\/+$/,
                        ""
                    );


            if (path) {

                username.textContent =
                    "@" +
                    path.split("/")[0];

            }

        } catch (error) {

            console.log(
                "Instagram URL error:",
                error
            );

        }

    }

}


// ==========================================
// SHOW BUSINESS ERROR
// ==========================================

function showBusinessError(message) {

    const name =
        document.getElementById(
            "businessName"
        );


    if (name) {

        name.textContent =
            message;

    }

}


// ==========================================
// STAR ELEMENTS
// ==========================================

const starButtons =
    document.querySelectorAll(
        "#starRating button"
    );


const ratingMessage =
    document.getElementById(
        "ratingMessage"
    );


const reviewInput =
    document.getElementById(
        "customerReview"
    );


const submitReview =
    document.getElementById(
        "submitReview"
    );


const copyReviewButton =
    document.getElementById(
        "copyReviewButton"
    );


const characterCount =
    document.getElementById(
        "characterCount"
    );


const reviewSuccess =
    document.getElementById(
        "reviewSuccess"
    );


const openGoogleButton =
    document.getElementById(
        "openGoogleButton"
    );


const toast =
    document.getElementById(
        "toast"
    );


// ==========================================
// RATING MESSAGES
// ==========================================

const messages = {

    1:
        "We're sorry your experience wasn't great.",

    2:
        "Thank you for your honesty.",

    3:
        "Thank you for your feedback.",

    4:
        "We're glad you had a great experience!",

    5:
        "We're thrilled you enjoyed your experience!"

};


// ==========================================
// STAR SELECTION
// ==========================================

starButtons.forEach(
    function (star) {

        star.addEventListener(
            "click",
            function () {

                selectedRating =
                    Number(
                        this.dataset.rating
                    );


                starButtons.forEach(
                    function (button) {

                        const value =
                            Number(
                                button.dataset.rating
                            );


                        if (
                            value <=
                            selectedRating
                        ) {

                            button.classList.add(
                                "active"
                            );

                        } else {

                            button.classList.remove(
                                "active"
                            );

                        }

                    }
                );


                if (ratingMessage) {

                    ratingMessage.textContent =
                        messages[
                            selectedRating
                        ];

                }


                checkReviewForm();

            }
        );

    }
);


// ==========================================
// REVIEW TEXT
// ==========================================

if (reviewInput) {

    reviewInput.addEventListener(
        "input",
        function () {

            if (characterCount) {

                characterCount.textContent =
                    this.value.length;

            }


            checkReviewForm();

        }
    );

}


// ==========================================
// CHECK REVIEW FORM
// ==========================================

function checkReviewForm() {

    if (!submitReview) {

        return;

    }


    const hasRating =
        selectedRating > 0;


    const hasReview =
        reviewInput &&
        reviewInput.value.trim().length > 0;


    if (
        hasRating &&
        hasReview
    ) {

        submitReview.classList.remove(
            "disabled"
        );

    } else {

        submitReview.classList.add(
            "disabled"
        );

    }

}


// ==========================================
// COPY TEXT
// ==========================================

async function copyText(text) {

    try {

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                text
            );

            return true;

        }

    } catch (error) {

        console.log(
            "Clipboard API failed:",
            error
        );

    }


    // ==================================
    // FALLBACK
    // ==================================

    try {

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            text;


        textarea.style.position =
            "fixed";

        textarea.style.opacity =
            "0";


        document.body.appendChild(
            textarea
        );


        textarea.focus();

        textarea.select();


        const success =
            document.execCommand(
                "copy"
            );


        document.body.removeChild(
            textarea
        );


        return success;

    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );


        return false;

    }

}


// ==========================================
// SHOW TOAST
// ==========================================

function showToast(message) {

    if (!toast) {

        return;

    }


    const text =
        toast.querySelector("p");


    if (text) {

        text.textContent =
            message;

    }


    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        2200
    );

}


// ==========================================
// PREPARE REVIEW
// ==========================================

async function prepareReview() {

    if (
        selectedRating === 0 ||
        !reviewInput
    ) {

        return false;

    }


    const reviewText =
        reviewInput.value.trim();


    if (!reviewText) {

        return false;

    }


    const copied =
        await copyText(
            reviewText
        );


    if (copied) {

        showToast(
            "Review copied"
        );

    } else {

        showToast(
            "Please use Copy Review"
        );

    }


    return copied;

}


// ==========================================
// SUBMIT REVIEW
// ==========================================

if (submitReview) {

    submitReview.addEventListener(
        "click",
        async function () {

            if (
                selectedRating === 0 ||
                !reviewInput ||
                reviewInput.value.trim() === ""
            ) {

                return;

            }


            submitReview.classList.add(
                "processing"
            );


            const buttonText =
                submitReview.querySelector(
                    "span"
                );


            if (buttonText) {

                buttonText.textContent =
                    "PREPARING REVIEW...";

            }


            await prepareReview();


            // ==============================
            // SHOW SUCCESS
            // ==============================

            if (reviewSuccess) {

                reviewSuccess.classList.add(
                    "show"
                );

            }


            submitReview.style.display =
                "none";


            if (copyReviewButton) {

                copyReviewButton.style.display =
                    "none";

            }


            // ==============================
            // OPEN GOOGLE
            // ==============================

            if (googleReviewUrl) {

                setTimeout(
                    function () {

                        window.open(
                            googleReviewUrl,
                            "_blank"
                        );

                    },
                    900
                );

            }

        }
    );

}


// ==========================================
// MANUAL COPY BUTTON
// ==========================================

if (copyReviewButton) {

    copyReviewButton.addEventListener(
        "click",
        async function () {

            if (
                !reviewInput ||
                reviewInput.value.trim() === ""
            ) {

                showToast(
                    "Write your review first"
                );

                return;

            }


            const copied =
                await copyText(
                    reviewInput.value.trim()
                );


            if (copied) {

                this.innerHTML =
                    "<span>REVIEW COPIED ✓</span>";


                showToast(
                    "Review copied"
                );


                setTimeout(
                    function () {

                        copyReviewButton.innerHTML =
                            "<span>COPY REVIEW</span><span>⧉</span>";

                    },
                    1800
                );

            }

        }
    );

}


// ==========================================
// GOOGLE BUTTON
// ==========================================

if (openGoogleButton) {

    openGoogleButton.addEventListener(
        "click",
        function () {

            if (googleReviewUrl) {

                window.open(
                    googleReviewUrl,
                    "_blank"
                );

            }

        }
    );

}


// ==========================================
// START CUSTOMER PAGE
// ==========================================

if (
    document.getElementById(
        "businessLogo"
    )
) {

    loadBusiness();

}