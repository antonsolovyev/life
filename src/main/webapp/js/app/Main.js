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

        messageBus = new Life.MessageBus();
        messageBus.on("showLifeView", function () {
            // TODO
            //router.navigate("patterns", {'trigger': true});
            lifeView.render();
        });
        messageBus.on("showPatternsView", function () {
            // TODO
            //router.navigate("patterns", {'trigger': true});
            patternsView.render();
        });

        lifeView = new Life.LifeView({messageBus: messageBus});
        patternsView = new Life.PatternsView({messageBus: messageBus});

        messageBus.trigger("showLifeView");
        // TODO
        //router = new Life.Router();
        //router.on("route:home", function () {
        //    lifeView.render();
        //});
        //router.on("route:patterns", function () {
        //    patternsView.render();
        //});
        //Backbone.history.start();
    };

    return that;
};

Life.Router = function () {
    var that = new Backbone.Router(
        {
            routes:
            {
                '': 'home',
                'patterns': 'patterns'
            }
        });

    return that;
};

Life.MessageBus = function()
{
    var that = {};

    // Documentation tells to mix in this specific way
    _.extend(that, Backbone.Events);

    return that;
};
