<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8"/>
        <title>Conway Game of Life</title>

        <link rel="icon" href="/favicon.ico"/>

        <link rel="stylesheet" type="text/css" href="/css/life.css"/>
        <link rel="stylesheet" type="text/css" href="/js/lib/jquery-ui/jquery-ui.css"/>
        <link rel="stylesheet" type="text/css" href="/js/lib/DataTables/css/dataTables.jqueryui.css"/>
    </head>

    <body>
        <script type="text/javascript" src="/js/lib/jquery.js"></script>

        <script type="text/javascript" src="/js/lib/jquery-ui/external/jquery/jquery.js"></script>
        <script type="text/javascript" src="/js/lib/jquery-ui/jquery-ui.js"></script>

        <script type="text/javascript" src="/js/lib/underscore.js"></script>
        <script type="text/javascript" src="/js/lib/backbone.js"></script>

        <script type="text/javascript" src="/js/lib/DataTables/js/jquery.dataTables.js"></script>
        <script type="text/javascript" src="/js/lib/DataTables/js/dataTables.jqueryui.js"></script>

        <script type="text/javascript" src="/js/lib/jquery.jeditable.js"></script>

        <script type="text/javascript" src="/js/app/Main.js"></script>
        <script type="text/javascript" src="/js/app/LifeEngine.js"></script>
        <script type="text/javascript" src="/js/app/LifeView.js"></script>
        <script type="text/javascript" src="/js/app/PatternsView.js"></script>

        <script type="text/html" id="lifeViewHtml">
            <%@ include file="template/lifeView.html" %>
        </script>
        <script type="text/html" id="patternsViewHtml">
            <%@ include file="template/patternsView.html" %>
        </script>
        <script type="text/html" id="messageBoxHtml">
            <%@ include file="template/messageBox.html" %>
        </script>
        <script type="text/html" id="savePatternDialogHtml">
            <%@ include file="template/savePatternDialog.html" %>
        </script>
        <script type="text/html" id="uploadDialogHtml">
            <%@ include file="template/uploadDialog.html" %>
        </script>
        <script type="text/html" id="confirmDeletePatternDialogHtml">
            <%@ include file="template/confirmDeletePatternDialog.html" %>
        </script>

        <div id="lifeView"></div>
        <div id="patternsView"></div>
    </body>
</html>