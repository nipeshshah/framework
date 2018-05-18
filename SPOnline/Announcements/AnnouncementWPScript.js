
(function ($) {

    $.fn.GenerateAnnouncementBlock = function (options) {
        var selectedObjects = this;
        var announcementListItems;
        var oList;
        // This is the easiest way to have default options.
        var settings = $.extend({
            // These are the defaults.
            AnnouncementList: "Announcements",
            DisplayPosted: true,
            DisplayPostedBy: true,
            Width: "300px",
            LimitCharCount: 0,
            RowLimit: 5,
            DisplayCategory: true
        }, options);

        // Greenify the collection based on the settings variable.
        SP.SOD.executeFunc('sp.js', 'SP.ClientContext', announcementsRetrieveListItems);

        function announcementsRetrieveListItems() {

            var clientContext = new SP.ClientContext.get_current();

            var web = clientContext.get_web();
            oList = web.get_lists().getByTitle(settings.AnnouncementList);

            var camlQuery = new SP.CamlQuery();
            camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="Created" Ascending="False" /></OrderBy></Query><RowLimit>' + settings.RowLimit + '</RowLimit></View>');

            announcementsListItems = oList.getItems(camlQuery);
            //load default columns
            clientContext.load(oList, 'DefaultDisplayFormUrl', 'DefaultViewUrl')
            clientContext.load(announcementsListItems);
            clientContext.executeQueryAsync(
                announcementsOnQuerySucceeded,
                announcementsOnQueryFailed
                );
        }
        function announcementsOnQuerySucceeded(sender, args) {
            var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var html = '';
            var listItemEnumerator = announcementsListItems.getEnumerator();
            var counter = 1;
            var url = oList.get_defaultDisplayFormUrl();
            while (listItemEnumerator.moveNext()) {

                var oListItem = listItemEnumerator.get_current()

                var body = oListItem.get_item('Body');
                //body = $(body).text()
                var postedon = oListItem.get_item('Created');
                var postedby = oListItem.get_item('Author');
                var category = oListItem.get_item('Category');
                var title = oListItem.get_item('Title');

                if (counter % 2 == 0) {
                    html += "<div class=\"b-announcement even\">"
                }
                else {
                    html += "<div class=\"b-announcement odd\">"
                }
                html += "<a href=\"" + url + "?ID=" + oListItem.get_id() + "&Source=" + window.location.href + " \" class=\"b-announcement-link\" >";
                html += title + "</a>";
                if (settings.LimitCharCount > 0 && body.length > settings.LimitCharCount - 3) {
                    body = body.substring(0, settings.LimitCharCount - 3) + "..."
                }
                html += "       <div class=\"b-announcement-title\">" + body.trim() + "</div>";

                html += "    <div class='postedonStyle'>"
                if (settings.DisplayCategory) {
                    html += "<b>" + category.toUpperCase() + "</b>&nbsp; "
                }
                if (settings.DisplayPosted) {
                    html += "Posted on " + weekdays[postedon.getDay()] + "," + postedon.format(" dd MMMM yyyy") + "&nbsp; ";
                }
                if (settings.DisplayPostedBy) {
                    html += "By " + postedby.get_lookupValue();
                }
                html += "</div></div>";

                counter++;
            }
            html += "<div class='announcementArchiveStyle'><a target='_blank' href='" + oList.get_defaultViewUrl() + "'>Announcement Archive</a></div>"
            $(selectedObjects).html(html)
            $(selectedObjects).css("width", settings.Width);
            $(".b-announcement-title").dotdotdot();
            return $(selectedObjects).html()
        }

        function announcementsOnQueryFailed(sender, args) {
            $(selectedObjects).html('Request failed. ' + args.get_message() + '<br/>\n' + args.get_stackTrace());
        }
    };
}(jQuery));