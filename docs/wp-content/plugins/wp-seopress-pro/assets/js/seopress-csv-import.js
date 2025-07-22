/*global ajaxurl, seopress_csv_import_params */
; (function ($, window) {

    /**
     * metadatasImportForm handles the import process.
     */
    var metadatasImportForm = function ($form) {
        this.$form = $form;
        this.xhr = false;
        this.mapping = seopress_csv_import_params.mapping;
        this.position = 0;
        this.file = seopress_csv_import_params.file;
        this.delimiter = seopress_csv_import_params.delimiter;
        this.import_ignore_metadata = seopress_csv_import_params.import_ignore_metadata;
        this.security = seopress_csv_import_params.import_nonce;

        // Number of import successes/failures.
        this.imported = 0;
        this.failed = 0;
        this.updated = 0;
        this.skipped = 0;

        // Initial state.
        this.$form.find('.seopress-importer-progress').val(0);

        this.run_import = this.run_import.bind(this);

        // Start importing.
        this.run_import();
    };

    /**
     * Run the import in batches until finished.
     */
    metadatasImportForm.prototype.run_import = function () {
        var $this = this;
        $.ajax({
            type: 'POST',
            url: ajaxurl,
            data: {
                action: 'seopress_do_ajax_metadatas_import',
                position: $this.position,
                mapping: $this.mapping,
                file: $this.file,
                delimiter: $this.delimiter,
                import_ignore_metadata: $this.import_ignore_metadata,
                security: $this.security
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $this.position = response.data.position;
                    $this.imported += response.data.imported;
                    $this.failed += response.data.failed;
                    $this.updated += response.data.updated;
                    $this.skipped += response.data.skipped;
                    $this.$form.find('.seopress-importer-progress').val(response.data.percentage);

                    if ('done' === response.data.position) {
                        window.location = response.data.url + '&metadatas-imported=' + parseInt($this.imported, 10) + '&metadatas-failed=' + parseInt($this.failed, 10) + '&metadatas-updated=' + parseInt($this.updated, 10) + '&metadatas-skipped=' + parseInt($this.skipped, 10);
                    } else {
                        $this.run_import();
                    }
                }
            }
        }).fail(function (response) {
            window.console.log(response);
        });
    };

    /**
     * Function to call metadatasImportForm on jQuery selector.
     */
    $.fn.seopress_csv_importer = function () {
        new metadatasImportForm(this);
        return this;
    };

    $('.seopress-importer').seopress_csv_importer();

})(jQuery, window);
