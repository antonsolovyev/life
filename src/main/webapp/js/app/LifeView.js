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
    
    var Direction = {
        UP: "UP",
        DOWN: "DOWN",
        RIGHT: "RIGHT",
        LEFT: "LEFT"
    }

    var PAN_FACTOR = 8;
    var SCREEN_SIZE_RATIO = 0.9;
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
                    handlePanButton(Direction.RIGHT);
                },
                "click #panLeftButton": function () {
                    handlePanButton(Direction.LEFT);
                },
                "click #panUpButton": function () {
                    handlePanButton(Direction.UP);
                },
                "click #panDownButton": function () {
                    handlePanButton(Direction.DOWN);
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

    var initialCellSize = spec.cellSize;
    var cellSize = initialCellSize;
    var initialBoardCenter = {x: 0, y: 0};
    var boardCenter = initialBoardCenter;
    var boardWidth;
    var boardHeight;
    var cellGap;

    var timer;
    var state = State.STOPPED;
    var lifeEngine;
    var canvas;

    messageBus.on("loadPattern", function (pattern) {
        reset();
        var locations = pattern.get('locations');
        for (var i = 0; i < locations.length; i++) {
            var location = locations[i];
            lifeEngine.setCell(new Life.LifeEngine.Cell({x: location.x, y: location.y, live: true, age: 0}));
        }
        update();
    });

    var handlePanButton = function (direction) {
        var shiftX = Math.floor(boardWidth / PAN_FACTOR);
        if(shiftX < 1) {
            shiftX = 1;
        }
        var shiftY = Math.floor(boardHeight / PAN_FACTOR);
        if(shiftY < 1) {
            shiftY = 1;
        }
        switch(direction) {
            case Direction.UP:
                boardCenter = {x: boardCenter.x, y: boardCenter.y + shiftY};
                break;
            case Direction.DOWN:
                boardCenter = {x: boardCenter.x, y: boardCenter.y - shiftY};
                break;
            case Direction.RIGHT:
                boardCenter = {x: boardCenter.x - shiftX, y: boardCenter.y};
                break;
            case Direction.LEFT:
                boardCenter = {x: boardCenter.x + shiftX, y: boardCenter.y};
                break;
            default:
        }
        update();
    };
    
    var handleZoomInButton = function () {
        cellSize = Math.floor(cellSize * 2);
        if(cellSize > 1) {
            $("#zoomOutButton").prop("disabled", false);
        }

        update();

        if(boardWidth <= 2 || boardHeight <= 2) {
            $("#zoomInButton").prop("disabled", true);
        }
    };

    var handleZoomOutButton = function () {
        cellSize = Math.floor(cellSize / 2);
        if(cellSize <= 1) {
            $("#zoomOutButton").prop("disabled", true);
        }

        update();

        if(boardWidth > 2 && boardHeight > 2) {
            $("#zoomInButton").prop("disabled", false);
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
        cellSize = initialCellSize;
        boardCenter = initialBoardCenter;
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

        boardWidth = getBoardWidth($(window).width() - $("#lifeViewControls").width() - $("#lifeViewNav").width(),
            $(window).height());
        boardHeight = getBoardHeight($(window).width() - $("#lifeViewControls").width() - $("#lifeViewNav").width(),
            $(window).height());
        cellGap = getCellGap(cellSize);
        canvas.height = getCanvasHeight();
        canvas.width = getCanvasWidth();

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

        for (var i = 0; i <= boardWidth; i++) {
            drawRect(new Rect({left: cellSize * i, top: 0, right: cellSize * i + cellGap,
                bottom: getCanvasHeight()}), GRID_COLOR);
        }

        for (var i = 0; i <= boardHeight; i++) {
            drawRect(new Rect({top: cellSize * i, left: 0, bottom: cellSize * i + cellGap,
                right: getCanvasWidth()}), GRID_COLOR);
        }
    };

    var drawBoard = function () {
        var cells = lifeEngine.getLiveCells();
        for(var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            drawCell(cell.x, cell.y, cell.age);
        }
    };

    var getCellGap = function (cellSize) {
        return Math.round(cellSize / GAP_RATIO);
    };

    var getBoardWidth = function (availableWidth, availableHeight) {
        var res = Math.floor((availableWidth * SCREEN_SIZE_RATIO -
            getCellGap(cellSize)) / cellSize);
        if(res < 1) {
            return 1;
        }
        return res;
    };

    var getBoardHeight = function (availableWidth, availableHeight) {
        var res = Math.floor((availableHeight * SCREEN_SIZE_RATIO -
            getCellGap(cellSize)) / cellSize);
        if(res < 1) {
            return 1;
        }
        return res;
    };

    var getBoardOffsetX = function () {
        return boardCenter.x + Math.floor(boardWidth / 2);
    };

    var getBoardOffsetY = function () {
        return boardCenter.y + Math.floor(boardHeight / 2);
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

    var getCanvasWidth = function () {
        return boardWidth * cellSize + cellGap;
    };

    var getCanvasHeight = function () {
        return boardHeight * cellSize + cellGap;
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