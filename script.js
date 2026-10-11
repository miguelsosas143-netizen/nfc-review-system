
/* ==========================================
   SUPABASE
========================================== */

const SUPABASE_URL =
    "https://zkavcbepyykiislrhnze.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Sce3qe6R5jfLZ-8W4U6HXA_f07s-1L4";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* ==========================================
   ADMIN ELEMENTS
========================================== */

const businessForm = document.getElementById("businessForm");
const logoFileInput = document.getElementById("logoFile");
const fileName = document.getElementById("fileName");


/* ==========================================
   LOGO FILE NAME
========================================== */

if (logoFileInput) {
    logoFileInput.addEventListener("change", function () {
        const file = this.files[0];

        if (fileName) {
            fileName.textContent = file
                ? file.name
                : "No logo selected";
        }
    });
}


/* ==========================================
   CREATE BUSINESS
========================================== */

if (businessForm) {
    businessForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const result = document.getElementById("result");

        const businessName = document
            .getElementById("businessName")
            .value.trim();

        const googleReviewUrl = document
            .getElementById("googleReviewUrl")
            .value.trim();

        const instagramUrl = document
            .getElementById("instagramUrl")
            .value.trim();

        const facebookInput =
            document.getElementById("facebookUrl");

        const facebookUrl = facebookInput
            ? facebookInput.value.trim()
            : "";

        const logoFile =
            logoFileInput && logoFileInput.files.length
                ? logoFileInput.files[0]
                : null;

        function showAdminError(title, message) {
            if (!result) return;

            const box = document.createElement("div");
            box.className = "error-result";

            const strong = document.createElement("strong");
            strong.textContent = title;

            const span = document.createElement("span");
            span.textContent = message;

            box.append(strong, span);
            result.replaceChildren(box);
        }

        if (!businessName) {
            showAdminError(
                "Business name required",
                "Please enter your business name."
            );
            return;
        }

        if (!googleReviewUrl) {
            showAdminError(
                "Google review link required",
                "Please enter your Google review link."
            );
            return;
        }

        if (!instagramUrl) {
            showAdminError(
                "Instagram link required",
                "Please enter your Instagram page."
            );
            return;
        }

        function isValidWebUrl(value) {
            try {
                const url = new URL(value);

                return (
                    url.protocol === "https:" ||
                    url.protocol === "http:"
                );
            } catch {
                return false;
            }
        }

        if (!isValidWebUrl(googleReviewUrl)) {
            showAdminError(
                "Invalid Google link",
                "Please enter a valid Google review URL."
            );
            return;
        }

        if (!isValidWebUrl(instagramUrl)) {
            showAdminError(
                "Invalid Instagram link",
                "Please enter a valid Instagram URL."
            );
            return;
        }

        if (facebookUrl && !isValidWebUrl(facebookUrl)) {
            showAdminError(
                "Invalid Facebook link",
                "Please enter a valid Facebook URL."
            );
            return;
        }

        const businessId = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        let logoUrl = null;

        /* Upload logo if provided */

        if (logoFile) {
            if (result) {
                result.innerHTML = `
                    <div class="loading-result">
                        <div class="loading-spinner"></div>
                        <p>Uploading business logo...</p>
                    </div>
                `;
            }

            const safeFileName = logoFile.name.replace(
                /[^\w.-]/g,
                "_"
            );

            const filePath =
                `${businessId}/${Date.now()}-${safeFileName}`;

            const { error: uploadError } =
                await supabaseClient.storage
                    .from("logos")
                    .upload(filePath, logoFile, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: logoFile.type
                    });

            if (uploadError) {
                console.error(
                    "Logo upload error:",
                    uploadError
                );

                showAdminError(
                    "Logo upload failed",
                    uploadError.message
                );
                return;
            }

            const { data: publicUrlData } =
                supabaseClient.storage
                    .from("logos")
                    .getPublicUrl(filePath);

            logoUrl = publicUrlData.publicUrl;
        }

        if (result) {
            result.innerHTML = `
                <div class="loading-result">
                    <div class="loading-spinner"></div>
                    <p>Creating your review page...</p>
                </div>
            `;
        }

        /* Save business information */

        const { error } = await supabaseClient
            .from("businesses")
            .insert([{
                business_id: businessId,
                business_name: businessName,
                logo_url: logoUrl,
                google_review_url: googleReviewUrl,
                instagram_url: instagramUrl,
                facebook_url: facebookUrl || null
            }]);

        if (error) {
            console.error(
                "Business creation error:",
                error
            );

            showAdminError(
                "Business creation failed",
                error.message
            );
            return;
        }

        /* Build customer review page link */

        const basePath = window.location.pathname
            .replace("admin.html", "");

        const reviewPage =
            `${window.location.origin}${basePath}review.html?id=${encodeURIComponent(businessId)}`;

        /* Success message */

        if (result) {
            result.innerHTML = `
                <div class="created-result">
                    <div class="created-top">
                        <div class="created-icon">✓</div>
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
                            rel="noopener noreferrer"
                            class="open-review-page"
                        >
                            OPEN PAGE <span>↗</span>
                        </a>

                        <button
                            type="button"
                            id="copyNfcLink"
                            class="nfc-link-button"
                        >
                            COPY NFC LINK <span>⌁</span>
                        </button>
                    </div>

                    <div class="nfc-ready">
                        <div class="nfc-ready-icon">⌁</div>
                        <div>
                            <strong>NFC READY</strong>
                            <span>
                                Program your NFC card with this link.
                            </span>
                        </div>
                    </div>
                </div>
            `;

            const linkInput =
                document.getElementById("reviewPageLink");

            if (linkInput) {
                linkInput.value = reviewPage;
            }
        }

        /* Copy review page link */

        const copyReviewPage =
            document.getElementById("copyReviewPage");

        if (copyReviewPage) {
            copyReviewPage.addEventListener(
                "click",
                async function () {
                    const copied = await copyText(reviewPage);

                    this.textContent = copied
                        ? "COPIED ✓"
                        : "COPY FAILED";

                    setTimeout(() => {
                        this.textContent = "COPY";
                    }, 1800);
                }
            );
        }

        /* Copy NFC link */

        const copyNfcLink =
            document.getElementById("copyNfcLink");

        if (copyNfcLink) {
            copyNfcLink.addEventListener(
                "click",
                async function () {
                    const copied = await copyText(reviewPage);

                    this.textContent = copied
                        ? "NFC LINK COPIED ✓"
                        : "COPY FAILED";

                    setTimeout(() => {
                        this.innerHTML =
                            'COPY NFC LINK <span>⌁</span>';
                    }, 1800);
                }
            );
        }
    });
}


