const supabaseURL = "https://lnmficqjmkhukjqugnxl.supabase.co"
const supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxubWZpY3FqbWtodWtqcXVnbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjAzNDgsImV4cCI6MjA5MjE5NjM0OH0.C_B-ZuZwnBHoL6LVJ90yZa74Vy0R42o4qz9wKBbFZGk"
const my_supabase = supabase.createClient(supabaseURL, supabase_key)

async function saveScore(
    username = "Developer", 
    DataCollectionArgs = {
            TotalMoves: 0,
            StartTime: Math.floor(Date.now()/1000),
            EndTime: Math.floor(Date.now()/1000),
            GridSize: '{"row": 5, "col": 5}'
        }
    )
{
    const {data, error} = await my_supabase
        .from("leaderboard")
        .insert([{
            username: username,
            time_taken: DataCollectionArgs.EndTime-DataCollectionArgs.StartTime,
            moves: DataCollectionArgs.TotalMoves,
            grid_size: JSON.parse(DataCollectionArgs.GridSize)
        }])
    if (error) console.error("Error saving:", error);
        else console.log("Score saved!");
}