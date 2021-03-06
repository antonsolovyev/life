var Life = Life || {};

Life.PatternsView = function (spec) {
    var T = Backbone.View.extend({
        el: spec.el,
        events: {
            "click #cancelButton": function () {
                handleCancelButton();
            },
            "click #uploadButton": function () {
                handleUploadButton();
            },
            "click .loadPatternButton": function (e) {
                handleLoadPatternButton(e);
            },
            "click .deletePatternButton": function (e) {
                handleDeletePatternButton(e);
            },
        }
    });
    var that = new T();

    var messageBus = spec.messageBus;

    var handleCancelButton = function () {
        messageBus.trigger("showLifeView");
    };

    var handleLoadPatternButton = function (e) {
        var patternId = $(e.currentTarget).data("id");
        messageBus.trigger("loadPattern", patternList.get(patternId));
        messageBus.trigger("showLifeView");
    };

    var handleDeletePatternButton = function (e) {
        var patternId = $(e.currentTarget).data("id");
        var pattern = patternList.get(patternId);

        var template = _.template($("#confirmDeletePatternDialogHtml").html());
        $("body").append(template({name: pattern.get("name")}));

        $("#confirmDeletePatternDialog").dialog({
            resizable: false,
            modal: true,
            close: function () {
                $("#confirmDeletePatternDialog").dialog("destroy");
                $("#confirmDeletePatternDialog").remove();
            },
            // Use array to guarantee button order!
            buttons: [
                {
                    text: "Cancel",
                    click: function () {
                        $("#confirmDeletePatternDialog").dialog("close");
                    }
                },
                {
                    text: "Delete",
                    click: function () {
                        pattern.destroy({wait: true});
                        $("#confirmDeletePatternDialog").dialog("close");
                    }
                }
            ]
        });
    };

    var handleUploadButton = function () {
        $("body").append($("#uploadDialogHtml").html());

        $("#uploadDialog").dialog({
            resizable: false,
            modal: true,
            close: function () {
                $("#uploadDialog").dialog("destroy");
                $("#uploadDialog").remove();
            },
            buttons: [
                {
                    text: "Upload",
                    click: function () {
                        if ($("#fileInput")[0].files.length === 0) {
                            return;
                        }
                        var formData = new FormData($("#uploadForm")[0]);
                        $.ajax({
                            url: "/rest/upload",
                            data: formData,
                            processData: false,
                            contentType: false,
                            type: 'POST',
                            success: function () {
                                Life.Util.messageBox({
                                    title: "Success",
                                    message: "Pattern uploaded!"
                                });
                                that.render();
                            },
                            error: function (request, status, error) {
                                if (request.status && request.status === 400) {
                                    alert(request.responseText);
                                } else {
                                    alert("Error uploading file!");
                                }
                            }
                        });
                        $("#uploadDialog").dialog("close");
                    }
                },
                {
                    text: "Cancel",
                    click: function () {
                        $("#uploadDialog").dialog("close");
                    }
                }
            ]
        });
    };

    var patternList = new Life.PatternsView.PatternList();

    patternList.on("add remove", function () {
        that.render();
    });

    that.render = function () {
        patternList.fetch(
            {
                success: function (patternList) {
                    var template = _.template($("#patternsViewHtml").html());
                    that.$el.html(template({patternList: patternList.models}));
                    $("#patternsList .nameCell").editable(function (value, settings) {
                        var patternId = $(this).data("id");
                        var model = patternList.get(patternId);
                        if (!value.trim()) {
                            return;
                        }
                        model.set({name: value});
                        model.save();
                        return (value);
                    }, {
                        indicator: 'Saving...',
                        tooltip: 'Click to edit...',
                        type: 'text'
                    });
                    $("#patternsList").DataTable({
                        "columnDefs": [
                            {"orderable": false, "targets": ["noSort"]}
                        ]
                    });
                },
                error: function () {
                    alert("Error retrieving patterns!");
                    messageBus.trigger("viewRenderError", that);
                },
                reset: true
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