var Life = Life || {};

$(document).ready(function () {
    new Life.Main().main();
});

Life.Main = function () {
    var that = {};

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

        var lifeView = new Life.LifeView();
        lifeView.render();
    };

    return that;
};