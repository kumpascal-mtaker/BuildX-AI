let currentProject = {
    name: "My App",
    type: "web",
    html: "",
    css: "",
    js: ""
};

let currentCodeTab = "html";

let payments =
    JSON.parse(localStorage.getItem("buildxPayments")) || [];


/* -------------------------
   SCREEN MANAGEMENT
------------------------- */

function showScreen(id) {

    document.querySelectorAll(".screen")
        .forEach(screen => screen.classList.remove("active"));

    document.getElementById(id)
        .classList.add("active");

    window.scrollTo(0, 0);
}


function goHome() {
    showScreen("homeScreen");
}


function openPublish() {
    showScreen("publishScreen");
}


function closePublish() {
    showScreen("builderScreen");
}


function closePayment() {
    showScreen("publishScreen");
}


/* -------------------------
   AI APP GENERATOR
------------------------- */

function generateApp() {

    const prompt =
        document.getElementById("appPrompt").value.trim();

    const type =
        document.getElementById("appType").value;

    if (!prompt) {
        showToast("Describe the app you want first.");
        return;
    }

    const appName =
        extractAppName(prompt) || "My AI App";

    currentProject.name = appName;
    currentProject.type = type;

    /*
       This is the MVP/demo generator.

       Later this function will call the secure
       BuildX AI backend and an AI model to generate
       real application code from the user's prompt.
    */

    currentProject.html = createStarterHTML(appName, prompt);
    currentProject.css = createStarterCSS();
    currentProject.js = createStarterJS();

    document.getElementById("projectTitle")
        .textContent = appName;

    showScreen("builderScreen");

    showCode("html");

    updatePreview();

    showToast("Your app has been generated!");
}


function extractAppName(prompt) {

    const match =
        prompt.match(/called\s+["']?([^"'.]+)["']?/i);

    if (match) {
        return match[1].trim();
    }

    return null;
}


/* -------------------------
   STARTER APP
------------------------- */

function createStarterHTML(name, prompt) {

    return `<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<title>${escapeHTML(name)}</title>
</head>

<body>

<header>
    <h1>${escapeHTML(name)}</h1>
</header>

<main>

    <section class="hero">
        <h2>Welcome to ${escapeHTML(name)}</h2>

        <p>
            This application was created with BuildX AI.
        </p>

        <button onclick="startApp()">
            Get Started
        </button>
    </section>

    <section class="about">

        <h2>Your idea</h2>

        <p>
            ${escapeHTML(prompt)}
        </p>

    </section>

</main>

</body>
</html>`;
}


function createStarterCSS() {

    return `* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #f5f7fb;
    color: #202637;
}

header {
    background: #6d4aff;
    color: white;
    padding: 20px;
    text-align: center;
}

main {
    max-width: 900px;
    margin: auto;
    padding: 30px 20px;
}

.hero {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 20px;
}

.hero button {
    background: #6d4aff;
    color: white;
    border: none;
    padding: 13px 25px;
    border-radius: 8px;
    cursor: pointer;
}

.about {
    margin-top: 25px;
    background: white;
    padding: 25px;
    border-radius: 15px;
}`;
}


function createStarterJS() {

    return `function startApp() {

    alert("Welcome to your new app!");

}`;
}


/* -------------------------
   CODE EDITOR
------------------------- */

function showCode(tab) {

    saveCurrentCode();

    currentCodeTab = tab;

    const editor =
        document.getElementById("codeEditor");

    if (tab === "html") {
        editor.value = currentProject.html;
    }

    if (tab === "css") {
        editor.value = currentProject.css;
    }

    if (tab === "js") {
        editor.value = currentProject.js;
    }
}


function saveCurrentCode() {

    const editor =
        document.getElementById("codeEditor");

    if (!editor) return;

    if (currentCodeTab === "html") {
        currentProject.html = editor.value;
    }

    if (currentCodeTab === "css") {
        currentProject.css = editor.value;
    }

    if (currentCodeTab === "js") {
        currentProject.js = editor.value;
    }
}


