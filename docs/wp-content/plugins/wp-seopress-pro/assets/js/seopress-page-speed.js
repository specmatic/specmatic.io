//Request Google Page Speed
jQuery(document).ready(function ($) {
    $('.seopress-request-page-speed').on('click', function () {
        var data_permalink = $(this).attr('data_permalink');
        $.ajax({
            method: 'POST',
            url: seopressAjaxRequestPageSpeed.seopress_request_page_speed,
            data: {
                action: 'seopress_request_page_speed',
                data_permalink: data_permalink,
                seopress_ps_api_key: $('#seopress_ps_api_key').val(),
                seopress_ps_url: $('#seopress_ps_url').val(),
                _ajax_nonce: seopressAjaxRequestPageSpeed.seopress_nonce,
            },
            success: function () {
                window.location.reload();
            },
        });
    });

    $('.seopress-request-page-speed').on('click', function () {
        $(this).attr("disabled", "disabled");
        $('.spinner').css("visibility", "visible");
        $('.spinner').css("float", "none");
    });

    //Clear Google Page Speed Transient
    $('#seopress-clear-page-speed-cache').on('click', function () {
        $.ajax({
            method: 'GET',
            url: seopressAjaxClearPageSpeedCache.seopress_clear_page_speed_cache,
            data: {
                action: 'seopress_clear_page_speed_cache',
                _ajax_nonce: seopressAjaxClearPageSpeedCache.seopress_nonce,
            },
            success: function () {
                window.location.reload(true);
            },
        });
    });
    $('#seopress-clear-page-speed-cache').on('click', function () {
        $(this).attr("disabled", "disabled");
        $('.spinner').css("visibility", "visible");
        $('.spinner').css("float", "none");
    });

    //Accordion PS audits
    $('.ps-audits').accordion({
        header: 'h4',
        collapsible: true,
        animate: false,
        classes: {
            'ui-accordion': 'seopress-ui-accordion',
            'ui-accordion-header': 'seopress-ui-corner-top',
            'ui-accordion-header-collapsed': 'seopress-ui-corner-all',
            'ui-accordion-content': 'seopress-ui-corner-bottom',
            'ui-accordion-header-active': 'is-open'
        }
    });
});
