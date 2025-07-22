//Request Matomo Analytics
jQuery(document).ready(function ($) {
    //Ajax
    $('.spinner').css("visibility", "visible");
    $('.spinner').css("float", "none");
    $.ajax({
        method: 'GET',
        url: seopressAjaxRequestMatomoAnalytics.seopress_request_matomo_analytics,
        data: {
            action: 'seopress_request_matomo_analytics',
            _ajax_nonce: seopressAjaxRequestMatomoAnalytics.seopress_nonce,
        },
        success: function (data) {
            $('#seopress_matomo_dashboard_widget #submit').on('click', function () {
                window.history.pushState("", "", window.location.href + "&settings-updated=true");
            });
            if (window.location.hash === '#seopress_matomo_dashboard_widget&settings-updated=true') {
                if ($('#seopress_matomo_dashboard_widget .inside').length === 1 && window.location.hash !== '#seopress_matomo_dashboard_widget&settings-updated=true&reload=done') {
                    window.history.pushState("", "", window.location.href + "&reload=done");
                    window.location.reload(true);
                }
            }

            if (data.success) {
                //Graph
                if (typeof ctxseopress_matomo !== 'undefined') {
                    var data = {
                        labels: data.data.sessions_graph_labels,
                        datasets: [
                            {
                                label: data.data.sessions_graph_title,
                                fill: true,
                                lineTension: 0.1,
                                backgroundColor: "#9ED8FF",
                                borderColor: "#2C97DF",
                                borderCapStyle: 'butt',
                                borderDash: [],
                                borderDashOffset: 0.0,
                                borderJoinStyle: 'miter',
                                pointBorderColor: "#2C97DF",
                                pointBackgroundColor: "#9ED8FF",
                                pointBorderWidth: 1,
                                pointHoverRadius: 5,
                                pointHoverBackgroundColor: "#9ED8FF",
                                pointHoverBorderColor: "#2C97DF",
                                pointHoverBorderWidth: 2,
                                pointRadius: 2,
                                pointHitRadius: 10,
                                data: data.data.sessions_graph_data,
                                spanGaps: false,
                            }
                        ]
                    };
                    var myLineChart = new Chart(ctxseopress_matomo, {
                        type: 'line',
                        data: data,
                        options: {
                            scales: {
                                xAxes: [{
                                    display: false
                                }]
                            }
                        }
                    });
                }
            }
        },
        complete: function () {
            $('.spinner').css("visibility", "hidden");
        }
    });
});
