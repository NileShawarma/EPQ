const WORD_BANK = {
    "4": [
        "ABLE", "BIRD", "CALM", "COLD", "DARK", "DUST", "ECHO", "FISH", "FLAG", "GLOW",
        "GOLD", "HERO", "HUNT", "IDEA", "IRON", "JUMP", "KIND", "KING", "LAMP", "LION",
        "MAZE", "MOON", "NEXT", "NOTE", "OPEN", "OVEN", "PARK", "PATH", "RAIN", "ROCK",
        "SAND", "SNOW", "TIDE", "TREE", "UNIT", "VAST", "WAVE", "WOLF", "YEAR", "ZERO"
    ],
    "5": [
        "APPLE", "BRAVE", "BREAD", "CHAIR", "CLOUD", "DANCE", "DREAM", "EAGLE", "EARTH", "FLAME",
        "FROST", "GHOST", "GRAPE", "HEART", "HONEY", "JUICE", "KNIFE", "LEMON", "LIGHT", "MANGO",
        "MUSIC", "NIGHT", "NURSE", "OCEAN", "ORBIT", "PEARL", "PIANO", "QUEEN", "RIVER", "ROBIN",
        "SOLAR", "STONE", "TIGER", "TRAIN", "VIVID", "VOICE", "WATCH", "WHALE", "YOUTH", "ZEBRA"
    ],
    "6": [
        "ANIMAL", "BASKET", "BRIDGE", "CAMERA", "CANDLE", "DESERT", "DRAGON", "ENGINE", "FALCON", "FOREST",
        "GALAXY", "GARDEN", "HAMMER", "INSECT", "ISLAND", "JUNGLE", "KETTLE", "LAGOON", "LEGEND", "MARBLE",
        "MEADOW", "NATURE", "NEEDLE", "ORANGE", "OYSTER", "PEBBLE", "PLANET", "RABBIT", "ROCKET", "SILVER",
        "SPIRIT", "TEMPLE", "TUNNEL", "VELVET", "VIOLET", "WINTER", "WIZARD", "YELLOW", "MOSAIC", "THRONE"
    ]
}

