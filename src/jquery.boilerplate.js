// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.

;(function ( $, window, document, undefined ) {

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "GivaktForm",
				defaults = {
					  url: 'https://docs.google.com/forms/d/1OVBAxKirWvr7rAdJTMIrfj2lEKNWuwfAVLV2UD3Yd5M/formResponse',
						callback: 'formComplete',
						formId: '#givakt-form',
						inputClass: '.givakt-input',
						submitBtn: 'button',
						regExpPatterns: {
								letnumb: /^[a-zåäöA-ZÅÄÖ0-9\s.&-]+$/,
								letters: /^[a-zåäöA-ZÅÄÖ\s.&-]+$/,
								numbers: /^[0-9]+$/,
								email: null
						}
				};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				this.element = element;
				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don't want to alter the default options for
				// future instances of the plugin
				this.options = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
				console.log('hey');
		}

		Plugin.prototype = {
				init: function () {
						// Place initialization logic here
						// You already have access to the DOM element and
						// the options via the instance, e.g. this.element
						// and this.options
						// you can add more functions like the one below and
						// call them like so: this.yourOtherFunction(this.element, this.options).
						this.noErrors = true;
						this.inputs = this.options.formId + " " + this.options.inputClass;
						this.sendBtn = this.options.formId + " " + this.options.submitBtn;
						var that = this;

						$(this.inputs).on('blur', function() {
								that.validateOnBlur($(this));
						});

						/*$(this.sendBtn).on('click', function() {
								that.resetVals();
								console.time('preptime');
								that.prepareForm();
						});*/

						$(this.options.formId).submit(function(event) {
					    that.resetVals();
					    console.time('preptime');
					    that.prepareForm();
					    event.preventDefault();
					    return false;
					  });
				},

				resetVals: function () {
					this.noErrors = true;
					console.timeEnd('preptime');
				},

				validateOnBlur: function (elem) {
						var that = this;
						var pattern = this.options.regExpPatterns[elem.data('validate')];
						var elemVal = elem.val();
						if (pattern && elemVal != '') {
								that.validateInput(elem, elemVal, pattern);
						}
				},

				validateInput: function (elem, input, pattern) {
					  console.log(input);
					  console.log(pattern.test(input))
						if (!pattern.test(input)) {
								elem.addClass('error');
								this.noErrors = false;
						} else {
								elem.removeClass('error');
						}
				},

				addData: function () {
					  var finalData = {};
					  $(this.inputs).each(function () {
					  	finalData[$(this).data('field')] = $(this).val();
					  });
						console.log(finalData);
						return finalData;
				},

				sendForm: function (validData) {
					  var that = this;
						$.ajax({
								type: 'POST',
								url: this.options.url,
								data: validData,
								crossDomain: true,
								statusCode: {
										0: function() {
												that.options.callback();
										},
										200: function() {
												that.options.callback();
										}
								}
						});
						console.timeEnd('preptime');
				},

				prepareForm: function () {
						var that = this;
						$(this.inputs).each(function () {
							that.validateInput($(this), $(this).val(), that.options.regExpPatterns[$(this).data('validate')]);
						});
						console.log(this.noErrors);
						if (this.noErrors) {
								this.sendForm(this.addData());
						}
				}
		};

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});
		};

})( jQuery, window, document );
