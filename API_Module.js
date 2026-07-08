const supabaseURL = "https://lnmficqjmkhukjqugnxl.supabase.co"
const supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxubWZpY3FqbWtodWtqcXVnbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjAzNDgsImV4cCI6MjA5MjE5NjM0OH0.C_B-ZuZwnBHoL6LVJ90yZa74Vy0R42o4qz9wKBbFZGk"
const my_supabase = supabase.createClient(supabaseURL, supabase_key)

async function saveScore(
    username = "Developer", 
    DataCollectionArgs = {
            TotalMoves: 0,
            StartTime: Math.floor(Date.now()/1000),
            EndTime: Math.floor(Date.now()/1000),
            GridSize: 5,
            GameSeed: "",
            GenerationType: "recursive_backtracker",
            OptimalPath: "",
            OptimalPathLength: 0,
            PlayerMovement: ""
        }
    )
{
    if (DataCollectionArgs.GameSeed==""){
        throw new Error("Cannot save game without proper seed!");
    }
    const {data, error} = await my_supabase
        .from("maze_event")
        .insert([{
            username: username,
            time_taken: DataCollectionArgs.EndTime-DataCollectionArgs.StartTime,
            moves: DataCollectionArgs.TotalMoves,
            grid_size: DataCollectionArgs.GridSize,
            game_seed: DataCollectionArgs.GameSeed,
            generation_type: DataCollectionArgs.GenerationType,
            player_movement: DataCollectionArgs.PlayerMovement,
            optimal_path: DataCollectionArgs.OptimalPath,
            optimal_path_length: DataCollectionArgs.OptimalPathLength
        }])
    if (error) console.error("Error saving:", error);
        else console.log("Score saved!");
}

async function saveConnect4Score(
    username = "Developer",
    DataCollectionArgs = {
            Username: "",
            Difficulty: "medium",
            StartTime: Math.floor(Date.now()/1000),
            EndTime: Math.floor(Date.now()/1000),
            Winner: 0,
            TotalMoves: 0,
            PlayerMoves: [],
            MoveTimings: [],
            FinalBoard: [],
            OptimalMoves: [],
            MoveAgreementRate: 0,
            CriticalMistakes: []
        }
    )
{
    if (DataCollectionArgs.PlayerMoves.length==0){
        throw new Error("Cannot save a game with no player moves!");
    }
    const {data, error} = await my_supabase
        .from("connect4_leaderboard")
        .insert([{
            username: username,
            difficulty: DataCollectionArgs.Difficulty,
            winner: DataCollectionArgs.Winner,
            time_taken: DataCollectionArgs.EndTime-DataCollectionArgs.StartTime,
            total_moves: DataCollectionArgs.TotalMoves,
            player_moves: DataCollectionArgs.PlayerMoves,
            move_timings: DataCollectionArgs.MoveTimings,
            final_board: DataCollectionArgs.FinalBoard,
            optimal_moves: DataCollectionArgs.OptimalMoves,
            move_agreement_rate: DataCollectionArgs.MoveAgreementRate,
            critical_mistakes: DataCollectionArgs.CriticalMistakes
        }])
    if (error) console.error("Error saving:", error);
        else console.log("Connect 4 score saved!");
}

async function saveWordleScore(
    username = "Developer",
    DataCollectionArgs = {
            Username: "",
            WordLength: 5,
            TargetWord: "",
            StartTime: Math.floor(Date.now()/1000),
            EndTime: Math.floor(Date.now()/1000),
            Won: false,
            TotalGuesses: 0,
            Guesses: [],
            GuessTimings: []
        }
    )
{
    if (DataCollectionArgs.Guesses.length==0){
        throw new Error("Cannot save a game with no guesses!");
    }
    const {data, error} = await my_supabase
        .from("wordle_leaderboard")
        .insert([{
            username: username,
            word_length: DataCollectionArgs.WordLength,
            target_word: DataCollectionArgs.TargetWord,
            won: DataCollectionArgs.Won,
            time_taken: DataCollectionArgs.EndTime-DataCollectionArgs.StartTime,
            total_guesses: DataCollectionArgs.TotalGuesses,
            guesses: DataCollectionArgs.Guesses,
            guess_timings: DataCollectionArgs.GuessTimings
        }])
    if (error) console.error("Error saving:", error);
        else console.log("Wordle score saved!");
}