/* ==========================================
   CUSTOMER PAGE VARIABLES
========================================== */

let googleReviewUrl = "";
let selectedRating = 0;


/* ==========================================
   LOAD BUSINESS
========================================== */

async function loadBusiness() {
    const params =
        new URLSearchParams(window.location.search);

    const businessId = params.get("id");

    if (!businessId) {
        showBusinessError("No business ID found.");
        return;
    }

    const { data, error } = await supabaseClient
        .from("businesses")
        .select("*")
        .eq("business_id", businessId)
        .single();

    if (error || !data) {
        console.error("Business error:", error);
        showBusinessError("Business not found");
        return;
    }

    const name = document.getElementById("businessName");

    if (name) {
        name.textContent =
            data.business_name || "Our Business";
    }

    const logo = document.getElementById("businessLogo");

    if (logo) {
        if (data.logo_url) {
            logo.src = data.logo_url;
            logo.alt =
                `${data.business_name || "Business"} logo`;
            logo.style.display = "block";
        } else {
            logo.style.display = "none";
        }
    }

    googleReviewUrl = data.google_review_url || "";

    /* Instagram */

    if (data.instagram_url) {
        setupInstagram(data.instagram_url);
    } else {
        const section =
            document.getElementById("instagramSection");

        if (section) {
            section.style.display = "none";
        }
    }

    /* Facebook */

    if (data.facebook_url) {
        setupFacebook(data.facebook_url);
    } else {
        const button =
            document.getElementById("facebookButton");

        if (button) {
            button.style.display = "none";
        }
    }
}


