/*!
  * JS3 - JavaScript Style Sheet
  * Instead of putting programming in CSS, it puts CSS in a programming language.
  * 
  * Copyright (C) 2014 Vikas Burman. All rights reserved.
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
		VERSION: '0.6.4',
		COPYRIGHT: 'Copyright (C) 2014 Vikas Burman. All rights reserved.',
		URL: 'https://github.com/vikasburman/js3'
	};	
	var isArray = function(obj) { return obj && Object.prototype.toString.call(obj) === '[object Array]'; };
	var isFunction = function(obj) { return obj && typeof obj === 'function'; };
	var isLiteral = function(obj) { return obj && Object.prototype.toString.call(obj) === '[object Object]'; };
	
	var CSS = function(core, objectName) {
		var self = this;
		
		// generation
		var stylesPlaceHolder = '$STYLES$',
			selsPlaceHolder = '$SELS$',
			atRuleQueryOrValuePlaceHolder = '$VALUE$',
			invalidArgument = 'invalid argument',
			alreadyDefined = ' already defined',
			canNotBeApplied = ' cannot be applied',
			notSupported = 'not supported',
			allItems = [], // {type: 'at'|'sel'|'direct', item: atObject|selObject|direct}
			allPfxCache = null,
			id = '',
			isLoaded = false,
			xref = false,
			isDirty = false,
			isDone = false,
			isLoadAfterDone = false,
			isEnd = false,
			selectorScopes = [];
		var valueTypes = {
			pfx: 'prefix',
			vars: 'variable',
			rule: 'rule',
			style: 'style',
			sel: 'selector',
			at: 'at',
			dir: 'direct'
		};
		var atRules = {
			cs: 'charset',
			doc: 'document',
			ff: 'font-face',
			imp: 'import',
			med: 'media',
			ns: 'namespace',
			pg: 'page',
			kf: 'keyframes',
			sup: 'supports'		
		};
		var atRuleTemplates = {
			'charset': '@charset "' + atRuleQueryOrValuePlaceHolder + '";',
			'font-face': '@font-face {' + selsPlaceHolder + '}',
			'import': '@import ' + atRuleQueryOrValuePlaceHolder + ';',
			'namespace': '@namespace ' + atRuleQueryOrValuePlaceHolder + ';',
			'page': '@page ' + atRuleQueryOrValuePlaceHolder + ' {' + selsPlaceHolder + '}',
			'media': '@media ' + atRuleQueryOrValuePlaceHolder + ' {' + selsPlaceHolder + '}',
			'document': '@document ' + atRuleQueryOrValuePlaceHolder + ' {' + selsPlaceHolder + '}',
			'keyframes': '@keyframes ' + atRuleQueryOrValuePlaceHolder + ' {' + selsPlaceHolder + '}',
			'supports': '@supports ' + atRuleQueryOrValuePlaceHolder + ' {' + selsPlaceHolder + '}'
		};		
		var randomName = function() { 
			var S4 = function() { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); };
			return ("_" + S4() + S4() + '_' + S4() + '_' + S4() + '_' + S4() + '_' + S4() + S4() + S4());		
		};
		var getNewId = function() { return 'js3_' + objectName + randomName(); };
		var newLine = function() { return (self.parent.settings.isGeneratePrettyCSS ? '\n' : ''); };
		var tab = function() { return (self.parent.settings.isGeneratePrettyCSS ? '\t' : ''); };
		var generateStyles = function(styles) {
			var allStyles = '',
				style = null,
				styleValue = '',
				isDebugging = self.parent.settings.isDebugging,
				index = 0;			
			for (index = 0; index < styles.length; ++index) {
				style = styles[index];
				if (style.isOn()) {
					styleValue = style.apply(self);
					allStyles += ' ' + styleValue;
					if (isDebugging) { window.console.log('style: ' + style.fName() + ' >> ' + styleValue); }
				} else {
					if (isDebugging) { window.console.log('style: ' + style.fName() + ' >> (skipped)'); }
				}
			}
			return allStyles;
		};
		var generateCSS = function() {
			var css = '',
				item = null,
				at = null,
				sel = null,
				itemCss = '',
				isDebugging = self.parent.settings.isDebugging,
				sels = null,
				styles = '',
				atStyles = '',
				index = 0,
				selName = '',
				selBody = '',
				atBody = '',
				index2 = 0,
				index3 = 0,
				scope = '';
			for (index = 0; index < allItems.length; ++index) {
				item = allItems[index];
				itemCss = '';
				switch(item.type) {
					case valueTypes.sel:
						sel = item.item;
						if (sel.isOn()) {
							selBody = sel.apply(self);
							var cleanStyles = selBody.replace(stylesPlaceHolder, generateStyles(sel.styles()));
							if (cleanStyles) {
								// add scopes, if required
								if (sel.raw.canBeScoped() && 
									self.parent.settings.isConsiderScopes && 
									selectorScopes.length > 0) {
									styles = '';
									for (index2 = 0; index2 < selectorScopes.length; ++index2) {
										scope = selectorScopes[index2];
										styles += (scope + ' ' + cleanStyles);
									}
								} else {
									styles = cleanStyles;
								}
								itemCss = styles;
								if (isDebugging) { window.console.log('selector: ' + sel.fName() + ' >> ' + itemCss); }
							} else {
								if (isDebugging) { window.console.log('selector: ' + sel.fName() + ' >> (no styles)'); }
							}
						} else {
							if (isDebugging) { window.console.log('selector: ' + sel.fName() + ' >> (skipped)'); }
						}
						break;
					case valueTypes.at:
						at = item.item;
						if (at.isOn()) {
							atBody = at.apply(self);
							if (at.raw.canEmbedSels()) {
								styles = '';
								selName = '';
								sels = at.sel.apply(self);
								for (index2 = 0; index2 < sels.length; ++index2) {
									selName = sels[index2];
									if (at.raw.hasSpecialSelectors()) {
										sel = null;
										if (at.raw.rule() === atRules.kf) {
											selBody = selName + ' {' + newLine() + stylesPlaceHolder + '}' + newLine();
											atStyles = generateStyles(at.styles(selName));
											if (atStyles) {
												styles += selBody.replace(stylesPlaceHolder, atStyles);
											}
										} else if (at.raw.rule() === atRules.ff) {
											selBody = selName + ': ' + stylesPlaceHolder + newLine();
											// TODO: 
										}
									} else {
										sel = self.sel[selName];
										if (sel.isOn()) {
											selBody = sel();
											atStyles = generateStyles(at.styles(selName));
											if (atStyles) {
												styles += selBody.replace(stylesPlaceHolder, atStyles);
												// add scopes, if required
												if (sel.raw.canBeScoped() && 
													self.parent.settings.isConsiderScopes && 
													selectorScopes.length > 0) {
													for (index3 = 0; index3 < selectorScopes.length; ++index3) {
														scope = selectorScopes[index3];
														styles += (scope + ' ' + styles);
													}
												}
											}
										}
									}
								}
								if (styles) {
									itemCss = atBody.replace(selsPlaceHolder, newLine() + styles);
									if (isDebugging) { window.console.log('at rule: ' + at.fName() + ' >> ' + itemCss); }
								} else {
									if (isDebugging) { window.console.log('at rule: ' + at.fName() + ' >> (no styles)'); }
								}
							} else {
								itemCss = atBody;
								if (isDebugging) { window.console.log('at rule: ' + at.fName() + ' >> ' + atBody); }
							}
						} else {
							if (isDebugging) { window.console.log('at rule: ' + at.fName() + ' >> (skipped)'); }
						}
						break;
					case valueTypes.dir:
						itemCss = (typeof item.item === 'string' ? item.item : item.item.apply(self)) + newLine();
						break;
					default:
						throw item.item.fName() + canNotBeApplied;
				}
				css += (itemCss || '');
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
				isDirty = true;
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
				if (self.parent.state.isChangeHandlersAttached) {
					self.parent.onChange.raise({css:self, type:'stylesAdded'});
				}
			}
		};
		var styleRemoved = function(name, type, from) {
			isDirty = true;
			if (isLoaded && self.parent.settings.isLogChanges) {
				window.console.log('Style "' + name + '" is removed from ' + type  + ' "' + from + '".');
			}
			if (isLoaded && self.parent.settings.isReloadOnChange) {
				self.reload();
				if (self.parent.state.isChangeHandlersAttached) {
					self.parent.onChange.raise({css:self, type:'styleRemoved'});
				}				
			}			
		};
		var valueChanged = function(type, name, oldValue, newValue) {
			isDirty = true;
			if (isLoaded && self.parent.settings.isLogChanges) {
				window.console.log('Value of ' + type + ' "' + name + '" is changed from "' + oldValue + '" to "' + newValue + '".');
			}
			if (isLoaded && self.parent.settings.isReloadOnChange) {
				self.reload();
				if (self.parent.state.isChangeHandlersAttached) {
					self.parent.onChange.raise({css:self, type:'valueChanged'});
				}					
			}	
		};
		var statusChanged = function(type, name, oldValue, newValue) {
			isDirty = true;
			if (isLoaded && self.parent.settings.isLogChanges) {
				window.console.log('Inclusion status of ' + type + ' "' + name + '" is changed from "' + oldValue + '" to "' + newValue + '".');
			}
			if (isLoaded && self.parent.settings.isReloadOnChange) {
				self.reload();
				if (self.parent.state.isChangeHandlersAttached) {
					self.parent.onChange.raise({css:self, type:'statusChanged'});
				}				
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
		var pfxValueWrapperFunc = function(pfxValueOrFunc) {
			var getValue = function() { return null; };
			if (pfxValueOrFunc) {
				if (isFunction(pfxValueOrFunc)) {
					// this is a function
					getValue = function() {
						var value = pfxValueOrFunc.apply(self);
						return value;
					};	
				} else {
					// this is value itself
					getValue = function() {
						var value = pfxValueOrFunc;
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
		var styleValueWrapperFunc = function(ruleArrayOrRuleArrayFuncOrCondFunc, ruleArrayOrRuleLiteral) {
			var getValue = function() { return []; };
			var getAsArray = function(value) { 
				if (!value) { value = []; }
				if (!isArray(value)) { value = [value]; }
				return value;
			};
			if (ruleArrayOrRuleArrayFuncOrCondFunc) {
				if (isFunction(ruleArrayOrRuleArrayFuncOrCondFunc)) {
					if (ruleArrayOrRuleLiteral) {
						if (isArray(ruleArrayOrRuleLiteral)) {
							// this is styles collection in an array
							getValue = function() {
								var value = [];
								var valueIndex = ruleArrayOrRuleArrayFuncOrCondFunc.apply(self);
								if (valueIndex <= ruleArrayOrRuleLiteral.length) {
									value = getAsArray(ruleArrayOrRuleLiteral[valueIndex]);
								}
								return value;
							};
						} else if (isLiteral(ruleArrayOrRuleLiteral)) {
							// this is styles collection in a literal
							getValue = function() {
								var value = [];
								var valueKey = ruleArrayOrRuleArrayFuncOrCondFunc.apply(self);
								if (ruleArrayOrRuleLiteral[valueKey]) {
									value = getAsArray(ruleArrayOrRuleLiteral[valueKey]);
								}
								return value;
							};						
						} else {
							// this is an invalid argument
							throw invalidArgument;
						}
					} else {
						if (isFunction(ruleArrayOrRuleArrayFuncOrCondFunc.type) && 
							ruleArrayOrRuleArrayFuncOrCondFunc.type() === valueTypes.rule) {
							// this is single rule
							getValue = function() {
								var value = getAsArray(ruleArrayOrRuleArrayFuncOrCondFunc);
								return value;
							};						
						} else {
							// this is a custom function
							getValue = function() {
								var value = getAsArray(ruleArrayOrRuleArrayFuncOrCondFunc.apply(self));
								return value;
							};
						}
					}
				} else {
					if (isArray(ruleArrayOrRuleArrayFuncOrCondFunc)) {
						// this is a rules array
						getValue = function() {
							var value = ruleArrayOrRuleArrayFuncOrCondFunc;
							return value;
						};
					} else {
						// this is an invalid argument
						throw invalidArgument;
					}
				}
			}
			getValue.plain = function() { return getValue(); };
			getValue.last = {};
			getValue.last.ruleArrayOrRuleArrayFuncOrCondFunc = ruleArrayOrRuleArrayFuncOrCondFunc;
			getValue.last.ruleArrayOrRuleLiteral = ruleArrayOrRuleLiteral;
			return getValue;
		};		
		var selValueWrapperFunc = function(selectorOrFuncOrArray) {
			var getValue = function() { return ''; };
			var getCompleteSelector = function(selector) { return selector + ' {' + newLine() + stylesPlaceHolder + '}' + newLine(); };
			if (selectorOrFuncOrArray) {
				if (isFunction(selectorOrFuncOrArray)) {
					// this is a function
					getValue = function(isSkipAddingSuffix) {
						var value = selectorOrFuncOrArray.apply(self);
						if (value && !isSkipAddingSuffix) { value = getCompleteSelector(value); }
						return value;
					};
				} else if (isArray(selectorOrFuncOrArray)) {
					// this is an array (of strings, each representing one selector)
					getValue = function(isSkipAddingSuffix) {
						var index = 0;
						var value = '';
						for (index = 0; index < selectorOrFuncOrArray.length; ++index) {
							if (value) {
								value += ', ' + selectorOrFuncOrArray[index];
							} else {
								value = selectorOrFuncOrArray[index];
							}
						}					
						if (value && !isSkipAddingSuffix) { value = getCompleteSelector(value); }
						return value;
					};				
				
				} else {
					// this is value itself
					getValue = function(isSkipAddingSuffix) {
						var value = selectorOrFuncOrArray;
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
			if (arguments.length > 0) {
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
		var pfxWrapper = function(pfxName, pfxValueWrapper) {
			var wrapper = function(newPfxValueOrFunc) {
				if (newPfxValueOrFunc) { 
					var oldValue = pfxValueWrapper(); 
					pfxValueWrapper = pfxValueWrapperFunc(newPfxValueOrFunc); 
					valueChanged(valueTypes.pfx, pfxName, oldValue, pfxValueWrapper()); 
				}
				return pfxValueWrapper();
			};
			var pfxId = randomName();
			var isOn = true;
			wrapper.id = function() { return pfxId; };				
			wrapper.type = function() { return valueTypes.pfx; };
			wrapper.fName = function() { return pfxName; };
			wrapper.off = function() { 
				if (isOn) {
					isOn = false;
					allPfxCache = null; // so that cache is created a fresh
					statusChanged(valueTypes.pfx, pfxName, 'on', 'off');
				}
			};
			wrapper.on = function() { 
				if (!isOn) {
					isOn = true;
					allPfxCache = null; // so that cache is created a fresh
					statusChanged(valueTypes.pfx, pfxName, 'off', 'on');
				}			
			};
			wrapper.isOn = function() { return isOn; };					
			wrapper.raw = {};
			wrapper.raw.value = function() { return pfxValueWrapper.plain(); };
			wrapper.raw.type = function() { return typeof wrapper.raw.value(); };
			self.parent.ex.me(self, wrapper, valueTypes.pfx, wrapper.raw.type(), '');
			return wrapper;		
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
			var varId = randomName();
			wrapper.id = function() { return varId; };				
			wrapper.type = function() { return valueTypes.vars; };
			wrapper.fName = function() { return varName; };
			wrapper.raw = {};
			wrapper.raw.value = function() { return varValueWrapper.plain(); };
			wrapper.raw.type = function() { return typeof wrapper.raw.value(); };
			self.parent.ex.me(self, wrapper, valueTypes.vars, wrapper.raw.type(), '');
			return wrapper;
		};
		var ruleWrapper = function(ruleName, isAddPrefixes, propName, propValueWrapper) {
			var getRule = function(propValue) {
				if (propValue) { propValue = propValue.toString(); }
				if (!propValue) { return ''; }
				if (propValue.substr(propValue.length - 1 !== ';')) { propValue += ';'; }
				var ruleDef = tab() + propName + ':' + propValue;
				if (isAddPrefixes) {
					if (!allPfxCache) {
						var pfx = null;
						var pfxName = '';
						allPfxCache = [];
						for(pfxName in self.pfx) {
							if (self.pfx.hasOwnProperty(pfxName)) {
								pfx = self.pfx[pfxName];
								if (isFunction(pfx.type) && pfx.isOn()) {
									allPfxCache.push(pfx.apply(self));
								}
							}
						}
					} 
					var index = 0;
					for (index = 0; index < allPfxCache.length; ++index) {	
						ruleDef = (tab() + allPfxCache[index] + propName + ':' + propValue + newLine()) + ruleDef;
					}
				}
				return ruleDef;
			};
			var wrapper = function(valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone) {
				if (arguments.length > 0) { 
					var oldValue = getRule(propValueWrapper()); 
					if (!valueSuffixOrValueArrayOrValueLiteral) { valueSuffixOrValueArrayOrValueLiteral = propValueWrapper.last.valueSuffixOrValueArrayOrValueLiteral; }
					if (!valueSuffixOrFuncOrNone) { valueSuffixOrFuncOrNone = propValueWrapper.last.valueSuffixOrFuncOrNone; }
					propValueWrapper = propValueWrapperFunc(valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone);
					valueChanged(valueTypes.rule, ruleName, oldValue, getRule(propValueWrapper())); 
				}
				return getRule(propValueWrapper());
			};
			var ruleId = randomName();
			var isOn = true;
			var propValueWrapperLast = null;
			wrapper.id = function() { return ruleId; };			
			wrapper.type = function() { return valueTypes.rule; };
			wrapper.fName = function() { return ruleName; };
			wrapper.off = function() { 
				if (isOn) {
					isOn = false;
					statusChanged(valueTypes.rule, ruleName, 'on', 'off');
				}
			};
			wrapper.on = function() { 
				if (!isOn) {
					isOn = true;
					statusChanged(valueTypes.rule, ruleName, 'off', 'on');
				}			
			};
			wrapper.isOn = function() { return isOn; };			
			wrapper.reset = function(interactiveKeyOrIndex) {
				if (!propValueWrapper.last.valueSuffixOrValueArrayOrValueLiteral) { throw notSupported; }
				if (interactiveKeyOrIndex) {
					if (!propValueWrapperLast) { propValueWrapperLast = propValueWrapper.last; } 
					wrapper(function() { return interactiveKeyOrIndex; }); 
				} else {
					if (propValueWrapperLast) { 
						propValueWrapper.last = propValueWrapperLast; 
						propValueWrapperLast = null;
					}
					wrapper(propValueWrapper.last.valueOrValueFuncOrCondFunc);
				}
			};
			wrapper.raw = {};
			wrapper.raw.property = function() { return propName; };
			wrapper.raw.hasPrefixes = function() { return isAddPrefixes; };
			wrapper.raw.value = function() { return propValueWrapper.plain(); };
			wrapper.raw.type = function() { return typeof wrapper.raw.value(); };
			wrapper.raw.suffix = function() {
				var fullValue = propValueWrapper();
				var justValue = wrapper.prop.value();
				return fullValue.replace(justValue, '');
			};
			self.parent.ex.me(self, wrapper, valueTypes.rule, wrapper.raw.type(), propName);
			return wrapper;
		};
		var styleWrapper = function(styleName, styleValueWrapper) {
			var getStyles = function(rules) { 
				var theStyles = '',
					index = 0,
					ruleValue = '',
					isDebugging = self.parent.settings.isDebugging,
					rule = null;
				for (index = 0; index < rules.length; ++index) {
					rule = rules[index];
					if (rule.isOn()) {
						ruleValue = rule.apply(self);
						theStyles +=  ruleValue + newLine();
						if (isDebugging) { window.console.log('style rule: ' + rule.fName() + ' >> ' + ruleValue); }
					} else {
						if (isDebugging) { window.console.log('style rule: ' + rule.fName() + ' >> (skipped)'); }
					}
				}
				return theStyles;
			};				
			var wrapper = function(ruleArrayOrRuleArrayFuncOrCondFunc, ruleArrayOrRuleLiteral) {
				if (arguments.length > 0) { 
					var oldValue = getStyles(styleValueWrapper()); 
					if (!ruleArrayOrRuleLiteral) { ruleArrayOrRuleLiteral = styleValueWrapper.last.ruleArrayOrRuleLiteral; }
					styleValueWrapper = styleValueWrapperFunc(ruleArrayOrRuleArrayFuncOrCondFunc, ruleArrayOrRuleLiteral);
					valueChanged(valueTypes.style, styleName, oldValue, getStyles(styleValueWrapper())); 
				}
				return getStyles(styleValueWrapper());
			};
			var styleId = randomName();
			var isOn = true;
			var styleValueWrapperLast = null;
			wrapper.id = function() { return styleId; };
			wrapper.type = function() { return valueTypes.style; };
			wrapper.fName = function() { return styleName; };
			wrapper.off = function() { 
				if (isOn) {
					isOn = false;
					statusChanged(valueTypes.style, styleName, 'on', 'off');
				}
			};
			wrapper.on = function() { 
				if (!isOn) {
					isOn = true;
					statusChanged(valueTypes.style, styleName, 'off', 'on');
				}			
			};
			wrapper.isOn = function() { return isOn; };			
			wrapper.rules = function() { return styleValueWrapper.plain(); };
			wrapper.rules.add = function(newRules, isInsertOnTop) {
				var processedRuleArray = styleValueWrapper.plain();
				processedRuleArray = (isArray(processedRuleArray) ? processedRuleArray.slice(0) : [processedRuleArray]);
				newRules = (isArray(newRules) ? newRules : [newRules]);
				if (isInsertOnTop) { 
					processedRuleArray = newRules.concat(processedRuleArray);
				} else {
					processedRuleArray = processedRuleArray.concat(newRules);
				}
				wrapper(processedRuleArray); // update it
			};
			wrapper.rules.remove = function(rule) {
				var processedRuleArray = styleValueWrapper.plain();
				processedRuleArray = (isArray(processedRuleArray) ? processedRuleArray.slice(0) : [processedRuleArray]);
				var index = 0;
				var item = null;
				var ruleId = rule.id();
				var foundAt = -1;
				var isRemoved = false;
				while(true) {
					foundAt = -1;
					for (index = 0; index < processedRuleArray.length; ++index) {
						item = processedRuleArray[index];
						if (item.id() === ruleId) {
							foundAt = index;
							break;
						}
					}
					if (foundAt !== -1) {
						processedRuleArray.splice(foundAt, 1); // remove it
						isRemoved = true;
					} else {
						break; // all instances of this rule is removed
					}
				}
				if (isRemoved) {
					wrapper(processedRuleArray); // update it
				}
			};
			wrapper.rules.remove.all = function() {
				wrapper([]); // update it
			};
			wrapper.reset = function(interactiveKeyOrIndex) {
				if (!styleValueWrapper.last.ruleArrayOrRuleLiteral) { throw notSupported; }
				if (interactiveKeyOrIndex) {
					if (!styleValueWrapperLast) { styleValueWrapperLast = styleValueWrapper.last; } 
					wrapper(function() { return interactiveKeyOrIndex; }); 
				} else {
					if (styleValueWrapperLast) { 
						styleValueWrapper.last = styleValueWrapperLast; 
						styleValueWrapperLast = null;
					}
					wrapper(styleValueWrapper.last.ruleArrayOrRuleArrayFuncOrCondFunc);
				}
			};
			wrapper.raw = {};
			wrapper.raw.value = function() { return styleValueWrapper.plain(); };
			wrapper.raw.type = function() { return typeof wrapper.raw.value(); };
			self.parent.ex.me(self, wrapper, valueTypes.style, '', '');
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
			var selId = randomName();
			var styles = [];
			var isOn = true;
			wrapper.id = function() { return selId; };
			wrapper.type = function() { return valueTypes.sel; };
			wrapper.fName = function() { return selName; };
			wrapper.off = function() { 
				if (isOn) {
					isOn = false;
					statusChanged(valueTypes.sel, selName, 'on', 'off');
				}
			};
			wrapper.on = function() { 
				if (!isOn) {
					isOn = true;
					statusChanged(valueTypes.sel, selName, 'off', 'on');
				}			
			};
			wrapper.isOn = function() { return isOn; };
			wrapper.styles = function() { return styles; };
			wrapper.styles.value = function() { return generateStyles(wrapper.styles()); };
			wrapper.styles.add = function(newStyles) {
				newStyles = (isArray(newStyles) ? newStyles : [newStyles]);
				styles = styles.concat(newStyles);
				stylesAdded(newStyles.length, valueTypes.sel, selName);			
			};
			wrapper.styles.remove = function(style) {
				var index = 0;
				var styleId = style.id();
				var styleName = style.fName();
				var foundAt = -1;
				var isRemoved = false;
				while (true) {
					foundAt = -1;
					for (index = 0; index < styles.length; ++index) {
						if (styles[index].id() === styleId) {
							foundAt = index; 
							break;
						}
					}
					if (foundAt !== -1) {
						styles.splice(foundAt, 1); // remove this
						isRemoved = true;
					} else {
						break; // all instances of given style are removed
					}
				}
				if (isRemoved) {
					styleRemoved(styleName, valueTypes.sel, selName);
				}
			};
			wrapper.styles.remove.all = function() { 
				styles.length = 0; 
				styleRemoved('All styles', valueTypes.sel, selName);
			};
			wrapper.raw = {};
			wrapper.raw.canBeScoped = function() { return canBeScoped; };
			wrapper.raw.value = function() { return selValueWrapper.plain(); };
			wrapper.raw.type = function() { return typeof wrapper.raw.value(); };
			self.parent.ex.me(self, wrapper, valueTypes.sel, '', '');
			return wrapper;	
		};
		var atWrapper = function(atName, atRule, atValueWrapper) {
			var template = atRuleTemplates[atRule.toLowerCase()];
			if (!template) { throw invalidArgument; }
			var canEmbedSels = (template.indexOf(selsPlaceHolder) !== -1);
			var atRuleDeclaration = function(atRuleQueryOrValue) {
				atRuleQueryOrValue = atRuleQueryOrValue || ''; 
				return template.replace(atRuleQueryOrValuePlaceHolder, atRuleQueryOrValue) + newLine();
			};
			var wrapper = function(newAtRuleQueryOrIdentifierOrFunc) {
				if (newAtRuleQueryOrIdentifierOrFunc) { 
					var oldValue = atRuleDeclaration(atValueWrapper()); 
					atValueWrapper = atValueWrapperFunc(newAtRuleQueryOrIdentifierOrFunc); 
					valueChanged(valueTypes.at, atName, oldValue, atRuleDeclaration(atValueWrapper())); 
				}
				return atRuleDeclaration(atValueWrapper());
			};
			var atId = randomName();
			var groupedStyles = {};
			var isOn = true;
			wrapper.id = function() { return atId; };
			wrapper.type = function() { return valueTypes.at; };
			wrapper.fName = function() { return atName; };
			wrapper.off = function() { 
				if (isOn) {
					isOn = false;
					statusChanged(valueTypes.at, atName, 'on', 'off');
				}
			};
			wrapper.on = function() { 
				if (!isOn) {
					isOn = true;
					statusChanged(valueTypes.at, atName, 'off', 'on');
				}			
			};
			wrapper.isOn = function() { return isOn; };
			if (canEmbedSels) {
				wrapper.sel = function() { 
					var sels = [];
					var selName = '';
					for (selName in groupedStyles) {
						if (groupedStyles.hasOwnProperty(selName)) { sels.push(selName); }
					}
					return sels;
				};
				wrapper.sel.define = function(newGroupedStyles) {
					groupedStyles = newGroupedStyles;
					stylesAdded('New selectors and styles', valueTypes.at, atName);
				};
				wrapper.sel.add = function(selOrSelName, styles) { 
					var selName = (typeof selOrSelName === 'string' ? selOrSelName : selOrSelName.fName());
					styles = (styles ? (isArray(styles) ? styles : [styles]) : []);
					if (!groupedStyles[selName]) {
						groupedStyles[selName] = styles;
					} else {
						groupedStyles[selName] = groupedStyles[selName].concat(styles); // add more
					}
					stylesAdded(styles.length, valueTypes.sel, selName + ' (under ' + atName + ')');	
				};	
				wrapper.sel.remove = function(selOrSelName, style) { 
					var selName = (typeof selOrSelName === 'string' ? selOrSelName : selOrSelName.fName());
					if (groupedStyles[selName]) {
						var index = 0;
						var styles = (isArray(groupedStyles[selName]) ? groupedStyles[selName] : []);
						if (styles.length > 0) {
							var styleName = style.fName();
							var foundAt = -1;
							var isRemoved = false;
							while (true) {
								foundAt = -1;
								for (index = 0; index < styles.length; ++index) {
									if (styles[index].fName() === styleName) {
										foundAt = index; 
										break;
									}
								}
								if (foundAt !== -1) {
									styles.splice(foundAt, 1); // remove this
									isRemoved = true;
								} else {
									break; // all instances of given style are removed
								}
							}
							if (isRemoved) {
								groupedStyles[selName] = styles; // update
								styleRemoved(styleName, valueTypes.sel, selName + ' (under ' + atName + ')');
							}	
						}
					}
				};	
				wrapper.sel.remove.all = function() { 
					groupedStyles = {};
					styleRemoved('All styles', valueTypes.at, atName);
				};					
				wrapper.styles = function(selOrSelName) { 
					var selName = (typeof selOrSelName === 'string' ? selOrSelName : selOrSelName.fName());
					var styles = [];
					if (groupedStyles[selName]) { styles = groupedStyles[selName]; }
					return (isArray(styles) ? styles : [styles]);
				};	
				wrapper.styles.value = function(selOrSelName) { 
					var selName = (typeof selOrSelName === 'string' ? selOrSelName : selOrSelName.fName());
					return generateStyles(wrapper.styles(selName)); 
				};
				wrapper.styles.add = function(selOrSelName, styles) { 
					return wrapper.sel.add(selOrSelName, styles);
				};	
				wrapper.styles.remove = function(selOrSelName, style) { 
					return wrapper.sel.remove(selOrSelName, style);
				};	
				wrapper.styles.remove.all = function(selOrSelName) { 
					var selName = (typeof selOrSelName === 'string' ? selOrSelName : selOrSelName.id());
					if (!selName) { 
						wrapper.sel.remove.all(); 
					} else {
						if (groupedStyles[selName]) {
							groupedStyles[selName] = [];
							styleRemoved('All styles', valueTypes.sel, selName + ' (under ' + atName + ')');
						}
					}
				};				
			}
			wrapper.raw = {};
			wrapper.raw.rule = function() { return atRule; };
			wrapper.raw.canEmbedSels = function() { return canEmbedSels; };
			wrapper.raw.hasSpecialSelectors = function() { return (atRule === atRules.kf || atRules.ff); };
			wrapper.raw.value = function() { return atValueWrapper.plain(); };
			wrapper.raw.type = function() { return typeof wrapper.raw.value(); };
			self.parent.ex.me(self, wrapper, valueTypes.at, '', atRule);
			return wrapper;			
		};
		
		// definitions
		self.xref = function() {
			if (arguments.length > 0) { 
				self.parent.xref(objectName, Array.prototype.slice.call(arguments, 0)); 
				xref = true;
			}
			return self;
		};
		self.rule = function(isAddPrefixesOrPropName, propName, valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone) {
			var isAddPrefixes = false;
			if (typeof isAddPrefixesOrPropName === 'string') {
				if (valueSuffixOrValueArrayOrValueLiteral) { valueSuffixOrFuncOrNone = valueSuffixOrValueArrayOrValueLiteral; }
				if (valueOrValueFuncOrCondFunc) { valueSuffixOrValueArrayOrValueLiteral = valueOrValueFuncOrCondFunc; }
				if (propName) { valueOrValueFuncOrCondFunc = propName; }
				propName = isAddPrefixesOrPropName;
				isAddPrefixes = false;
			} else {
				isAddPrefixes = isAddPrefixesOrPropName;
			}	
			return ruleWrapper(randomName(), isAddPrefixes, propName, propValueWrapperFunc(valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone));
		};
		self.style = function(ruleArrayOrRuleArrayFuncOrCondFunc, ruleArrayOrRuleLiteral) {
			return styleWrapper(randomName(), styleValueWrapperFunc(ruleArrayOrRuleArrayFuncOrCondFunc, ruleArrayOrRuleLiteral));
		};	
		self.pfx = function(para1, para2) {
			if (arguments.length === 2) {
				// name, value
				if (self.pfx[para1]) { throw para1 + alreadyDefined; }
				self.pfx[para1] = pfxWrapper(para1, pfxValueWrapperFunc(para2));
			} else if (isLiteral(para1)) {
				// { key1: value1, key2: value3, ... }
				var property = null;
				for (property in para1) {
					if (para1.hasOwnProperty(property)) {
						if (self.pfx[property]) { throw property + alreadyDefined; }
						self.pfx[property] = pfxWrapper(property, pfxValueWrapperFunc(para1[property])); 
					}
				}
			}
			return self;
		};		
		self.vars = function(para1, para2) {
			if (arguments.length === 2) {
				// name, value
				if (self.vars[para1]) { throw para1 + alreadyDefined; }
				self.vars[para1] = varWrapper(para1, varValueWrapperFunc(para2));
			} else if (isLiteral(para1)) {
				// { key1: value1, key2: value3, ... }
				var property = null;
				for (property in para1) {
					if (para1.hasOwnProperty(property)) {
						if (self.vars[property]) { throw property + alreadyDefined; }
						self.vars[property] = varWrapper(property, varValueWrapperFunc(para1[property])); 
					}
				}
			}
			return self;
		};
		self.sel = function(name, selectorOrFuncOrArray, canBeScoped) {
			if (self.sel[name]) { throw name + alreadyDefined; }
			self.sel[name] = selWrapper(name, canBeScoped, selValueWrapperFunc(selectorOrFuncOrArray));
			return self;
		};		
		self.rules = function(name, isAddPrefixesOrPropName, propName, valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone) {
			if (self.rules[name]) { throw name + alreadyDefined; }
			var isAddPrefixes = false;
			if (typeof isAddPrefixesOrPropName === 'string') {
				if (valueSuffixOrValueArrayOrValueLiteral) { valueSuffixOrFuncOrNone = valueSuffixOrValueArrayOrValueLiteral; }
				if (valueOrValueFuncOrCondFunc) { valueSuffixOrValueArrayOrValueLiteral = valueOrValueFuncOrCondFunc; }
				if (propName) { valueOrValueFuncOrCondFunc = propName; }
				propName = isAddPrefixesOrPropName;
				isAddPrefixes = false;
			} else {
				isAddPrefixes = isAddPrefixesOrPropName;
			}
			self.rules[name] = ruleWrapper(name, isAddPrefixes, propName, propValueWrapperFunc(valueOrValueFuncOrCondFunc, valueSuffixOrValueArrayOrValueLiteral, valueSuffixOrFuncOrNone)); 
			return self;
		};	
		self.styles = function(name, ruleArrayOrRuleArrayFuncOrCondFunc, ruleArrayOrRuleLiteral) {
			if (self.styles[name]) { throw name + alreadyDefined; }		
			self.styles[name] = styleWrapper(name, styleValueWrapperFunc(ruleArrayOrRuleArrayFuncOrCondFunc, ruleArrayOrRuleLiteral));
			return self;
		};
		self.at = function(name, atRule, atRuleQueryOrIdentifierOrFunc) {
			if (self.at[name]) { throw name + alreadyDefined; }
			atRuleQueryOrIdentifierOrFunc = atRuleQueryOrIdentifierOrFunc || '';
			self.at[name] = atWrapper(name, atRule, atValueWrapperFunc(atRuleQueryOrIdentifierOrFunc)); 
			return self;			
		};
		
		// append in style sheet
		self.write = function(selOrAtOrDirStringOrFunc, StylesOrGroupedStylesOrNone) {
			var targetType = '';
			if (typeof selOrAtOrDirStringOrFunc === 'string' || (isFunction(selOrAtOrDirStringOrFunc) && !selOrAtOrDirStringOrFunc.type)) {
				targetType = valueTypes.dir;
			} else {
				targetType = selOrAtOrDirStringOrFunc.type();
			}
			switch(targetType) {
				case valueTypes.sel:
					allItems.push({type: valueTypes.sel, item:selOrAtOrDirStringOrFunc});
					if (StylesOrGroupedStylesOrNone) { selOrAtOrDirStringOrFunc.styles.add(StylesOrGroupedStylesOrNone); }
					break;
				case valueTypes.at:
					allItems.push({type: valueTypes.at, item:selOrAtOrDirStringOrFunc});
					if (selOrAtOrDirStringOrFunc.raw.canEmbedSels() && StylesOrGroupedStylesOrNone) {
						selOrAtOrDirStringOrFunc.sel.define(StylesOrGroupedStylesOrNone);
					}
					break;
				case valueTypes.dir:
					allItems.push({type: valueTypes.dir, item:selOrAtOrDirStringOrFunc});
					break;
				default:
					throw invalidArgument;
			}
			return self;
		};
		
		// either end or (done first and load later will be used)
		self.done = function() {
			if (!isEnd) {
				isDirty = true;
				isDone = true;
				if (self.parent.settings.isDebugging) { window.console.log('complete: Marked as done. Not loaded yet.'); }
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
					if (self.parent.settings.isDebugging) { window.console.log('complete: Loaded.'); }
				}
			}
		};
		self.end = function() {
			if (!isDone) {
				isDirty = true; 
				isEnd = true;
				self.reload();
				if (self.parent.settings.isDebugging) { window.console.log('complete: Loaded.'); }
			}
		};
		
		// general
		self.parent = core;
		self.id = function() { return id; };
		self.isChanged = function() { return isDirty; };
		self.name = function() { return objectName; };
		self.reload = function(isForceReload) { 
			if ((((isDirty && !isDone) || (isDirty && isDone && isLoadAfterDone)) && !self.parent.state.isUpdatesSuspended) || (isForceReload && (isLoadAfterDone || isEnd))) { 
				loadCSS(); 
				if (xref) { self.parent.reload.dependents(objectName, isForceReload); }
			}
		};
		self.unload = function() { 
			if (isLoaded) { 
				unloadCSS(); 
				if (xref) { self.parent.unload.dependents(objectName); }
			}
		};
		self.remove = function() {
			self.unload();
			self.parent.css.remove(self.name());
			if (xref) { self.parent.remove.dependents(objectName); }
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
		core.settings.isLogChanges = false;
		core.settings.isLoadExtensions = true;
		core.settings.isReloadOnChange = true;
		core.settings.isConsiderScopes = true;
		core.settings.isGeneratePrettyCSS = false;
		core.settings.isDebugging = false;
		
		// state
		core.state = {};
		core.state.isUpdatesSuspended = false;
		core.state.isChangeHandlersAttached = false;
		
		// files
		var allFiles = [],
			xref = {};
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
		core.css = function(objectName) {
			if (core[objectName]) { throw objectName + ' is already loaded.'; }
			var myCSS = new CSS(core, objectName);
			core[objectName] = myCSS;
			allFiles.push(myCSS);
			return myCSS;
		};
		core.css.remove = function(objectName) {
			if (!core[objectName]) { return; }
			delete core[objectName];
			var index = 0;
			var css = null;
			var foundAt = -1;
			for (index = 0; index < allFiles.length; ++index) {
				css = allFiles[index];
				if (css.name() === objectName) { foundAt = index; break; }
			}
			if (foundAt !== -1) { allFiles.splice(foundAt, 1); }
		};
		
		// extensions
		var allEx = {};
		core.ex = function(exName, targetFilter, exProcessor) {
			if (!core.settings.isLoadExtensions) { return; }
			if (!targetFilter.objectType) { targetFilter.objectType = ['prefix', 'variable', 'rule', 'style', 'selector', 'at', 'direct']; }
			if (!targetFilter.dataType) { targetFilter.dataType = ''; }
			if (!targetFilter.type) { targetFilter.type = ''; }
			
			// add if not already added
			targetFilter.objectType = (isArray(targetFilter.objectType) ? targetFilter.objectType : [targetFilter.objectType]);
			var index = 0,
				objectType = '',
				fullName = '';
			for (index = 0; index < targetFilter.objectType.length; ++index) {
				objectType = targetFilter.objectType[index];
				fullName = '_' + objectType + '_' + targetFilter.dataType + '_' + targetFilter.type + '_' + exName;
				if (allEx[fullName]) { throw 'Extension "' + exName + '" for given contents "' + fullName + '" is already loaded.'; }
				allEx[fullName] = {exName: exName, targetFilter: targetFilter, exProcessor: exProcessor};
			}
		};
		core.ex.me = function(css, wrapper, objectType, dataType, type) {
			var ex = null,
				property = null;
			wrapper.parent = wrapper.parent || css;
			for (property in allEx) {
				if (allEx.hasOwnProperty(property)) {
					ex = allEx[property];
					if (ex.targetFilter.objectType.indexOf(objectType) !== -1 &&
					   (ex.targetFilter.dataType === dataType || ex.targetFilter.dataType === '') &&
					   (ex.targetFilter.type === type || ex.targetFilter.type === '')) {
						ex.exProcessor(wrapper); // let it add on to wrapper as required
					}
				}
			}		
		};
		
		// event
		var allHandlers = [];
		core.onChange = function(handlerName, handler) {
			var index = 0;
			var foundAt = -1;
			for (index = 0; index < allHandlers.length; ++index) {
				if (allHandlers[index].name === handlerName) { 
					foundAt = index;
					break;
				}
			}
			if (isFunction(handler)) {
				core.state.isChangeHandlersAttached = true;
				if (foundAt === -1) {
					allHandlers.push({name: handlerName, handler: handler});
				} else {
					allHandlers[foundAt].handler = handler;
				}
			} else {
				if (foundAt !== -1) {
					allHandlers.splice(foundAt, 1); // remove
				}
				if (allHandlers.length === 0) {
					core.state.isChangeHandlersAttached = false;
				}
			}
		};
		core.onChange.raise = function(e) {
			var index = 0;
			for (index = 0; index < allHandlers.length; ++index) {
				allHandlers[index].handler(e); // call
			}
		};
		
		// changes
		core.suspendUpdates = function() { 
			core.state.isUpdatesSuspended = true; 
		};
		core.isUpdatesSuspended = function() { 
			return core.state.isUpdatesSuspended;
		};
		core.resumeUpdates = function() { 
			core.state.isUpdatesSuspended = false;
			core.reload.all(); // without force
		};
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
		core.unload.dependents = function(ofObjectName) {
			var dependentFiles = (xref[ofObjectName] || []);
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
		core.reload.all = function(isForceReload) {
			var index = 0;
			var css = null;
			for (index = 0; index < allFiles.length; ++index) {
				css = allFiles[index];
				css.reload(isForceReload);
			}			
		};
		core.reload.dependents = function(ofObjectName, isForceReload) {
			var dependentFiles = (xref[ofObjectName] || []);
			var index = 0;
			var dependentFile = '';
			var css = null;
			for (index = 0; index < dependentFiles.length; ++index) {
				dependentFile = dependentFiles[index];
				css = core[dependentFile];
				if (css) { css.reload(isForceReload); }
			}
		};
		core.remove = {};
		core.remove.all = function() {
			core.unload.all();
			var index = 0;
			var css = null;
			for (index = 0; index < allFiles.length; ++index) {
				css = allFiles[index];
				delete core[css.name()];
			}
			allFiles = [];
		};
		core.remove.dependents = function(ofObjectName) {
			var dependentFiles = (xref[ofObjectName] || []);
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
	
	// update internal default settings with globally available settings
	if (window.JS3Settings && isLiteral(window.JS3Settings)) {
		var property = '';
		for (property in window.JS3Settings) {
			if (window.JS3Settings.hasOwnProperty(property) && window.JS3.settings[property]) {
				window.JS3.settings[property] = window.JS3Settings[property];
			}
		}
		delete window.JS3Settings; // clear it
	}
}());
