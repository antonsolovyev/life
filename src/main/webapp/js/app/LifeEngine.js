var Life = Life || {};

Life.LifeEngine = function (spec) {
    var that = {};
    _.extend(that, Backbone.Events);
    var timeout;

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

    var modulo = function (spec) {
        var n = spec.n;
        var mod = spec.mod;

        var res = n % mod;
        if (res < 0) {
            return res + mod;
        }
        return res;
    };

    var startTimer = function () {
        timeout = setTimeout(function () {
            handleTimerEvent();
            clearTimeout(timeout);
            timeout = setTimeout(startTimer, that.timerTick);
        }, that.timerTick);
    };

    var stopTimer = function () {
        clearTimeout(timeout);
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
                        var x = modulo({n: i + k, mod: that.width});
                        var y = modulo({n: j + l, mod: that.height});
                        if (that.board[x][y] > 0) {
                            liveNeighborCount += 1;
                        }
                    }
                }

                if (that.board[i][j] > 0) {
                    if (liveNeighborCount < 2 || liveNeighborCount > 3) {
                        nextBoard[i][j] = 0;
                    }
                    else {
                        nextBoard[i][j] = that.board[i][j] + 1;
                    }
                }
                else {
                    if (liveNeighborCount === 3) {
                        nextBoard[i][j] = 1;
                    }
                }
            }
        }

        that.board = nextBoard;

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
        that.board = makeEmptyBoard();
        postUpdate();
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
                if (that.board[i][j] > 0) {
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
    that.board = makeEmptyBoard();

    return that;
};

Life.LifeEngine.GameState = {
    STOPPED: "STOPPED",
    RUNNING: "RUNNING"
};

Life.LifeEngine.Cell = function (spec) {
    var that = {};
    that.x = spec.x;
    that.y = spec.y;
    that.age = spec.age;

    that.toString = function () {
        var res = "Life.LifeEngine.Cell {";
        res += "x: " + that.x + ", ";
        res += "y: " + that.y + ", ";
        res += "age: " + that.age + "}";
        return res;
    };

    that.hashCode = function () {
        return (x * 31 + y).toString();
    };

    return that;
};