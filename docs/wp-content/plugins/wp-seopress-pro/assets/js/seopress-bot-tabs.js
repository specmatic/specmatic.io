jQuery(document).ready(function ($) {
    function siteAuditDataTable() {
        jQuery(document).ready(function ($) {
            $('.seopress-site-audit-table').each(function () {
                if (!$.fn.DataTable.isDataTable(this)) {
                    $(this).DataTable({
                        paging: true,
                        lengthMenu: [
                            [10, 25, 50, -1],
                            [10, 25, 50, 'All']
                        ],
                        order: [[0, 'desc']],
                        responsive: true,
                        dom: 'Bfrtip',
                        buttons: [
                            {
                                extend: 'csvHtml5',
                                text: 'Export CSV',
                                exportOptions: {
                                    format: {
                                        body: function (data, row, column, node) {
                                            if ($(node).hasClass('site-audit-item-impact')) {
                                                return $(node).attr('data-sort');
                                            }
                                            if ($(node).hasClass('site-audit-item-link')) {
                                                return $(node).attr('data-sort');
                                            }
                                            if ($(node).hasClass('site-audit-name')) {
                                                return $(node).attr('data-sort');
                                            }
                                            if ($(node).hasClass('site-audit-desc')) {
                                                return $(node).attr('data-sort');
                                            }
                                            if ($(node).hasClass('site-audit-target-keyword')) {
                                                return $(node).attr('data-sort');
                                            }
                                            if ($(node).hasClass('site-audit-ignore')) {
                                                return $(node).attr('data-sort');
                                            }
                                            return data;
                                        }
                                    }
                                },
                            },
                        ]
                    });
                }
            });
        });
    }

    // Select all .wrap-site-audit-analysis elements
    $('.wrap-site-audit-analysis').each(function () {
        var $details = $(this);

        // Listen for the toggle event
        $details.on('toggle', function () {
            if (this.open && !$details.data('loaded')) {
                var type = $details.data('type');
                var $placeholder = $details.find('.analysis-results-placeholder');

                // Make AJAX request to load the analysis results
                $.ajax({
                    url: ajaxurl,
                    method: 'POST',
                    data: {
                        action: 'seopress_site_audit_load_analysis',
                        _ajax_nonce: seopressAjaxBot.seopress_nonce,
                        type: type
                    },
                    success: function (data) {
                        $placeholder.html(data);
                        siteAuditDataTable(); // Initialize DataTable after loading
                        $details.data('loaded', true); // Mark as loaded
                    },
                    error: function () {
                        console.error('Error loading analysis results.');
                        $placeholder.html('Failed to load results.');
                    }
                });
            }
        });
    });

    // Run manually site audit task
    $('#seopress-run-site-audit').click(function () {
        $(this).attr("disabled", "disabled");
        $('.spinner').css("visibility", "visible");
        $('.spinner').css("float", "none");

        $.ajax({
            url: ajaxurl,
            method: 'POST',
            data: {
                action: 'seopress_site_audit_run_task',
                _ajax_nonce: seopressAjaxBot.seopress_nonce,
            },
            success: function () {
                window.location.reload(true);
            },
            error: function () {
                console.error('Error to run scheduled task.');
            }
        });
    });

    // Get progress status
    setInterval(function() {
        $.ajax({
            url: ajaxurl,
            method: 'POST',
            data: {
                action: 'seopress_site_audit_get_task_progress',
                _ajax_nonce: seopressAjaxBot.seopress_nonce,
            },
            success: function(response) {
                if (response && response.data.running === 1) {
                    $('#seopress-notice-site-audit-running').show();
                    $('#seopress-run-site-audit').prop("disabled", true);
                    $('.spinner').css("visibility", "visible");
                    $('.spinner').css("float", "none");
                    $('#seopress-site-audit-offset').html(response.data.progress);
                } else if ($('#seopress-cancel-site-audit').length && response.data.running === 0) {
                    window.location.reload(true);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Failed to fetch new content:', textStatus, errorThrown);
            }
        });
    }, 2000);


    // Cancel site audit task
    $('#seopress-cancel-site-audit').click(function () {
        $(this).attr("disabled", "disabled");
        $.ajax({
            url: ajaxurl,
            method: 'POST',
            data: {
                action: 'seopress_site_audit_cancel_task',
                _ajax_nonce: seopressAjaxBot.seopress_nonce,
            },
            success: function(response) {
                if (response.success) {
                    alert(response.data);
                    window.location.reload(true);
                } else {
                    alert('Failed to cancel the task.');
                }
            }
        });
    });

    // Ignore an issue
    $('body').on('click', '.seopress-site-audit-ignore-issue', function () {
        var $btn = $(this); // Cache the button to avoid repeated jQuery lookups
        var issue_post_id = $btn.data('issue-post-id');
        var issue_type = $btn.data('issue-type');

        $btn.attr("disabled", "disabled");

        $.ajax({
            url: ajaxurl,
            method: 'POST',
            data: {
                action: 'seopress_site_audit_ignore_issue',
                _ajax_nonce: seopressAjaxBot.seopress_nonce,
                issue_post_id: issue_post_id,
                issue_type: issue_type,
            },
            success: function(response) {
                if (response.success) {
                    $btn.closest('.gr-analysis-title').remove();
                } else {
                    alert('Failed to ignore the issue.');
                    $btn.removeAttr("disabled"); // Re-enable button on failure
                }
            },
            error: function() {
                alert('An error occurred while processing the request.');
                $btn.removeAttr("disabled"); // Re-enable button on AJAX error
            }
        });
    });

    // Run actions
    $('body').on('click', '.seopress-site-audit-run-actions-img-alt', function () {
        var $btn = $(this); // Cache the button to avoid repeated jQuery lookups
        var issue_post_id = $btn.data('issue-post-id');

        $btn.attr("disabled", "disabled");

        $.ajax({
            url: ajaxurl,
            method: 'POST',
            data: {
                action: 'seopress_site_audit_run_actions',
                _ajax_nonce: seopressAjaxBot.seopress_nonce,
                issue_post_id: issue_post_id,
            },
            success: function(response) {
                if (response.success) {
                    alert('Alt text generated');
                    $btn.removeAttr("disabled"); // Re-enable button on failure
                } else {
                    alert('Failed to generate alt text.');
                    $btn.removeAttr("disabled"); // Re-enable button on failure
                }
            },
            error: function() {
                alert('An error occurred while processing the request.');
                $btn.removeAttr("disabled"); // Re-enable button on AJAX error
            }
        });
    });

    var get_hash = window.location.hash;
    var clean_hash = get_hash.split('$');

    if (typeof sessionStorage != 'undefined') {
        var seopress_bot_tab_session_storage = sessionStorage.getItem("seopress_scan_tab");

        if (clean_hash[1] == '1') { //Scan Tab
            $('#tab_seopress_scan-tab').addClass("nav-tab-active");
            $('#tab_seopress_scan').addClass("active");
        } else if (clean_hash[1] == '2') { //Scan settings Tab
            $('#tab_seopress_scan_settings-tab').addClass("nav-tab-active");
            $('#tab_seopress_scan_settings').addClass("active");
        } else if (seopress_bot_tab_session_storage) {
            $('#seopress-tabs').find('.nav-tab.nav-tab-active').removeClass("nav-tab-active");
            $('#seopress-tabs').find('.seopress-tab.active').removeClass("active");

            $('#' + seopress_bot_tab_session_storage.split('#tab=') + '-tab').addClass("nav-tab-active");
            $('#' + seopress_bot_tab_session_storage.split('#tab=')).addClass("active");
        } else {
            //Default TAB
            $('#tab_seopress_audit-tab').addClass("nav-tab-active");
            $('#tab_seopress_audit').addClass("active");
        }
    };
    $("#seopress-tabs").find("a.nav-tab").click(function (e) {
        e.preventDefault();
        var hash = $(this).attr('href').split('#tab=')[1];

        $('#seopress-tabs').find('.nav-tab.nav-tab-active').removeClass("nav-tab-active");
        $('#' + hash + '-tab').addClass("nav-tab-active");

        if (clean_hash[1] == 1) {
            sessionStorage.setItem("seopress_scan_tab", 'tab_seopress_scan');
        } else if (clean_hash[1] == 2) {
            sessionStorage.setItem("seopress_scan_tab", 'tab_seopress_scan_settings');
        } else {
            sessionStorage.setItem("seopress_scan_tab", hash);
        }

        $('#seopress-tabs').find('.seopress-tab.active').removeClass("active");
        $('#' + hash).addClass("active");
    });

    //Ajax
    $('#seopress_launch_bot').on('click', function (e) {
        e.preventDefault();
        self.process_offset(0, self);
    });
    process_offset = function (offset, self) {
        $.ajax({
            method: 'POST',
            url: seopressAjaxBot.seopress_request_bot,
            data: {
                action: 'seopress_request_bot',
                _ajax_nonce: seopressAjaxBot.seopress_nonce,
                offset: offset,
            },
            success: function (data) {
                if ('done' == data.data.offset) {
                    window.location.reload(true);
                } else {
                    if ($('#seopress_bot_log').val().length > 0) {
                        prev = $('#seopress_bot_log').val();
                    } else {
                        prev = '';
                    }
                    $('#seopress_bot_log').text(data.data.post_title + '\n' + prev);
                    self.process_offset(parseInt(data.data.offset), self);
                }
            },
        });
    };
    $('#seopress_launch_bot').on('click', function () {
        $('#seopress_bot_log').show();
        $(this).attr("disabled", "disabled");
        $('.spinner').css("visibility", "visible");
        $('.spinner').css("float", "none");
    });
});
