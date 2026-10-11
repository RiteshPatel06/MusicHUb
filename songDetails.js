
const backBtn = document.querySelector("#backBtn");
const params = new URLSearchParams(window.location.search);

const trackId = params.get("id");
const numericTrackId = params.get("trackId");
const title = params.get("title");
const artist = params.get("artist");
const artwork = params.get("artwork");

const shuffleBtn = document.querySelector("#siffleBtn");
const previousBtn = document.querySelector("#previusBtn");
const playPauseBtn = document.querySelector("#playPauseBtn");
const nextBtn = document.querySelector("#nextBtn");
const repeatBtn = document.querySelector("#repetBtn");
const progressBar = document.querySelector("#progressBar");
const currentTimeEl = document.querySelector("#currentTime");
const durationEl = document.querySelector("#duration");
const downloadBtn = document.querySelector("#downloadBtn");

const songTitleEl = document.querySelector("#songTitle");
const songArtistEl = document.querySelector("#songArtist");
const songArtworkEl = document.querySelector("#songArtwork");

const descriptionEl = document.querySelector("#trackDescription");
const tagsContainer = document.querySelector("#trackTags");



const audioPlayer = new Audio();

let playlist = [];
const playlistData = JSON.parse(params.get("playlist") || "[]");
let currentIndex = Number(params.get("index") || 0);

const currentTrack = playlistData[currentIndex];


async function updateTrackInfo(song) {
    descriptionEl.textContent = "Loading description...";
    tagsContainer.textContent = "Loading tags...";

    try {
        const response = await fetch(
            `https://api.audius.co/v1/tracks/${encodeURIComponent(song.id)}`
        );

        const result = await response.json();

        if (!response.ok || !result.data) {
            throw new Error("Track details nahi mile");
        }

        const track = result.data;

        descriptionEl.textContent =
            track.description?.trim() || "No description available.";

        let tags = track.tags || "";

        if (Array.isArray(tags)) {
            // Tags already array mein hain.
        } else if (typeof tags === "string") {
            tags = tags.split(/[,\s]+/).filter(Boolean);
        } else {
            tags = [];
        }

        tagsContainer.innerHTML = "";

        if (tags.length === 0) {
            tagsContainer.textContent = "No tags available.";
            return;
        }

        tags.forEach((tag) => {
            const tagElement = document.createElement("span");
            tagElement.textContent = tag.startsWith("#") ? tag : `#${tag}`;
            tagElement.className =
                "rounded-full border border-gray-500 bg-white/10 px-3 py-2 text-sm";

            tagsContainer.append(tagElement);
        });
    } catch (error) {
        console.error("Track details error:", error);
        descriptionEl.textContent = "Description load nahi ho payi.";
        tagsContainer.textContent = "Tags load nahi ho paye.";
    }
}


descriptionEl.textContent =
    currentTrack?.description || "No description available.";

let tags = currentTrack?.tags || [];

if (typeof tags === "string") {
    tags = tags.split(/[,\s]+/).filter(Boolean);
}

tagsContainer.innerHTML = "";

if (tags.length === 0) {
    tagsContainer.textContent = "No tags available.";
} else {
    tags.forEach((tag) => {
        const tagElement = document.createElement("span");
        tagElement.textContent = tag.startsWith("#") ? tag : `#${tag}`;
        tagElement.className =
            "rounded-full border border-gray-500 bg-white/10 px-3 py-2 text-sm";
        tagsContainer.append(tagElement);
    });
}

try {
    playlist = JSON.parse(params.get("playlist") || "[]");
} catch (error) {
    console.error("Playlist read error:", error);
}

//let currentIndex = Number(params.get("index") || 0);
let isShuffleOn = false;
let isRepeatOn = false;

// Show selected song details
songTitleEl.textContent = title || "Unknown Song";
songArtistEl.textContent = artist || "Unknown Artist";
songArtworkEl.src = artwork || "";

// Back button
backBtn.addEventListener("click", () => {
    window.history.back();
});

