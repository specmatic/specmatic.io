//Save htaccess
jQuery(document).ready(function ($) {
    $('#seopress-save-htaccess').on('click', function () {
        $.ajax({
            method: 'POST',
            url: seopressAjaxSaveHtaccess.seopress_save_htaccess,
            data: {
                action: 'seopress_save_htaccess',
                htaccess_content: $('textarea#seopress_htaccess_file').val(),
                _ajax_nonce: seopressAjaxSaveHtaccess.seopress_nonce,
            },
            success: function (data) {
                setTimeout(function () { window.location.reload() }, 4000);
                $("#tab_seopress_htaccess .log").css('display', 'block');
                $("#tab_seopress_htaccess .log").html("<div class='seopress-notice " + data.data.class + "'><p>" + data.data.msg + "</p></div>");
            },
        });
    });
    //htaccess rules
    $('#seopress-tag-htaccess-1').click(function () {
        $("#seopress_htaccess_file").val($("#seopress_htaccess_file").val() + '\n' + $('#seopress-tag-htaccess-1').attr('data-tag'));
    });
    $('#seopress-tag-htaccess-2').click(function () {
        $("#seopress_htaccess_file").val($("#seopress_htaccess_file").val() + '\n' + $('#seopress-tag-htaccess-2').attr('data-tag'));
    });
    $('#seopress-tag-htaccess-3').click(function () {
        $("#seopress_htaccess_file").val($("#seopress_htaccess_file").val() + '\n' + $('#seopress-tag-htaccess-3').attr('data-tag'));
    });

    $('#seopress-save-htaccess').on('click', function () {
        $(this).attr("disabled", "disabled");
        $('.spinner').css("visibility", "visible");
        $('.spinner').css("float", "none");
    });
});