/* ==========================================
   INSTAGRAM
========================================== */

function setupInstagram(url) {
    const button =
        document.getElementById("instagramButton");

    const username =
        document.getElementById("instagramUsername");

    try {
        const parsed = new URL(url);

        if (!["https:", "http:"].includes(parsed.protocol)) {
            throw new Error("Invalid URL protocol");
        }

        if (button) {
            button.href = parsed.href;
            button.target = "_blank";
            button.rel = "noopener noreferrer";
            button.style.display = "flex";
        }

        if (username) {
            const path = parsed.pathname
                .replace(/^\/+/, "")
                .replace(/\/+$/, "");

            username.textContent = path
                ? "@" + path.split("/")[0]
                : "Instagram";
        }
    } catch (error) {
        console.error("Instagram URL error:", error);

        const section =
            document.getElementById("instagramSection");

        if (section) {
            section.style.display = "none";
        }
    }
}


/* ==========================================
   FACEBOOK
========================================== */

function setupFacebook(url) {
    const button =
        document.getElementById("facebookButton");

    if (!button) return;

    try {
        const parsed = new URL(url);

        if (!["https:", "http:"].includes(parsed.protocol)) {
            throw new Error("Invalid URL protocol");
        }

        button.href = parsed.href;
        button.target = "_blank";
        button.rel = "noopener noreferrer";
        button.style.display = "flex";
    } catch (error) {
        console.error("Facebook URL error:", error);
        button.style.display = "none";
    }
}


/* ==========================================
   SHOW BUSINESS ERROR
========================================== */

function showBusinessError(message) {
    const name = document.getElementById("businessName");

    if (name) {
        name.textContent = message;
    }
}


/* ==========================================
   STAR ELEMENTS
========================================== */

const starButtons =
    document.querySelectorAll("#starRating button");

const ratingMessage =
    document.getElementById("ratingMessage");

const reviewInput =
    document.getElementById("customerReview");

const submitReview =
    document.getElementById("submitReview");

const copyReviewButton =
    document.getElementById("copyReviewButton");

const characterCount =
    document.getElementById("characterCount");

const reviewSuccess =
    document.getElementById("reviewSuccess");

const openGoogleButton =
    document.getElementById("openGoogleButton");

const toast =
    document.getElementById("toast");


/* ==========================================
   RATING MESSAGES
========================================== */

const messages = {
    1: "We're sorry your experience wasn't great.",
    2: "Thank you for your honesty.",
    3: "Thank you for your feedback.",
    4: "We're glad you had a great experience!",
    5: "We're thrilled you enjoyed your experience!"
};


/* ==========================================
   STAR SELECTION
========================================== */

starButtons.forEach(function (star) {
    star.addEventListener("click", function () {
        selectedRating = Number(this.dataset.rating);

        starButtons.forEach(function (button) {
            const value = Number(button.dataset.rating);

            button.classList.toggle(
                "active",
                value <= selectedRating
            );
        });

        if (ratingMessage) {
            ratingMessage.textContent =
                messages[selectedRating] || "";
        }

        checkReviewForm();
    });
});


/* ==========================================
   REVIEW TEXT AND CHARACTER COUNT
========================================== */

if (reviewInput) {
    reviewInput.addEventListener("input", function () {
        if (characterCount) {
            characterCount.textContent = this.value.length;
        }

        checkReviewForm();
    });
}


/* ==========================================
   CHECK REVIEW FORM
========================================== */

function checkReviewForm() {
    if (!submitReview) return;

    const hasRating = selectedRating > 0;

    const hasReview =
        reviewInput &&
        reviewInput.value.trim().length > 0;

    const isValid = hasRating && hasReview;

    submitReview.classList.toggle(
        "disabled",
        !isValid
    );

    submitReview.disabled = !isValid;
}


