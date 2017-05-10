$(document).ready(function () {
    if (typeof document.forms[0] === 'undefined') {
        return;
    }
    if (!$('form').data('validator')) {
        return;
    }
    var validator = $.data($('form')[0], 'validator').settings;
    validator.success = function (error) {
        var container = error.data("unobtrusiveContainer"),
            replaceAttrValue = container.attr("data-valmsg-replace"),
            replace = replaceAttrValue ? $.parseJSON(replaceAttrValue) : null;
        if (container) {
            container.addClass("field-validation-valid").removeClass("field-validation-error");
            error.removeData("unobtrusiveContainer");

            var parent = container.parent().closest(".form-group");
            parent.removeClass('has-error');

            if (replace) {
                container.empty();
            }
        }
    };

    //I think this is to override invalidHandler
    //validator.error = function (event, validator) {
    //    var container = $(this).find("[data-valmsg-summary=true]"),
    //        list = container.find("ul");

    //    if (list && list.length && validator.errorList.length) {
    //        list.empty();
    //        container.addClass("validation-summary-errors").removeClass("validation-summary-valid");

    //        $.each(validator.errorList, function () {
    //            $("<li />").html(this.message).appendTo(list);
    //        });
    //    }
    //};
    validator.errorPlacement = function (error, inputElement) {
        var container = $('form').find("[data-valmsg-for='" + escapeAttributeValue(inputElement[0].name) + "']"),
        replaceAttrValue = container.attr("data-valmsg-replace"),
        replace = replaceAttrValue ? $.parseJSON(replaceAttrValue) !== false : null;
        container.removeClass("field-validation-valid").addClass("field-validation-error");
        error.data("unobtrusiveContainer", container).addClass('help-block alert alert-danger');
        if (error.find('glyphicon-alert').length === 0) {
            error.prepend('<span class="glyphicon glyphicon-alert"></span>');
        }
        var parent = container.parent().closest(".form-group");
        parent.addClass('has-error');

        if (replace) {
            container.empty();
            error.removeClass("input-validation-error").appendTo(container);
        }
        else {
            error.hide();
        }
    };
});

function escapeElementName(name) {
    if (name) {
        name = name.replace(".", "_").replace("[", "_").replace("]", "_");
    }
    return name;
}

function escapeAttributeValue(value) {
    // As mentioned on http://api.jquery.com/category/selectors/
    return value.replace(/([!"#$%&'()*+,./:;<=>?@\[\\\]^`{|}~])/g, "\\$1");
}
