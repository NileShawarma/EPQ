import random
import stack

END_SQUARE = START_SQUARE = "+"
WALL = "#"
PATH = "█"
PLAYER = "*"
STARTING_SQUARE_ID = {"row": 0, "col": 0}
END_SQUARE_ID = {"row": 9, "col": 9}
def dirList_to_dirLetter(dirList:list) -> str:
    match dirList:
        case [-1,0]:
            return "N"
        case [1,0]:
            return "S"
        case [0,1]:
            return "E"
        case [0,-1]:
            return "W"
        case _:
            raise ValueError("Invalid direction")

def dirLetter_to_dirList(dirLetter:str) -> list:
    match dirLetter:
        case "N":
            return [-1,0]
        case "S":
            return [1,0]
        case "E":
            return [0,1]
        case "W":
            return [0,-1]
        case _:
            raise ValueError("Invalid direction")
        
class Maze:
    def __init__(self):
        self.grid = []
    
    def output_grid(self):
        STARTING_CELL = self.get_cell_by_ID(STARTING_SQUARE_ID)
        ENDING_CELL = self.get_cell_by_ID(END_SQUARE_ID)

        num_rows = 2 * (len(self.grid)) +1
        num_cols = 2 * (len(self.grid[0])) + 1

        gameview_list = [[WALL for i in range(num_cols)] for j in range(num_rows)]

        
        for r, row in enumerate(self.grid):
            for c, cell in enumerate(row):
                cell_walls = cell.Walls

                if cell_walls["N"]:
                    gameview_list[2*r][2*c+1] = WALL
                else:
                    gameview_list[2*r][2*c+1] = PATH
                if cell_walls["E"]:
                    gameview_list[2*r+1][2*c+2] = WALL
                else:
                    gameview_list[2*r+1][2*c+2] = PATH
                if cell_walls["S"]:
                    gameview_list[2*r+2][2*c+1] = WALL
                else:
                    gameview_list[2*r+2][2*c+1] = PATH
                if cell_walls["W"]:
                    gameview_list[2*r+1][2*c] = WALL
                else:
                    gameview_list[2*r+1][2*c] = PATH

                if cell == STARTING_CELL:
                    gameview_list[2*r+1][2*c+1] = START_SQUARE
                elif cell == ENDING_CELL:
                    gameview_list[2*r+1][2*c+1] = END_SQUARE
                else:
                    gameview_list[2*r+1][2*c+1] = PATH

        return gameview_list
    
    def generate_empty_grid(self, rows: int, cols: int):
        self.grid = [
            [
                Cell(Parent = self, id = {"row": row, "col": col}) for col in range(cols)
            ] for row in range(rows)
            ]
    
    def generate_maze(self):
        for row in self.grid:
            for cell in row:
                cell.Visited = False
        
        STARTING_CELL = self.get_cell_by_ID(STARTING_SQUARE_ID)
        STARTING_CELL.Visited = True

        Stack = stack.Stack()
        Stack.push(STARTING_CELL)

        while not Stack.is_empty():
            current_cell: Cell = Stack.peek()
            adj_cells = current_cell.GetAdjacentCells()
            
            sanitised_adj_cells: list[tuple[str,Cell]] = []
            
            for i,cell in enumerate(adj_cells):
                if cell[1] != -1 and cell[1].Visited == False:
                    sanitised_adj_cells.append(adj_cells[i])
            
            if len(sanitised_adj_cells) == 0:
                Stack.pop()
                continue

            cell_to_go_to_details = random.choice(sanitised_adj_cells)
            cell_to_go_to_dir = cell_to_go_to_details[0]
            cell_to_go_to = cell_to_go_to_details[1]

            current_cell.BreakWallInDir(dirLetter_to_dirList(cell_to_go_to_dir))

            Stack.push(cell_to_go_to)

            cell_to_go_to.Visited = True

    def get_cell_by_ID(self, newID: dict):
        for row in self.grid:
            for cell in row:
                if cell.ID == newID:
                    return cell
        
        return -1

class Cell():
    def __init__(self, Parent, id):
        self.Parent = Parent
        self.ID = id
        self.Visited = False
        self.State = PATH
        self.Walls = {"N":1,"E":1,"S":1,"W":1}

    def MoveUp(self):
        return self.GetCellInDir(dirLetter_to_dirList("N"))
    def MoveDown(self):
        return self.GetCellInDir(dirLetter_to_dirList("S"))
    def MoveLeft(self):
        return self.GetCellInDir(dirLetter_to_dirList("W"))
    def MoveRight(self):
        return self.GetCellInDir(dirLetter_to_dirList("E"))

    def BreakWallInDir(self, dir: list):
        dirLetter = dirList_to_dirLetter(dir)
        next_square = self.GetCellInDir(dir)
        
        if next_square==-1:
            raise ValueError("Directed square is out of range!")
        
        anti_dir = [dir[0]*-1, dir[1]*-1]
        anti_dirLetter = dirList_to_dirLetter(anti_dir)

        self.Walls[dirLetter] = 0
        next_square.Walls[anti_dirLetter] = 0
    
    def GetCellInDir(self, dir: list) -> "Cell":
        NewID = {"row": self.ID["row"]+dir[0], "col": self.ID["col"]+dir[1]}

        return self.Parent.get_cell_by_ID(NewID)
    
    def GetAdjacentCells(self) -> list[tuple[str,"Cell"]]:
        return [
            ("N",self.MoveUp()), 
            ("E",self.MoveRight()), 
            ("S",self.MoveDown()), 
            ("W",self.MoveLeft())
        ]

maze = Maze()
maze.generate_empty_grid(10,10)
maze.generate_maze()
maze_map = maze.output_grid()



for row in maze_map:
    print("".join(row))
