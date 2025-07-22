jQuery(document).ready(function () {
    jQuery(document).on("click", "#seopress_ai_generate_seo_meta", function () {
        sp_ai_generate_meta();
    });
});

function sp_ai_generate_meta() {
    const $ = jQuery;
    //Open AI
    $("#seopress_ai_generate_seo_meta").attr("disabled", "disabled");
    $("#seopress_ai_generate_seo_meta_log").hide();

    jQuery.ajax({
        method: "POST",
        url: seopressAjaxAIMetaSEO.seopress_ai_generate_seo_meta,
        data: {
            action: "seopress_ai_generate_seo_meta",
            post_id: seopressElementorBase.post_id,
            _ajax_nonce: seopressAjaxAIMetaSEO.seopress_nonce,
        },
        success: function (data) {
            $('#seopress_ai_generate_seo_meta').removeAttr("disabled");
            if (data.success === true) {
                $("input[data-setting=_seopress_titles_title]").val(data.data.title);
                $("textarea[data-setting=_seopress_titles_desc]").val(data.data.desc);
                if (data.data.message !== 'Success') {
                    $("#seopress_ai_generate_seo_meta_log").show();
                    $("#seopress_ai_generate_seo_meta_log").html("<div style='margin-top:20px'><p>" + data.data.message + "</p></div>");
                }
            } else {
                $("#seopress_ai_generate_seo_meta_log").show();
                $("#seopress_ai_generate_seo_meta_log").html("<div style='margin-top:20px'><p>" + data.data.message + "</p></div>");

            }
        }
    });
}