// Format time
function formatTime(time) {
    if (!Number.isFinite(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${seconds}`;
}

// Load and play a song from the playlist
function playTrack(index, autoplay = true) {
    if (!playlist.length) {
        console.log("Playlist nahi mili. Search page se song open karo.");
        return;
    }

    if (index < 0) {
        index = playlist.length - 1;
    }

    if (index >= playlist.length) {
        index = 0;
    }

    currentIndex = index;

    const song = playlist[currentIndex];

    songTitleEl.textContent = song.title || "Unknown Song";
    songArtistEl.textContent = song.artist || "Unknown Artist";
    songArtworkEl.src = song.artwork || ""
    updateTrackInfo(song);

    audioPlayer.src =
        `https://api.audius.co/v1/tracks/${encodeURIComponent(song.id)}/stream`;

    audioPlayer.load();

    if (autoplay) {
        audioPlayer.play().catch(error => {
            console.error("Song play error:", error);
        });
    }
}

// Initial audio source
if (playlist.length && playlist[currentIndex]) {
    playTrack(currentIndex, false);
} else if (trackId) {
    audioPlayer.src =
        `https://api.audius.co/v1/tracks/${encodeURIComponent(trackId)}/stream`;
}

// Play / Pause
playPauseBtn.addEventListener("click", async () => {
    if (!audioPlayer.src) {
        alert("Song ka audio URL nahi mila!");
        return;
    }

    if (audioPlayer.paused) {
        try {
            await audioPlayer.play();
        } catch (error) {
            console.error("Audio play error:", error);
        }
    } else {
        audioPlayer.pause();
    }
});

// Update Play/Pause button title
audioPlayer.addEventListener("play", () => {
    playPauseBtn.title = "Pause";
});

audioPlayer.addEventListener("pause", () => {
    playPauseBtn.title = "Play";
});

// Progress bar and duration
audioPlayer.addEventListener("loadedmetadata", () => {
    progressBar.max = Number.isFinite(audioPlayer.duration)
        ? audioPlayer.duration
        : 0;

    durationEl.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener("timeupdate", () => {
    progressBar.value = audioPlayer.currentTime;
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
});

progressBar.addEventListener("input", () => {
    audioPlayer.currentTime = Number(progressBar.value);
});

// Shuffle
shuffleBtn.addEventListener("click", () => {
    isShuffleOn = !isShuffleOn;

    shuffleBtn.classList.toggle("text-red-600", isShuffleOn);

    console.log("Shuffle:", isShuffleOn ? "ON" : "OFF");
});

// Repeat
repeatBtn.addEventListener("click", () => {
    isRepeatOn = !isRepeatOn;
    audioPlayer.loop = isRepeatOn;

    repeatBtn.classList.toggle("text-red-600", isRepeatOn);

    console.log("Repeat:", isRepeatOn ? "ON" : "OFF");
});

// Previous song
previousBtn.addEventListener("click", () => {
    if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
    } else {
        playTrack(currentIndex - 1);
    }
});

// Next song
nextBtn.addEventListener("click", () => {
    if (isShuffleOn && playlist.length > 1) {
        let randomIndex;

        do {
            randomIndex = Math.floor(Math.random() * playlist.length);
        } while (randomIndex === currentIndex);

        playTrack(randomIndex);
    } else {
        playTrack(currentIndex + 1);
    }
});

// Automatically move to next song when current song ends
audioPlayer.addEventListener("ended", () => {
    if (!isRepeatOn && playlist.length > 1) {
        if (isShuffleOn) {
            let randomIndex;

            do {
                randomIndex = Math.floor(Math.random() * playlist.length);
            } while (randomIndex === currentIndex);

            playTrack(randomIndex);
        } else {
            playTrack(currentIndex + 1);
        }
    }
});

// Download button
downloadBtn.addEventListener("click", async () => {
    const idToUse = numericTrackId || trackId;

    if (!idToUse) {
        alert("Song ID nahi mila!");
        return;
    }

    try {
        const response = await fetch(
            `https://api.audius.co/v1/tracks/${encodeURIComponent(idToUse)}`
        );

        const result = await response.json();

        console.log("Track verify response:", result);

        if (!response.ok || !result.data) {
            alert("Audius ko is ID se track nahi mila.");
            return;
        }

        if (
            result.data.downloadable === false ||
            result.data.access?.download === false
        ) {
            alert("Is song ka download available nahi hai.");
            return;
        }

        window.open(
            `https://api.audius.co/v1/tracks/${encodeURIComponent(idToUse)}/download`,
            "_blank"
        );
    } catch (error) {
        console.error("Download error:", error);
        alert("Download karte waqt error aaya.");
    }
});




// Debug information
console.log("Song ID:", trackId);
console.log("Track ID:", numericTrackId);
console.log("Playlist length:", playlist.length);
console.log("Current index:", currentIndex);
