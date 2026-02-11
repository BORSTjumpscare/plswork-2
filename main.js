console.log("FNAF jumpscare extension loaded");

// --- Flags for jumpscare state ---
let jumpscare = false;
let jumpscareQueued = false;

// --- Secret key tracking for hidden trigger ---
let pressedKeys = new Set();

// --- Random delay helpers ---
function randomDelay() {
    // Delay for up to 10 seconds
    return Math.floor(Math.random() * 10000);
}

function randomCheckDelay() {
    // Delay for up to 5 seconds
    return Math.floor(Math.random() * 5000);
}

// --- Check if the current tab is focused ---
function isTabFocused() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "checkFocus" }, (response) => {
            resolve(response?.isFocused ?? false);
        });
    });
}

// --- Execute the jumpscare with fade ---
function executeJumpscare() {
    // Step 1: Create fullscreen overlay for slight darkening
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.zIndex = "9999";
    overlay.style.backgroundColor = "rgba(0,0,0,0)"; // start transparent
    overlay.style.transition = "background-color 2s"; // 2-second fade
    document.body.appendChild(overlay);

    // Step 2: Trigger slight fade
    setTimeout(() => {
        overlay.style.backgroundColor = "rgba(0,0,0,0.6)"; // slightly darker
    }, 50); // tiny delay for transition to work

    // Step 3: Wait 2 seconds for fade before jumpscare
    setTimeout(() => {
        // Jumpscare GIF
        const jumpscareGif = document.createElement("img");
        jumpscareGif.src = chrome.runtime.getURL("assets/fredbear.gif");
        jumpscareGif.style.width = "100%";
        jumpscareGif.style.height = "100%";
        jumpscareGif.style.objectFit = "cover";

        // Jumpscare audio
        const jumpscareAudio = document.createElement("audio");
        jumpscareAudio.src = chrome.runtime.getURL("assets/audio.mp3");
        jumpscareAudio.volume = 1.0;
        jumpscareAudio.autoplay = true;
        jumpscareAudio.play().catch(() => {
            console.log("[FNAF] Audio autoplay blocked, waiting for user interaction.");
        });

        // Static effect for after the GIF
        const staticOverlay = document.createElement("img");
        staticOverlay.src = chrome.runtime.getURL("assets/static.gif");
        staticOverlay.style.width = "100%";
        staticOverlay.style.height = "100%";
        staticOverlay.style.objectFit = "cover";

        // Add GIF and audio to overlay
        overlay.appendChild(jumpscareGif);
        overlay.appendChild(jumpscareAudio);

        jumpscareGif.addEventListener("load", () => {
            jumpscareAudio.play();

            // Replace GIF with static after 1.5 seconds
            setTimeout(() => {
                overlay.removeChild(jumpscareGif);
                overlay.appendChild(staticOverlay);

                // Remove overlay after 3 seconds and reset jumpscare flags
                setTimeout(() => {
                    overlay.remove();
                    jumpscare = false;
                    jumpscareQueued = false;
                    console.log("[FNAF] Freddy can strike again.");
                }, 3000);
            }, 1500);
        });
    }, 2000); // wait 2 seconds for fade
}

// --- Secret combo trigger: hold 1 + 9 + 8 + 7 ---
document.addEventListener("keydown", (event) => {
    pressedKeys.add(event.key);

    if (
        pressedKeys.has("1") &&
        pressedKeys.has("9") &&
        pressedKeys.has("8") &&
        pressedKeys.has("7")
    ) {
        console.log("[FNAF] Secret combo activated!");

        if (!jumpscare) {
            jumpscare = true;
            jumpscareQueued = true;
            executeJumpscare();
        }
    }
});

document.addEventListener("keyup", (event) => {
    pressedKeys.delete(event.key);
});

// --- Main jumpscare loop ---
async function overlayJumpscare() {
    let hasInteracted = false;

    function markInteracted() {
        hasInteracted = true;
        document.removeEventListener("click", markInteracted);
        document.removeEventListener("keydown", markInteracted);
    }

    // Listen for first user interaction
    document.addEventListener("click", markInteracted);
    document.addEventListener("keydown", markInteracted);

    // Step 1: Randomly queue jumpscare
    while (!jumpscareQueued) {
        const delay = randomDelay();
        console.log(`[FNAF] Jumpscare opportunity after ${delay / 1000}s`);
        await new Promise((r) => setTimeout(r, delay));

        if (Math.random() < 0.03) {
            console.log("[FNAF] Freddy wants to jumpscare!");
            jumpscareQueued = true;
        } else {
            console.log("[FNAF] Freddy does not want to jumpscare right now.");
        }
    }

    // Step 2: Wait for tab focus and user interaction
    while (!jumpscare) {
        const delay = randomCheckDelay();
        console.log("[FNAF] Jumpscare queued. Waiting for next opportunity!");
        await new Promise((r) => setTimeout(r, delay));

        const tabFocused = await isTabFocused();

        if (!tabFocused) {
            console.log("[FNAF] Freddy is waiting for the user to focus this tab.");
        } else if (!hasInteracted) {
            console.log("[FNAF] Freddy is waiting for the next user interaction.");
        } else {
            if (!jumpscare) {
                console.log("[FNAF] Opportunity found.");
                jumpscare = true;

                if (Math.random() < 0.5) {
                    console.log("[FNAF] Freddy backed out and left this tab alone!");
                } else {
                    console.log("[FNAF] Freddy is preparing to jumpscare!");
                    executeJumpscare();
                }
            } else {
                console.log("[FNAF] Freddy is deciding!");
            }
        }
    }
}

// --- Start the jumpscare process ---
overlayJumpscare();