function setBackground(color){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function getThemeColour(name, fallback){
    let value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()

    if (value == ""){
        return fallback
    }

    return value
}

function drawBoard(wordle){
    let bg_col = getThemeColour("--surface", "#37322a")

    setBackground(bg_col)

    for (let row = 0; row < wordle.MAX_GUESSES; row++){
        for (let col = 0; col < wordle.WordLength; col++){
            let letter = ""
            let state = "empty"

            if (row < wordle.Guesses.length){
                letter = wordle.Guesses[row][col]
                state = wordle.GuessResults[row][col]
            }else if (row == wordle.Guesses.length && !wordle.GameOver){
                letter = wordle.CurrentGuess[col] || ""
                state = letter == "" ? "empty" : "pending"
            }

            drawTile(row, col, letter, state)
        }
    }
}

function drawTile(row, col, letter, state){
    let empty_col = getThemeColour("--bg", "#2b2823")
    let border_col = getThemeColour("--border", "#4d463b")
    let pending_col = getThemeColour("--accent", "#ddbea9")
    let text_col = getThemeColour("--text", "#f1e9dd")
    let correct_col = "#a3b18a"
    let present_col = getThemeColour("--accent2", "#d4a373")
    let absent_col = getThemeColour("--wall", "#443d33")

    let x = BOARD_PAD + (col * (TILE_SIZE + TILE_GAP))
    let y = BOARD_PAD + (row * (TILE_SIZE + TILE_GAP))

    let fill_col = empty_col
    let outline_col = border_col
    let letter_col = text_col

    if (state == "correct"){
        fill_col = correct_col
        outline_col = correct_col
        letter_col = "#2b2823"
    }else if (state == "present"){
        fill_col = present_col
        outline_col = present_col
        letter_col = "#2b2823"
    }else if (state == "absent"){
        fill_col = absent_col
        outline_col = absent_col
        letter_col = getThemeColour("--muted", "#96897a")
    }else if (state == "pending"){
        outline_col = pending_col
    }

    ctx.fillStyle = fill_col
    ctx.strokeStyle = outline_col
    ctx.lineWidth = 2
    ctx.beginPath()
    if (typeof ctx.roundRect == "function"){
        ctx.roundRect(x, y, TILE_SIZE, TILE_SIZE, 6)
    }else{
        ctx.rect(x, y, TILE_SIZE, TILE_SIZE)
    }
    ctx.fill()
    ctx.stroke()

    if (letter != ""){
        ctx.fillStyle = letter_col
        ctx.font = `700 ${Math.floor(TILE_SIZE * 0.5)}px 'Space Mono', monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(letter, x + (TILE_SIZE / 2), y + (TILE_SIZE / 2) + 2)
    }
}

function restartGame(wordle){
    let word_length = document.getElementById("size-sel").value

    wordle.set_word_length(word_length)
    wordle.generate_empty_grid()
    wordle.heartbeat(wordle)
    unlock_username_input()
}

function showUsernameWarning(){
    let warningText = document.getElementById("warning")
    warningText.textContent = "Please Enter A Valid Username Before Playing"

    setTimeout(()=>{
        warningText.textContent = ""
    }, 4000)
}

function validUsername(){
    let input = document.getElementById("username")
    let contents = input.value

    try {
        let validName = true
        let year = contents.substring(0, 2)

        year = Number(year)

        if (isNaN(year)){
            validName = false
        }else if (contents.length <= 4 || contents.length > 8){
            validName = false
        }

        if (!validName){
            throw new Error("Invalid name")
        }

        return lock_username_input()
    } catch (error) {
        showUsernameWarning()
        return false
    }
}

function lock_username_input(){
    let input = document.getElementById("username")
    let usernameTitle = document.getElementsByClassName("username")[0]

    input.classList.add("confirmed")
    usernameTitle.classList.add("confirmed")
    input.disabled = true
    return true
}

function unlock_username_input(){
    let input = document.getElementById("username")
    let usernameTitle = document.getElementsByClassName("username")[0]

    input.classList.remove("confirmed")
    usernameTitle.classList.remove("confirmed")
    input.disabled = false
    return true
}

function open_popup(){
    let overlay = document.getElementById("overlay")
    overlay.classList.add("active")
}

function close_popup(){
    let overlay = document.getElementById("overlay")
    overlay.classList.remove("active")
}

async function popup_text(text){
    let popup = document.getElementById("popup")
    open_popup()

    popup.textContent = ""

    text = text.split("")
    for (const char of text){
        popup.textContent += char
        await new Promise(resolve => setTimeout(resolve, Math.random() * 60))
        if (!document.getElementById("overlay").classList.contains("active")){
            return
        }
    }
}

class Wordle {
    constructor() {
        this.MAX_GUESSES = 6
        this.WordLength = 5

        this.TargetWord = ""
        this.Guesses = []
        this.GuessResults = []
        this.CurrentGuess = ""
        this._GameOver = false
        this.resolveOnGameOver = null
        this.interval_clock = null
        this.LastGuessTime = -1

        this.DataCollection = {
            Username: "",
            WordLength: 5,
            TargetWord: "",
            StartTime: -1,
            EndTime: -1,
            Won: false,
            TotalGuesses: 0,
            Guesses: [],
            GuessTimings: []
        }
    }

    generate_empty_grid(){
        clearInterval(this.interval_clock)

        this.TargetWord = this.pick_target_word()
        this.Guesses = []
        this.GuessResults = []
        this.CurrentGuess = ""
        this.GameOver = false
        this.LastGuessTime = -1

        this.DataCollection = {
            Username: "",
            WordLength: this.WordLength,
            TargetWord: this.TargetWord,
            StartTime: -1,
            EndTime: -1,
            Won: false,
            TotalGuesses: 0,
            Guesses: [],
            GuessTimings: []
        }

        resizeCanvas(this.WordLength, this.MAX_GUESSES)

        let msg_line = document.getElementById("msg")
        msg_line.textContent = ""
        msg_line.classList.remove("won")
    }

    set_word_length(newLength){
        let lengths = ["4", "5", "6"]

        if (!lengths.includes(String(newLength))){
            newLength = "5"
        }

        this.WordLength = Number(newLength)
    }

    pick_target_word(){
        let words = WORD_BANK[String(this.WordLength)]
        return words[Math.floor(Math.random() * words.length)]
    }

    type_letter(letter){
        if (this.GameOver || this.CurrentGuess.length >= this.WordLength){
            return
        }

        if (this.GameStarted == false){
            if (validUsername() == false){
                return
            }

            this.start_game_clock()
        }

        this.CurrentGuess += letter.toUpperCase()
        this.heartbeat(this)
    }

    delete_letter(){
        if (this.GameOver || this.CurrentGuess.length == 0){
            return
        }

        this.CurrentGuess = this.CurrentGuess.slice(0, -1)
        this.heartbeat(this)
    }

    submit_guess(){
        if (this.GameOver || this.GameStarted == false){
            return
        }

        if (this.CurrentGuess.length < this.WordLength){
            let msg_line = document.getElementById("msg")
            msg_line.textContent = "//NOT ENOUGH LETTERS"
            return
        }

        let guess = this.CurrentGuess
        let now = Date.now()

        this.Guesses.push(guess)
        this.GuessResults.push(this.evaluate_guess(guess))
        this.CurrentGuess = ""

        this.DataCollection.TotalGuesses++
        this.DataCollection.Guesses.push(guess)
        this.DataCollection.GuessTimings.push(Math.floor(now - this.LastGuessTime))
        this.LastGuessTime = now

        this.resolve_game_state(guess)
        this.heartbeat(this)
    }

    evaluate_guess(guess){
        let results = new Array(this.WordLength).fill("absent")
        let letter_counts = {}

        for (let letter of this.TargetWord){
            letter_counts[letter] = (letter_counts[letter] || 0) + 1
        }

        for (let i = 0; i < this.WordLength; i++){
            if (guess[i] == this.TargetWord[i]){
                results[i] = "correct"
                letter_counts[guess[i]]--
            }
        }

        for (let i = 0; i < this.WordLength; i++){
            if (results[i] == "correct"){
                continue
            }

            if (letter_counts[guess[i]] > 0){
                results[i] = "present"
                letter_counts[guess[i]]--
            }
        }

        return results
    }

    resolve_game_state(guess){
        if (guess == this.TargetWord){
            this.GameOver = true
            this.DataCollection.EndTime = Math.floor(Date.now() / 1000)
            this.DataCollection.Won = true
            this.DataCollection.Username = document.getElementById("username").value
            this.save_game_data()
            this.game_won()
            return true
        }

        if (this.Guesses.length >= this.MAX_GUESSES){
            this.GameOver = true
            this.DataCollection.EndTime = Math.floor(Date.now() / 1000)
            this.DataCollection.Won = false
            this.DataCollection.Username = document.getElementById("username").value
            this.save_game_data()
            this.game_lost()
            return true
        }

        return false
    }

    save_game_data(){
        saveWordleScore(this.DataCollection.Username, this.DataCollection)
    }

    game_won(){
        let msg_line = document.getElementById("msg")
        let time_taken = this.DataCollection.EndTime - this.DataCollection.StartTime

        msg_line.textContent = `//WORD FOUND IN ${time_taken}s WITH ${this.DataCollection.TotalGuesses} GUESSES`
        if (typeof confetti == "function"){
            confetti()
        }

        msg_line.classList.add("won")
        clearInterval(this.interval_clock)
    }

    game_lost(){
        let msg_line = document.getElementById("msg")
        msg_line.textContent = `//OUT OF GUESSES - WORD WAS ${this.TargetWord}`
        msg_line.classList.add("won")
        clearInterval(this.interval_clock)
    }

    start_game_clock(){
        this.DataCollection.StartTime = Math.floor(Date.now() / 1000)
        this.LastGuessTime = Date.now()
        this.interval_clock = setInterval(() => {
            this.heartbeat(this)
        }, 1000)
    }

    get GameStarted(){
        return this.DataCollection.StartTime != -1
    }

    get GameOver(){
        return this._GameOver
    }

    set GameOver(newVal){
        if (this._GameOver !== newVal){
            this._GameOver = newVal

            if (newVal == true && typeof(this.resolveOnGameOver) == "function"){
                this.resolveOnGameOver()
                this.resolveOnGameOver = null
            }
        }
    }

    heartbeat(wordle){
        if (!wordle.GameOver){
            let startTime = wordle.DataCollection.StartTime

            if (startTime == -1){
                startTime = Math.floor(Date.now() / 1000)
            }

            document.getElementById("timer").textContent = Math.floor(Date.now() / 1000) - startTime + "s"
        }

        document.getElementById("size-disp").textContent = wordle.WordLength
        document.getElementById("steps").textContent = `${wordle.Guesses.length}/${wordle.MAX_GUESSES}`

        let msg_line = document.getElementById("msg")

        if (!wordle.GameOver && wordle.GameStarted){
            msg_line.textContent = "//GUESS THE WORD"
        }

        drawBoard(wordle)
    }
}

const TILE_SIZE = 62
const TILE_GAP = 8
const BOARD_PAD = 12

const canvas = document.getElementById("maze-canvas")
const ctx = canvas.getContext("2d")

function resizeCanvas(word_length, max_guesses){
    canvas.width = (word_length * TILE_SIZE) + ((word_length - 1) * TILE_GAP) + (BOARD_PAD * 2)
    canvas.height = (max_guesses * TILE_SIZE) + ((max_guesses - 1) * TILE_GAP) + (BOARD_PAD * 2)
}

const wordle = new Wordle()

restartGame(wordle)

let padKeys = document.querySelectorAll(".key-pad button")

for (let padKey of padKeys){
    padKey.addEventListener("click", ()=>{
        if (padKey.id == "DEL"){
            wordle.delete_letter()
        }
        if (padKey.id == "ENT"){
            wordle.submit_guess()
        }

        padKey.classList.add("is-active")
        setTimeout(() =>{
            padKey.classList.remove("is-active")
        }, 250)
    })
}

document.addEventListener("keydown", e=>{
    let key = e.key

    if (e.target.tagName == "INPUT"){
        return
    }

    if (key == "Enter"){
        e.preventDefault()
        wordle.submit_guess()
        return
    }

    if (key == "Backspace"){
        e.preventDefault()
        wordle.delete_letter()
        return
    }

    if (key.length == 1 && key.match(/[a-zA-Z]/)){
        wordle.type_letter(key)
    }
})

document.getElementById("new-btn").addEventListener("click", ()=>restartGame(wordle))
document.getElementById("size-sel").addEventListener("change", ()=>restartGame(wordle))
document.getElementById("overlay").addEventListener("click", (e)=>{
    if (e.target == document.getElementById("overlay")){
        close_popup()
    }
})

popup_text("welcome to wordle! guess the hidden word before your 6 tries run out. green means the letter is correct, yellow means it's in the word but in the wrong spot, and grey means it's not in the word at all. enter your username, pick a word length, and start typing. click anywhere outside this box to begin!")
