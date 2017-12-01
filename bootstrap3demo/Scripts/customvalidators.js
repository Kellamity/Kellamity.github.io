(function () {
    function customDateFormatValidation(value, element) {
        return this.optional(element) || (Date.parseExact(value, "d/M/yyyy") !== null);
    }
    $.validator.addMethod('date', customDateFormatValidation);

    $.validator.addMethod('sqldatetime', function (value, element, parameters) {
        //if no value return true
        var minValue = new Date(1753, 00, 01);
        var maxValue = new Date(9999, 11, 31);
        if (Date.parse(value) < minValue) {
            return false;
        }
        return true;
    });
    $.validator.unobtrusive.adapters.addBool('sqldatetime');
})();

function requiredCheckboxGroup(value, element) {
    return !!value;
}
$.validator.addMethod('requiredcheckboxgroup', requiredCheckboxGroup);
$.validator.unobtrusive.adapters.addBool("requiredcheckboxgroup");

function requiredIfEnabled(value, element, params) {
    var $element = $(element);
    //skip disabled elements
    if ($element.prop('disabled')) {
        return true;
    }
    var actualvalue = $element.val();
    if ($.trim(value).length === 0 || actualvalue == ('false')) {
        return false;
    }
    return !!value;
}
$.validator.addMethod('requiredifenabled', requiredIfEnabled);
$.validator.unobtrusive.adapters.addBool('requiredifenabled');

jQuery.validator.setDefaults({
    onkeyup: function (element, event) {
        if (element.name in this.submitted || element == this.lastElement) {
            if (!this.check(element) && !this.invalid[element.name]) {
                return;
            }
            this.element(element);
        }
    }
});
