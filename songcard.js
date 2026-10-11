const backBtn = document.querySelector("#backBtn")
const params = new URLSearchParams(window.location.search);
const trackId = params.get("id");
const numericTrackId = params.get("trackId");
const title = params.get("title")
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
const audioPlayer = new Audio();
let playlist = [];

const streamUrl = trackId
    ? `https://api.audius.co/v1/tracks/${encodeURIComponent(trackId)}/stream`
    : "";

if (streamUrl) {
    audioPlayer.src = streamUrl;
}

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


function playTrack(index) {
    if (playlist.length === 0) {
        console.log("Playlist nahi mili");
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

    document.querySelector("#songTitle").textContent = song.title;
    document.querySelector("#songArtist").textContent = song.artist;
    document.querySelector("#songArtwork").src = song.artwork;

    audioPlayer.src =
        `https://api.audius.co/v1/tracks/${encodeURIComponent(song.id)}/stream`;

    audioPlayer.play().catch(error => {
        console.error("Song play error:", error);
    });
}

previousBtn.addEventListener("click", () => {
    playTrack(currentIndex - 1);
});

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




try {
    playlist = JSON.parse(params.get("playlist") || "[]");
} catch (error) {
    console.error("Playlist read error:", error);
}

let currentIndex = Number(params.get("index") || 0);



function formatTime(time) {
    if (!Number.isFinite(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${seconds}`;
}

audioPlayer.addEventListener("loadedmetadata", () => {
    progressBar.max = audioPlayer.duration;
    durationEl.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener("timeupdate", () => {
    progressBar.value = audioPlayer.currentTime;
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
});

progressBar.addEventListener("input", () => {
    audioPlayer.currentTime = Number(progressBar.value);
});

audioPlayer.addEventListener("ended", () => {
    playPauseBtn.title = "Play";
});



let isShuffleOn = false;
let isRepeatOn = false;

// Shuffle button
shuffleBtn.addEventListener("click", () => {
    isShuffleOn = !isShuffleOn;

    shuffleBtn.classList.toggle("text-red-600", isShuffleOn);
    shuffleBtn.classList.toggle("text-white", !isShuffleOn);

    console.log("Shuffle:", isShuffleOn ? "ON" : "OFF");
});

// Repeat button
repeatBtn.addEventListener("click", () => {
    isRepeatOn = !isRepeatOn;
    audioPlayer.loop = isRepeatOn;

    repeatBtn.classList.toggle("text-red-600", isRepeatOn);
    repeatBtn.classList.toggle("text-white", !isRepeatOn);

    console.log("Repeat:", isRepeatOn ? "ON" : "OFF");
});

// Previous button: current song ko restart karo
previousBtn.addEventListener("click", () => {
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch(error => {
        console.error("Previous button error:", error);
    });
});

// Next button: current song ko skip karke dobara start karo
nextBtn.addEventListener("click", () => {
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch(error => {
        console.error("Next button error:", error);
    });
});





console.log("Song ID:", trackId);
console.log("Track ID:", numericTrackId);
console.log("URL ke saare parameters:", window.location.search);
const downloadBtn = document.querySelector("#downloadBtn");

document.querySelector("#songTitle").textContent = title || "Unknown Song";
document.querySelector("#songArtist").textContent = artist || "Unknown Artist";
document.querySelector("#songArtwork").src = artwork || "";

backBtn.addEventListener("click", () => {
    window.history.back();
});


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

        if (result.data.downloadable === false) {
            alert("Is song ka download available nahi hai.");
            return;
        }

        window.open(
            `https://api.audius.co/v1/tracks/${encodeURIComponent(idToUse)}/download`,
            "_blank"
        );
    } catch (error) {
        console.error("Download error:", error);
        alert("Track verify karte waqt error aaya.");
    }
});


