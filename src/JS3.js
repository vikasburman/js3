/*!
  * JS3 - JavaScript Style Sheet
  * Instead of putting programming in CSS, it puts CSS in a programming language.
  * 
  * Copyright © 2014 Vikas Burman. All rights reserved.
  * 
  * Licensed under the terms of the MIT license. You are free to use 'JS3' under any open source or 
  * commercial project, as long as this copyright header is left intact.
  * 
  *     Project: https://github.com/vikasburman/js3
  *     License: https://raw.github.com/vikasburman/js3/master/LICENSE.md
  *  Commercial: http://www.vikasburman.com/js3
  */
/*jslint indent: 4, maxerr: 50, white: true, vars: true, unparam: true,  */
/*global window */ 
(function() {
	"use strict";
	
	//// Private ////
	var CONST = {
		NAME: 'JS3',
		TITLE: 'JavaScript Style Sheets',
		VERSION: '0.1.1',
		COPYRIGHT: 'Copyright © 2014 Vikas Burman. All rights reserved.',
		URL: 'https://github.com/vikasburman/js3'
	};	
	var isArray = function(obj) { return obj && Object.prototype.toString.call(obj) === '[object Array]'; };
	var isFunction = function(obj) { return obj && typeof obj === 'function'; };
	var isLiteral = function(obj) { return obj && Object.prototype.toString.call(obj) === '[object Object]'; };
	
	var CSS = function(core, fileName) {
		var self = this;
		
		// css generation
		var stylesPlaceHolder = '%STYLES%';	
		var allItems = [];
		var id = '';
		var isLoaded = false;
		var isDirty = false;		
		var getPropValue = function(valueOrFunc) {
			var propValue = '';
			if (isFunction(valueOrFunc)) { 
				propValue = valueOrFunc.apply(self); 
			} else {
				propValue = valueOrFunc.toString();
			}
			if (propValue.substr(propValue.length - 1) !== ';') { propValue += ';'; }
			return propValue;
		};		
		var getStyles = function(props) { 
			var theStyles = '';
			var index = 0;
			var prop = null;
			for (index = 0; index < props.length; ++index) {
				prop = props[index];
				theStyles += ' ' + prop.apply(self);
			}
			return theStyles;
		};		
		var randomName = function() { 
			var S4 = function() { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); };
			return ("_" + S4() + S4() + '_' + S4() + '_' + S4() + '_' + S4() + '_' + S4() + S4() + S4());		
		};
		var getNewId = function() { return 'js3_' + fileName + randomName(); };
		var loadCSS = function() {
			// add new style definition
			var oldId = id;
			id = getNewId();
			var s = window.document.createElement('style');
			s.id = id;
			s.innerHTML = generateCSS();
			window.document.getElementsByTagName('head')[0].appendChild(s);
			
			// remove old style definition, if exists
			if (oldId) {
				var el = window.document.getElementById(oldId);
				el.parentNode.removeChild(el);
			}
			
			// set flags
			isLoaded = true;
			isDirty = false;
		};
		var unloadCSS = function() {
			if (isLoaded) {
				// remove style
				var el = window.document.getElementById(id);
				el.parentNode.removeChild(el);
				
				// reset flags
				id = '';
				isLoaded = false;
				isDirty = false;
			}	
		};
		var generateCSS = function() {
			var css = '';
			var item = null;
			var applyTo = '';
			var styles = [];
			var style = null;
			var itemCss = '';
			var allStyles = '';
			var index = 0;
			var index2 = 0;
			for (index = 0; index < allItems.length; ++index) {
				item = allItems[index];
				applyTo = item.applyTo();
				styles = item.styles;
				allStyles = '';
				for (index2 = 0; index2 < styles.length; ++index2) {
					style = styles[index2];
					allStyles += ' ' + style.apply(self);
				}
				itemCss = applyTo.replace(stylesPlaceHolder, allStyles);
				css += ' ' + itemCss;
			}	
			return css;
		};
		
		// creational
		var propWrapper = function(propName, propValueOrFunc, propValueArrayOrLiteral) {
			var wrapper = null;
			if (isFunction(propValueOrFunc)) {
				if (propValueArrayOrLiteral) {
					var getValueOrFunc = function() { return ''; };
					if (isArray(propValueArrayOrLiteral)) {
						getValueOrFunc = function() {
							var index = propValueOrFunc().apply(self);
							if (index < propValueArrayOrLiteral.length - 1) { return propValueArrayOrLiteral[index]; }	
							return '';
						};
					} else if (isLiteral(propValueArrayOrLiteral)) {
						getValueOrFunc = function() {
							var key = propValueOrFunc().apply(self);
							if (propValueArrayOrLiteral[key]) { return propValueArrayOrLiteral[key]; }
							return '';
						};
					}
					wrapper = function() { return propName + ': ' + getPropValue(getValueOrFunc()); };
				} else {
					// this propValueOrFunc can be a var or a custom function
					wrapper = function() { return propName + ': ' + getPropValue(propValueOrFunc); };
				}
			} else {
				wrapper = function() { return propName + ': ' + getPropValue(propValueOrFunc); };
			}
			return wrapper;		
		};
		var styleWrapper = function(styleArrayOrFunc, styleArrayOrLiteral) {
			var wrapper = null;
			if (isFunction(styleArrayOrFunc)) {
				if (styleArrayOrLiteral) {
					var getArray = function() { return []; };
					if (isArray(styleArrayOrLiteral)) {
						getArray = function() {
							var index = styleArrayOrFunc.apply(self);
							var value = null;
							if (index < styleArrayOrLiteral.length - 1) { value = styleArrayOrLiteral[index]; }	
							if (isArray(value)) { return value; }
							return [value];
						};
					} else if (isLiteral(styleArrayOrLiteral)) {
						getArray = function() {
							var key = styleArrayOrFunc.apply(self);
							var value = null;
							if (styleArrayOrLiteral[key]) { value = styleArrayOrLiteral[key]; }						
							if (isArray(value)) { return value; }
							return [value];
						};
					}
					wrapper = function() { return getStyles(getArray()); };	
				}
			}
			if (!wrapper) {
				wrapper = function() { return getStyles(isArray(styleArrayOrFunc) ? styleArrayOrFunc : [styleArrayOrFunc]); };
			}
			return wrapper;			
		};
		self.prop = function(propName, propValueOrFunc, propValueArrayOrLiteral) {
			return propWrapper(propName, propValueOrFunc, propValueArrayOrLiteral);
		};
		self.style = function(styleArrayOrFunc, styleArrayOrLiteral) {
			return styleWrapper(styleArrayOrFunc, styleArrayOrLiteral);
		};	
		
		// chained
		self.vars = function(para1, para2) {
			if (arguments.length === 2) {
				// name, value
				self.vars[para1] = function() { return para2; };
			} else if (isLiteral(para1)) {
				// { key1: value1, key2: value3, ... }
				var property = null;
				for (property in para1) {
					if (para1.hasOwnProperty(property) && self.vars[property]) {
						self.vars[property] = function() { return para1[property]; }; 
					}
				}
			}
			return self;
		};
		self.sel = function(name, selector) {
			self.sel[name] = function() { return selector.toString() + ' { ' + stylesPlaceHolder + ' }'; };
			return self;
		};		
		self.at = function(name, atRule, atRuleQueryOrIdentifier) {
			if (name) { self.at[name] = function() { return '@' + atRule.toString() + (atRuleQueryOrIdentifier ? ' ' + atRuleQueryOrIdentifier : '') + ' { ' +  stylesPlaceHolder + ' }'; }; }
			return self;
		};		
		self.props = function(name, propName, propValueOrFunc, propValueArrayOrLiteral) {
			if (name) { self.props[name] = propWrapper(propName, propValueOrFunc, propValueArrayOrLiteral); }
			return self;
		};	
		self.styles = function(name, styleArrayOrFunc, styleArrayOrLiteral) {
			if (name) { self.styles[name] = styleWrapper(styleArrayOrFunc, styleArrayOrLiteral); }
			return self;
		};
		self.apply = function(applyTo, styles) {
			allItems.push({applyTo: applyTo, styles: (isArray(styles) ? styles : [styles])});
			return self;
		};
		self.end = function() {
			self.reload();
		};
		
		// general
		self.id = function() { return id; };
		self.parent = core;
		self.name = function() { return fileName; };
		self.reload = function() { 
			loadCSS();
		};
		self.unload = function() { 
			if (isLoaded) { unloadCSS(); }
		};
		self.remove = function() {
			self.unload();
			self.parent.css.remove(self.name());
		};
	};
	var JS3 = function() {
		var core = this;
		
		// general 
		core.info = {
			name: function() { return CONST.NAME; },
			title: function() { return CONST.TITLE; },
			version: function() { return CONST.VERSION; },
			copyright: function() { return CONST.COPYRIGHT; },
			url: function() { return CONST.URL; }
		};
		
		// files
		var allFiles = [];
		core.all = function() { return allFiles; }
		
		// definition
		core.css = function(fileName) {
			if (!fileName) { throw 'CSS filename must be defined.'; }
			if (core[fileName]) { throw 'CSS file "' + fileName + '" is already loaded.'; }
			var myCSS = new CSS(core, fileName);
			core[fileName] = myCSS;
			allFiles.push(myCSS);
			return myCSS;
		};
		core.css.remove = function(fileName) {
			if (!fileName) { throw 'CSS filename must be defined.'; }
			if (!core[fileName]) { throw 'CSS file "' + fileName + '" is not loaded.'; }
			delete core[fileName];
			var index = 0;
			var css = null;
			var foundAt = -1;
			for (index = 0; index < allFiles.length; ++index) {
				css = allFiles[index];
				if (css.name() === fileName) { foundAt = index; break; }
			}
			if (foundAt !== -1) { allFiles.splice(foundAt, 1); }
		};
		
		// changes
		core.unloadAll = function() {
			var index = 0;
			var css = null;
			for (index = 0; index < allFiles.length; ++index) {
			   css = allFiles[index];
			   css.unload();
			}			
		};
		core.reloadAll = function() {
			var index = 0;
			var css = null;
			for (index = 0; index < allFiles.length; ++index) {
			   css = allFiles[index];
			   css.reload();
			}			
		};
		core.removeAll = function() {
			core.unloadAll();
			var index = 0;
			var css = null;
			for (index = 0; index < allFiles.length; ++index) {
			   css = allFiles[index];
			   delete core[css.name()];
			}
			allFiles = [];
		};
	};
	
	//// Public ////
	window.JS3 = new JS3();
}());
