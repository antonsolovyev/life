var Life = Life || {};

Life.LifeView = function (spec) {
    var T = Backbone.View.extend(
        {
            el: "#page",
            events: {
                "click #startStopButton": function () {
                    handleStartStopButton();
                },
                "input #speedSlider": function (e) {
                    lifeEngine.timerTick = sliderToTimerTick(e.target.value);
                }
            }
        });
    var that = new T();

    var SCREEN_SIZE_RATIO = 0.95;
    var FIELD_COLOR = "white";
    var CELL_COLOR = "black";
    var CELL_GAP = 2;
    var GRID_COLOR = '#D0D0D0';
    var DEFAULT_TIMER_TICK = 50;
    var lifeEngine;
    var canvas;
    var windowWidth;
    var windowHeight;
    var cellSize;

    var handleStartStopButton = function () {
        if (lifeEngine.gameState === Life.LifeEngine.GameState.RUNNING) {
            lifeEngine.stop();
        }
        else if (lifeEngine.gameState === Life.LifeEngine.GameState.STOPPED) {
            lifeEngine.start();
        }
        $("#startStopButonSpan").text(getStartStopButtonText());
    };

    var initLifeEngine = function () {
        lifeEngine = new Life.LifeEngine({width: 60, height: 60, timerTick: 50});

        lifeEngine.board[0][2] = 1;
        lifeEngine.board[1][2] = 1;
        lifeEngine.board[2][2] = 1;
        lifeEngine.board[1][0] = 1;
        lifeEngine.board[2][1] = 1;

        lifeEngine.on("update", function (lifeEngine) {
            refresh();
        });

        lifeEngine.start();
    };

    var refresh = function () {
        if (!canvas) {
            return;
        }

        cleanCanvas();
        drawBoard();
        drawGrid();
    };

    var drawGrid = function () {
        for (var i = 0; i <= lifeEngine.width; i++) {
            canvas.getContext('2d').beginPath();
            canvas.getContext('2d').lineWidth = CELL_GAP;
            canvas.getContext('2d').strokeStyle = GRID_COLOR;
            canvas.getContext('2d').moveTo(CELL_GAP / 2 + i * cellSize, 0);
            canvas.getContext('2d').lineTo(CELL_GAP / 2 + i * cellSize, getCanvasHeight());
            canvas.getContext('2d').stroke();
        }

        for (var i = 0; i <= lifeEngine.height; i++) {
            canvas.getContext('2d').beginPath();
            canvas.getContext('2d').lineWidth = CELL_GAP;
            canvas.getContext('2d').strokeStyle = GRID_COLOR;
            canvas.getContext('2d').moveTo(0, CELL_GAP / 2 + cellSize * i);
            canvas.getContext('2d').lineTo(getCanvasWidth(), CELL_GAP / 2 + cellSize * i);
            canvas.getContext('2d').stroke();
        }
    };

    var drawBoard = function () {
        for (var i = 0; i < lifeEngine.width; i++) {
            for (var j = 0; j < lifeEngine.height; j++) {
                if (lifeEngine.board[i][j] > 0) {
                    drawCell(i, j, lifeEngine.board[i][j]);
                }
            }
        }
    };

    var round = function (value) {
        if (value > 0) {
            return Math.floor(value);
        }
        else {
            return Math.ceil(value);
        }
    };

    var getCellSize = function () {
        return round(Math.min(windowHeight * SCREEN_SIZE_RATIO / lifeEngine.height,
            windowWidth * SCREEN_SIZE_RATIO / (lifeEngine.width)));
    };

    var getCellRect = function (x, y) {
        var left = x * cellSize + CELL_GAP;
        var top = y * cellSize + CELL_GAP;
        var right = left + cellSize - CELL_GAP;
        var bottom = top + cellSize - CELL_GAP;

        return new Life.LifeView.Rect({left: left, top: top, right: right, bottom: bottom});
    };

    var getCanvasHeight = function () {
        return lifeEngine.height * cellSize + CELL_GAP;
    };

    var getCanvasWidth = function () {
        return lifeEngine.width * cellSize + CELL_GAP;
    };

    var drawRect = function (rect, color) {
        canvas.getContext('2d').fillStyle = color;
        canvas.getContext('2d').fillRect(rect.left, rect.top, rect.width(), rect.height());
    };

    var drawCell = function (x, y, value) {
        return drawRect(getCellRect(x, y), CELL_COLOR);
    };

    var initCellSize = function () {
        cellSize = getCellSize();
    };

    var cleanCanvas = function () {
        drawRect(new Life.LifeView.Rect({left: 0, top: 0, right: canvas.width, bottom: canvas.height}),
            FIELD_COLOR);
    };

    var initCanvasSize = function () {
        canvas.height = getCanvasHeight();
        canvas.width = getCanvasWidth();
    };

    var getStartStopButtonText = function () {
        if (lifeEngine.gameState === Life.LifeEngine.GameState.RUNNING) {
            return "Stop";
        }
        else if (lifeEngine.gameState === Life.LifeEngine.GameState.STOPPED) {
            return "Start";
        }
        else {
            throw {name: "Illegal state", message: "Unknown game state"};
        }
    };

    var initControls = function () {
        $("#startStopButonSpan").text(getStartStopButtonText());
        $("#speedSlider").attr({max: 100, min: 0, step: 1, value: timerTickToSlider(DEFAULT_TIMER_TICK)});
    };

    var sliderToTimerTick = function (sliderValue) {
        return sliderValue;
    };

    var timerTickToSlider = function (timerTickValue) {
        return timerTickValue;
    };

    that.render = function () {
        that.$el.html(_.getFromUrl("/template/lifeView.html"));

        canvas = $("#boardCanvas")[0];
        windowHeight = $(window).height();
        windowWidth = $(window).width();

        initCellSize();
        initCanvasSize();
        initControls();
        refresh();
    };

    initLifeEngine();

    return that;
};

Life.LifeView.Rect = function (spec) {
    var that = {};

    that.left = spec.left;
    that.top = spec.top;
    that.right = spec.right;
    that.bottom = spec.bottom;

    that.width = function () {
        return that.right - that.left;
    };

    that.height = function () {
        return that.bottom - that.top;
    };

    that.toString = function () {
        var res = "Life.LiveView.Rect {";
        res += "left: " + that.left + ", ";
        res += "top: " + that.top + ", ";
        res += "width: " + that.width() + ", ";
        res += "height: " + that.height() + "}";
        return res;
    };

    return that;
};