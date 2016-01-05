var Life = Life || {};

$(document).ready(function () {
    new Life.Main().main();
});

Life.Main = function () {
    var that = {};
    var messageBus;
    var router;
    var lifeView;
    var patternsView;

    var amendUnderscore = function () {
        _.mixin(
            {
                getFromUrl: function (url) {
                    var res = "";
                    this.cache = this.cache || {};

                    if (this.cache[url]) {
                        res = this.cache[url];
                    }
                    else {
                        $.ajax(
                            {
                                url: url,
                                method: "GET",
                                async: false,
                                success: function (data) {
                                    res = data;
                                },
                                error: function () {
                                    alert('Error retrieving data from a URL!');
                                }
                            });

                        this.cache[url] = res;
                    }
                    return res;
                }
            });
    }

    that.main = function () {
        amendUnderscore();

        var initParams;
        $.ajax({
            url: "/rest/init",
            method: "GET",
            async: false,
            success: function (data) {
                initParams = data;
            }
        });
        if (!initParams) {
            alert('Error getting init params!');
            return;
        }

        messageBus = new Life.MessageBus();
        messageBus.on("showLifeView", function () {
            router.navigate("", {'trigger': true});
            //lifeView.render();
        });
        messageBus.on("showPatternsView", function () {
            router.navigate("patterns", {'trigger': true});
            //patternsView.render();
        });
        messageBus.on("viewRenderError", function (view) {
            history.back();
        });

        lifeView = new Life.LifeView({
            messageBus: messageBus, boardWidth: initParams.boardWidth,
            boardHeight: initParams.boardHeight, timerTick: initParams.timerTick
        });
        patternsView = new Life.PatternsView({messageBus: messageBus});

        //messageBus.trigger("showLifeView");
        router = new Life.Router();
        router.on("route:home", function () {
            lifeView.render();
        });
        router.on("route:patterns", function () {
            patternsView.render();
        });
        Backbone.history.start();
    };

    return that;
};

Life.Router = function () {
    var that = new Backbone.Router({
            routes: {
                "": "home",
                patterns: "patterns"
            }
        });

    return that;
};

Life.MessageBus = function () {
    var that = {};

    // Documentation tells to mix in this specific way
    _.extend(that, Backbone.Events);

    return that;
};
