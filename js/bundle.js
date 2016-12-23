(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const rgbHex = require('rgb-hex');

document.addEventListener('DOMContentLoaded', function() {
    var runButton = document.getElementById('runButton');
    runButton.addEventListener('click', run);

    var addButton = document.getElementById('addButton');
    addButton.addEventListener('click', addInputGroup);

    if (!window.colourLover) {
        var colourLover = ColourLoverFactory.create();
        window.colourLover = colourLover;
    }
    
    colourLover.on('beforeload', function() {
        var $colourLoverMask = $("#colour-lover-mask");
        $colourLoverMask.css('visibility', 'visible');
    });
    
    colourLover.on('load', function(event, instance, colors) {
        var $colourLoverContent = $("#colour-lover-content");
        $colourLoverContent.empty();
        
        if (instance.page > 1) {
            // If we're on the first page of Colour Lover items don't show the back button
            var $colourLoverPrev = $($("#colour-lover-prev").html());
            $colourLoverPrev.click(function() {
                window.colourLover.prevPage();  
            });
            $colourLoverPrev.appendTo($colourLoverContent);
        } else {
            var $colourLoverItem = $($("#colour-lover-selector-template").html());
            $colourLoverItem.appendTo($colourLoverContent)[0];
        }
        
        for (var i = 0; i < colors.length; i++) {
            var color = colors[i];
            var $colourLoverItem = $($("#colour-lover-selector-template").html());
            $colourLoverItem.click(function() {
                var copyFrom = $('<textarea/>');
                var hexBgColor = '#' + rgbHex($(this).css('background-color'));
                copyFrom.text(hexBgColor);
                $('body').append(copyFrom);
                copyFrom.select();
                document.execCommand('copy');
                copyFrom.remove();
            });
            var el = $colourLoverItem.appendTo($colourLoverContent)[0];
            el.style.backgroundColor = '#' + color;
        }
        
        var $colourLoverNext = $($("#colour-lover-next").html());
        $colourLoverNext.click(function() {
            window.colourLover.nextPage();
        });
        $colourLoverNext.appendTo($colourLoverContent);
        var $colourLoverMask = $("#colour-lover-mask");
        $colourLoverMask.css('visibility', 'hidden');
    });
    
    colourLover.load();
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

ColourLoverFactory = {
    create: function() {
        var instance = $({});
        instance.requestUrl = "http://www.colourlovers.com/api/palettes/top?format=json&numResults=1",
            instance.page = 1,
            instance.colors = [],
            instance.load = function(callback) {
                this.loadPage(this.page, callback);
            },
            instance.loadPage = function(page, callback) {
                instance.trigger('beforeload');
                $.ajax({
                    url: this.requestUrl + "&resultOffset=" + page,
                    success: function(response) {
                        instance.colors = response[0].colors;
                        instance.trigger('load', [instance, instance.colors]);
                    },
                    dataType: 'json'
                });
            },
            instance.nextPage = function(callback) {
                this.loadPage(++this.page, callback);
            },
            instance.prevPage = function(callback) {
                this.loadPage(--this.page, callback);
            };
        return instance;
    }
}

// Load our previously saved data, if there is any, from local storage.
function loadChanges() {
    chrome.storage.sync.get('data', function(info) {
        var data = info.data;

        if (data && data.length) {
            data.forEach(function(el) {
                addInputGroup(el);
            });
        } else {
            addInputGroup();
        }
    });
}

// Gets the color data from the inputs.
function getColorDataFromInputs() {
    var inputRow = $('.input-row');
    var colorData = [];

    // Build our color data.
    inputRow.each(function(index) {
        var colorPicker = $(this).find('.color-picker');
        var selectorInput = $(this).find('.input-selector');

        var color = colorPicker.colorpicker('getValue');
        var selector = selectorInput.val().trim();

        if (selector.length > 0) {
            colorData.push({
                color: color,
                selector: selector
            });
        }
    });

    return colorData;
}

// Adds a new color group.
function addInputGroup(colorData) {
    var template, group, colorEl, selectorEl, colorInput;

    template = $("#color-group-template").html();
    group = $(template).appendTo('.content');

    // Get the children elements for setting loaded values.
    colorEl = group.find('.color-picker');
    selectorEl = group.find('.input-selector');
    colorInput = group.find('.input-color');

    if (colorData !== undefined) {
        // Fill the color and selector elements with the correct values.
        colorEl.colorpicker({
            color: colorData.color,
            format: 'rgb'
        });

        selectorEl.val(colorData.selector);
        colorInput.val(colorEl.data('colorpicker').color.toHex());
    } else {
        colorEl.colorpicker({
            format: 'rgb'
        });
    }
    
    // Make sure the background color of the button matches the current colorpicker value.
    var colorElementValue = colorEl.colorpicker('getValue');
    colorEl.css('background-color', colorElementValue);

    var colorPickerHandler = function() {
        var color, element;

        // set the color on the picker
        element = $(this);
        color = element.data('colorpicker').color.toHex();
        element.css('background-color', color);

        // Disable the color input while we set its value so we don't get into an infinite event loop
        colorInput.prop('disabled', true);
        colorInput.val(color);
        colorInput.prop('disabled', false);

        applyColorData(getColorDataFromInputs());
    }.bind(colorEl);
    
    // Set up the listener on the color picker to update the color element background
    colorEl.on('changeColor', colorPickerHandler);
    
    // Set a listener on the color input to update the color picker 
    $(colorInput).on('blur', function() {
        var color = $(this).val();
        colorEl.off('changeColor');
        colorEl.colorpicker('setValue', color);
        colorEl.css('background-color', color);
        colorEl.on('changeColor', colorPickerHandler);
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

},{"rgb-hex":2}],2:[function(require,module,exports){
'use strict';
/* eslint-disable no-mixed-operators */
module.exports = (red, green, blue, alpha) => {
	const isPercent = (red + (alpha || '')).toString().includes('%');

	if (typeof red === 'string') {
		const res = red.match(/(0?\.?\d{1,3})%?\b/g).map(Number);
		// TODO: use destructuring when targeting Node.js 6
		red = res[0];
		green = res[1];
		blue = res[2];
		alpha = res[3];
	} else if (alpha !== undefined) {
		alpha = parseFloat(alpha);
	}

	if (typeof red !== 'number' ||
		typeof green !== 'number' ||
		typeof blue !== 'number' ||
		red > 255 ||
		green > 255 ||
		blue > 255) {
		throw new TypeError('Expected three numbers below 256');
	}

	if (typeof alpha === 'number') {
		if (!isPercent && alpha >= 0 && alpha <= 1) {
			alpha = Math.round(255 * alpha);
		} else if (isPercent && alpha >= 0 && alpha <= 100) {
			alpha = Math.round(255 * alpha / 100);
		} else {
			throw new TypeError(`Expected alpha value (${alpha}) as a fraction or percentage`);
		}
		alpha = (alpha | 1 << 8).toString(16).slice(1);
	} else {
		alpha = '';
	}

	return ((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1) + alpha;
};

},{}]},{},[1]);