/* -------------------------
   LIVE PREVIEW
------------------------- */

function updatePreview() {

    saveCurrentCode();

    const frame =
        document.getElementById("previewFrame");

    const documentContent = `
<!DOCTYPE html>
<html>

<head>

<style>

${currentProject.css}

</style>

</head>

<body>

${extractBody(currentProject.html)}

<script>

${currentProject.js}

<\/script>

</body>

</html>
`;

    frame.srcdoc = documentContent;

    showToast("Preview updated.");
}


function extractBody(html) {

    const match =
        html.match(/<body[^>]*>([\\s\\S]*?)<\\/body>/i);

    return match ? match[1] : html;
}


/* -------------------------
   PAYMENT
------------------------- */

let selectedService = "";
let selectedAmount = 0;


function selectPayment(service, amount) {

    selectedService = service;
    selectedAmount = amount;

    document.getElementById("paymentService")
        .textContent = service;

    document.getElementById("paymentAmount")
        .textContent = amount.toLocaleString() + " XAF";

    showScreen("paymentScreen");
}


function submitPayment() {

    const reference =
        document.getElementById("paymentReference")
            .value.trim();

    const note =
        document.getElementById("paymentNote")
            .value.trim();

    if (!reference) {
        showToast("Enter your payment reference.");
        return;
    }

    const payment = {

        id: Date.now(),

        project: currentProject.name,

        service: selectedService,

        amount: selectedAmount,

        reference: reference,

        note: note,

        status: "Pending",

        date: new Date().toLocaleString()

    };

    payments.push(payment);

    localStorage.setItem(
        "buildxPayments",
        JSON.stringify(payments)
    );

    document.getElementById("paymentReference")
        .value = "";

    document.getElementById("paymentNote")
        .value = "";

    showToast(
        "Payment submitted for verification."
    );

    setTimeout(() => {
        showScreen("builderScreen");
    }, 1500);
}


/* -------------------------
   ADMIN
------------------------- */

function openAdmin() {

    showScreen("adminScreen");

    renderPayments();
}


function renderPayments() {

    const container =
        document.getElementById("paymentRequests");

    if (!payments.length) {

        container.innerHTML =
            `<div class="empty">
                No payment requests yet.
             </div>`;

        return;
    }

    container.innerHTML = "";

    payments.forEach(payment => {

        const item =
            document.createElement("div");

        item.className = "payment-request";

        item.innerHTML = `

            <h3>${escapeHTML(payment.project)}</h3>

            <p>
                Publishing:
                <strong>
                    ${escapeHTML(payment.service)}
                </strong>
            </p>

            <p>
                Amount:
                <strong>
                    ${payment.amount.toLocaleString()} XAF
                </strong>
            </p>

            <p>
                Reference:
                ${escapeHTML(payment.reference)}
            </p>

            <p>
                Date:
                ${escapeHTML(payment.date)}
            </p>

            <p>
                Status:
                <strong>
                    ${escapeHTML(payment.status)}
                </strong>
            </p>

            ${
                payment.status === "Pending"
                ?
                `
                <button
                    class="approve"
                    onclick="approvePayment(${payment.id})">
                    ✅ Approve
                </button>

                <button
                    class="reject"
                    onclick="rejectPayment(${payment.id})">
                    ❌ Reject
                </button>
                `
                :
                ""
            }

        `;

        container.appendChild(item);

    });
}


function approvePayment(id) {

    const payment =
        payments.find(p => p.id === id);

    if (!payment) return;

    payment.status = "Approved";

    localStorage.setItem(
        "buildxPayments",
        JSON.stringify(payments)
    );

    renderPayments();

    showToast(
        "Payment approved. Publishing can proceed."
    );
}


function rejectPayment(id) {

    const payment =
        payments.find(p => p.id === id);

    if (!payment) return;

    payment.status = "Rejected";

    localStorage.setItem(
        "buildxPayments",
        JSON.stringify(payments)
    );

    renderPayments();

    showToast("Payment rejected.");
}


/* -------------------------
   HELPERS
------------------------- */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}


function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }
