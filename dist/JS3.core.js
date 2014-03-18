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
/*jslint indent: 4, maxerr: 50, white: true, vars: true,  nomen: true, unparam: true, plusplus: true, bitwise: true, continue: true */
/*global window */ 
(function() {
	"use strict";
	
	var CONST = {
		NAME: 'JS3',
		TITLE: 'JavaScript Style Sheets',
		VERSION: '0.8.5',
		COPYRIGHT: 'Copyright (C) 2014 Vikas Burman. All rights reserved.',
		URL: 'https://github.com/vikasburman/js3'
	};	
	var isArray = function(object) { return object && Object.prototype.toString.call(object) === '[object Array]'; };
	var isFunction = function(object) { return object && typeof object === 'function'; };
	var isString = function(object) { return object && typeof object === 'string'; };
	var isLiteral = function(object) { return object && Object.prototype.toString.call(object) === '[object Object]' && object.constructor.name === 'Object'; };
	var repeat = function(str, num) { return new [].constructor(num + 1).join(str); };
	var valueTypes = {
		vars: 'variable', 
		style: 'style', 
		rule: 'rule', 
		sel: 'selector', 
		at: 'at-rule', 
		dir: 'direct'
	};
		
	var CSS = function(core, objectName) {
		var self = this, 
			invalidArgument = 'invalid argument',
			alreadyDefined = ' already defined',
			notSupported = 'not supported',
			nestedScopesCanNotBeApplied = 'nested scopes cannot be applied',
			allItems = [], 
			allPrefixes = [],
			hierarchyStack = [],
			isChild = false, 
			isSibling = false, 
			isRootLevel = true,
			id = '', 
			selectorScope = '', 
			tabLevel = 0,
			isLoaded = false, 
			isDirty = false, 
			isDone = false, 
			isEnd = false,
			isLoadAfterDone = false, 
			isManuallyUnloaded = false,
			prefixPlaceholder = '~', 
			scopePlaceholder = '$', 
			atRuleIdentifier = '@', 
			verbatimIdentifier = '&', 
			keyIdentifier = '%';
		var randomName = function() { 
			var S4 = function() { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); };
			return ("_" + S4() + S4() + '_' + S4() + '_' + S4() + '_' + S4() + '_' + S4() + S4() + S4());		
		};
		var getNewId = function() { return 'js3_' + objectName + randomName(); };
		var newLine = function() { return (core.settings.isGeneratePrettyCSS ? '\n' : ''); };
		var tab = function() { return (core.settings.isGeneratePrettyCSS ? repeat('\t', tabLevel + 1) : ''); };
		var sep = function(sep, isPre) { return (core.settings.isGeneratePrettyCSS ? (isPre ? ' ' + sep : sep + ' ') : sep); };
		
		var generateStyles = function(styles, formatType) {
			var allStyles = '',
				style = null,
				styleRuleProp = '',
				styleValue = '',
				chars = '',
				index = 0;
			if (!formatType) { formatType = 0; }
			if (isFunction(styles) && isFunction(styles.type) && styles.type() === valueTypes.style) { styles = [styles]; }
			if (isArray(styles)) {
				for (index = 0; index < styles.length; ++index) {
					style = styles[index];
					if (style.isOn()) {
						styleValue = style.apply(self);
						allStyles += (index > 0 ? newLine() : '') + styleValue;
					}
				}
			} else if (isLiteral(styles)) {
				for(styleRuleProp in styles) { // these are actual style rules
					if (styles.hasOwnProperty(styleRuleProp)) {
						styleValue = styles[styleRuleProp];
						if (styleValue) {
							if (formatType === 0) {
								allStyles += tab() + styleRuleProp + sep(':') + styleValue.toString() + ';' + newLine();
							} else if (formatType === 1) { // @keyframes
								tabLevel++;
								allStyles += tab() + styleRuleProp + sep('{', true) + newLine();
								tabLevel++;
								allStyles += generateStyles(styleValue);
								tabLevel--;
								allStyles += newLine() + tab() + sep('}') + newLine();
								tabLevel--;
							}
						}
					}
				}
				chars = newLine();
				if (chars.length > 0 && allStyles.substring(allStyles.length - chars.length) === chars) {
					allStyles = allStyles.substring(0, (allStyles.length - chars.length));
				}
			}
			return allStyles;
		};
		var processItem = function(root, rootSel, theItem) {
			var selBody = '', 
				chars = '',
				index2 = 0, 
				index3 = 0,
				sibling = null, 
				lastSibling = null;
			if (theItem.type === valueTypes.dir) {
				root.itemCss = theItem.directValue + newLine();
				return;
			}
			if (theItem.type === valueTypes.at) {
				if (theItem.children.length === 0 && theItem.siblings.length === 0 && 
					!theItem.stylesLiteral && theItem.styles.length === 0) {
					root.itemCss = theItem.selector + (theItem.atRuleValue ? ' ' + theItem.atRuleValue : '') + ';' + newLine();
					return;
				}
			}				
			if (theItem.canBeScoped && 
				core.settings.isConsiderScopes && 
				selectorScope) {
				rootSel += ' ' + selectorScope + theItem.selector;
			} else if (theItem.siblings.length === 0) {
				rootSel += ' ' + theItem.selector;
			}
			rootSel = rootSel.trim();
			if (theItem.siblings.length !== 0) {
				lastSibling = theItem.siblings[theItem.siblings.length - 1];
				if (lastSibling.stylesLiteral || lastSibling.styles.length !== 0) {
					selBody += rootSel + ' ' + theItem.selector + ',' + newLine(); // this item itself
					for (index2 = 0; index2 < theItem.siblings.length; ++index2) {
						sibling = theItem.siblings[index2];
						selBody += rootSel + ' ' + sibling.selector + ',' + newLine();
					}
					chars = newLine();
					if (chars.length > 0 && selBody.substring(selBody.length - chars.length) === chars) {
						selBody = selBody.substring(0, (selBody.length - chars.length));
					}					
					selBody += sep('{', true) + newLine();
					if (lastSibling.stylesLiteral) {
						selBody += generateStyles(lastSibling.stylesLiteral);
					} else if (lastSibling.styles.length !== 0) {
						selBody += generateStyles(lastSibling.styles);
					}
					selBody +=  newLine() + '}' + newLine();
				}
			} else {
				if (theItem.stylesLiteral || theItem.styles.length !== 0) {
					selBody += ((theItem.isAtRule && theItem.parent) ? tab() : '') + rootSel + (theItem.atRuleValue ? ' ' + theItem.atRuleValue : '') + sep('{', true) + newLine();
					if (theItem.stylesLiteral) {
						selBody += generateStyles(theItem.stylesLiteral, ((theItem.isAtRule && theItem.selector === '@keyframes') ? 1 : 0));
					} else if (theItem.styles.length !== 0) {
						selBody += generateStyles(theItem.styles);
					}							
					selBody += newLine() + ((theItem.isAtRule && theItem.parent) ? tab() : '') + '}' + newLine();
				} else {
					if (theItem.isAtRule) {
						selBody += rootSel + (theItem.atRuleValue ? ' ' + theItem.atRuleValue : '') + sep('{', true) + newLine();
						rootSel = '';
					}					
				}
			}
			if (selBody) { root.itemCss += selBody; }
			
			// subsequent levels
			if (theItem.children.length !== 0) {
				for (index3 = 0; index3 < theItem.children.length; ++index3) {
					processItem(root, rootSel, theItem.children[index3]);
				}
			}
			if (isRootLevel && theItem.isAtRule && !theItem.stylesLiteral && theItem.styles.length === 0) {
				root.itemCss += '}' + newLine();
			}			
		};		
		var generateCSS = function() {
			var css = '',
				root = {itemCss: ''},
				index = 0;
			for (index = 0; index < allItems.length; ++index) { // all top level items
				root.itemCss = '';
				processItem(root, '', allItems[index]);
				css += (root.itemCss || '');
			}
			return css;
		};		
		
		var loadCSS = function() {
			// add new style definition
			var el = null, 
				s = null, 
				oldId = id;
			if (core.settings.isLoadOnDOM) {
				id = getNewId();
				s = window.document.createElement('style');
				s.id = id;
				s.innerHTML = generateCSS();
				window.document.getElementsByTagName('head')[0].appendChild(s);
				
				// remove old style definition, if exists
				if (oldId) {
					el = window.document.getElementById(oldId);
					el.parentNode.removeChild(el);
				}
			}
			
			// set flags
			isLoaded = true;
			isDirty = false;
		};
		var unloadCSS = function() {
			if (isLoaded && core.settings.isLoadOnDOM) {
				// remove style
				var el = window.document.getElementById(id);
				el.parentNode.removeChild(el);
				
				// reset flags
				id = '';
				isLoaded = false;
				isDirty = true;
			}	
		};
		
		var valueChanged = function(type, name, oldValue, newValue) {
			isDirty = true;
			if (isLoaded && core.settings.isReloadOnChange) {
				self.reload();
				if (core._.state.isChangeHandlersAttached) {
					core._.raiseEvent({css: self, type: 'valueChanged'});
				}					
			}	
		};
		var statusChanged = function(type, name, oldValue, newValue) {
			isDirty = true;
			if (isLoaded && core.settings.isReloadOnChange) {
				self.reload();
				if (core._.state.isChangeHandlersAttached) {
					core._.raiseEvent({css: self, type: 'statusChanged'});
				}				
			}	
		};		
		
		var getPrefixedSet = function(propName, propValue) {
			var rule = '', 
				prefix = '',
				index = 0;
			for (index = 0; index < allPrefixes.length; ++index) {
				prefix = allPrefixes[index];
				rule += tab() + propName.replace(prefixPlaceholder, prefix) + sep(':') + propValue + ';' + newLine();
			}
			return rule;
		};
		var varWrapper = function(varName, varValueOrFunc) {
			var currentPlainValue = null,
				isFirstCall = true;
			var getValue = function(varValue) {
				var value = varValue;
				if (isFunction(value)) { value = value.apply(self); }
				return value;
			};
			getValue.plain = function() { return getValue(currentPlainValue); };
			var wrapper = function(newVarValueOrFunc) {
				if (isFirstCall) {
					isFirstCall = false;
					currentPlainValue = varValueOrFunc;
				}
				if (newVarValueOrFunc) { 
					var oldValue =  getValue(currentPlainValue); // last value
					varValueOrFunc = newVarValueOrFunc;
					currentPlainValue = newVarValueOrFunc;
					valueChanged(valueTypes.vars, varName, oldValue, getValue(currentPlainValue));
				}
				return getValue(currentPlainValue);
			};
			wrapper(); // call it once, so default value is set in FirstCall
			var varId = randomName();
			wrapper.id = function() { return varId; };				
			wrapper.type = function() { return valueTypes.vars; };
			wrapper.fName = function() { return varName; };
			wrapper.raw = function() { return getValue.plain(); };
			wrapper.raw.type = function() { 
				var rawValue = wrapper.raw();
				if (typeof rawValue === 'object' && isFunction(rawValue.type)) {
					return rawValue.type(); 
				}
				return typeof rawValue; 
			};
			core._.exObj(self, wrapper, valueTypes.vars, wrapper.raw.type(), '');
			return wrapper;
		};
		var ruleWrapper = function(ruleName, isAddPrefixes, propName, propValueOrLiteral, propValueSuffixOrNone) {
			var currentPlainValue = null,
				isFirstCall = true;
			var getRule = function(propValue) {
				var rule = '';
				propValue = propValue.toString();
				if (propValue) {
					if (isAddPrefixes) { rule = getPrefixedSet(propName, propValue); } 
					rule += tab() + propName.replace(prefixPlaceholder, '') + sep(':') + propValue + ';' + newLine();
				}
				return rule;
			};
			var getValue = function(propValue, isSkipAddingSuffix) {
				var value = propValue;
				if (isFunction(propValue)) { value = propValue.apply(self); }
				if (value && propValueSuffixOrNone && !isSkipAddingSuffix) {
					if (isFunction(propValueSuffixOrNone)) {
						value = value.toString() + (propValueSuffixOrNone.apply(self)).toString();
					} else {
						value = value.toString() + propValueSuffixOrNone.toString();
					}
				}
				return value;				
			};
			getValue.plain = function() { return getValue(currentPlainValue, true); };			
			var wrapper = function(newPropValueOrLiteral, newPropValueSuffixOrNone) {
				if (isFirstCall) {
					isFirstCall = false;
					if (isLiteral(propValueOrLiteral)) {
						currentPlainValue = propValueOrLiteral[Object.keys(propValueOrLiteral)[0]]; // pick first item's value as default value
					} else if (isString(propValueOrLiteral)) { 
						if (propValueOrLiteral.substring(0, 1) === keyIdentifier) { // not possible in first call
							throw notSupported;
						}
						currentPlainValue = propValueOrLiteral;
					} else {
						currentPlainValue = propValueOrLiteral;
					}
				}
				if (arguments.length > 0) { 
					var key = '',
						propValue = null, oldValue = null;
					if (isLiteral(newPropValueOrLiteral)) {
						propValueOrLiteral = newPropValueOrLiteral;
						propValue = newPropValueOrLiteral[Object.keys(newPropValueOrLiteral)[0]]; // pick first item's value as default value
					} else if (isString(newPropValueOrLiteral)) {
						if (newPropValueOrLiteral.substring(0, 1) === keyIdentifier) { // key, coming from select()
							key = newPropValueOrLiteral.substring(1);
							propValue = propValueOrLiteral[key]; 
						} else {
							propValueOrLiteral = newPropValueOrLiteral;
							propValue = newPropValueOrLiteral;
						}
					} else {
						propValueOrLiteral = newPropValueOrLiteral;
						propValue = newPropValueOrLiteral;
					}
					oldValue = getRule(currentPlainValue); // last current
					if (newPropValueSuffixOrNone) { propValueSuffixOrNone = newPropValueSuffixOrNone; }
					currentPlainValue = propValue;
					valueChanged(valueTypes.rule, ruleName, oldValue, getRule(currentPlainValue)); 
				}
				return getRule(getValue(currentPlainValue));
			};
			wrapper(); // call it once, so default value is set in FirstCall
			var ruleId = randomName();
			var isOn = true;
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
			if (isLiteral(propValueOrLiteral)) {
				wrapper.select = function(key) {
					if (isFunction(key)) { key = key.apply(self); }
					wrapper(keyIdentifier + key); 
				};
			}
			wrapper.raw = function() { return getValue.plain(); };
			wrapper.raw.type = function() { 
				var rawValue = wrapper.raw();
				if (typeof rawValue === 'object' && isFunction(rawValue.type)) {
					return rawValue.type(); 
				}
				return typeof rawValue; 
			};
			wrapper.raw.property = function() { return propName; };
			wrapper.raw.hasPrefixes = function() { return isAddPrefixes; };
			wrapper.raw.suffix = function() {
				var fullValue = getValue();
				var justValue = wrapper.prop.value();
				return fullValue.replace(justValue, '');
			};
			core._.exObj(self, wrapper, valueTypes.rule, wrapper.raw.type(), propName);
			return wrapper;
		};
		var styleWrapper = function(styleName, rulesArrayOrLiteral) {
			var currentPlainValue = null,
				isFirstCall = true;
			var getStyles = function(rules) { 
				var theStyles = '', chars = '', ruleProp = '',
					index = 0,
					ruleValue = null, rule = null;
				if (isLiteral(rules)) {
					for(ruleProp in rules) {
						if (rules.hasOwnProperty(ruleProp)) {
							ruleValue = rules[ruleProp];
							if (ruleValue) {
								if (isFunction(ruleValue)) {
									ruleValue = ruleValue.apply(self).toString();
								} else {
									ruleValue = ruleValue.toString();
								}
								if (ruleProp.indexOf(prefixPlaceholder) !== -1) { // add prefix
									rule = getPrefixedSet(ruleProp, ruleValue);
								}
								rule = tab() + ruleProp.replace(prefixPlaceholder, '') + sep(':') + ruleValue + ';' + newLine();	
								theStyles += rule;
							}
						}
					}
				} else {
					for (index = 0; index < rules.length; ++index) {
						rule = rules[index];
						if (rule.isOn()) {
							ruleValue = rule.apply(self);
							if (rule.type() === valueTypes.style) { ruleValue += newLine(); }
							theStyles += ruleValue;
						}
					}
				}
				chars = newLine();
				if (chars.length > 0 && theStyles.substring(theStyles.length - chars.length) === chars) {
					theStyles = theStyles.substring(0, (theStyles.length - chars.length));
				}
				return theStyles;
			};				
			var getValue = function(rules) {
				var value = null;
				if (isLiteral(rules)) { // direct rules w/o rule objects
					value = rules;
				} else { // one or more rule objects
					value = (isArray(rules) ? rules : [rules]);	
				}
				return value;				
			};
			getValue.plain = function() { return getValue(currentPlainValue); };
			var wrapper = function(newRulesArrayOrLiteral) {
				var key = '', 
					rules = null;
				if (isFirstCall) {
					isFirstCall = false;
					if (isString(rulesArrayOrLiteral) && rulesArrayOrLiteral.substring(0, 1) === keyIdentifier) { // not possible in first call
						throw notSupported;
					} 
					if (isLiteral(rulesArrayOrLiteral)) {
						currentPlainValue = rulesArrayOrLiteral[Object.keys(rulesArrayOrLiteral)[0]]; // pick first item's set as value
					} else {
						currentPlainValue = rulesArrayOrLiteral;
					}
				}
				if (arguments.length > 0) { 
					if (isString(newRulesArrayOrLiteral) && newRulesArrayOrLiteral.substring(0, 1) === keyIdentifier) { // key
						key = newRulesArrayOrLiteral.substring(1);
						rules = rulesArrayOrLiteral[key]; 
					} else if (isLiteral(newRulesArrayOrLiteral)) {
						rulesArrayOrLiteral = newRulesArrayOrLiteral;
						rules = newRulesArrayOrLiteral[Object.keys(newRulesArrayOrLiteral)[0]]; // pick first item's set as value
					} else {
						rulesArrayOrLiteral = newRulesArrayOrLiteral; 
						rules = newRulesArrayOrLiteral;
					}
					var oldValue = getStyles(getValue(currentPlainValue)); // last value
					currentPlainValue = rules;
					valueChanged(valueTypes.style, styleName, oldValue, getStyles(getValue(currentPlainValue))); 
				}
				return getStyles(getValue(currentPlainValue));
			};
			wrapper(); // call it once, so default value is set in FirstCall
			var styleId = randomName();
			var isOn = true;
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
			wrapper.rules = function() { return getValue.plain(); };
			wrapper.rules.add = function(newRules, isInsertOnTop) {
				var processedRuleArray = getValue.plain();
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
				var processedRuleArray = getValue.plain(),
					index = 0, foundAt = -1,
					item = null,
					ruleId = rule.id(),
					isRemoved = false;
				processedRuleArray = (isArray(processedRuleArray) ? processedRuleArray.slice(0) : [processedRuleArray]);
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
			if (isLiteral(rulesArrayOrLiteral)) {
				wrapper.select = function(key) {
					if (isFunction(key)) { key = key.apply(self); }
					wrapper(keyIdentifier + key); 
				};
			}			
			wrapper.raw = function() { return getValue.plain(); };
			wrapper.raw.type = function() { return typeof wrapper.raw(); };
			core._.exObj(self, wrapper, valueTypes.style, '', '');
			return wrapper;			
		};
		
		self._ = {};
		self._.prefixes = function() {
			if (isEnd || isDone) { throw notSupported; }
			var index = 0,
				prefix = '';
			for (index = 0; index < arguments.length; ++index) {
				prefix = arguments[index];
				if (isFunction(prefix)) { prefix = prefix.apply(self).toString(); }
				if (allPrefixes.indexOf(prefix) !== -1) { throw prefix + alreadyDefined; }
				allPrefixes.push(prefix);
			}
		};			
		self._.rule = function(propName, propValueOrLiteral, propValueSuffixOrNone) { 
			if (isEnd || isDone) { throw notSupported; }
			if (!propName) { return; }
			var ruleName = '',
				isAddPrefixes = false,
				nameEndsAt = -1,
				theRule = null;
			if (propName.substring(0, 1) === '[') {
				nameEndsAt = propName.indexOf(']');
				ruleName = propName.substring(1, nameEndsAt);
				propName = propName.substring(nameEndsAt + 1).trim();
				if (self.rules[ruleName]) { throw ruleName + alreadyDefined; }				
			} else {
				ruleName = randomName();
			}
			if (propName.indexOf(prefixPlaceholder) !== -1) {
				isAddPrefixes = true;
			}
			theRule = ruleWrapper(ruleName, isAddPrefixes, propName, propValueOrLiteral, propValueSuffixOrNone);
			self.rules[ruleName] = theRule;
			return theRule;
		};
		self._.style = function() {
			if (isEnd || isDone) { throw notSupported; }
			var styleName = '',
				theStyle = null, 
				rulesLiteral = null, 
				para = null,
				index = 0,
				rules = [];
			for (index = 0; index < arguments.length; ++index) {
				para = arguments[index];
				if (index === 0) {
					if (isString(para)) {
						styleName = para;
						if (self.styles[styleName]) { throw styleName + alreadyDefined; }  
						continue;
					}
					styleName = randomName();
				}
				if (isLiteral(para)) { // namedRulesCollection
					rulesLiteral = para;
					break; 
					// NOTE: only one literal can be defined, if multiple are defined
					// first one will be picked
					// if rules and literal both are defined, only first literal will be used
					// rules will be discarded
				}
				if (isFunction(para) && isFunction(para.type) && para.type() === valueTypes.rule) { // rule
					rules.push(para);
				} else if (isFunction(para) && isFunction(para.type) && para.type() === valueTypes.style) { // style
					rules.push(para); // style itself
				}
			}
			theStyle = styleWrapper(styleName, (rulesLiteral || rules));
			self.styles[styleName] = theStyle;
			return theStyle;				
		};	
		self._.vars = function(para1, para2) {
			if (isEnd || isDone) { throw notSupported; }
			var theVar = null, 
				property = null;
			if (arguments.length === 2) { // name, value
				if (self.vars[para1]) { throw para1 + alreadyDefined; }
				theVar = varWrapper(para1, para2);
				self._.vars[para1] = theVar;
				self.vars[para1] = theVar;
				return theVar;
			} 
			if (isLiteral(para1)) { // { key1: value1, key2: value3, ... }
				for (property in para1) {
					if (para1.hasOwnProperty(property)) {
						if (self.vars[property]) { throw property + alreadyDefined; }
						theVar = varWrapper(property, para1[property]);
						self._.vars[property] = theVar;
						self.vars[property] = theVar;
					}
				}
				return null;
			}
		};
		self._.$$ = function() {
			if (isEnd || isDone) { throw notSupported; }
			var para = null, 
				chainObject = null, 
				parentObject = null, 
				theItem = null,
				index = 0;
			if (arguments.length === 0) {
				if (hierarchyStack.length !== 0) { hierarchyStack.pop(); }
			} else if (isRootLevel) {
				hierarchyStack = [];
			} else {
				if (hierarchyStack.length !== 0) { 
					parentObject = hierarchyStack[hierarchyStack.length - 1]; 
				}
			}
			theItem = {
				type: '', 
				selector: '', 
				directValue: '', 
				atRuleValue: '',
				canBeScoped: false, 
				isAtRule: false, 
				parent: parentObject, 
				stylesLiteral: null,
				styles: [], 
				siblings: [], 
				children: []
			};
			if (arguments.length !== 0) {
				for (index = 0; index < arguments.length; ++index) {
					para = arguments[index];
					if (index === 0) {
						if (isFunction(para)) { para = para.apply(self).toString(); }
						if (para.substring(0, 1) === scopePlaceholder) { // scope-required selector
							if (!isRootLevel) { throw nestedScopesCanNotBeApplied; }
							para = para.substring(1);
							theItem.type = valueTypes.sel;
							theItem.canBeScoped = true;
							theItem.selector = para;
							continue;
						} 
						if (para.substring(0, 1) === atRuleIdentifier) { // at-rule
							theItem.type = valueTypes.at;
							theItem.isAtRule = true;
							theItem.selector = para;
							continue;
						} 
						if (para.substring(0, 1) === verbatimIdentifier) { // verbatim string
							theItem.type = valueTypes.dir;
							theItem.directValue = para.substring(1);
							continue;
						} 
						// selector
						theItem.type = valueTypes.sel;
						theItem.selector = para;
						continue;				
					}
					if (theItem.isAtRule && index === 1 && isString(para)) { // at-rule value
						theItem.atRuleValue = para;
						continue;
					}
					if (isLiteral(para)) { // literal format rules for in-place styling
						theItem.stylesLiteral = para;
						continue;
					}
					if (isFunction(para) && isFunction(para.type) && para.type() === valueTypes.style) { // normal styles
						theItem.styles.push(para); 
					} else if (isFunction(para) && isFunction(para.type) && para.type() === valueTypes.rule) { // one rule
						theItem.styles.push(self._.style(para)); 
					} else {
						throw invalidArgument;
					}
				}
				if (theItem.parent) {
					if (isChild) {
						theItem.parent.children.push(theItem);
						hierarchyStack.push(theItem);
					} else if (isSibling) {
						theItem.parent.siblings.push(theItem);
					} else {
						throw notSupported;
					}
				} else {
					allItems.push(theItem);
					hierarchyStack.push(theItem);
				}
			}
			
			chainObject = {};
			if (!isRootLevel) {
				chainObject.up = function() { 
					var oldRootLevel = isRootLevel,
						func = self._.$$,
						returnValue = null;
					isChild = false;
					isRootLevel = false;
					returnValue = func.apply(self, []);
					isChild = false;
					isRootLevel = oldRootLevel;
					return returnValue;
				};		
			}
			if (isSibling && !theItem.stylesLiteral && theItem.styles.length === 0) { delete chainObject.up; }
			if (!isSibling) {
				chainObject.$$ = function() { 
					var oldRootLevel = isRootLevel,
						func = self._.$$,
						returnValue = null;
					isChild = true;
					isRootLevel = false;
					returnValue = func.apply(self, arguments);
					isChild = false;
					isRootLevel = oldRootLevel;
					return returnValue;
				};
			}
			if (!isRootLevel && !theItem.isAtRule && !theItem.stylesLiteral && theItem.styles.length === 0) {
				chainObject.join = function() {
					var oldRootLevel = isRootLevel,
						func = self._.$$,
						returnValue = null;
					isSibling = true;
					isRootLevel = false;
					returnValue = func.apply(self, arguments);
					isSibling = false;
					isRootLevel = oldRootLevel;
					return returnValue;				
				};
			}
			return chainObject;
		};
		self._.end = function(isLoadNow) {
			if (isEnd || isDone) { throw notSupported; }
			if (arguments.length === 0) { isLoadNow = true; }
			if (!isLoadNow) {
				if (!isEnd) {
					isDirty = true;
					isDone = true;
				}			
			} else {
				if (!isDone) {
					isDirty = true; 
					isEnd = true;
					self.reload();
				}
			}
		};
		
		self.vars = {};
		self.styles = {};
		self.rules = {};
		
		self.parent = core;
		self.id = function() { return id; };
		self.isChanged = function() { return isDirty; };
		self.name = function() { return objectName; };
		self.toCSS = function(isGeneratePrettyCSS) { 
			var oldIsGeneratePrettyCSS = core.settings.isGeneratePrettyCSS,
				startTime = 0,
				endTime = 0,
				css = '';
			if (arguments.length > 0) { core.settings.isGeneratePrettyCSS = isGeneratePrettyCSS; }
			startTime = window.performance.now();
			css = generateCSS();
			endTime = window.performance.now();
			window.console.log('js3 > css: ' + (endTime - startTime).toPrecision(6) + ' ms');
			core.settings.isGeneratePrettyCSS = oldIsGeneratePrettyCSS;
			return css;
		};
		self.load = function(scope) {
			if (isDone) {
				if (!isLoadAfterDone || (isLoadAfterDone && !isLoaded)) {
					isLoadAfterDone = true;
					if (scope) { selectorScope = scope; }					
					isDirty = true; 
					self.reload();
				}
			}
		};
		self.reload = function(isForceReload, isAutoLoad) { 
			if ((((isDirty && !isDone) || (isDirty && isDone && isLoadAfterDone)) && !core._.state.isUpdatesSuspended) || (isForceReload && (isLoadAfterDone || isEnd))) { 
				if (isAutoLoad && isManuallyUnloaded) { return; }
				loadCSS(); 
				isManuallyUnloaded = false;
				if (core._.xref.hasDependents(objectName)) { core._.reloadDependents(objectName, isForceReload); }
			}
		};
		self.unload = function(isAutoUnload) { 
			if (isLoaded) { 
				if (!isManuallyUnloaded && !isAutoUnload) { isManuallyUnloaded = true; }
				unloadCSS(); 
				if (core._.xref.hasDependents(objectName)) { core._.unloadDependents(objectName); }
			}
		};
		self.remove = function() {
			self.unload();
			core.remove(self.name());
			if (core._.xref.hasDependents(objectName)) { core._.removeDependents(objectName); }
		};
	};
	var JS3 = function() {
		var core = this,
			allFiles = [], 
			allHandlers = [], 
			xref = {}, 
			allEx = {}, 
			allFn = {},
			allTypes = {},
			alreadyLoaded = ' is already loaded',
			reservedName = ' is a reserved name';
		
		core.info = {
			name: function() { return CONST.NAME; },
			title: function() { return CONST.TITLE; },
			version: function() { return CONST.VERSION; },
			copyright: function() { return CONST.COPYRIGHT; },
			url: function() { return CONST.URL; }
		};
		
		core.settings = {};
		core.settings.isLoadExtensions = true;
		core.settings.isLoadOnDOM = true;
		core.settings.isReloadOnChange = true;
		core.settings.isConsiderScopes = true;
		core.settings.isGeneratePrettyCSS = false;
		
		core._ = {};		
		core._.state = {};
		core._.state.isUpdatesSuspended = false;
		core._.state.isChangeHandlersAttached = false;
		
		core._.xref = function(dependentObject, depenentOnObjectsArray) {
			var dependentOnObject = '',
				index = 0,
			    dependents = null;
			for (index = 0; index < depenentOnObjectsArray.length; ++index) {
				dependentOnObject = depenentOnObjectsArray[index];
				if (dependentOnObject !== dependentObject) {
					dependents = xref[dependentOnObject] || [];
					if (dependents.indexOf(dependentObject) === -1) { 
						dependents.push(dependentObject);
						xref[dependentOnObject] = dependents;
					}
				}
			}
		};
		core._.xref.hasDependents = function(ofObjectName) {
			return (isArray(xref[ofObjectName]) && xref[ofObjectName].length > 0);
		};

		core._.raiseEvent = function(e) {
			var index = 0;
			for (index = 0; index < allHandlers.length; ++index) {
				allHandlers[index].handler(e); // call
			}
		};
		core._.reloadDependents = function(ofObjectName, isForceReload) {
			var dependentFiles = (xref[ofObjectName] || []),
				index = 0,
				dependentFile = '',
				css = null;
			for (index = 0; index < dependentFiles.length; ++index) {
				dependentFile = dependentFiles[index];
				css = core[dependentFile];
				if (css) { css.reload(isForceReload, true); }
			}
		};
		core._.removeDependents = function(ofObjectName) {
			var dependentFiles = (xref[ofObjectName] || []),
				index = 0,
				dependentFile = '',
				css = null;
			for (index = 0; index < dependentFiles.length; ++index) {
				dependentFile = dependentFiles[index];
				css = core[dependentFile];
				if (css) { css.remove(); }
			}
		};
		core._.unloadDependents = function(ofObjectName) {
			var dependentFiles = (xref[ofObjectName] || []),
				index = 0,
				dependentFile = '',
				css = null;
			for (index = 0; index < dependentFiles.length; ++index) {
				dependentFile = dependentFiles[index];
				css = core[dependentFile];
				if (css) { css.unload(true); }
			}
		};
		core._.exObj = function(css, wrapper, objectType, dataType, type) {
			var ex = null, 
				property = null, 
				exDefn = null, 
				fnItem = null,
				fnProp = '',
				args = [], 
				argValues = [];
			var update = function() {
				wrapper.apply(css, arguments);
				return wrapper;
			};				
			for (property in allEx) {
				if (allEx.hasOwnProperty(property)) {
					ex = allEx[property];
					if (ex.targetFilter.objectType.indexOf(objectType) !== -1 &&
					   (!ex.targetFilter.dataType || ex.targetFilter.dataType.indexOf(dataType) !== -1) &&
					   (!ex.targetFilter.type || ex.targetFilter.type(type) !== -1)) {
						args = ['css', 'parent', 'name', 'object', 'raw', 'value', 'update'];
						argValues = [css, css.parent, css.name(), wrapper, wrapper.raw, wrapper, update];
						for (fnProp in allFn) {
							if (allFn.hasOwnProperty(fnProp)) {
								fnItem = allFn[fnProp];
								args.push(fnItem.name);
								argValues.push(fnItem.defn);					
							}
						}							
						args.push(ex.body);
						exDefn = Function.apply(null, args);
						exDefn.apply(css, argValues);
					}
				}
			}		
		};

		core.define = function(objectName, referOrObjectDefn, objectDefnOrNone) {
			var css = null, 
				objectDefn = null, 
				objectDefnWrapper = null, 
				referredCss = null, 
				fnItem = null,
				body = '', 
				referCss = '', 
				fnProp = '',
				index = 0, 
				args = ['css', 'parent', 'name', 'prefixes', 'vars', 'style', 'styles', 'rule', 'rules', '$$', 'end'], 
				argValues = [],
				refer = [], 
				included = [];	
			if (isArray(referOrObjectDefn)) {
				refer = referOrObjectDefn;
				objectDefn = objectDefnOrNone;
			} else {
				objectDefn = referOrObjectDefn;
			}
			if (core[objectName]) { throw objectName + alreadyLoaded; }
			if (args.indexOf(objectName) !== -1) { throw objectName + reservedName; }
			css = new CSS(core, objectName);
			core[objectName] = css;
			allFiles.push(css);
			
			body = objectDefn.toString();
			body = body.substring(body.indexOf("{") + 1, body.lastIndexOf("}"));
			argValues = [css, css.parent, objectName, css._.prefixes, css._.vars, css._.style, css.styles, css._.rule, css.rules, css._.$$, css._.end];
			if (refer.length > 0) {
				for (index = 0; index < refer.length; ++index) {
					referCss = refer[index];
					if (referCss !== objectName) {
						referredCss = core[referCss];
						if (referredCss) {
							included.push(referCss);
							args.push(referCss);
							argValues.push(referredCss);
						} else {
							throw referCss + ' is not loaded.';
						}
					}
				}
				if (included.length > 0) { core._.xref(objectName, included); }
			}
			for (fnProp in allFn) {
				if (allFn.hasOwnProperty(fnProp)) {
					fnItem = allFn[fnProp];
					args.push(fnItem.name);
					argValues.push(fnItem.defn);					
				}
			}
			args.push(body);
			objectDefnWrapper = Function.apply(null, args);
			objectDefnWrapper.apply(css, argValues);  
			return css;
		};
		
		core.ex = {};
		core.ex.op = function(exName, targetFilter, exDefn) {
			if (!core.settings.isLoadExtensions) { return; }
			if (isFunction(targetFilter)) {
				exDefn = targetFilter;
				targetFilter = {};
			} else if (isArray(targetFilter)) {
				targetFilter = { objectType: targetFilter };
			}
			if (!targetFilter.objectType) { targetFilter.objectType = [valueTypes.vars, valueTypes.style, valueTypes.rule]; }
			if (targetFilter.dataType) { targetFilter.dataType = isArray(targetFilter.dataType) || [targetFilter.dataType]; }
			if (targetFilter.type) { targetFilter.type = isArray(targetFilter.type) || [targetFilter.type]; }
			targetFilter.objectType = (isArray(targetFilter.objectType) ? targetFilter.objectType : [targetFilter.objectType]);
			var index = 0,
				objectType = '', 
				fullName = '', 
				body = '';
			for (index = 0; index < targetFilter.objectType.length; ++index) {
				objectType = targetFilter.objectType[index];
				fullName = '_' + objectType + '_' + exName;
				if (allEx[fullName]) { throw fullName + alreadyLoaded; }
				body = exDefn.toString();
				body = body.substring(body.indexOf("{") + 1, body.lastIndexOf("}"));
				allEx[fullName] = {exName: exName, targetFilter: targetFilter, body: body};
			}
		};
		core.ex.fn = function(fnName, fnDefn) {
			if (!core.settings.isLoadExtensions) { return; }
			if (['css', 'parent', 'name', 'object', 'raw', 'value', 'update'].indexOf(fnName) !== -1) { throw fnName + reservedName;}
			if (allFn['_' + fnName]) { throw fnName + alreadyLoaded; }
			allFn['_' + fnName] = {name: fnName, defn: fnDefn};
		};
		core.ex.ty = function(typeName, typeDefn) {
			if (!core.settings.isLoadExtensions) { return; }
			if (allTypes[typeName]) { throw typeName + alreadyLoaded; }
			allTypes[typeName] = typeDefn;
		};
		core.types = function(typeName) {
			if (allTypes[typeName]) { return allTypes[typeName]; }
			return null;
		};		
		
		core.onChange = function(handlerName, handler) {
			var index = 0, 
				foundAt = -1;
			for (index = 0; index < allHandlers.length; ++index) {
				if (allHandlers[index].name === handlerName) { 
					foundAt = index;
					break;
				}
			}
			if (isFunction(handler)) {
				core._.state.isChangeHandlersAttached = true;
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
					core._.state.isChangeHandlersAttached = false;
				}
			}
		};
		core.all = function() { return allFiles; };
		core.suspendUpdates = function() { 
			core._.state.isUpdatesSuspended = true; 
		};
		core.isUpdatesSuspended = function() { 
			return core._.state.isUpdatesSuspended;
		};
		core.resumeUpdates = function() { 
			core._.state.isUpdatesSuspended = false;
			core.reload.all(); // without force
		};
		
		core.load = {};
		core.load.all = function() {
			var index = 0, 
				css = null;
			for (index = 0; index < allFiles.length; ++index) {
				css = allFiles[index];
				css.load.apply(css, arguments);
			}	
		};
		core.unload = {};
		core.unload.all = function() {
			var index = 0,
				css = null;
			for (index = 0; index < allFiles.length; ++index) {
				css = allFiles[index];
				css.unload();
			}			
		};
		core.reload = {};
		core.reload.all = function(isForceReload) {
			var index = 0,
				css = null;
			for (index = 0; index < allFiles.length; ++index) {
				css = allFiles[index];
				css.reload(isForceReload);
			}			
		};
		core.remove = function(objectName) {
			var index = 0, 
				foundAt = -1,
				css = null;
			if (!core[objectName]) { return; }
			delete core[objectName];
			for (index = 0; index < allFiles.length; ++index) {
				css = allFiles[index];
				if (css.name() === objectName) { foundAt = index; break; }
			}
			if (foundAt !== -1) { allFiles.splice(foundAt, 1); }
		};
		core.remove.all = function() {
			var index = 0,
				css = null;
			core.unload.all();
			for (index = 0; index < allFiles.length; ++index) {
				css = allFiles[index];
				delete core[css.name()];
			}
			allFiles = [];
		};
	};
	
	window.JS3 = new JS3();
	
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