var Life = Life || {};

$(document).ready(function () {
    new Life.Main().main();
});

Life.Main = function () {
    var that = {};

    that.main = function () {
        var lifeEngine = new Life.LifeEngine({width: 10, height: 10});

        lifeEngine.board[4][4] = 1;
        lifeEngine.board[4][5] = 1;
        lifeEngine.board[4][6] = 1;

        lifeEngine.addListener(function (lifeEngine) {
            console.log("=> Update received, lifeEngine: " + lifeEngine);
        });

        lifeEngine.start();
    };

    return that;
};