/* ==========================================
   COPY TEXT
========================================== */

async function copyText(text) {
    try {
        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (error) {
        console.log("Clipboard API failed:", error);
    }

    try {
        const textarea =
            document.createElement("textarea");

        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const success =
            document.execCommand("copy");

        document.body.removeChild(textarea);

        return success;
    } catch (error) {
        console.error("Copy failed:", error);
        return false;
    }
}


/* ==========================================
   SHOW TOAST
========================================== */

function showToast(message) {
    if (!toast) return;

    const text = toast.querySelector("p");

    if (text) {
        text.textContent = message;
    }

    toast.classList.add("show");

    setTimeout(function () {
        toast.classList.remove("show");
    }, 2200);
}


/* ==========================================
   SUBMIT CUSTOMER FEEDBACK
========================================== */

// Every rating is saved to Supabase.
// Every customer receives the same Google redirect.

if (submitReview) {
    submitReview.addEventListener("click", async function () {
        if (
            selectedRating === 4-5 ||
            !reviewInput ||
            reviewInput.value.trim() === ""
        ) {
            showToast(
                "Select a star rating and write your feedback."
            );
            return;
        }

        const params =
            new URLSearchParams(window.location.search);

        const businessId = params.get("id");
        const feedback = reviewInput.value.trim();

        if (!businessId) {
            showToast("Business ID is missing.");
            return;
        }

        if (!googleReviewUrl) {
            showToast(
                "Google review link is unavailable."
            );
            return;
        }

        submitReview.disabled = true;
        submitReview.classList.add("processing");

        const buttonText =
            submitReview.querySelector("span");

        if (buttonText) {
            buttonText.textContent = "SUBMITTING...";
        }

        try {
            // Save the customer's rating and written feedback.
            const { error } = await supabaseClient
                .from("customer_feedback")
                .insert({
                    business_id: businessId,
                    rating: selectedRating,
                    feedback: feedback
                });

            if (error) {
                throw error;
            }

            // Redirect only after the feedback is saved.
            // This behavior is only for 4-5 ratings if they press 1-3 star they will be submit it in private supabase.
            window.location.assign(googleReviewUrl);

        } catch (error) {
            console.error(
                "Feedback submission error:",
                error
            );

            showToast(
                "Couldn't submit feedback. Please try again."
            );

            submitReview.disabled = false;
            submitReview.classList.remove("processing");

            if (buttonText) {
                buttonText.textContent = "SUBMIT REVIEW";
            }
        }
    });
}


/* ==========================================
   MANUAL COPY BUTTON
========================================== */

if (copyReviewButton) {
    copyReviewButton.addEventListener(
        "click",
        async function () {
            if (
                !reviewInput ||
                !reviewInput.value.trim()
            ) {
                showToast("Write your review first.");
                return;
            }

            const copied = await copyText(
                reviewInput.value.trim()
            );

            if (copied) {
                this.innerHTML =
                    "<span>REVIEW COPIED ✓</span>";

                showToast("Review copied");

                setTimeout(() => {
                    copyReviewButton.innerHTML =
                        "<span>COPY REVIEW</span><span>⧉</span>";
                }, 1800);
            } else {
                showToast(
                    "Copy failed. Please try again."
                );
            }
        }
    );
}


/* ==========================================
   GOOGLE REVIEW BUTTON
========================================== */

// Keep the manual Google Review button working as a fallback.

if (openGoogleButton) {
    openGoogleButton.addEventListener(
        "click",
        function () {
            if (!googleReviewUrl) {
                showToast(
                    "Google review link is unavailable."
                );
                return;
            }

            window.location.assign(googleReviewUrl);
        }
    );
}


/* ==========================================
   START CUSTOMER PAGE
========================================== */

if (document.getElementById("businessLogo")) {
    loadBusiness();
}
