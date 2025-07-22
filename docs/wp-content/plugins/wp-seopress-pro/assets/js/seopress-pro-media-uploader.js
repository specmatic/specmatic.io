jQuery(document).ready(function ($) {
    var mediaUploader;
    $('input[type="button"].manual_img_library_global').click(function (e) {
        e.preventDefault();

        var url_field_id = $(this).attr("id");
        var url_field = $("#" + url_field_id)
            .closest("p")
            .find("input[type=text].manual_img_library_global");
        var url_field_width = $("#" + url_field_id)
            .closest("p")
            .find("input[type=hidden].manual_img_library_global_width");
        var url_field_height = $("#" + url_field_id)
            .closest("p")
            .find("input[type=hidden].manual_img_library_global_height");

        // Extend the wp.media object
        mediaUploader = wp.media.frames.file_frame = wp.media({
            multiple: false,
        });

        // When a file is selected, grab the URL and set it as the text field's value
        mediaUploader.on("select", function () {
            attachment = mediaUploader
                .state()
                .get("selection")
                .first()
                .toJSON();
            $(url_field).val(attachment.url);
            $(url_field_width).val(attachment.width);
            $(url_field_height).val(attachment.height);
        });
        // Open the uploader dialog
        mediaUploader.open();
    });
    const array = [
        "#seopress_pro_rich_snippets_jobs_hiring_logo",
        "#seopress_pro_rich_snippets_review_img",
        "#seopress_pro_rich_snippets_events_img",
        "#seopress_pro_rich_snippets_service_lb_img",
        "#seopress_pro_rich_snippets_service_img",
        "#seopress_pro_rich_snippets_product_img",
        "#seopress_pro_rich_snippets_videos_img",
        "#seopress_pro_rich_snippets_recipes_img",
        "#seopress_pro_rich_snippets_lb_img",
        "#seopress_pro_rich_snippets_article_img",
        "#seopress_pro_rich_snippets_how_to_img",
        "#seopress_pro_rich_snippets_how_to_step_img",
    ];

    array.forEach(function (item) {
        var mediaUploader;
        $(item).click(function (e) {
            e.preventDefault();
            // If the uploader object has already been created, reopen the dialog
            if (mediaUploader) {
                mediaUploader.open();
                return;
            }
            // Extend the wp.media object
            mediaUploader = wp.media.frames.file_frame = wp.media({
                multiple: false,
            });

            // When a file is selected, grab the URL and set it as the text field's value
            mediaUploader.on("select", function () {
                attachment = mediaUploader
                    .state()
                    .get("selection")
                    .first()
                    .toJSON();
                $(item + "_meta").val(attachment.url);
                $(item + "_width").val(attachment.width);
                $(item + "_height").val(attachment.height);
            });
            // Open the uploader dialog
            mediaUploader.open();
        });
    });

    const uploadBtnsRepeater = $(
        ".js-media-upload-how-to-repeater .seopress_media_upload"
    );

    if (uploadBtnsRepeater.length > 0) {
        uploadBtnsRepeater.each(function (key, item) {
            var mediaUploader;

            $(item).click(function (e) {
                e.preventDefault();

                const item_id = "#" + $(item).attr("id");

                // If the uploader object has already been created, reopen the dialog
                if (mediaUploader) {
                    mediaUploader.open();
                    return;
                }
                // Extend the wp.media object
                mediaUploader = wp.media.frames.file_frame = wp.media({
                    multiple: false,
                });

                // When a file is selected, grab the URL and set it as the text field's value
                mediaUploader.on("select", function () {
                    attachment = mediaUploader
                        .state()
                        .get("selection")
                        .first()
                        .toJSON();

                    $(item_id + "_meta").val(attachment.url);
                    if ($(item_id + "_attachment_id").length > 0) {
                        $(item_id + "_attachment_id").val(attachment.id);
                    }
                    $(item_id + "_width").val(attachment.width);
                    $(item_id + "_height").val(attachment.height);
                });
                // Open the uploader dialog
                mediaUploader.open();
            });
        });
    }
});
