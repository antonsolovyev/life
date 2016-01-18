var Life = Life || {};

Life.LifeView = function (spec) {
    var Rect = function (spec) {
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

    var State = {
        STOPPED: "STOPPED",
        RUNNING: "RUNNING"
    };

    var PAN_FACTOR = 8;
    var SCREEN_SIZE_RATIO = 0.90;
    var FIELD_COLOR = "white";
    var CELL_COLOR = "black";
    var GAP_RATIO = 4;
    var GRID_COLOR = '#D0D0D0';

    var T = Backbone.View.extend(
        {
            el: spec.el,
            events: {
                "click #startStopButton": function () {
                    handleStartStopButton();
                },
                "click #resetButton": function () {
                    boardSize = initialBoardSize;
                    boardCenter = initialBoardCenter;
                    reset();
                },
                "click #patternsButton": function () {
                    handlePatternsButton();
                },
                "click #saveButton": function () {
                    handleSaveButton();
                },
                "click #zoomInButton": function () {
                    handleZoomInButton();
                },
                "click #zoomOutButton": function () {
                    handleZoomOutButton();
                },
                "click #panRightButton": function () {
                    boardCenter = {x: boardCenter.x - Math.floor(boardSize / PAN_FACTOR), y: boardCenter.y};
                    update();
                },
                "click #panLeftButton": function () {
                    boardCenter = {x: boardCenter.x + Math.floor(boardSize / PAN_FACTOR), y: boardCenter.y};
                    update();
                },
                "click #panUpButton": function () {
                    boardCenter = {x: boardCenter.x, y: boardCenter.y + Math.floor(boardSize / PAN_FACTOR)};
                    update();
                },
                "click #panDownButton": function () {
                    boardCenter = {x: boardCenter.x, y: boardCenter.y - Math.floor(boardSize / PAN_FACTOR)};
                    update();
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
    var timerTick = spec.timerTick;

    var initialBoardSize = Math.pow(2, spec.boardSizeLog2);
    var boardSize = initialBoardSize;
    var initialBoardCenter = {x: 0, y: 0};
    var boardCenter = initialBoardCenter;

    var timer;
    var state = State.STOPPED;
    var lifeEngine;
    var canvas;
    var cellSize;
    var cellGap;

    messageBus.on("loadPattern", function (pattern) {
        reset();
        var locations = pattern.get('locations');
        for (var i = 0; i < locations.length; i++) {
            var location = locations[i];
            lifeEngine.setCell(new Life.LifeEngine.Cell({x: location.x, y: location.y, live: true, age: 0}));
        }
        update();
    });

    var handleZoomInButton = function () {
        boardSize /= 2;

        if(boardSize <= 2) {
            $("#zoomInButton").prop("disabled", true);
        }

        update();

        if(cellSize > 1) {
            $("#zoomOutButton").prop("disabled", false);
        }
    };

    var handleZoomOutButton = function () {
        boardSize *= 2;

        if(boardSize > 2) {
            $("#zoomInButton").prop("disabled", false);
        }

        update();

        if(cellSize <= 1) {
            $("#zoomOutButton").prop("disabled", true);
        }
    };

    var handleSlider = function (e) {
        var savedState = state;
        stop();
        timerTick = sliderToTimerTick(e.target.value);
        if(savedState === State.RUNNING) {
            start();
        }
    };

    var handlePatternsButton = function () {
        messageBus.trigger("showPatternsView");
    };

    var handleSaveButton = function () {
        var savedState = state;
        stop();

        $('body').append(_.template($("#savePatternDialogHtml").html()));
        $('#savePatternDialog').dialog({
            resizable: false,
            modal: true,
            close: function () {
                $('#savePatternDialog').dialog('destroy');
                $('#savePatternDialog').remove();
                if (savedState === State.RUNNING) {
                    start();
                }
            },
            buttons: {
                Save: function () {
                    var name = $('#nameField').val();
                    if (name && name !== "") {
                        var locations = [];
                        for (var i = 0; i < boardSize; i++) {
                            for (var j = 0; j < boardSize; j++) {
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
        if (state === State.RUNNING) {
            stop();
        }
        else if (state === State.STOPPED) {
            start();
        }
    };

    var handleBoardClick = function (e) {
        stop();
        var boardLocation = getBoardLocation(e.offsetX, e.offsetY);
        if(!boardLocation) {
            return;
        }
        if (!lifeEngine.getCell(boardLocation.x, boardLocation.y).live) {
            lifeEngine.setCell(new Life.LifeEngine.Cell({x: boardLocation.x, y: boardLocation.y, live: true, age: 0}));
        }
        else {
            lifeEngine.setCell(new Life.LifeEngine.Cell({x: boardLocation.x, y: boardLocation.y, live: false}));
        }
        update();
    };

    var startTimer = function () {
        timer = setInterval(handleTimerEvent, timerTick);
    };

    var stopTimer = function () {
        clearInterval(timer);
    };

    var handleTimerEvent = function () {
        if (state !== State.RUNNING) {
            return;
        }
        lifeEngine.iterate();
        update();
    };

    var start = function () {
        if (state === State.STOPPED) {
            state = State.RUNNING;
            update();
            startTimer();
        }
    };

    var stop = function () {
        if (state === State.RUNNING) {
            stopTimer();
            state = State.STOPPED;
            update();
        }
    };

    var reset = function () {
        stop();
        lifeEngine.reset()
        update();
    };

    var update = function () {
        $("#speedSlider").attr({max: 100, min: 0, step: 1, value: timerTickToSlider(timerTick)});
        $("#startStopButonSpan").text(getStartStopButtonText());
        $("#generationSpan").text("Generation: " + lifeEngine.generation);

        canvas = $("#boardCanvas")[0];
        if (!canvas) {
            return;
        }

        cellSize = getCellSize($(window).width() - $("#lifeViewControls").width(), $(window).height());
        cellGap = getCellGap(cellSize);
        canvas.height = getCanvasSize();
        canvas.width = getCanvasSize();

        cleanCanvas();
        drawGrid();
        drawBoard();
    };

    var drawGrid = function () {
        if(cellGap === 0) {
            drawRect(new Rect({left: 0, top: 0, right: canvas.width, bottom: canvas.height}),
                GRID_COLOR);
            return;
        }

        for (var i = 0; i <= boardSize; i++) {
            drawRect(new Rect({left: cellSize * i, top: 0, right: cellSize * i + cellGap,
                bottom: getCanvasSize()}), GRID_COLOR);
        }

        for (var i = 0; i <= boardSize; i++) {
            drawRect(new Rect({top: cellSize * i, left: 0, bottom: cellSize * i + cellGap,
                right: getCanvasSize()}), GRID_COLOR);
        }
    };

    var drawBoard = function () {
        var cells = lifeEngine.getLiveCells();
        for(var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            drawCell(cell.x, cell.y, cell.age);
        }
    };

    var getCellSize = function (availableWidth, availableHeight) {
        var res = Math.floor(Math.min(availableHeight, availableWidth) * SCREEN_SIZE_RATIO *
            GAP_RATIO / (GAP_RATIO * boardSize + 1));
        if(res < 1) {
            return 1;
        }
        return res;
    };

    var getCellGap = function (cellSize) {
        return Math.round(cellSize / GAP_RATIO);
    };

    var getBoardOffsetX = function () {
        return boardCenter.x + boardSize / 2;
    };

    var getBoardOffsetY = function () {
        return boardCenter.y + boardSize / 2;
    };

    var getCellRect = function (x, y) {
        x = x + getBoardOffsetX();
        y = y + getBoardOffsetY();
        var left = x * cellSize + cellGap;
        var top = y * cellSize + cellGap;
        var right = (x + 1) * cellSize;
        var bottom = (y + 1) * cellSize;
        return new Rect({left: left, top: top, right: right, bottom: bottom});
    };

    var getBoardLocation = function (x, y) {
        if((x % cellSize) < cellGap || (y % cellSize) < cellGap) {
            return null;
        }

        var boardX = Math.floor(x / cellSize) - getBoardOffsetX();
        var boardY = Math.floor(y / cellSize) - getBoardOffsetY();
        return {x: boardX, y: boardY}
    };

    var getCanvasSize = function () {
        return boardSize * cellSize + cellGap;
    };

    var drawRect = function (rect, color) {
        canvas.getContext('2d').fillStyle = color;
        canvas.getContext('2d').fillRect(rect.left, rect.top, rect.width(), rect.height());
    };

    var drawCell = function (x, y, age) {
        return drawRect(getCellRect(x, y), CELL_COLOR);
    };

    var cleanCanvas = function () {
        drawRect(new Rect({left: 0, top: 0, right: canvas.width, bottom: canvas.height}),
            FIELD_COLOR);
    };

    var getStartStopButtonText = function () {
        if (state === State.RUNNING) {
            return "Stop";
        } else if (state === State.STOPPED) {
            return "Start";
        } else {
            return "undefined";
        }
    };

    var sliderToTimerTick = function (sliderValue) {
        return 1000 - sliderValue * 10;
    };

    var timerTickToSlider = function (timerTickValue) {
        return (1000 - timerTickValue) / 10;
    };

    that.render = function () {
        that.$el.html($("#lifeViewHtml").html());

        $(window).on("resize", function () {
            update();
        });

        update();
    };

    lifeEngine = new Life.LifeEngine();
    update();

    return that;
};