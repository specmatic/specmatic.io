jQuery(document).ready(function ($) {
    //Regenerate Video XML sitemap
    $("#seopress-video-regenerate").click(function () {
        url = seopressAjaxVdeoRegenerate.seopress_video_regenerate;
        action = 'seopress_pro_video_xml_sitemap_regenerate';
        _ajax_nonce = seopressAjaxVdeoRegenerate.seopress_nonce;

        self.process_offset2(0, self, url, action, _ajax_nonce);
    });

    process_offset2 = function (
        offset,
        self,
        url,
        action,
        _ajax_nonce
    ) {
        i18n = seopressAjaxVdeoRegenerate.i18n.video;
        $.ajax({
            method: 'POST',
            url: url,
            data: {
                action: action,
                offset: offset,
                _ajax_nonce: _ajax_nonce,
            },
            success: function (data) {
                if ("done" == data.data.offset) {
                    $("#seopress-video-regenerate").removeAttr(
                        "disabled"
                    );
                    $(".spinner").css("visibility", "hidden");
                    $("#tab_seopress_tool_video .log").css("display", "block");
                    $("#tab_seopress_tool_video .log").html("<div class='seopress-notice is-success'><p>" + i18n + "</p></div>");

                    if (data.data.url != "") {
                        $(location).attr("href", data.data.url);
                    }
                } else {
                    self.process_offset2(
                        parseInt(data.data.offset),
                        self,
                        url,
                        action,
                        _ajax_nonce
                    );
                    if (data.data.total) {
                        progress = (data.data.count / data.data.total * 100).toFixed(2);
                        $("#tab_seopress_tool_video .log").css("display", "block");
                        $("#tab_seopress_tool_video .log").html("<div class='seopress-notice'><p>" + progress + "%</p></div>");
                    }
                }
            },
        });
    };
    $("#seopress-video-regenerate").on("click", function () {
        $(this).attr("disabled", "disabled");
        $("#tab_seopress_tool_video .spinner").css(
            "visibility",
            "visible"
        );
        $("#tab_seopress_tool_video .spinner").css("float", "none");
        $("#tab_seopress_tool_video .log").html("");
    });
});
