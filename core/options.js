var settings;
$(document).ready(function() {
    chrome['storage']['sync'].get("settings", function(a) {
        settings = a.settings || {};
        if (!settings.bitrateOption) {
            settings.bitrateOption = "bitrate_only"
        }
        if (!settings.downloadAllButton) {
            settings.downloadAllButton = 0
        }
        if (!settings.disableMonetiz) {
            settings.disableMonetiz = 0
        }
        $("input[name=bitrate_info][value=" + settings.bitrateOption + "]").prop("checked", true);
        $("input[name=download_all_button][value=" + settings.downloadAllButton + "]").prop("checked", true);
        if (settings.disableMonetiz) {
            $("input[name=disable_monetiz]").prop("checked", true)
        }
    });
    $("form").change(function() {
        settings.bitrateOption = $("input[name=bitrate_info]:checked", this).val();
        settings.downloadAllButton = parseInt($("input[name=download_all_button]:checked", this).val());
        settings.disableMonetiz = ($("input[name=disable_monetiz]", this).is(":checked")) ? 1 : 0;
        if (settings.disableMonetiz) {
            $("#adv_notice_on").hide();
            $("#adv_notice_off").show()
        } else {
            $("#adv_notice_on").show();
            $("#adv_notice_off").hide()
        }
        chrome['storage']['sync'].set({
            settings: settings
        }, function() {
            $("#result").hide().text("Изменения сохранены!").show("slow");
            setTimeout(function() {
                $("#result").hide("slow")
            }, 5000)
        })
    })
});