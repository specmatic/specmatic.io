'use strict';

var checkInterval = null;

function checkIfRunning() {

    // Check if ssp_single_ajax is available.
    if (typeof ssp_single_ajax === 'undefined') {
        return false;
    }
    fetch(ssp_single_ajax.rest_url +  'simplystatic/v1/is-running',
        {
            credentials: 'same-origin',
            headers: {
                "Content-Type": "application/json",
                'X-WP-Nonce': ssp_single_ajax.rest_nonce
            },
        }
    )
        .then(resp => resp.json())
        .then(resp => {
            var json = JSON.parse(resp);

            if (json.running) {
                jQuery('#generate-single').attr('disabled', 'disabled');

            } else {
                jQuery('#generate-single').removeAttr('disabled');

                clearInterval(checkInterval);
            }
        });
}

function startCheckIfRunning() {
    checkIfRunning();
    checkInterval = setInterval(
        function () {
            checkIfRunning();
        },
        5000
    );
}

jQuery(document).ready(function ($) {
    startCheckIfRunning();

    // Check if the export was an single export.
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if ('single_export' === urlParams.get('type')) {
        $('#generate').hide();
        $('.actions').hide();
    }

    // Start generation of single.
    $('#generate-single').on('click', function () {
        var single_id = $(this).attr('data-id');

        $('#generate-single').attr('disabled', 'disabled');
        $('#export-file-container .spinner').addClass('is-active');

        $.ajax({
            type: 'POST',
            url: ssp_single_ajax.ajax_url,
            data: {
                'action': 'apply_single',
                'nonce': ssp_single_ajax.single_nonce,
                'single_id': single_id,
                'assets': $('#generate-single-assets').prop('checked') ? '1' : '0'
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $('#generate-single').removeAttr('disabled');
                    $('#export-file-container .spinner').removeClass('is-active');
                }
            },
        });
    });

    // Start generation of single.
    $('#delete-single').on('click', function () {
        var single_id = $(this).attr('data-id');

        $('#delete-single').attr('disabled', 'disabled');
        $('#delete-file-container .spinner').addClass('is-active');

        $.ajax({
            type: 'POST',
            url: ssp_single_ajax.ajax_url,
            data: {'action': 'delete_single', 'nonce': ssp_single_ajax.single_nonce, 'single_id': single_id},
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $('#delete-single').removeAttr('disabled');
                    $('#delete-file-container .spinner').removeClass('is-active');
                } else {
                    $("#delete-file-container").append('<p>' + response.error + '</p>');
                    $('#delete-file-container .spinner').removeClass('is-active');
                }
            },
        });
    });
});