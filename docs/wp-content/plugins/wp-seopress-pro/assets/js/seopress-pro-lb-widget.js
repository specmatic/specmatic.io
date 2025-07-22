function seopress_sortable_lb_business() {
    var container = jQuery(".seopress-sortable-lb-widget");
    container.sortable({
        placeholder: "widget-placeholder",
        connectWith: ".seopress-sortable-lb-widget p",
        items: "[data-id]",
        update: function (event) {
            const item = jQuery(event.target);

            var postData = item.sortable("toArray", {
                attribute: "data-id",
            });
            var id = item.parents(".widget-inside").find(".multi_number").val()
                ? item.parents(".widget-inside").find(".multi_number").val()
                : item.parents(".widget-inside").find(".widget_number").val();

            item.parents(".widget-inside")
                .find(".data-order")
                .val(postData.join(","));
        },
    });
}
jQuery(document).ready(function () {
    seopress_sortable_lb_business();

    jQuery(document).on("widget-updated widget-added", function (e, widget) {
        seopress_sortable_lb_business();
    });
});
