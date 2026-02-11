Perfect! Here's a fully rewritten main.js for your FNAF jumpscare extension. It has:

Infinite loops — Freddy will always watch for jumpscare opportunities.

Secret code detection — works anywhere, even if you're typing in an input.

Failsafe — removes the overlay automatically after 10s.

Optimized structure — less repeated code, easier to read.

console.log("FNAF jumpscare content script loaded!");

// --- Flags ---
let jumpscare = false;
let jumpscareQueued = false;

// --- Secret combo ---
const secretCombo = ["1", "9", "8", "7"];
let comboIndex = 0;
let comboTimer = null;
const comboTime = 3000; // 3 seconds to complete combo

// --- Random delay helpers ---
const randomDelay = () => Math.floor(Math.random() * 10000);       // up to 10s
const randomCheckDelay = () => Math.floor(Math.random() * 5000);   // up to 5s

// --- Check if tab is focused ---
function isTabFocused() {
    return new Promise(resolve => {
        chrome.runtime.sendMessage({ action: "checkFocus" }, response => {
            resolve(response?.isFocused ?? false);
        });
    });
}

// --- Execute jumpscare ---
function executeJumpscare() {
    if (jumpscare) return;
    jumpscare = true;

    const overlay = document.createElement("div");
    overlay.id = "fnaf-jumpscare-overlay";
    Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        zIndex: "9999",
        backgroundColor: "rgba(0,0,0,0)",
        transition: "background-color 2s"
    });
    document.body.appendChild(overlay);

    // Fade in
    setTimeout(() => overlay.style.backgroundColor = "rgba(0,0,0,0.6)", 50);

    // Add jumpscare media after fade
    setTimeout(() => {
        const img = document.createElement("img");
        img.src = chrome.runtime.getURL("assets/fredbear.gif");
        Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover" });

        const audio = document.createElement("audio");
        audio.src = chrome.runtime.getURL("assets/audio.mp3");
        audio.volume = 1.0;
        audio.autoplay = true;
        audio.play().catch(() => console.log("[FNAF] Audio blocked"));

        const staticImg = document.createElement("img");
        staticImg.src = chrome.runtime.getURL("assets/static.gif");
        Object.assign(staticImg.style, { width: "100%", height: "100%", objectFit: "cover" });

        overlay.appendChild(img);
        overlay.appendChild(audio);

        img.addEventListener("load", () => {
            audio.play();

            setTimeout(() => {
                overlay.removeChild(img);
                overlay.appendChild(staticImg);

                setTimeout(() => {
                    overlay.remove();
                    jumpscare = false;
                    jumpscareQueued = false;
                    console.log("[FNAF] Freddy can strike again.");
                }, 3000);
            }, 1500);
        });

        // Failsafe: remove overlay after 10s
        setTimeout(() => {
            if (document.getElementById("fnaf-jumpscare-overlay")) {
                overlay.remove();
                jumpscare = false;
                jumpscareQueued = false;
                console.log("[FNAF] Failsafe triggered, overlay removed.");
            }
        }, 10000);

    }, 2000);
}

// --- Secret combo detection (works everywhere) ---
document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    if (e.key === secretCombo[comboIndex]) {
        if (comboIndex === 0) {
            comboTimer = setTimeout(() => comboIndex = 0, comboTime);
        }

        comboIndex++;

        if (comboIndex === secretCombo.length) {
            console.log("[FNAF] Secret combo triggered!");
            jumpscareQueued = true;
            executeJumpscare();
            comboIndex = 0;
            if (comboTimer) clearTimeout(comboTimer);
        }
    } else {
        comboIndex = 0;
        if (comboTimer) clearTimeout(comboTimer);
    }
}, true); // capture phase ensures detection even inside inputs

// --- Infinite jumpscare loop ---
async function jumpscareLoop() {
    let interacted = false;

    const markInteracted = () => { interacted = true; };
    document.addEventListener("click", markInteracted);
    document.addEventListener("keydown", markInteracted);

    while (true) {
        // Queue jumpscare randomly
        while (!jumpscareQueued) {
            await new Promise(r => setTimeout(r, randomDelay()));
            if (Math.random() < 0.03) jumpscareQueued = true;
        }

        // Wait for proper conditions to execute
        while (!jumpscare) {
            await new Promise(r => setTimeout(r, randomCheckDelay()));
            const focused = await isTabFocused();
            if (focused && interacted && !jumpscare) {
                if (Math.random() < 0.5) {
                    console.log("[FNAF] Freddy backed out!");
                    jumpscareQueued = false; // reset for next loop
                } else {
                    executeJumpscare();
                }
            }
        }

        // Reset for next cycle
        jumpscareQueued = false;
        jumpscare = false;
    }
}

// --- Start infinite loop ---
jumpscareLoop();
