debugger
var filteredElements = {},
    colorParams = colorParams || [],
    allElements = document.getElementsByTagName('*');

// find all elements with a 'background-color' style and store them in a hash table for quick lookup later
for (var i = 0; i < allElements.length; i++) {
    var el = allElements[i],
        elStyles = window.getComputedStyle(el);

    if (elStyles.hasOwnProperty('background-color')) {
        if (!el.hasOwnProperty('originalBackgroundColor')) {
            var color = elStyles['background-color'].toLowerCase().replace(/ /g, '');
            el.originalBackgroundColor = color;
        }
        var backgroundColor = el.originalBackgroundColor;
        filteredElements.hasOwnProperty(backgroundColor) ? filteredElements[backgroundColor].push(el) : (filteredElements[backgroundColor] = [el]);
    }
}

colorParams.forEach(function(colorObject) {
    var color = hexToRgb(colorObject.selector);
    if (filteredElements.hasOwnProperty(color)) {
        var elements = filteredElements[color];
        elements.forEach(function(el) {
            el.style.backgroundColor = colorObject.color;
        });
    }
});

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 'rgb(' + parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) + ')' : null;
}