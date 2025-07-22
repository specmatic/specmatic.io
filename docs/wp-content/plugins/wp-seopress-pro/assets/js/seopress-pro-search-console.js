jQuery(document).ready(function ($) {
    let disabledBtn = false

    $("#seopress_launch_bot_search_console").on('click', function (e) {
        e.preventDefault()
        if (disabledBtn) {
            return
        }

        disabledBtn = true
        $(this).attr("disabled", "disabled");
        $("#tab_seopress_inspect_url .spinner").css(
            "visibility",
            "visible"
        );
        $("#tab_seopress_inspect_url .log").css("display", "block");
        $('#tab_seopress_inspect_url .spinner').css("float", "none");

        $.ajax({
            method: 'POST',
            url: seopressAjaxGSC.seopress_request_bot,
            data: {
                action: 'seopress_request_data_search_console',
                _ajax_nonce: seopressAjaxGSC.seopress_nonce_search_console,
            },
            success: function (response) {
                const { data } = response
                const { status } = data

                // Is not null data.error
                if(status === 'error' && data.error !== null ) {
                    try {
                        const { error } = JSON.parse(data.error)

                        if(error.message){
                            $("#tab_seopress_inspect_url .log").html("<div class='seopress-notice is-error'><p>" + error.message + "</p></div>");
                            $("#tab_seopress_inspect_url .spinner").css("visibility", "hidden");
                            $("#seopress_launch_bot_search_console").attr('disabled', '');
                            disabledBtn = false
                        }
                    } catch (error) {

                    }

                }
                else{
                    saveDataResultSearchConsole(data.data)

                }
            },
        });

    })


    async function saveDataResultSearchConsole(rows) {

        let totalMatches = 0;
        let current = 0
        const totalRows = rows.length
        while (rows.length > 0) {
            const progress = Number((current * 100) / totalRows).toFixed(2)

            $("#tab_seopress_inspect_url .log").html("<div class='seopress-notice'><p>" + progress + "% " + seopressAjaxGSC.i18n.progress_matches.replace('%s', totalMatches) + "</p></div>");

            const chunk = rows.splice(0, seopressAjaxGSC.seopress_search_console_batch_process)
            current += Number(seopressAjaxGSC.seopress_search_console_batch_process)


            const { data } = await ajaxSaveDataBotSearchConsole(chunk)
            if (data.total_matches) {
                totalMatches += data.total_matches
            }
        }

        $("#tab_seopress_inspect_url .spinner").css("visibility", "hidden");
        $("#tab_seopress_inspect_url .log").css("display", "block");
        $("#tab_seopress_inspect_url .log").html("<div class='seopress-notice is-success'><p>" + seopressAjaxGSC.i18n.finish_matches.replace('%s', totalMatches) + "</p></div>");
        $("#seopress_launch_bot_search_console").attr('disabled', '');
        disabledBtn = false
    }


    function ajaxSaveDataBotSearchConsole(rows) {
        return new Promise((resolve, reject) => {
            $.ajax({
                method: 'POST',
                url: seopressAjaxGSC.seopress_request_bot,
                data: {
                    action: 'seopress_request_save_search_console',
                    _ajax_nonce: seopressAjaxGSC.seopress_nonce_search_console,
                    rows: rows,
                },
                success: function (data) {
                    resolve(data)
                },
            });
        })
    }
});
