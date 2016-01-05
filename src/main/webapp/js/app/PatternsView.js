var Life = Life || {};

Life.PatternsView = function (spec) {
    var T = Backbone.View.extend({
        el: "#page",
        events: {
            "click #cancelButton": function () {
                handleCancelButton();
            },
            "click .loadPatternButton": function (e) {
                handleLoadPatternButton(e);
            },
            "click .deletePatternButton": function (e) {
                handleDeletePatternButton(e);
            }
        }
    });
    var that = new T();

    var messageBus = spec.messageBus;

    var handleCancelButton = function () {
        messageBus.trigger("showLifeView");
    };

    var handleLoadPatternButton = function (e) {
        messageBus.trigger("loadPattern", patternList.get(e.currentTarget.id));
        messageBus.trigger("showLifeView");
    };

    var handleDeletePatternButton = function (e) {
        var pattern = patternList.get(e.currentTarget.id);
        pattern.destroy({wait: true});
    };

    var patternList = new Life.PatternsView.PatternList();

    patternList.on("remove", function () {
        that.render();
    });

    that.render = function () {
        patternList.fetch(
            {
                success: function (patternList) {
                    var template = _.template(_.getFromUrl('/template/patternsView.html'));
                    that.$el.html(template({'patternList': patternList.models}));
                    $("#patternsList").DataTable({
                        "columnDefs": [
                            { "orderable": false, "targets": ["noSort"] }
                        ]
                    });
                },
                error: function () {
                    alert('Error retrieving patterns!');
                    messageBus.trigger("viewRenderError", that);
                }
            });
    };

    return that;
};

Life.PatternsView.Pattern = function (attributes, options) {
    var T = Backbone.Model.extend({});
    var that = new T(attributes, options);

    return that;
};

Life.PatternsView.PatternList = function (attributes, options) {
    var T = Backbone.Collection.extend({
        url: "/rest/patterns",
        model: Life.PatternsView.Pattern
    });
    var that = new T(attributes, options);

    return that;
};