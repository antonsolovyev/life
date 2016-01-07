var Life = Life || {};

Life.LifeEngine = function (spec) {
    var that = {};
    _.extend(that, Backbone.Events);
    var timer;
    var board;

    var makeEmptyBoard = function () {
        var res = [];
        for (var i = 0; i < that.width; i++) {
            res[i] = [];
            for (var j = 0; j < that.height; j++) {
                res[i][j] = 0;
            }
        }

        return res;
    };

    var modulo = function (n, mod) {
        return n >= 0 ? n % mod : mod + n % mod;
    };

    var startTimer = function () {
        timer = setInterval(handleTimerEvent, that.timerTick);
    };

    var stopTimer = function () {
        clearInterval(timer);
    };

    var iterateBoard = function () {
        var nextBoard = makeEmptyBoard();

        for (var i = 0; i < that.width; i++) {
            for (var j = 0; j < that.height; j++) {
                var liveNeighborCount = 0;
                for (var k = -1; k < 2; k++) {
                    for (var l = -1; l < 2; l++) {
                        if (k === 0 && l === 0) {
                            continue;
                        }
                        var x = modulo(i + k, that.width);
                        var y = modulo(j + l, that.height);
                        if (board[x][y] > 0) {
                            liveNeighborCount += 1;
                        }
                    }
                }

                if (board[i][j] > 0) {
                    if (liveNeighborCount < 2 || liveNeighborCount > 3) {
                        nextBoard[i][j] = 0;
                    }
                    else {
                        nextBoard[i][j] = board[i][j] + 1;
                    }
                }
                else {
                    if (liveNeighborCount === 3) {
                        nextBoard[i][j] = 1;
                    }
                }
            }
        }

        board = nextBoard;

        that.generation += 1;
    };

    var handleTimerEvent = function () {
        if (that.gameState !== Life.LifeEngine.GameState.RUNNING) {
            return;
        }

        iterateBoard();
        postUpdate();
    };

    var postUpdate = function () {
        that.trigger("update", that);
    };

    that.start = function () {
        if (that.gameState === Life.LifeEngine.GameState.STOPPED) {
            that.gameState = Life.LifeEngine.GameState.RUNNING;
            startTimer();
            postUpdate();
        }
    };

    that.stop = function () {
        if (that.gameState === Life.LifeEngine.GameState.RUNNING) {
            stopTimer();
            that.gameState = Life.LifeEngine.GameState.STOPPED;
            postUpdate();
        }
    };

    that.reset = function () {
        that.stop();
        board = makeEmptyBoard();
        postUpdate();
    };

    that.setCell = function (x, y, value) {
        board[modulo(x, that.width)][modulo(y, that.width)] = value;
    };

    that.getCell = function (x, y) {
        return board[modulo(x, that.width)][modulo(y, that.width)];
    };

    that.toString = function () {
        var res = "LifeEngine {";
        res += "width: " + that.width + ", ";
        res += "height: " + that.height + ", ";
        res += "gameState: " + that.gameState + ", ";
        res += "generation: " + that.generation + ", ";
        res += "board:\n";
        for (var j = 0; j < that.height; j++) {
            res += "    ";
            for (var i = 0; i < that.width; i++) {
                if (board[i][j] > 0) {
                    res += "x ";
                }
                else {
                    res += "o ";
                }
            }
            res += "\n";
        }
        res += "}";
        return res;
    };

    that.width = spec.width;
    that.height = spec.height;
    that.timerTick = spec.timerTick;
    that.gameState = Life.LifeEngine.GameState.STOPPED;
    that.generation = 0;

    board = makeEmptyBoard();

    return that;
};

Life.LifeEngine.GameState = {
    STOPPED: "STOPPED",
    RUNNING: "RUNNING"
};