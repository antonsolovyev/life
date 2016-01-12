var Life = Life || {};

Life.LifeView = function (spec) {
    var T = Backbone.View.extend(
        {
            el: spec.el,
            events: {
                "click #startStopButton": function () {
                    handleStartStopButton();
                },
                "click #resetButton": function () {
                    lifeEngine.reset();
                },
                "click #patternsButton": function () {
                    handlePatternsButton();
                },
                "click #saveButton": function () {
                    handleSaveButton();
                },
                "input #speedSlider": function (e) {
                    handleSlider(e);
                },
                "mousedown #boardCanvas": function (e) {
                    handleBoardClick(e);
                }
            }
        });
    var that = new T();

    var messageBus = spec.messageBus;
    var boardWidth = spec.boardWidth;
    var boardHeight = spec.boardHeight;
    var timerTick = spec.timerTick;
    var SCREEN_SIZE_RATIO = 0.95;
    var FIELD_COLOR = "white";
    var CELL_COLOR = "black";
    var GAP_RATIO = 6;
    var GRID_COLOR = '#D0D0D0';
    var lifeEngine;
    var canvas;
    var cellSize;
    var cellGap;

    messageBus.on("loadPattern", function (pattern) {
        lifeEngine.reset();
        var locations = pattern.get('locations');
        for (var i = 0; i < locations.length; i++) {
            var location = locations[i];
            lifeEngine.setCell(new Life.LifeEngine.Cell({x: location.x, y: location.y, live: true, age: 0}));
        }
        update();
    });

    var handleSlider = function (e) {
        var savedGameState = lifeEngine.gameState;
        lifeEngine.stop();
        lifeEngine.timerTick = sliderToTimerTick(e.target.value);
        if(savedGameState === Life.LifeEngine.GameState.RUNNING) {
            lifeEngine.start();
        }
    };

    var handlePatternsButton = function () {
        messageBus.trigger("showPatternsView");
    };

    var handleSaveButton = function () {
        var savedGameState = lifeEngine.gameState;
        lifeEngine.stop();
        update();

        $('body').append(_.template(_.getFromUrl('/template/savePatternDialog.html')));
        $('#savePatternDialog').dialog({
            resizable: false,
            modal: true,
            close: function () {
                $('#savePatternDialog').dialog('destroy');
                $('#savePatternDialog').remove();
                if (savedGameState === Life.LifeEngine.GameState.RUNNING) {
                    lifeEngine.start();
                }
                update();
            },
            buttons: {
                Save: function () {
                    var name = $('#nameField').val();
                    if (name && name !== "") {
                        var locations = [];
                        for (var i = 0; i < boardWidth; i++) {
                            for (var j = 0; j < boardHeight; j++) {
                                if (lifeEngine.getCell(i, j).live) {
                                    locations.push({x: i, y: j});
                                }
                            }
                        }
                        var pattern = new Life.PatternsView.Pattern({name: name, locations: locations},
                            {collection: new Life.PatternsView.PatternList()});
                        pattern.save({}, {
                            error: function () {
                                alert("Error saving pattern!");
                            }
                        });
                    }
                    $('#savePatternDialog').dialog('close');
                }
            }
        });
    };

    var handleStartStopButton = function () {
        if (lifeEngine.gameState === Life.LifeEngine.GameState.RUNNING) {
            lifeEngine.stop();
        }
        else if (lifeEngine.gameState === Life.LifeEngine.GameState.STOPPED) {
            lifeEngine.start();
        }
        update();
    };

    var handleBoardClick = function (e) {
        lifeEngine.stop();
        var boardLocation = getBoardLocation(e.offsetX, e.offsetY);
        if (!lifeEngine.getCell(boardLocation.x, boardLocation.y).live) {
            lifeEngine.setCell(new Life.LifeEngine.Cell({x: boardLocation.x, y: boardLocation.y, live: true, age: 0}));
        }
        else {
            lifeEngine.setCell(new Life.LifeEngine.Cell({x: boardLocation.x, y: boardLocation.y, live: false}));
        }
        update();
    };

    var initLifeEngine = function () {
        lifeEngine = new Life.LifeEngine({timerTick: timerTick});

        lifeEngine.on("update", function (lifeEngine) {
            update();
        });
    };

    var update = function () {
        $("#speedSlider").attr({max: 100, min: 0, step: 1, value: timerTickToSlider(lifeEngine.timerTick)});
        $("#startStopButonSpan").text(getStartStopButtonText());

        canvas = $("#boardCanvas")[0];
        if (!canvas) {
            return;
        }
        cellSize = getCellSize($(window).width() - $("#lifeViewControls").width(), $(window).height());
        cellGap = getCellGap(cellSize);
        canvas.height = getCanvasHeight();
        canvas.width = getCanvasWidth();

        cleanCanvas();
        drawBoard();
        drawGrid();
    };

    var drawGrid = function () {
        for (var i = 0; i <= boardWidth; i++) {
            canvas.getContext('2d').beginPath();
            canvas.getContext('2d').lineWidth = cellGap;
            canvas.getContext('2d').strokeStyle = GRID_COLOR;
            canvas.getContext('2d').moveTo(cellGap / 2 + i * cellSize, 0);
            canvas.getContext('2d').lineTo(cellGap / 2 + i * cellSize, getCanvasHeight());
            canvas.getContext('2d').stroke();
        }

        for (var i = 0; i <= boardHeight; i++) {
            canvas.getContext('2d').beginPath();
            canvas.getContext('2d').lineWidth = cellGap;
            canvas.getContext('2d').strokeStyle = GRID_COLOR;
            canvas.getContext('2d').moveTo(0, cellGap / 2 + cellSize * i);
            canvas.getContext('2d').lineTo(getCanvasWidth(), cellGap / 2 + cellSize * i);
            canvas.getContext('2d').stroke();
        }
    };

    var drawBoard = function () {
        for (var i = 0; i < boardWidth; i++) {
            for (var j = 0; j < boardHeight; j++) {
                if (lifeEngine.getCell(i, j).live) {
                    drawCell(i, j, lifeEngine.getCell(i, j));
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

    var getCellSize = function (windowHeight, windowWidth) {
        return round(Math.min(windowHeight * SCREEN_SIZE_RATIO / boardHeight,
            windowWidth * SCREEN_SIZE_RATIO / (boardWidth)));
    };

    var getCellGap = function (cellSize) {
        return Math.floor(cellSize / GAP_RATIO);
    }

    var getCellRect = function (x, y) {
        var left = x * cellSize + cellGap;
        var top = y * cellSize + cellGap;
        var right = (x + 1) * cellSize;
        var bottom = (y + 1) * cellSize;

        return new Life.LifeView.Rect({left: left, top: top, right: right, bottom: bottom});
    };

    var getBoardLocation = function (x, y) {
        var boardX = Math.floor(x / cellSize) % boardWidth;
        var boardY = Math.floor(y / cellSize) % boardHeight;
        return {x: boardX, y: boardY}
    };

    var getCanvasHeight = function () {
        return boardHeight * cellSize + cellGap;
    };

    var getCanvasWidth = function () {
        return boardWidth * cellSize + cellGap;
    };

    var drawRect = function (rect, color) {
        canvas.getContext('2d').fillStyle = color;
        canvas.getContext('2d').fillRect(rect.left, rect.top, rect.width(), rect.height());
    };

    var drawCell = function (x, y, cell) {
        return drawRect(getCellRect(x, y), CELL_COLOR);
    };

    var cleanCanvas = function () {
        drawRect(new Life.LifeView.Rect({left: 0, top: 0, right: canvas.width, bottom: canvas.height}),
            FIELD_COLOR);
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

    var sliderToTimerTick = function (sliderValue) {
        return 1000 - sliderValue * 10;
    };

    var timerTickToSlider = function (timerTickValue) {
        return (1000 - timerTickValue) / 10;
    };

    that.render = function () {
        that.$el.html(_.getFromUrl("/template/lifeView.html"));

        $(window).on("resize", function () {
            update();
        });

        update();
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

    return that;
};