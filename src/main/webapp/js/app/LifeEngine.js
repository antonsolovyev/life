var Life = Life || {};

Life.LifeEngine = function (spec) {
    var TIMER_TICK = 1000;

    var that = {};
    var timer;
    var listeners = [];

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
        timer = setInterval(handleTimerEvent, TIMER_TICK);
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
                        if(k === 0 && l === 0) {
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
        if (that.gameState !== Life.GameState.RUNNING) {
            return;
        }

        iterateBoard();
        postUpdate();
    };

    that.start = function () {
        if (that.gameState === Life.GameState.STOPPED) {
            that.gameState = Life.GameState.RUNNING;
            startTimer();
        }
    };

    that.stop = function () {
        if (that.gameState !== Life.GameState.RUNNING) {
            stopTimer();
            that.gameState = Life.GameState.STOPPED;
        }
    };

    that.reset = function () {
        that.stop();
        that.board = makeEmptyBoard();
        postUpdate();
    };

    that.addListener = function (listener) {
        listeners.push(listener);
    };

    that.removeListener = function (listener) {
        var newListeners = [];
        for (var i in that.listeners) {
            if (that.listeners[i] !== listener) {
                newListeners.push(that.listeners[i]);
            }
        }
        that.listeners = newListeners;
    };

    var postUpdate = function () {
        for (var i in listeners) {
            listeners[i](that);
        }
    };

    that.toString = function () {
        var res = "LifeEngine {";
        res += "width: " + that.width + ", ";
        res += "height: " + that.height + ", ";
        res += "gameState: " + that.gameState + ", ";
        res += "generation: " + that.generation + ", ";
        res += "board:\n";
        for(var j = 0; j < that.height; j++)
        {
            res += "    ";
            for(var i = 0; i < that.width; i++)
            {
                if(that.board[i][j] > 0) {
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
    that.board = makeEmptyBoard();
    that.gameState = Life.GameState.STOPPED;
    that.generation = 0;

    return that;
};

Life.GameState = {
    STOPPED: "STOPPED",
    RUNNING: "RUNNING"
};