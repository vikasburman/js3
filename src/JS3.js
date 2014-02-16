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
/*jslint indent: 4, maxerr: 50, white: true, vars: true, unparam: true, plusplus: true, bitwise: true */
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
		
		// generation
		var stylesPlaceHolder = '$TYLE$';	
		var allItems = [];
		var id = '';
		var isLoaded = false;
		var xref = false;
		var isDirty = false;
		var isDone = false;
		var isLoadAfterDone = false;
		var isEnd = false;
		var selectorScopes = [];
		var valueTypes = {
			vars: 'variable',
			decl: 'declaration',
			style: 'style',
			sel: 'selector',
			at: 'at-rule'
		};			
		var randomName = function() { 
			var S4 = function() { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); };
			return ("_" + S4() + S4() + '_' + S4() + '_' + S4() + '_' + S4() + '_' + S4() + S4() + S4());		
		};
		var getNewId = function() { return 'js3_' + fileName + randomName(); };
		var generateStyles = function(styles) {
			var allStyles = '';
			var style = null;		
			var index = 0;			
			for (index = 0; index < styles.length; ++index) {
				style = styles[index];
				allStyles += ' ' + style.apply(self);
			}
			return allStyles;
		};
		var generateCSS = function() {
			var css = '';
			var item = null;
			var applyTo = '';
			var itemCss = '';
			var scopedItemCss = '';
			var styles = '';
			var index = 0;
			var index2 = 0;
			var scope = '';
			for (index = 0; index < allItems.length; ++index) {
				item = allItems[index];
				applyTo = item.applyTo();
				styles = applyTo.replace(stylesPlaceHolder, generateStyles(item.styles)) ;
				if (item.applyTo.type() === valueTypes.sel &&
					item.applyTo.raw.canBeScoped() && 
					self.parent.settings.isConsiderScopes && 
					selectorScopes.length > 0) {
					for (index2 = 0; index2 < selectorScopes.length; ++index2) {
						scope = selectorScopes[index2];
						scopedItemCss += (scope + ' ' + styles);
					}
					itemCss = scopedItemCss;	
				} else {
					itemCss = styles;
				}
				css += ' ' + itemCss;
			}	
			return css;
		};		
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
		
		// definition
		var stylesAdded = function(count, type, to) {
			isDirty = true;
			if (isLoaded && self.parent.settings.isLogChanges) {
				window.console.log(count.toString() + ' new style' + (count > 1 ? 's are' : ' is') + ' added to ' + type  + ' "' + to + '".');
			}
			if (isLoaded && self.parent.settings.isReloadOnChange) {
				self.reload();
			}			
		};
		var styleRemoved = function(name, type, from) {
			isDirty = true;
			if (isLoaded && self.parent.settings.isLogChanges) {
				window.console.log('Style "' + name + '" is removed from ' + type  + ' "' + from + '".');
			}
			if (isLoaded && self.parent.settings.isReloadOnChange) {
				self.reload();
			}			
		};
		var valueChanged = function(type, name, oldValue, newValue) {
			isDirty = true;
			if (isLoaded && self.parent.settings.isLogChanges) {
				window.console.log('Value of ' + type + ' "' + name + '" is changed from "' + oldValue + '" to "' + newValue + '".');
			}
			if (isLoaded && self.parent.settings.isReloadOnChange) {
				self.reload();
			}	
		};
		var varValueWrapperFunc = function(varValueOrFunc) {
			var getValue = function() { return null; };
			if (varValueOrFunc) {
				if (isFunction(varValueOrFunc)) {
					// this is a function
					getValue = function() {
						var value = varValueOrFunc.apply(self);
						return value;
					};	
				} else {
					// this is value itself
					getValue = function() {
						var value = varValueOrFunc;
						return value;
					};					
				}
			}
			getValue.plain = function() { return getValue(true); };
			return getValue;
		};		
		var propValueWrapperFunc = function(valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone) {
			var getValue = function() { return ''; };
			if (valueOrValueFuncOrCondFunc) {
				if (isFunction(valueOrValueFuncOrCondFunc)) {
					if (valueSuffixOrValueArrayOrValueLiteral) {
						if (isArray(valueSuffixOrValueArrayOrValueLiteral)) {
							// this is values collection in an array
							getValue = function(isSkipAddingSuffix) {
								var value = '';
								var valueIndex = valueOrValueFuncOrCondFunc.apply(self);
								if (valueIndex <= valueSuffixOrValueArrayOrValueLiteral.length) {
									value = valueSuffixOrValueArrayOrValueLiteral[valueIndex];
								}
								if (value && valueSuffixOrFuncOrNone && !isSkipAddingSuffix) {
									if (isFunction(valueSuffixOrFuncOrNone)) {
										value = value.toString() + (valueSuffixOrFuncOrNone.apply(self)).toString();
									} else {
										value = value.toString() + valueSuffixOrFuncOrNone.toString();
									}
								}
								return value;
							};
						} else if (isLiteral(valueSuffixOrValueArrayOrValueLiteral)) {
							// this is values collection in a literal
							getValue = function(isSkipAddingSuffix) {
								var value = '';
								var valueKey = valueOrValueFuncOrCondFunc.apply(self);
								if (valueSuffixOrValueArrayOrValueLiteral[valueKey]) {
									value = valueSuffixOrValueArrayOrValueLiteral[valueKey];
								}
								if (value && valueSuffixOrFuncOrNone && !isSkipAddingSuffix) {
									if (isFunction(valueSuffixOrFuncOrNone)) {
										value = value.toString() + (valueSuffixOrFuncOrNone.apply(self)).toString();
									} else {
										value = value.toString() + valueSuffixOrFuncOrNone.toString();
									}
								}
								return value;
							};						
						} else {
							// this is a value function with value suffix
							getValue = function(isSkipAddingSuffix) {
								var value = valueOrValueFuncOrCondFunc.apply(self);
								if (value) {
									if (isFunction(valueSuffixOrValueArrayOrValueLiteral) && !isSkipAddingSuffix) {
										value = value.toString() + (valueSuffixOrValueArrayOrValueLiteral.apply(self)).toString();
									} else {
										value = value.toString() + valueSuffixOrValueArrayOrValueLiteral.toString();
									}
								}
								return value;
							};							
						}
					} else {
						// this is value function without value suffix
						getValue = function() {
							var value = valueOrValueFuncOrCondFunc.apply(self);
							return value;
						};					
					}
				} else {
					// this is plain value
					getValue = function(isSkipAddingSuffix) {
						var value = valueOrValueFuncOrCondFunc;
						if (value && valueSuffixOrValueArrayOrValueLiteral && !isSkipAddingSuffix) {
							if (isFunction(valueSuffixOrValueArrayOrValueLiteral)) {
								value = value.toString() + (valueSuffixOrValueArrayOrValueLiteral.apply(self)).toString();
							} else {
								value = value.toString() + valueSuffixOrValueArrayOrValueLiteral.toString();
							}
						}					
						return value;
					};					
				}
			}
			getValue.plain = function() { return getValue(true); };
			getValue.last = {};
			getValue.last.valueOrValueFuncOrCondFunc = valueOrValueFuncOrCondFunc;
			getValue.last.valueSuffixOrValueArrayOrValueLiteral = valueSuffixOrValueArrayOrValueLiteral;
			getValue.last.valueSuffixOrFuncOrNone = valueSuffixOrFuncOrNone;
			return getValue;
		};
		var styleValueWrapperFunc = function(declArrayOrDeclArrayFuncOrCondFunc, declArrayOrDeclLiteral) {
			var getValue = function() { return []; };
			var getAsArray = function(value) { 
				if (!value) { value = []; }
				if (!isArray(value)) { value = [value]; }
				return value;
			};
			if (declArrayOrDeclArrayFuncOrCondFunc) {
				if (isFunction(declArrayOrDeclArrayFuncOrCondFunc)) {
					if (declArrayOrDeclLiteral) {
						if (isArray(declArrayOrDeclLiteral)) {
							// this is styles collection in an array
							getValue = function() {
								var value = [];
								var valueIndex = declArrayOrDeclArrayFuncOrCondFunc.apply(self);
								if (valueIndex <= declArrayOrDeclLiteral.length) {
									value = getAsArray(declArrayOrDeclLiteral[valueIndex]);
								}
								return value;
							};
						} else if (isLiteral(declArrayOrDeclLiteral)) {
							// this is styles collection in a literal
							getValue = function() {
								var value = [];
								var valueKey = declArrayOrDeclArrayFuncOrCondFunc.apply(self);
								if (declArrayOrDeclLiteral[valueKey]) {
									value = getAsArray(declArrayOrDeclLiteral[valueKey]);
								}
								return value;
							};						
						} else {
							// this is an invalid argument
							throw 'invalid argument';
						}
					} else {
						if (isFunction(declArrayOrDeclArrayFuncOrCondFunc.type) && 
							declArrayOrDeclArrayFuncOrCondFunc.type() === valueTypes.decl) {
							// this is single declaration
							getValue = function() {
								var value = getAsArray(declArrayOrDeclArrayFuncOrCondFunc);
								return value;
							};						
						} else {
							// this is a custom function
							getValue = function() {
								var value = getAsArray(declArrayOrDeclArrayFuncOrCondFunc.apply(self));
								return value;
							};
						}
					}
				} else {
					if (isArray(declArrayOrDeclArrayFuncOrCondFunc)) {
						// this is a declarations array
						getValue = function() {
							var value = declArrayOrDeclArrayFuncOrCondFunc;
							return value;
						};
					} else {
						// this is an invalid argument
						throw 'invalid argument';
					}
				}
			}
			getValue.plain = function() { return getValue(); };
			getValue.last = {};
			getValue.last.declArrayOrDeclArrayFuncOrCondFunc = declArrayOrDeclArrayFuncOrCondFunc;
			getValue.last.declArrayOrDeclLiteral = declArrayOrDeclLiteral;
			return getValue;
		};		
		var selValueWrapperFunc = function(selectorOrFunc) {
			var getValue = function() { return ''; };
			var getCompleteSelector = function(selector) { return selector + ' {' + stylesPlaceHolder + '}'; };
			if (selectorOrFunc) {
				if (isFunction(selectorOrFunc)) {
					// this is a function
					getValue = function(isSkipAddingSuffix) {
						var value = selectorOrFunc.apply(self);
						if (value && !isSkipAddingSuffix) { value = getCompleteSelector(value); }
						return value;
					};	
				} else {
					// this is value itself
					getValue = function(isSkipAddingSuffix) {
						var value = selectorOrFunc;
						if (value && !isSkipAddingSuffix) { value = getCompleteSelector(value); }
						return value;
					};					
				}
			}
			getValue.plain = function() { return getValue(true); };
			return getValue;
		};		
		var atValueWrapperFunc = function(atRuleQueryOrIdentifierOrFunc) {
			var getValue = function() { return ''; };
			if (arguments.lenhth > 0) {
				if (isFunction(atRuleQueryOrIdentifierOrFunc)) {
					// this is a function
					getValue = function() {
						var value = atRuleQueryOrIdentifierOrFunc.apply(self).toString();
						return value;
					};	
				} else {
					// this is value itself
					getValue = function() {
						var value = atRuleQueryOrIdentifierOrFunc.toString();
						return value;
					};					
				}
			}
			getValue.plain = function() { return getValue(true); };
			return getValue;
		};			
		var varWrapper = function(varName, varValueWrapper) {
			var wrapper = function(newVarValueOrFunc) {
				if (newVarValueOrFunc) { 
					var oldValue = varValueWrapper(); 
					varValueWrapper = varValueWrapperFunc(newVarValueOrFunc); 
					valueChanged(valueTypes.vars, varName, oldValue, varValueWrapper()); 
				}
				return varValueWrapper();
			};
			wrapper.type = function() { return valueTypes.vars; };
			wrapper.raw = {};
			wrapper.raw.name = function() { return varName; };
			wrapper.raw.value = function() { return varValueWrapper.plain(); };
			wrapper.raw.type = function() { return typeof wrapper.raw.value(); };
			self.parent.ex.me(self, wrapper, wrapper.type(), wrapper.raw.type(), wrapper.raw.name());
			return wrapper;
		};
		var declWrapper = function(name, propName, propValueWrapper) {
			var getDeclaration = function(propValue) {
				if (propValue) { propValue = propValue.toString(); }
				if (propValue.substr(propValue.length - 1 !== ';')) { propValue += ';'; }
				return propName + ':' + propValue;
			};
			var wrapper = function(valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone) {
				if (arguments.length > 0) { 
					var oldValue = getDeclaration(propValueWrapper()); 
					if (!valueSuffixOrValueArrayOrValueLiteral) { valueSuffixOrValueArrayOrValueLiteral = propValueWrapper.last.valueSuffixOrValueArrayOrValueLiteral; }
					if (!valueSuffixOrFuncOrNone) { valueSuffixOrFuncOrNone = propValueWrapper.last.valueSuffixOrFuncOrNone; }
					propValueWrapper = propValueWrapperFunc(valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone);
					valueChanged(valueTypes.decl, name, oldValue, getDeclaration(propValueWrapper())); 
				}
				return getDeclaration(propValueWrapper());
			};
			wrapper.type = function() { return valueTypes.decl; };
			wrapper.raw = {};
			wrapper.raw.name = function() { return name; };
			wrapper.raw.property = function() { return propName; };
			wrapper.raw.value = function() { return propValueWrapper.plain(); };
			wrapper.raw.type = function() { return typeof wrapper.raw.value(); };
			wrapper.raw.suffix = function() {
				var fullValue = propValueWrapper();
				var justValue = wrapper.prop.value();
				return fullValue.replace(justValue, '');
			};
			self.parent.ex.me(self, wrapper, wrapper.type(), wrapper.raw.type(), wrapper.raw.property());
			return wrapper;
		};
		var styleWrapper = function(styleName, styleValueWrapper) {
			var getStyles = function(props) { 
				var theStyles = '';
				var index = 0;
				var prop = null;
				for (index = 0; index < props.length; ++index) {
					prop = props[index];
					theStyles += prop.apply(self);
				}
				return theStyles;
			};				
			var wrapper = function(declArrayOrDeclArrayFuncOrCondFunc, declArrayOrDeclLiteral) {
				if (arguments.length > 0) { 
					var oldValue = getStyles(styleValueWrapper()); 
					if (!declArrayOrDeclLiteral) { declArrayOrDeclLiteral = styleValueWrapper.last.declArrayOrDeclLiteral; }
					styleValueWrapper = styleValueWrapperFunc(declArrayOrDeclArrayFuncOrCondFunc, declArrayOrDeclLiteral);
					valueChanged(valueTypes.style, styleName, oldValue, getStyles(styleValueWrapper())); 
				}
				return getStyles(styleValueWrapper());
			};
			wrapper.type = function() { return valueTypes.style; };
			wrapper.attach = function(selsOrAts) { self.attach(self.styles[styleName], selsOrAts); };
			wrapper.detach = function(selsOrAts) { self.detach(self.styles[styleName], selsOrAts); };
			wrapper.add = function(declArray, isInsertOnTop) {
				var processedDeclArray = styleValueWrapper.plain();
				processedDeclArray = (isArray(processedDeclArray) ? processedDeclArray.slice(0) : [processedDeclArray]);
				declArray = (isArray(declArray) ? declArray : [declArray]);
				if (isInsertOnTop) { 
					processedDeclArray = declArray.concat(processedDeclArray);
				} else {
					processedDeclArray = processedDeclArray.concat(declArray);
				}
				wrapper(processedDeclArray); // update it
			};
			wrapper.remove = function(namedDecl) {
				var processedDeclArray = styleValueWrapper.plain();
				processedDeclArray = (isArray(processedDeclArray) ? processedDeclArray.slice(0) : [processedDeclArray]);
				if (!isFunction(namedDecl.type) && namedDecl.type() !== valueTypes.decl) { throw 'invalid argument'; }
				var index = 0;
				var decl = null;
				var namedDeclName = namedDecl.raw.name();
				var foundAt = -1;
				for (index = 0; index < processedDeclArray.length; ++index) {
					decl = processedDeclArray[index];
					if (decl.raw.name() === namedDeclName) {
						foundAt = index;
						break;
					}
				}
				if (foundAt !== -1) {
					processedDeclArray.splice(foundAt, 1); // remove it
				}
				wrapper(processedDeclArray); // update it			
			};
			wrapper.raw = {};
			wrapper.raw.name = function() { return styleName; };
			wrapper.raw.value = function() { return styleValueWrapper.plain(); };
			wrapper.raw.type = function() { return typeof wrapper.raw.value(); };
			return wrapper;			
		};
		var selWrapper = function(selName, canBeScoped, selValueWrapper) {
			canBeScoped = (canBeScoped || false);
			var wrapper = function(newSelectorOrFunc) {
				if (newSelectorOrFunc) { 
					var oldValue = selValueWrapper(); 
					selValueWrapper = selValueWrapperFunc(newSelectorOrFunc); 
					valueChanged(valueTypes.sel, selName, oldValue, selValueWrapper()); 
				}
				return selValueWrapper();
			};
			wrapper.type = function() { return valueTypes.sel; };
			wrapper.apply = function(styles) { self.apply(self.sel[selName], styles); };
			wrapper.clear = function(namedStyle) { self.clear(self.sel[selName], namedStyle); };
			wrapper.raw = {};
			wrapper.raw.name = function() { return selName; };
			wrapper.raw.canBeScoped = function() { return canBeScoped; };
			wrapper.raw.value = function() { return selValueWrapper.plain(); };
			wrapper.raw.type = function() { return typeof wrapper.raw.value(); };
			return wrapper;	
		};
		var atWrapper = function(atName, atRule, atValueWrapper) {
			var atRuleDeclaration = function() {
				return '@' + atRule + ' {' + stylesPlaceHolder + '}';
			};
			var wrapper = function(newAtRuleQueryOrIdentifierOrFunc) {
				if (newAtRuleQueryOrIdentifierOrFunc) { 
					var oldValue = atRuleDeclaration(atValueWrapper()); 
					atValueWrapper = atValueWrapperFunc(newAtRuleQueryOrIdentifierOrFunc); 
					valueChanged(valueTypes.at, atName, oldValue, atRuleDeclaration(atValueWrapper())); 
				}
				return atRuleDeclaration(atValueWrapper());
			};
			wrapper.type = function() { return valueTypes.at; };
			wrapper.apply = function(styles) { self.apply(self.at[atName], styles); };
			wrapper.clear = function(namedStyle) { self.clear(self.at[atName], namedStyle); };		
			wrapper.raw = {};
			wrapper.raw.name = function() { return atName; };
			wrapper.raw.rule = function() { return atRule; };
			wrapper.raw.value = function() { return atValueWrapper.plain(); };
			wrapper.raw.type = function() { return typeof wrapper.raw.value(); };
			return wrapper;			
		};
		self.xref = function() {
			if (arguments.length > 0) { 
				self.parent.xref(fileName, Array.prototype.slice.call(arguments, 0)); 
				xref = true;
			}
			return self;
		};
		self.decl = function(propName, valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone) {
			return declWrapper(randomName(), propName, propValueWrapperFunc(valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone));
		};
		self.style = function(declArrayOrDeclArrayFuncOrCondFunc, declArrayOrDeclLiteral) {
			return styleWrapper(randomName(), styleValueWrapperFunc(declArrayOrDeclArrayFuncOrCondFunc, declArrayOrDeclLiteral));
		};	
		self.vars = function(para1, para2) {
			if (arguments.length === 2) {
				// name, value
				if (self.vars[para1]) { throw 'Variable "' + para1 + '" already defined.'; }
				self.vars[para1] = varWrapper(para1, varValueWrapperFunc(para2));
			} else if (isLiteral(para1)) {
				// { key1: value1, key2: value3, ... }
				var property = null;
				for (property in para1) {
					if (para1.hasOwnProperty(property)) {
						if (self.vars[property]) { throw 'Variable "' + property + '" already defined.'; }
						self.vars[property] = varWrapper(property, varValueWrapperFunc(para1[property])); 
					}
				}
			}
			return self;
		};
		self.sel = function(name, selectorOrFunc, canBeScoped) {
			if (name) { self.sel[name] = selWrapper(name, canBeScoped, selValueWrapperFunc(selectorOrFunc)); }
			return self;
		};		
		self.at = function(name, atRule, atRuleQueryOrIdentifierOrFunc) {
			if (name) { self.at[name] = atWrapper(name, atRule, atValueWrapperFunc(atRuleQueryOrIdentifierOrFunc)); }
			return self;
		};		
		self.decls = function(name, propName, valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone) {
			if (name) { self.decls[name] = declWrapper(name, propName, propValueWrapperFunc(valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone)); }
			return self;
		};	
		self.styles = function(name, declArrayOrDeclArrayFuncOrCondFunc, declArrayOrDeclLiteral) {
			if (name) { self.styles[name] = styleWrapper(name, styleValueWrapperFunc(declArrayOrDeclArrayFuncOrCondFunc, declArrayOrDeclLiteral)); }
			return self;
		};
		self.apply = function(applyTo, styles) {
			styles = (isArray(styles) ? styles : [styles]);
			if (!isFunction(applyTo.type)) { throw 'invalid argument'; }
			var applyToType = applyTo.type();
			if ([valueTypes.sel, valueTypes.at].indexOf(applyToType) === -1) { throw 'invalid argument'; }		
			allItems.push({applyTo: applyTo, styles: styles});
			stylesAdded(styles.length, applyToType, applyTo.raw.name());
			return self;
		};
		self.clear = function(clearFrom, namedStyle) {
			if (!isFunction(clearFrom.type) || !isFunction(namedStyle.type)) { throw 'invalid argument'; }
			if (namedStyle.type() !== valueTypes.style) { throw 'invalid argument'; }
			var clearFromType = clearFrom.type();
			if ([valueTypes.sel, valueTypes.at].indexOf(clearFromType) === -1) { throw 'invalid argument'; }
			var clearFromName = clearFrom.raw.name();
			var index = 0;
			var index2 = 0;
			var item = null;
			var foundAt = -1;
			for (index = 0; index < allItems.length; ++index) {
				item = allItems[index];
				if (item.applyTo.type() === clearFromType && item.applyTo.raw.name() === clearFromName) {
					foundAt = -1;
					for (index2 = 0; index2 < item.styles.length; ++index2) {
						if (item.styles[index2].raw.name() === namedStyle.raw.name()) {
							foundAt = index2; break;
						}
					}
					if (foundAt !== -1) {
						item.styles.splice(foundAt, 1); // remove this
						styleRemoved(namedStyle.raw.name(), clearFromType, clearFromName);
					}
				}
			}		
			return self;
		};
		self.attach = function(style, selsOrAts) {
			selsOrAts = (isArray(selsOrAts) ? selsOrAts : [selsOrAts]);
			var index = 0;
			var selOrAt = null;
			var selOrAtType = '';
			for (index = 0; index < selsOrAts.length; ++index) {
				selOrAt = selsOrAts[index];
				if (!isFunction(selOrAt.type)) { throw 'invalid argument'; }
				selOrAtType = selOrAt.type();
				if ([valueTypes.sel, valueTypes.at].indexOf(selOrAtType) === -1) { throw 'invalid argument'; }				
				self.apply(selOrAt, style);
			}
		};
		self.detach = function(style, selsOrAts) {
			selsOrAts = (isArray(selsOrAts) ? selsOrAts : [selsOrAts]);
			var index = 0;
			var selOrAt = null;
			var selOrAtType = '';
			for (index = 0; index < selsOrAts.length; ++index) {
				selOrAt = selsOrAts[index];
				if (!isFunction(selOrAt.type)) { throw 'invalid argument'; }
				selOrAtType = selOrAt.type();
				if ([valueTypes.sel, valueTypes.at].indexOf(selOrAtType) === -1) { throw 'invalid argument'; }				
				self.clear(selOrAt, style);
			}		
		};		
		
		// either end or (done first and load later will be used)
		self.done = function() {
			if (!isEnd) {
				isDirty = true;
				isDone = true;
			}
		};
		self.load = function() {
			if (isDone) {
				if (!isLoadAfterDone) {
					isLoadAfterDone = true;
					if (arguments.length > 0) { 
						selectorScopes = Array.prototype.slice.call(arguments, 0);
					}					
					isDirty = true; 
					self.reload();
				}
			}
		};
		self.end = function() {
			if (!isDone) {
				isDirty = true; 
				isEnd = true;
				self.reload();
			}
		};
		
		// general
		self.parent = core;
		self.id = function() { return id; };
		self.isChanged = function() { return isDirty; };
		self.name = function() { return fileName; };
		self.reload = function() { 
			if ((isDirty && !isDone) || (isDirty && isDone && isLoadAfterDone)) { 
				loadCSS(); 
				if (xref) { self.parent.reload.dependents(fileName); }
			}
		};
		self.unload = function() { 
			if (isLoaded) { 
				unloadCSS(); 
				if (xref) { self.parent.unload.dependents(fileName); }
			}
		};
		self.remove = function() {
			self.unload();
			self.parent.css.remove(self.name());
			if (xref) { self.parent.remove.dependents(fileName); }
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
		
		// settings
		core.settings = {};
		core.settings.isLogChanges = true;
		core.settings.isLoadExtensions = true;
		core.settings.isReloadOnChange = false;
		core.settings.isConsiderScopes = true;
		
		// files
		var allFiles = [];
		var xref = {};
		core.all = function() { return allFiles; };
		core.xref = function(inFile, otherFilesArray) {
			var otherFiles = (xref[inFile] || []);
			var index = 0;
			var otherFile = '';
			for (index = 0; index < otherFilesArray.length; ++index) {
			   otherFile = otherFilesArray[index];
			   if (otherFile !== inFile && otherFiles.indexOf(otherFile) === -1) {
					otherFiles.push(otherFile);
			   }
			}
			xref[inFile] = otherFiles;
		};
		
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
		
		// extensions
		var allEx = {};
		core.ex = function(exName, targetValueTypes, targetValueDataType, targetType, classFunc) {
			if (!core.settings.isLoadExtensions) { return; }
			// add if not already added
			if (!exName) { throw 'invalid argument'; }
			if (!targetValueTypes) { throw 'invalid argument'; }
			if (!targetValueDataType) { targetValueDataType = ''; }
			if (targetValueDataType === '*') { targetValueDataType = ''; }
			if (!targetType) { targetType = ''; }
			if (targetType === '*') { targetType = ''; }
			targetValueTypes = (isArray(targetValueTypes) ? targetValueTypes : [targetValueTypes]);
			var index = 0;
			var targetValueType = '';
			var fullName = '';
			for (index = 0; index < targetValueTypes.length; ++index) {
				targetValueType = targetValueTypes[index];
				fullName = '_' + targetValueType + '_' + targetValueDataType + '_' + targetType + '_' + exName;
				if (allEx[fullName]) { throw 'Extension "' + exName + '" is already loaded.'; }
				allEx[fullName] = {exName: exName, targetValueType: targetValueType, targetValueDataType: targetValueDataType, targetType: targetType, classFunc: classFunc};
			}			
		};
		core.ex.me = function(css, wrapper, valueObjectType, valueObjectDataType, valueType) {
			var ex = null;
			var property = null;
			wrapper.parent = css;
			for (property in allEx) {
				if (allEx.hasOwnProperty(property)) {
					ex = allEx[property];
					if (ex.targetValueType === valueObjectType &&
						(ex.targetValueDataType === valueObjectDataType || ex.targetValueDataType === '') &&
						(ex.targetType === valueType || ex.targetType === '')) {
						wrapper[ex.exName] = ex.classFunc.apply(wrapper);
					}
				}
			}		
		};
		
		// changes
		core.load = {};
		core.load.all = function() {
			var index = 0;
			var css = null;
			for (index = 0; index < allFiles.length; ++index) {
			   css = allFiles[index];
			   css.load.apply(css, arguments);
			}	
		};
		core.unload = {};
		core.unload.all = function() {
			var index = 0;
			var css = null;
			for (index = 0; index < allFiles.length; ++index) {
			   css = allFiles[index];
			   css.unload();
			}			
		};
		core.unload.dependents = function(ofFileName) {
			var dependentFiles = (xref[ofFileName] || []);
			var index = 0;
			var dependentFile = '';
			var css = null;
			for (index = 0; index < dependentFiles.length; ++index) {
			   dependentFile = dependentFiles[index];
			   css = core[dependentFile];
			   if (css) { css.unload(); }
			}
		};		
		core.reload = {};
		core.reload.all = function() {
			var index = 0;
			var css = null;
			for (index = 0; index < allFiles.length; ++index) {
			   css = allFiles[index];
			   css.reload();
			}			
		};
		core.reload.dependents = function(ofFileName) {
			var dependentFiles = (xref[ofFileName] || []);
			var index = 0;
			var dependentFile = '';
			var css = null;
			for (index = 0; index < dependentFiles.length; ++index) {
			   dependentFile = dependentFiles[index];
			   css = core[dependentFile];
			   if (css) { css.reload(); }
			}
		};
		core.remove = {};
		core.remove.all = function() {
			core.unloadAll();
			var index = 0;
			var css = null;
			for (index = 0; index < allFiles.length; ++index) {
			   css = allFiles[index];
			   delete core[css.name()];
			}
			allFiles = [];
		};
		core.remove.dependents = function(ofFileName) {
			var dependentFiles = (xref[ofFileName] || []);
			var index = 0;
			var dependentFile = '';
			var css = null;
			for (index = 0; index < dependentFiles.length; ++index) {
			   dependentFile = dependentFiles[index];
			   css = core[dependentFile];
			   if (css) { css.remove(); }
			}
		};
	};
	
	//// Public ////
	window.JS3 = new JS3();
}());
