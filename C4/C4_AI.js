class Connect4AI {
    constructor() {
        this.ROWS = 6;
        this.COLS = 7;
        this.EMPTY = ".";
    }

    choose_move(board, aiPiece, playerPiece, difficulty) {
        let valid_cols = this.get_valid_columns(board);

        if (valid_cols.length == 0) {
            return -1;
        }

        switch (difficulty) {
            case "easy":
                return this.choose_random_move(valid_cols);
            case "medium":
                return this.choose_tactical_move(board, aiPiece, playerPiece);
            case "hard":
                return this.choose_minimax_move(board, aiPiece, playerPiece, 4);
            case "master":
                return this.choose_minimax_move(board, aiPiece, playerPiece, 6);
            default:
                return this.choose_tactical_move(board, aiPiece, playerPiece);
        }
    }

    choose_random_move(valid_cols) {
        return valid_cols[Math.floor(Math.random() * valid_cols.length)];
    }

    choose_tactical_move(board, aiPiece, playerPiece) {
        let valid_cols = this.get_valid_columns(board);

        for (let col of valid_cols) {
            let next_board = this.copy_board(board);
            this.drop_piece(next_board, col, aiPiece);
            if (this.has_winner(next_board, aiPiece)) {
                return col;
            }
        }

        for (let col of valid_cols) {
            let next_board = this.copy_board(board);
            this.drop_piece(next_board, col, playerPiece);
            if (this.has_winner(next_board, playerPiece)) {
                return col;
            }
        }

        return this.choose_weighted_move(valid_cols);
    }

    choose_weighted_move(valid_cols) {
        let preferred_cols = [3, 2, 4, 1, 5, 0, 6];

        for (let col of preferred_cols) {
            if (valid_cols.includes(col)) {
                return col;
            }
        }

        return this.choose_random_move(valid_cols);
    }

    choose_minimax_move(board, aiPiece, playerPiece, depth) {
        let result = this.minimax(board, depth, -Infinity, Infinity, true, aiPiece, playerPiece);

        if (result.col == -1) {
            return this.choose_tactical_move(board, aiPiece, playerPiece);
        }

        return result.col;
    }

    minimax(board, depth, alpha, beta, maximising, aiPiece, playerPiece) {
        let valid_cols = this.get_valid_columns(board);
        let terminal = this.is_terminal_node(board, aiPiece, playerPiece);

        if (depth == 0 || terminal) {
            if (terminal) {
                if (this.has_winner(board, aiPiece)) {
                    return { col: -1, score: 100000000 };
                }
                if (this.has_winner(board, playerPiece)) {
                    return { col: -1, score: -100000000 };
                }
                return { col: -1, score: 0 };
            }

            return { col: -1, score: this.score_position(board, aiPiece, playerPiece) };
        }

        if (maximising) {
            let value = -Infinity;
            let best_col = this.choose_weighted_move(valid_cols);

            for (let col of this.order_columns(valid_cols)) {
                let next_board = this.copy_board(board);
                this.drop_piece(next_board, col, aiPiece);
                let new_score = this.minimax(next_board, depth - 1, alpha, beta, false, aiPiece, playerPiece).score;

                if (new_score > value) {
                    value = new_score;
                    best_col = col;
                }

                alpha = Math.max(alpha, value);
                if (alpha >= beta) {
                    break;
                }
            }

            return { col: best_col, score: value };
        }

        let value = Infinity;
        let best_col = this.choose_weighted_move(valid_cols);

        for (let col of this.order_columns(valid_cols)) {
            let next_board = this.copy_board(board);
            this.drop_piece(next_board, col, playerPiece);
            let new_score = this.minimax(next_board, depth - 1, alpha, beta, true, aiPiece, playerPiece).score;

            if (new_score < value) {
                value = new_score;
                best_col = col;
            }

            beta = Math.min(beta, value);
            if (alpha >= beta) {
                break;
            }
        }

        return { col: best_col, score: value };
    }

    score_position(board, aiPiece, playerPiece) {
        let score = 0;
        let center_count = 0;

        for (let row = 0; row < this.ROWS; row++) {
            if (board[row][3] == aiPiece) {
                center_count++;
            }
        }

        score += center_count * 6;
        score += this.score_windows(board, aiPiece, playerPiece);

        return score;
    }

    score_windows(board, aiPiece, playerPiece) {
        let score = 0;

        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS - 3; col++) {
                score += this.score_window([
                    board[row][col],
                    board[row][col + 1],
                    board[row][col + 2],
                    board[row][col + 3]
                ], aiPiece, playerPiece);
            }
        }

        for (let col = 0; col < this.COLS; col++) {
            for (let row = 0; row < this.ROWS - 3; row++) {
                score += this.score_window([
                    board[row][col],
                    board[row + 1][col],
                    board[row + 2][col],
                    board[row + 3][col]
                ], aiPiece, playerPiece);
            }
        }

        for (let row = 0; row < this.ROWS - 3; row++) {
            for (let col = 0; col < this.COLS - 3; col++) {
                score += this.score_window([
                    board[row][col],
                    board[row + 1][col + 1],
                    board[row + 2][col + 2],
                    board[row + 3][col + 3]
                ], aiPiece, playerPiece);
            }
        }

        for (let row = 3; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS - 3; col++) {
                score += this.score_window([
                    board[row][col],
                    board[row - 1][col + 1],
                    board[row - 2][col + 2],
                    board[row - 3][col + 3]
                ], aiPiece, playerPiece);
            }
        }

        return score;
    }

    score_window(window, aiPiece, playerPiece) {
        let ai_count = window.filter(piece => piece == aiPiece).length;
        let player_count = window.filter(piece => piece == playerPiece).length;
        let empty_count = window.filter(piece => piece == this.EMPTY).length;

        if (ai_count == 4) {
            return 100000;
        }
        if (ai_count == 3 && empty_count == 1) {
            return 120;
        }
        if (ai_count == 2 && empty_count == 2) {
            return 15;
        }
        if (player_count == 3 && empty_count == 1) {
            return -160;
        }
        if (player_count == 2 && empty_count == 2) {
            return -18;
        }
        if (player_count == 4) {
            return -100000;
        }

        return 0;
    }

    get_valid_columns(board) {
        let valid_cols = [];

        for (let col = 0; col < this.COLS; col++) {
            if (board[0][col] == this.EMPTY) {
                valid_cols.push(col);
            }
        }

        return valid_cols;
    }

    order_columns(valid_cols) {
        let preferred_cols = [3, 2, 4, 1, 5, 0, 6];
        return preferred_cols.filter(col => valid_cols.includes(col));
    }

    drop_piece(board, col, piece) {
        for (let row = this.ROWS - 1; row >= 0; row--) {
            if (board[row][col] == this.EMPTY) {
                board[row][col] = piece;
                return row;
            }
        }

        return -1;
    }

    has_winner(board, piece) {
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS - 3; col++) {
                if (
                    board[row][col] == piece &&
                    board[row][col + 1] == piece &&
                    board[row][col + 2] == piece &&
                    board[row][col + 3] == piece
                ) {
                    return true;
                }
            }
        }

        for (let col = 0; col < this.COLS; col++) {
            for (let row = 0; row < this.ROWS - 3; row++) {
                if (
                    board[row][col] == piece &&
                    board[row + 1][col] == piece &&
                    board[row + 2][col] == piece &&
                    board[row + 3][col] == piece
                ) {
                    return true;
                }
            }
        }

        for (let row = 0; row < this.ROWS - 3; row++) {
            for (let col = 0; col < this.COLS - 3; col++) {
                if (
                    board[row][col] == piece &&
                    board[row + 1][col + 1] == piece &&
                    board[row + 2][col + 2] == piece &&
                    board[row + 3][col + 3] == piece
                ) {
                    return true;
                }
            }
        }

        for (let row = 3; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS - 3; col++) {
                if (
                    board[row][col] == piece &&
                    board[row - 1][col + 1] == piece &&
                    board[row - 2][col + 2] == piece &&
                    board[row - 3][col + 3] == piece
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    is_terminal_node(board, aiPiece, playerPiece) {
        return (
            this.has_winner(board, aiPiece) ||
            this.has_winner(board, playerPiece) ||
            this.get_valid_columns(board).length == 0
        );
    }

    copy_board(board) {
        return board.map(row => row.slice());
    }

    replay_human_game(playerMoves, difficulty) {
        let board = [];
        let humanPiece = "R";
        let aiPiece = "Y";
        let agreements = 0;

        let analysis = {
            OptimalMoves: [],
            MoveAgreementRate: 0,
            CriticalMistakes: []
        };

        for (let row = 0; row < this.ROWS; row++) {
            board.push(new Array(this.COLS).fill(this.EMPTY));
        }

        for (let i = 0; i < playerMoves.length; i++) {
            let human_col = playerMoves[i];
            let optimal_col = this.choose_move(board, humanPiece, aiPiece, difficulty);

            analysis.OptimalMoves.push(optimal_col);

            if (optimal_col == human_col) {
                agreements++;
            }

            if (this.move_is_critical(board, optimal_col, humanPiece, aiPiece) &&
                !this.move_is_critical(board, human_col, humanPiece, aiPiece)) {
                analysis.CriticalMistakes.push(i);
            }

            this.drop_piece(board, human_col, humanPiece);
        }

        if (playerMoves.length > 0) {
            analysis.MoveAgreementRate = Math.round((agreements / playerMoves.length) * 100);
        }

        return analysis;
    }

    move_is_critical(board, col, humanPiece, aiPiece) {
        let win_board = this.copy_board(board);
        this.drop_piece(win_board, col, humanPiece);
        if (this.has_winner(win_board, humanPiece)) {
            return true;
        }

        let block_board = this.copy_board(board);
        this.drop_piece(block_board, col, aiPiece);
        return this.has_winner(block_board, aiPiece);
    }
}
