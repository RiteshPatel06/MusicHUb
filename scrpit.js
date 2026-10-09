const inputBtn = document.querySelector("#inputBtn")
const searchBtn = document.querySelector("#searchBtn")
const songContainer = document.querySelector("#songContainer")
const progressBar = document.querySelector("#progressBar")
const currentTime = document.querySelector("#currentTime")
const duration = document.querySelector("#duration")
const currentSong = document.querySelector("#currentSong")
const playerControls = document.querySelector("#playerControls")
const audio = new Audio()


function formatTime(time) {
    if (!Number.isFinite(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60).toString().padStart(2, "0")

    return `${minutes}:${seconds}`
}
audio.addEventListener("loadedmetadata", () => {
    progressBar.max = audio.duration
    duration.textContent = formatTime(audio.duration)
})

audio.addEventListener("timeupdate", () => {
    progressBar.value = audio.currentTime
    currentTime.textContent = formatTime(audio.currentTime)
})
progressBar.addEventListener("input", () => {
    audio.currentTime = Number(progressBar.value)
})


searchBtn.addEventListener("click", (e) => {
    e.preventDefault()
    let query = inputBtn.value.trim()
    if (!query) {
        return
    }
    searchSongs(query)
})
async function searchSongs(songName) {
    songContainer.innerHTML = `Searching...`
    let response = await fetch(`https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(songName)}&limit=50`)
    let data = await response.json()
    console.log(data)
    displaySongs(data.data)

}
function displaySongs(songs) {
    songContainer.innerHTML = ""
    if(!songs || songs.length === 0){
        songContainer.innerHTML = `<p class="text-center text-gray-400 text-xl mt-8">song not found</p>`
        return
    }
    songs.forEach((song) => {
        const div = document.createElement("div")
        div.classList.add("flex", "flex-col")
        div.innerHTML = `
        <div class="flex justify-between border border-white/30 rounded-md m-3">
                <img width="60" height="60" src=${song.artwork["480x480"]} alt="">
                <div class=" song-title-box flex flex-col items-center">
                    <p>${song.title}</p>
                    <p>${song.user.handle}</p>
                </div>
                <div class="flex items-center">
                 <button class = "playBtn">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-circle-caret-right"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 12l-4 -4v8l4 -4" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg>
                 </button>
                <button class ="pauseBtn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-player-pause"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -12" /><path d="M14 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -12" /></svg>
                </button>
                </div> 
            </div>
            
            
        `
        songContainer.append(div)
        const playBtn = div.querySelector(".playBtn")
        playBtn.addEventListener("click", () => {
            currentSong.textContent = song.title

            div.append(playerControls)
            playerControls.classList.remove("hidden")

            audio.src = song.stream.url
            audio.play()
        })
        const pauseBtn = div.querySelector(".pauseBtn")
        pauseBtn.addEventListener("click", () => {
            audio.pause()
        })



    })

}