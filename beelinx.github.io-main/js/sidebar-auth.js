(function () {
    const SUPABASE_URL = "https://zjzygjflcjqvouitblne.supabase.co";
    const SUPABASE_KEY = "sb_publishable_cYvu5sb_VzOliWmHzYGFLA_e4QXgZTT";

    const menu = document.getElementById("sideMenu");
    if (!menu || !window.supabase) return;

    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    /* ---------- BUILD THE BLOCK ---------- */

    const box = document.createElement("div");
    box.className = "side-auth";
    box.innerHTML = `
        <div id="side-auth-out">
            <h3>Log in</h3>
            <p id="side-auth-msg" class="side-auth-msg" role="alert" hidden></p>

            <button type="button" id="side-auth-google" class="side-auth-google">
                <i class="fab fa-google"></i> Continue with Google
            </button>

            <div class="side-auth-divider"><span>or</span></div>

            <form id="side-auth-form">
                <label class="sr-only" for="side-auth-email">Email</label>
                <input id="side-auth-email" type="email" placeholder="Email"
                       autocomplete="email" required>
                <label class="sr-only" for="side-auth-password">Password</label>
                <input id="side-auth-password" type="password" placeholder="Password"
                       autocomplete="current-password" required>
                <button type="submit" class="side-auth-submit">Log in</button>
            </form>

            <div class="side-auth-row">
                <a class="side-auth-link" href="login.html?view=forgot">Forgot password?</a>
                <a class="side-auth-link" href="login.html?view=signup">Sign up</a>
            </div>

            <a class="side-auth-more" href="login.html">All sign-in options</a>
        </div>

        <div id="side-auth-in" hidden>
            <h3>Your account</h3>
            <p id="side-auth-user" class="side-auth-user"></p>
            <button type="button" id="side-auth-logout" class="side-auth-logout">Log out</button>
        </div>
    `;
    menu.appendChild(box);

    const outView = box.querySelector("#side-auth-out");
    const inView = box.querySelector("#side-auth-in");
    const msg = box.querySelector("#side-auth-msg");
    const form = box.querySelector("#side-auth-form");
    const submit = form.querySelector(".side-auth-submit");

    function showMsg(text) {
        if (!text) { msg.hidden = true; return; }
        msg.textContent = text;
        msg.hidden = false;
    }

    function render(session) {
        const loggedIn = !!(session && session.user);
        outView.hidden = loggedIn;
        inView.hidden = !loggedIn;
        box.querySelector("#side-auth-user").textContent =
            loggedIn ? (session.user.email || "") : "";
    }

    /* ---------- ACTIONS ---------- */

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        showMsg("");
        submit.disabled = true;
        try {
            const { error } = await client.auth.signInWithPassword({
                email: box.querySelector("#side-auth-email").value.trim(),
                password: box.querySelector("#side-auth-password").value
            });
            if (error) showMsg("Incorrect email or password.");
            else form.reset();
        } catch (err) {
            console.error(err);
            showMsg("Something went wrong. Please try again.");
        }
        submit.disabled = false;
    });

    box.querySelector("#side-auth-google").addEventListener("click", async () => {
        showMsg("");
        const { error } = await client.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.href.split("#")[0] }
        });
        if (error) showMsg("Google sign-in is not available yet.");
    });

    box.querySelector("#side-auth-logout").addEventListener("click", async () => {
        await client.auth.signOut();
    });

    /* ---------- KEEP IN SYNC ---------- */

    client.auth.onAuthStateChange((event, session) => render(session));

    client.auth.getSession().then(({ data }) => render(data.session));
})();