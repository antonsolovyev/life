var Life = Life || {};

Life.LifeEngine = function (spec) {
    var that = {};
    _.extend(that, Backbone.Events);
    var board;

    var resetBoard = function () {
        board = {};
        that.generation = 0;
    };

    var getNeighbors = function (cell) {
        var res = [];
        for(var i = -1; i < 2; i++) {
            for(var j = -1; j < 2; j++) {
                if(i === 0 && j === 0) {
                    continue;
                }
                res.push(new Life.LifeEngine.Cell({x: cell.x + i, y: cell.y + j, live: false}));
            }
        }
        return res;
    };

    var iterateBoard = function () {
        var nextBoard = {};

        // Create buffer
        for(var key in board) {
            var neighbors = getNeighbors(board[key]);
            for(var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];
                if (!board[neighbor.key()]) {
                    board[neighbor.key()] = new Life.LifeEngine.Cell({x: neighbor.x, y: neighbor.y, live: false});
                }
            }
        }

        // Calculate next board
        for(var key in board)
        {
            var cell = board[key];
            var neighbors = getNeighbors(cell);

            var liveNeighborCount = 0;
            for(var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];
                if(board[neighbor.key()] && board[neighbor.key()].live) {
                    liveNeighborCount += 1;
                }
            }

            if (cell.live) {
                if (liveNeighborCount === 2 || liveNeighborCount === 3) {
                    nextBoard[cell.key()] = new Life.LifeEngine.Cell({x: cell.x, y: cell.y, live: true,
                        age: (cell.age + 1)});
                }
            }
            else {
                if (liveNeighborCount === 3) {
                    nextBoard[cell.key()] = new Life.LifeEngine.Cell({x: cell.x, y: cell.y, live: true, age: 0});
                }
            }
        }

        board = nextBoard;

        that.generation += 1;

        //console.log("generation: " + that.generation + ", cell number: " + _.keys(board));
    };

    var postUpdate = function () {
        that.trigger("update", that);
    };

    that.reset = function () {
        resetBoard();
        postUpdate();
    };

    that.iterate = function (count) {
        if(!count) {
            count = 1;
        }

        for(var i = 0; i < count; i++) {
            iterateBoard()
        }

        postUpdate();
    };

    that.setCell = function (cell) {
        board[cell.key()] = cell;
        postUpdate();
    };

    that.getCell = function (x, y) {
        var res = board[new Life.LifeEngine.Cell({x: x, y: y}).key()];
        if(res) {
            return res;
        }
        return new Life.LifeEngine.Cell({x: x, y: y, live: false});
    };

    that.getLiveCells = function () {
        var res = [];
        for(var key in board) {
            var cell = board[key];
            if(cell.live) {
                res.push(cell);
            }
        }
        return res;
    };

    resetBoard();

    return that;
};

Life.LifeEngine.Cell = function (spec) {
    var that = {};

    that.x = spec.x;
    that.y = spec.y;
    that.live = spec.live;
    that.age = spec.age;

    that.key = function () {
        return that.x + ":" + that.y;
    };

    return that;
};