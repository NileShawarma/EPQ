const settingsOverlay = document.getElementById("settings-overlay")
const usernameField = document.getElementById("settings-username")
const adhdField = document.getElementById("settings-adhd")
const autismField = document.getElementById("settings-autism")
const warningField = document.getElementById("settings-warning")
const profileChip = document.getElementById("profile-chip")

let warningTimeout = null

function refreshProfileChip(){
    let profile = getPlayerProfile()

    if (profile.username != ""){
        profileChip.textContent = `// logged in as ${profile.username}`
    }else{
        profileChip.textContent = "// no username saved yet — open settings"
    }
}

function loadSettingsIntoForm(){
    let profile = getPlayerProfile()

    usernameField.value = profile.username
    adhdField.checked = profile.adhd
    autismField.checked = profile.autism
}

function openSettings(){
    loadSettingsIntoForm()
    warningField.textContent = ""
    settingsOverlay.classList.add("active")
    usernameField.focus()
}

function closeSettings(){
    settingsOverlay.classList.remove("active")
}

function showSettingsWarning(text){
    warningField.textContent = text
    clearTimeout(warningTimeout)
    warningTimeout = setTimeout(()=>{
        warningField.textContent = ""
    }, 4000)
}

function saveSettings(){
    let username = usernameField.value.trim()

    //Same validation the game subpages apply to the username box
    if (username != "" && !isValidProfileUsername(username)){
        showSettingsWarning("Please Enter A Valid Username Before Saving")
        return
    }

    savePlayerProfile({
        username: username,
        adhd: adhdField.checked,
        autism: autismField.checked
    })

    refreshProfileChip()
    closeSettings()
}

document.getElementById("settings-btn").addEventListener("click", openSettings)
document.getElementById("settings-save").addEventListener("click", saveSettings)
document.getElementById("settings-close").addEventListener("click", closeSettings)

settingsOverlay.addEventListener("click", (e)=>{
    if (e.target == settingsOverlay){
        closeSettings()
    }
})

usernameField.addEventListener("keydown", (e)=>{
    if (e.key == "Enter"){
        saveSettings()
    }
})

document.addEventListener("keydown", (e)=>{
    if (e.key == "Escape"){
        closeSettings()
    }
})

refreshProfileChip()
