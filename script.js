MESSAGES = {
  TIE: "НИЧЬЯ",
  WIN: "ПОБЕДИЛ",
  START: "НАЧНЕМ ЖЕ"
}

class Game {
  static gameContainer;
  static gameActive;
  static gameField;
  static gameStatus;
  static canPlayerMakeMove;

  static playerSymbol;
  static computerSymbol;

  static render(playerSymbol = "X") {
    this._createField();
    this._addHandlers();
    document.body.prepend(this.gameField);
    this._gameInit(playerSymbol);
    this._endGame(MESSAGES.START);
  }

  static _gameInit(playerSymbol = "X") {
    try {
      this.playerSymbol = playerSymbol;
      this.computerSymbol = this.playerSymbol === "X" ? "O" : "X";
      this.gameActive = true;
      this.canPlayerMakeMove = true;
      this.gameStatus = ["", "", "", "", "", "", "", "", ""];
      this._validate();
      this._makeFirstMove();
    } catch (error) {
      console.error(error);
    }
  }

  static _validate() {
    const validPlayers = ["X", "O"];
    if (!validPlayers.includes(this.playerSymbol))
      throw new Error("Invalid Player (must be X or O)");
  }

  static _createField() {
    this.gameField = document.createElement("div");
    this.gameField.classList.add("game_field");
    this.gameField.classList.add("glass_effect");
    this.gameField.id = "game_field";

    for (let i = 0; i < 3; i++) {
      let tr = document.createElement("div");
      tr.classList.add("row");
      tr.id = `row-${i}`;
      for (let j = 0; j < 3; j++) {
        let td = document.createElement("div");
        td.classList.add("cell");
        td.id = `cell-${i * 3 + j}`;
        tr.append(td);
      }
      this.gameField.append(tr);
    }
  }

  static _makeFirstMove() {
    if (this.playerSymbol === "X") return;
    this.canPlayerMakeMove = false;
    setTimeout(() => this._computerMove.apply(this), 500);
  }

  static _checkWin() {
    const winCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < winCombos.length; i++) {
      const [a, b, c] = winCombos[i];
      if (
        this.gameStatus[a] !== "" &&
        this.gameStatus[a] === this.gameStatus[b] &&
        this.gameStatus[b] === this.gameStatus[c]
      ) {
        this.gameField.querySelector(`#cell-${a}`).classList.add("winner");
        this.gameField.querySelector(`#cell-${b}`).classList.add("winner");
        this.gameField.querySelector(`#cell-${c}`).classList.add("winner");
        return this._endGame(MESSAGES.WIN + ` ${this.gameStatus[a]}`);
      }
    }
  }
  static _endGame(message) {
    this.gameActive = false;
    console.log(message);
    const gameOver = document.createElement("div");
    gameOver.classList.add("game_over");
    gameOver.classList.add("glass_effect");

    const gameOverText = document.createElement("div");
    gameOverText.classList.add("game_over_text");
    gameOverText.classList.add("glass_effect");
    
    gameOverText.textContent = message;

    const gameOverButtons = document.createElement("div");
    gameOverButtons.classList.add("game_over_buttons");

    const gameOverButtonX = document.createElement("button");
    gameOverButtonX.classList.add("game_over_button");
    gameOverButtonX.classList.add("glass_effect");
    gameOverButtonX.id = "play-x";
    gameOverButtonX.textContent = "Играть за X";

    const gameOverButtonO = document.createElement("button");
    gameOverButtonO.classList.add("game_over_button");
    gameOverButtonO.classList.add("glass_effect");
    gameOverButtonO.id = "play-o";
    gameOverButtonO.textContent = "Играть за O";

    gameOverButtons.append(gameOverButtonX);
    gameOverButtons.append(gameOverButtonO);
    gameOver.append(gameOverText);
    gameOver.append(gameOverButtons);

    this.gameField.append(gameOver);
    setTimeout(() => gameOver.classList.add("game_over_active"), 0);
    return true;
  }

  static _checkTie() {
    if (this.gameStatus.filter((item) => item === "").length !== 0) return;
    return this._endGame(MESSAGES.TIE);
  }

  static _computerMove() {
    if (!this.gameActive) return;

    const availableCellIndexes = [];
    for (let i = 0; i < this.gameStatus.length; i++) {
      if (this.gameStatus[i] === "") {
        availableCellIndexes.push(i);
      }
    }

    const randomAvailableCellIndex =
      availableCellIndexes[
        Math.floor(Math.random() * availableCellIndexes.length)
      ];

    this.gameStatus[randomAvailableCellIndex] = this.computerSymbol;
    this.gameField.querySelector(
      `#cell-${randomAvailableCellIndex}`
    ).textContent = this.computerSymbol;
    this.gameField
      .querySelector(`#cell-${randomAvailableCellIndex}`)
      .classList.add("computer_cell");

    this.canPlayerMakeMove = true;
    if (this._checkWin()) return;
    if (this._checkTie()) return;
  }

  static _handleCellClick(cell) {
    const cellIndex = parseInt(cell.id.replace("cell-", ""));
    if (
      this.gameStatus[cellIndex] !== "" ||
      !this.canPlayerMakeMove ||
      !this.gameActive
    )
      return;

    this.gameStatus[cellIndex] = this.playerSymbol;
    cell.textContent = this.playerSymbol;
    cell.classList.add(`player_cell`);

    if (this._checkWin()) return;
    if (this._checkTie()) return;

    this.canPlayerMakeMove = false;
    setTimeout(() => this._computerMove.apply(this), 500);
  }

  static _handleRestartClick(player) {
    this._gameInit(player);
  
    const gameOver = this.gameField.querySelector(".game_over");
    gameOver.classList.remove("game_over_active");
    setTimeout(() => {
      gameOver.remove();
    }, 300);

    this.gameField.querySelectorAll(".cell").forEach((cell) => {
      cell.textContent = "";
      cell.classList.add("cell_playable");
      cell.classList.remove("computer_cell");
      cell.classList.remove("player_cell");
      cell.classList.remove("winner");
    });
  }
  static _addHandlers() {
    this.gameField.addEventListener("click", (event) => {
      const cell = event.target.closest(".cell");
      const restartButton = event.target.closest(".game_over_button");
      if (cell) this._handleCellClick(cell);
      if (restartButton.id == "play-x") this._handleRestartClick("X");
      if (restartButton.id == "play-o") this._handleRestartClick("O");
    });
  }
}

Game.render();