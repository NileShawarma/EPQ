const PROFILE_STORAGE_KEY = "epq_player_profile"

function getPlayerProfile(){
    try {
        let raw = localStorage.getItem(PROFILE_STORAGE_KEY)

        if (!raw){
            return {username: "", adhd: false, autism: false}
        }

        let parsed = JSON.parse(raw)

        return {
            username: typeof parsed.username == "string" ? parsed.username : "",
            adhd: parsed.adhd == true,
            autism: parsed.autism == true
        }
    } catch (error) {
        return {username: "", adhd: false, autism: false}
    }
}

function savePlayerProfile(profile){
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
        username: profile.username || "",
        adhd: profile.adhd == true,
        autism: profile.autism == true
    }))
}

//Same rules as the games use: starts with a 2 digit year, 5-8 chars total
function isValidProfileUsername(contents){
    let year = Number(contents.substring(0, 2))

    if (isNaN(year) || contents.substring(0, 2).trim().length != 2){
        return false
    }
    if (contents.length <= 4 || contents.length > 8){
        return false
    }

    return true
}

//Auto-fill the game's username box from the saved profile (no-op on pages without one)
function prefillUsernameFromProfile(){
    let input = document.getElementById("username")

    if (!input){
        return
    }

    let profile = getPlayerProfile()

    if (profile.username != "" && input.value == ""){
        input.value = profile.username
    }
}

prefillUsernameFromProfile()
