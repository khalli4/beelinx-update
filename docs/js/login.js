const SUPABASE_URL = "https://zjzygjflcjqvouitblne.supabase.co";
const SUPABASE_KEY = "sb_publishable_cYvu5sb_VzOliWmHzYGFLA_e4QXgZTT";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const HOME_URL = new URL("index.html", window.location.href).href;
const LOGIN_URL = new URL("login.html", window.location.href).href;

const title = document.getElementById("auth-title");
const subtitle = document.getElementById("auth-subtitle");
const tabs = document.getElementById("auth-tabs");
const socialBlock = document.getElementById("social-block");
const messageBox = document.getElementById("auth-message");
const forms = document.querySelectorAll(".auth-form");

const VIEWS = {
    login:  { title: "Welcome back",       subtitle: "Log in to your Beelinx account", tabs: true,  social: true },
    signup: { title: "Create your account", subtitle: "Join Beelinx in a minute",       tabs: true,  social: true },
    forgot: { title: "Reset password",      subtitle: "We'll email you a reset link",   tabs: false, social: false },
    update: { title: "New password",        subtitle: "Choose a new password",          tabs: false, social: false }
};

function showMessage(text, type) {
    if (!text) { messageBox.hidden = true; return; }
    messageBox.textContent = text;
    messageBox.className = "auth-message" + (type === "success" ? " success" : "");
    messageBox.hidden = false;
}

function showView(name) {
    const view = VIEWS[name];
    title.textContent = view.title;
    subtitle.textContent = view.subtitle;
    tabs.hidden = !view.tabs;
    socialBlock.hidden = !view.social;
    forms.forEach(f => { f.hidden = f.dataset.view !== name; });
    document.querySelectorAll(".auth-tab").forEach(t => {
        t.classList.toggle("active", t.dataset.view === name);
    });
    showMessage("");
}

document.querySelectorAll(".auth-tab, .link-btn").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
});

document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
        const input = btn.parentElement.querySelector("input");
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.querySelector("i").className = show ? "fas fa-eye-slash" : "fas fa-eye";
    });
});

async function withLoading(form, task) {
    const button = form.querySelector(".auth-submit");
    button.disabled = true;
    try { await task(); }
    catch (err) {
        console.error(err);
        showMessage("Something went wrong. Please try again.");
    }
    button.disabled = false;
}

/* LOG IN */
document.getElementById("login-form").addEventListener("submit", e => {
    e.preventDefault();
    withLoading(e.target, async () => {
        const { error } = await sb.auth.signInWithPassword({
            email: document.getElementById("login-email").value.trim(),
            password: document.getElementById("login-password").value
        });
        if (error) { showMessage("Incorrect email or password."); return; }
        window.location.href = HOME_URL;
    });
});

/* SIGN UP */
document.getElementById("signup-form").addEventListener("submit", e => {
    e.preventDefault();
    const password = document.getElementById("signup-password").value;
    if (password !== document.getElementById("signup-confirm").value) {
        showMessage("Passwords do not match.");
        return;
    }
    withLoading(e.target, async () => {
        const { data, error } = await sb.auth.signUp({
            email: document.getElementById("signup-email").value.trim(),
            password,
            options: { emailRedirectTo: LOGIN_URL }
        });
        if (error) { showMessage(error.message); return; }
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            showMessage("An account with this email already exists. Try logging in.");
            return;
        }
        if (data.session) { window.location.href = HOME_URL; return; }
        showMessage("Check your email to confirm your account, then log in.", "success");
    });
});

/* FORGOT PASSWORD */
document.getElementById("forgot-form").addEventListener("submit", e => {
    e.preventDefault();
    withLoading(e.target, async () => {
        const { error } = await sb.auth.resetPasswordForEmail(
            document.getElementById("forgot-email").value.trim(),
            { redirectTo: LOGIN_URL }
        );
        if (error) { showMessage("Could not send the email. Please try again."); return; }
        showMessage("If that email has an account, a reset link is on its way.", "success");
    });
});

/* NEW PASSWORD (after clicking the reset email) */
document.getElementById("update-form").addEventListener("submit", e => {
    e.preventDefault();
    withLoading(e.target, async () => {
        const { error } = await sb.auth.updateUser({
            password: document.getElementById("update-password").value
        });
        if (error) { showMessage(error.message); return; }
        showMessage("Password updated. Taking you to Beelinx...", "success");
        setTimeout(() => { window.location.href = HOME_URL; }, 1200);
    });
});

/* GOOGLE */
document.getElementById("google-btn").addEventListener("click", async () => {
    const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: HOME_URL }
    });
    if (error) showMessage("Google sign-in is not available yet.");
});

/* SESSION CHECKS */
sb.auth.onAuthStateChange(event => {
    if (event === "PASSWORD_RECOVERY") showView("update");
});

(async function init() {
    const requested = new URLSearchParams(window.location.search).get("view");
    showView(VIEWS[requested] && requested !== "update" ? requested : "login");
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = await sb.auth.getSession();
    if (data.session && !isRecovery) window.location.href = HOME_URL;
})();