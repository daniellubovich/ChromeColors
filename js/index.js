document.addEventListener('DOMContentLoaded', function() {
    var runButton = document.getElementById('runButton');
    runButton.addEventListener('click', run);

    var addButton = document.getElementById('addButton');
    addButton.addEventListener('click', addInputGroup);

    loadChanges();
});

// Runs when user saves. Saves color data and applies it to the page.
function run() {
    saveChanges();
    applyColorData(getColorDataFromInputs());
}

// Save our current data to local storage.
function saveChanges() {
    var data = getColorDataFromInputs();

    chrome.storage.sync.set({
        'data': data
    }, function() {
        console.log('saved');
    });
}

// Load our previously saved data, if there is any, from local storage.
function loadChanges() {
    chrome.storage.sync.get('data', function(info) {
        var data = info.data;

        if (data.length) {
            data.forEach(function(el) {
                var group, colorEl, selectorEl;
                addInputGroup(el);
            });
        } else {
            addInputGroup();
        }
    });
}

// Gets the color data from the inputs.
function getColorDataFromInputs() {
    let colorGroups = $('.color-group');
    var colorData = [];

    // Build our color data.
    colorGroups.each(function(index) {
        var colorInput = $(this).find('.input-color');
        var selectorInput = $(this).find('.input-selector');

        var color = colorInput.colorpicker('getValue');
        var selector = selectorInput.val();

        colorData.push({
            color: color,
            selector: selector
        });
    });

    return colorData;
}

// Adds a new color group.
function addInputGroup(colorData) {
    var template, group, colorEl, selectorEl;

    template = $("#color-group-template").html();
    group = $(template).appendTo('.content');

    // Get the children elements for setting loaded values.
    colorEl = group.find('.input-color');
    selectorEl = group.find('.input-selector');

    if (colorData !== undefined) {
        // Fill the color and selector elements with the correct values.
        colorEl.colorpicker({
            color: colorData.color,
            format: 'rgb'
        });

        selectorEl.val(colorData.selector);
    } else {
        colorEl.colorpicker({
            format: 'rgb'
        });
    }

    // Make sure the background color of the button matches the current colorpicker value.
    var colorElementValue = colorEl.colorpicker('getValue');
    colorEl.css('background-color', colorElementValue);

    // Set up the listener to apply any changes.
    colorEl.on('changeColor', function(e) {
        var color, element;

        element = $(this);
        color = element.colorpicker('getValue');
        element.css('background-color', color);
        applyColorData(getColorDataFromInputs());
    });
}

// Injects the colors into the page with /js/content.js
function applyColorData(colorData) {
    chrome.tabs.executeScript({
        code: 'var colorParams = ' + JSON.stringify(colorData)
    }, function() {
        chrome.tabs.executeScript({
            file: '/js/content.js'
        });
    });
}
