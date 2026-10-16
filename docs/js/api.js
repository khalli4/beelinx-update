const API = "https://beelinx-api.onrender.com";

async function api(path) {
    const res = await fetch(API + path);
    if (!res.ok) throw new Error(`${res.status} ${path}`);
    return res.json();
}

function showMessage(container, text) {
    if (!container) return;
    container.replaceChildren();
    const p = document.createElement("p");
    p.className = "status-message";
    p.textContent = text;
    container.appendChild(p);
}