var Life = Life || {};

$(document).ready(function () {
    new Life.Main().main();
});

Life.Main = function () {
    var that = {};
    var messageBus;
    var router;
    var views = [];

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
        });
        messageBus.on("showPatternsView", function () {
            router.navigate("patterns", {'trigger': true});
        });
        messageBus.on("viewRenderError", function (view) {
            history.back();
        });

        var lifeView = new Life.LifeView({
            messageBus: messageBus,
            el: "#lifeView",
            boardSizeLog2: initParams.boardSizeLog2,
            timerTick: initParams.timerTick
        });
        views.push(lifeView);
        var patternsView = new Life.PatternsView({
            messageBus: messageBus,
            el: "#patternsView"}
        );
        views.push(patternsView);

        router = new Life.Router();
        router.on("route:home", function () {
            showView(lifeView);
        });
        router.on("route:patterns", function () {
            showView(patternsView);
        });
        Backbone.history.start();
    };

    var showView = function (view) {
        for(var i = 0; i < views.length; i++) {
            $(views[i].el).hide();
        }
        $(view.el).show();
        view.render();
    };

    return that;
};

Life.Util = {
    messageBox: function (spec) {
        var title = spec.title;
        var message = spec.message;
        var callback = spec.callback;

        var template = _.template(_.getFromUrl("/template/messageBox.html"));
        $("body").append(template({
                title: title,
                message: message
        }));

        $("#messageBox").dialog({
            dialogClass: "no-close",
            resizable: false,
            modal: true,
            buttons:
            {
                "OK": function()
                {
                    if(callback) {
                        callback();
                    }
                    jQuery('#messageBox').dialog('close');
                }
            },
            close: function() // this ensures that even if close button is used the dialog is removed
            {
                jQuery('#messageBox').dialog('destroy');
                jQuery('#messageBox').remove();
            }
        });

    }
}

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
