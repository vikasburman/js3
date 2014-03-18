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
}());;/**
  * JS3 Extension - Color manipulation types, functions and operations 
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
/*jslint indent: 4, maxerr: 50, white: true, vars: true, unparam: true, plusplus: true, bitwise: true, continue: true */
/*global window, JS3, object, raw, value, update, css, parent, name */ 

/* jshint ignore:start */
/* ignore jslint start */
// pusher.color.js - version v0.2.5 (http://tech.pusherhq.com/libraries/color)
// The MIT License (MIT). Copyright (c) 2013, Pusher Inc.
(function(){function normalize360(v){v=v%360;return v<0?360+v:v}function unsigned(i){return i>>>0}function trimLc(s){return s.replace(/^\s+/,"").replace(/\s+$/,"").toLowerCase()}function slice(obj,index){return Array.prototype.slice.call(obj,index)}function append(arr,value){arr.push(value);return arr}function clamp(x,a,b){return!(x>a)?a:!(x<b)?b:x}function mix(x,y,a){return(1-a)*x+a*y}function f2b(f){f=Math.round(255*f);if(!(f>0))return 0;else if(!(f<255))return 255;else return f&255}function b2f(b){return b/255}function rgbToHsl(r,g,b){var max=Math.max(r,g,b),min=Math.min(r,g,b);var h,s,l=(max+min)/2;if(max==min){h=s=0}else{var d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break}h/=6}return[h,s,l]}function hslToRgb(h,s,l){var r,g,b;if(s==0){r=g=b=l}else{function hue2rgb(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p}var q=l<.5?l*(1+s):l+s-l*s;var p=2*l-q;r=hue2rgb(p,q,h+1/3);g=hue2rgb(p,q,h);b=hue2rgb(p,q,h-1/3)}return[r,g,b]}function hex4ToRgba(color){var rgba=[parseInt(color.substr(1,1),16),parseInt(color.substr(2,1),16),parseInt(color.substr(3,1),16),1];for(var i=0;i<3;++i)rgba[i]=(rgba[i]*16+rgba[i])/255;return rgba}function hex7ToRgba(color){return[parseInt(color.substr(1,2),16)/255,parseInt(color.substr(3,2),16)/255,parseInt(color.substr(5,2),16)/255,1]}var namedColors={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,216],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[216,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]};function rgbaToHsva(rgba){var r=rgba[0];var g=rgba[1];var b=rgba[2];var min=Math.min(Math.min(r,g),b),max=Math.max(Math.max(r,g),b),delta=max-min;var value=max;var saturation,hue;if(max==min){hue=0}else if(max==r){hue=60*((g-b)/(max-min))%360}else if(max==g){hue=60*((b-r)/(max-min))+120}else if(max==b){hue=60*((r-g)/(max-min))+240}if(hue<0){hue+=360}if(max==0){saturation=0}else{saturation=1-min/max}return[Math.round(hue),Math.round(saturation*100),Math.round(value*100),rgba[3]]}function hsvaToRgba(hsva){var h=normalize360(hsva[0]);var s=hsva[1];var v=hsva[2];var s=s/100;var v=v/100;var hi=Math.floor(h/60%6);var f=h/60-hi;var p=v*(1-s);var q=v*(1-f*s);var t=v*(1-(1-f)*s);var rgb=[];switch(hi){case 0:rgb=[v,t,p];break;case 1:rgb=[q,v,p];break;case 2:rgb=[p,v,t];break;case 3:rgb=[p,q,v];break;case 4:rgb=[t,p,v];break;case 5:rgb=[v,p,q];break}return[rgb[0],rgb[1],rgb[2],hsva[3]]}function rgbaToHsl(c){var hsl=rgbToHsl(c[0],c[1],c[2]);hsl[0]=normalize360(Math.floor(hsl[0]*360));hsl[1]=Math.floor(hsl[1]*100);hsl[2]=Math.floor(hsl[2]*100);return hsl}function rgbaToHsla(c){var hsl=rgbaToHsl(c);hsl.push(c[3]);return hsl}function hslToRgba(c){var h=parseFloat(c[0])/360;var s=parseFloat(c[1])/100;var l=parseFloat(c[2])/100;var rgb=hslToRgb(h,s,l);return[rgb[0],rgb[1],rgb[2],1]}function hslaToRgba(c){var h=parseFloat(c[0])/360;var s=parseFloat(c[1])/100;var l=parseFloat(c[2])/100;var rgb=hslToRgb(h,s,l);return[rgb[0],rgb[1],rgb[2],parseFloat(c[3])]}var parse={byteOrPercent:function(s){var m;if(typeof s=="string"&&(m=s.match(/^([0-9]+)%$/)))return Math.floor(parseFloat(m[1])*255/100);else return parseFloat(s)},floatOrPercent:function(s){var m;if(typeof s=="string"&&(m=s.match(/^([0-9]+)%$/)))return parseFloat(m[1])/100;else return parseFloat(s)},numberOrPercent:function(s,scale){var m;if(typeof s=="string"&&(m=s.match(/^([0-9]+)%$/)))return parseFloat(m[1])/100*scale;else return parseFloat(s)},rgba:function(v){for(var i=0;i<3;++i)v[i]=b2f(parse.byteOrPercent(v[i]));v[3]=parse.floatOrPercent(v[i]);return new Color(v)},rgba8:function(v){return new Color([b2f(parse.byteOrPercent(v[0])),b2f(parse.byteOrPercent(v[1])),b2f(parse.byteOrPercent(v[2])),b2f(parse.byteOrPercent(v[3]))])},float3:function(v){for(var i=0;i<3;++i)v[i]=parse.floatOrPercent(v[i]);v[3]=1;return new Color(v)},float4:function(v){for(var i=0;i<3;++i)v[i]=parse.floatOrPercent(v[i]);v[3]=parse.floatOrPercent(v[i]);return new Color(v)},hsla:function(v){v[0]=parse.numberOrPercent(v[0],360);v[1]=parse.numberOrPercent(v[1],100);v[2]=parse.numberOrPercent(v[2],100);v[3]=parse.numberOrPercent(v[3],1);return new Color(hslaToRgba(v))},hsva:function(v){v[0]=normalize360(parseFloat(v[0]));v[1]=Math.max(0,Math.min(100,parseFloat(v[1])));v[2]=Math.max(0,Math.min(100,parseFloat(v[2])));v[3]=parse.floatOrPercent(v[3]);return new Color(hsvaToRgba(v))}};var supportedFormats={keyword:{},hex3:{},hex7:{},rgb:{parse:function(v){v=v.slice(0);v.push(1);return parse.rgba(v)}},rgba:{parse:parse.rgba},hsl:{parse:function(v){v=v.slice(0);v.push(1);return parse.hsla(v)}},hsla:{parse:parse.hsla},hsv:{parse:function(v){v=v.slice(0);v.push(1);return parse.hsva(v)}},hsva:{parse:parse.hsva},rgb8:{parse:function(v){v=v.slice(0);v.push(1);return parse.rgba(v)}},rgba8:{parse:function(v){return parse.rgba8(v)}},packed_rgba:{parse:function(v){v=[v>>24&255,v>>16&255,v>>8&255,(v&255)/255];return parse.rgba(v)},output:function(v){return unsigned(f2b(v[0])<<24|f2b(v[1])<<16|f2b(v[2])<<8|f2b(v[3]))}},packed_argb:{parse:function(v){v=[v>>16&255,v>>8&255,v>>0&255,(v>>24&255)/255];return parse.rgba(v)},output:function(v){return unsigned(f2b(v[3])<<24|f2b(v[0])<<16|f2b(v[1])<<8|f2b(v[2]))}},float3:{parse:parse.float3},float4:{parse:parse.float4}};function Color(value){this._value=value}var color=function(){var match=null;if(arguments[0]instanceof Color){return new Color(arguments[0]._value)}else if(typeof arguments[0]=="string"){var first=arguments[0][0];if(first=="#"){if(match=arguments[0].match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/i)){return new Color(hex4ToRgba(match[0]))}else if(match=arguments[0].match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/i)){return new Color(hex7ToRgba(match[0]))}}else if(match=supportedFormats[arguments[0].toLowerCase()]){if(arguments.length==2)return match.parse(arguments[1]);else return match.parse(slice(arguments,1))}else if(match=arguments[0].match(/^\s*([A-Z][A-Z0-9_]+)\s*\(\s*([\-0-9A-FX]+)\s*\)\s*$/i)){var format=supportedFormats[match[1].toLowerCase()];return format.parse(match[2])}else if(match=arguments[0].match(/^\s*([A-Z][A-Z0-9]+)\s*\(\s*([0-9\.]+%?)\s*,\s*([0-9\.]+%?)\s*,\s*([0-9\.]+%?)\s*(,\s*([0-9\.]+%?)\s*)?\)\s*$/i)){var format=supportedFormats[match[1].toLowerCase()];if(match[5]===undefined){var v=[match[2],match[3],match[4]];return format.parse(v)}else{var v=[match[2],match[3],match[4],match[6]];return format.parse(v)}}else if(arguments.length==1&&(match=namedColors[trimLc(arguments[0])])){var v=match;return new Color([b2f(v[0]),b2f(v[1]),b2f(v[2]),1])}}throw"Could not parse color '"+arguments[0]+"'"};var fixed={white:color("white"),black:color("black"),gray:color("gray")};function modifyComponent(index,arg){if(arg==undefined)return f2b(this._value[index]);var v=slice(this._value,0);if(typeof arg=="string"){var m;if(m=arg.match(/^([+\-\\*]=?)([0-9.]+)/)){var op=m[1];var offset=parseFloat(m[2]);switch(op[0]){case"+":v[index]+=offset/255;break;case"-":v[index]-=offset/255;break;case"*":v[index]*=offset;break}if(op[1]=="="){this._value=v;return this}else return new Color(v)}}else{var clone=this.clone();clone._value[index]=arg;return clone}}function modifyHsva(i){return function(){function change(obj,op,value){value=parseFloat(value);var hsva=rgbaToHsva(obj._value);var c=0;switch(op){case"=":hsva[i]=value;c=1;break;case"+":hsva[i]+=value;c=1;break;case"+=":hsva[i]+=value;break;case"-":hsva[i]-=value;c=1;break;case"-=":hsva[i]-=value;break;case"*":hsva[i]*=value;c=1;break;case"*=":hsva[i]*=value;break;default:throw"Bad op "+op}if(i==0)hsva[i]=normalize360(hsva[i]);else if(i==1||i==2){if(hsva[i]<0)hsva[i]=0;else if(hsva[i]>99)hsva[i]=99}if(c)obj=obj.clone();obj._value=hsvaToRgba(hsva);return obj}if(arguments.length==0)return rgbaToHsva(this._value)[i];else if(arguments.length==1){var m;if(typeof arguments[0]=="string"&&(m=arguments[0].match(/^([\+\-\*]=?)([0-9.]+)/)))return change(this,m[1],m[2]);else return change(this,"=",arguments[0])}else if(arguments.length==2)return change(this,arguments[0],arguments[1])}}var methods={clone:function(){return new Color(this._value.slice(0))},html:function(){var self=this;var v=this._value;var _fmt={hex3:function(){return self.hex3()},hex6:function(){return self.hex6()},rgb:function(){return"rgb("+self.rgb().join(",")+")"},rgba:function(){return"rgba("+self.rgba().join(",")+")"},hsl:function(){return"hsl("+rgbaToHsl(v).join(",")+")"},hsla:function(){return"hsla("+rgbaToHsla(v).join(",")+")"},keyword:function(){var dist=3*255*255+1;var keyword;for(name in namedColors){var c=namedColors[name];var d=0;for(var i=0;i<3;++i){var t=v[i]-b2f(c[i]);d+=t*t}if(d<dist){keyword=name;dist=d}}return keyword}};var type=arguments[0]||"rgba";return _fmt[type]()},red:function(){return modifyComponent.call(this,0,arguments[0])},green:function(){return modifyComponent.call(this,1,arguments[0])},blue:function(){return modifyComponent.call(this,2,arguments[0])},alpha:function(){if(arguments.length==1){c=this.clone();c._value[3]=parse.floatOrPercent(arguments[0]);return c}else return this._value[3]},alpha8:function(){if(arguments.length==1){c=this.clone();c._value[3]=parse.byteOrPercent(arguments[0])/255;return c}else return Math.floor(this._value[3]*255)},grayvalue:function(){var c=this._value;return(c[0]+c[1]+c[2])/3},grayvalue8:function(){return f2b(this.grayvalue())},luminanceFast:function(){var c=this._value;return c[0]*.2126+c[1]*.7152+c[2]*.0722},luminance:function(){function linearize(c){return c<.03928?c/12.92:Math.pow((c+.055)/1.055,2.4)}var r=linearize(this._value[0]);var g=linearize(this._value[1]);var b=linearize(this._value[2]);return r*.2126+g*.7152+b*.0722},luminance8:function(){return f2b(this.luminance())},luminanceFast8:function(){return f2b(this.luminanceFast())},hsv:function(){return rgbaToHsva(this._value).slice(0,3)},hsva:function(){return rgbaToHsva(this._value)},packed_rgba:function(){return supportedFormats.packed_rgba.output(this._value)},packed_argb:function(){return supportedFormats.packed_argb.output(this._value)},hue:modifyHsva(0),saturation:modifyHsva(1),value:modifyHsva(2),clamp:function(){var v=this._value;return new Color([clamp(v[0],0,1),clamp(v[1],0,1),clamp(v[2],0,1),clamp(v[3],0,1)])},blend:function(colorToBlend,amount){if(typeof amount!=="number")amount=parse.floatOrPercent(amount);var c=this;var c2=color(colorToBlend);return new Color([mix(c._value[0],c2._value[0],amount),mix(c._value[1],c2._value[1],amount),mix(c._value[2],c2._value[2],amount),mix(c._value[3],c2._value[3],amount)])},add:function(d){var u=this._value;var v=color(d)._value;return new Color([u[0]+v[0]*v[3],u[1]+v[1]*v[3],u[2]+v[2]*v[3],u[3]])},inc:function(d){var u=this._value;var v=color(d)._value;u[0]+=v[0]*v[3];u[1]+=v[1]*v[3];u[2]+=v[2]*v[3];return this},dec:function(d){var u=this._value;var v=color(d)._value;u[0]-=v[0]*v[3];u[1]-=v[1]*v[3];u[2]-=v[2]*v[3];return this},subtract:function(d){var u=this._value;var v=color(d)._value;return new Color([u[0]-v[0]*v[3],u[1]-v[1]*v[3],u[2]-v[2]*v[3],u[3]])},multiply:function(d){var u=this._value;var v=color(d)._value;return new Color([u[0]*v[0],u[1]*v[1],u[2]*v[2],u[3]*v[3]])},scale:function(d){var u=this._value;return new Color([u[0]*d,u[1]*d,u[2]*d,u[3]])},xor:function(d){var u=this.rgba8();var v=color(d).rgba8();return color("rgba8",u[0]^v[0],u[1]^v[1],u[2]^v[2],u[3])},tint:function(amount){return this.blend(fixed.white,amount)},shade:function(amount){return this.blend(fixed.black,amount)},tone:function(amount){return this.blend(fixed.gray,amount)},complement:function(){var hsva=this.hsva();hsva[0]=normalize360(hsva[0]+180);return new Color(hsvaToRgba(hsva))},triad:function(){return[new Color(this._value),this.hue("+120"),this.hue("+240")]},hueSet:function(){var h=0;var set=[];for(var s=100;s>=30;s-=35)for(var v=100;v>=30;v-=35)set.push(this.hue("+",h).saturation(s).value(v));return set},hueRange:function(range,count){var base=this.hue();var set=[];for(var i=0;i<count;++i){var h=base+2*(i/(count-1)-.5)*range;set.push(this.hue("=",h))}return set},contrastWhiteBlack:function(){return this.value()<50?color("white"):color("black")},contrastGray:function(){var hsva=this.hsva();var value=hsva[2]<30?hsva[2]+20:hsva[2]-20;return new Color(hsvaToRgba([hsva[0],0,value,hsva[3]]))},contrastText:function(){var c=this._value;var b=.241*c[0]*c[0]+.691*c[1]*c[1]+.068*c[2]*c[2];return b<.51?color("white"):color("black")},hex3:function(){function hex(d,max){return Math.min(Math.round(f2b(d)/16),15).toString(16)}return"#"+hex(this._value[0])+hex(this._value[1])+hex(this._value[2])},hex6:function(){function hex(d,max){var h=f2b(d).toString(16);return h.length<2?"0"+h:h}return"#"+hex(this._value[0])+hex(this._value[1])+hex(this._value[2])},rgb:function(){var v=this._value;return[f2b(v[0]),f2b(v[1]),f2b(v[2])]},rgba:function(){var v=this._value;return[f2b(v[0]),f2b(v[1]),f2b(v[2]),v[3]]},rgb8:function(){var v=this._value;return[f2b(v[0]),f2b(v[1]),f2b(v[2])]},rgba8:function(){var v=this._value;return[f2b(v[0]),f2b(v[1]),f2b(v[2]),this.alpha8()]},float3:function(){return[this._value[0],this._value[1],this._value[2]]},float4:function(){return[this._value[0],this._value[1],this._value[2],this._value[3]]}};methods["sub"]=methods["subtract"];methods["mul"]=methods["multiply"];for(var name in methods)Color.prototype[name]=methods[name];color.float3=function(r,g,b){return new Color([r,g,b,1])};color.float4=function(r,g,b,a){return new Color([r,g,b,a])};color.version="0.2.5";color.Color=Color;if(typeof module!=="undefined"&&module.exports){module.exports=color}else if(typeof window!=="undefined"){window.pusher=window.pusher||{};window.pusher.color=color}else if(typeof self!="undefined"){self.pusher=self.pusher||{};self.pusher.color=color}})();
/* ignore jslint end */
/* jshint ignore:end */

(function() {
	"use strict";
	
	// types
	JS3.ex.ty('ColorWrapper', function(obj) {
		this.color = function() { return obj; };
		this.type = function() { return 'color'; };
		this.toString = function(format) { return obj.html(format); };
	});	

	// functions
	JS3.ex.fn('color', function(color) {
		if (!color) { throw 'invalid argument'; }
		var ColorWrapper = JS3.types('ColorWrapper');
		return new ColorWrapper(pusher.color(color)); 
	});
	JS3.ex.fn('shades', function(color, setType, para1, para2) { 
		if (!color && !setType) { throw 'invalid argument'; }
		var ColorWrapper = JS3.types('ColorWrapper'),
			theColor = pusher.color(color),
			index = 0,
			set = [], 
			wrappedSet = [];
		switch(setType) {
			case 'tri':
				set = theColor.triad();
				break;
			case 'hue':
				set = theColor.hueSet();
				break;
			case 'range':
				if (!para1 && !para2) { throw 'invalid argument'; }
				set = theColor.hueRange(para1, para2);
				break;
		}
		for (index = 0; index < set.length; ++index) { wrappedSet.push(new ColorWrapper(set[index])); }
		return wrappedSet;
	});

	// operations
	JS3.ex.op('colorOperations', {objectType: ['variable', 'rule'], dataType: 'color'}, function() { 
		var ColorWrapper = JS3.types('ColorWrapper');
		var invalidArgument = 'invalid argument';

		// get/set (w chaining)
		object.r = function(value) { 
			if (arguments.length === 0) { 
				return raw().color().red();
			} else {
				return update(new ColorWrapper(raw().color().red(value))); 
			}
		};
		object.g = function(value) { 
			if (arguments.length === 0) { 
				return raw().color().green();
			} else {
				return update(new ColorWrapper(raw().color().green(value))); 
			}
		};
		object.b = function(value) { 
			if (arguments.length === 0) { 
				return raw().color().blue();
			} else {
				return update(new ColorWrapper(raw().color().blue(value))); 
			}		
		};
		object.h = function(value) { 
			if (arguments.length === 0) { 
				return raw().color().hue();
			} else {
				return update(new ColorWrapper(raw().color().hue(value))); 
			}
		};
		object.s = function(value) { 
			if (arguments.length === 0) { 
				return raw().color().saturation();
			} else {
				return update(new ColorWrapper(raw().color().saturation(value))); 
			}
		};
		object.v = function(value) { 
			if (arguments.length === 0) { 
				return raw().color().value();
			} else {
				return update(new ColorWrapper(raw().color().value(value))); 
			}
		};
		object.alpha = function(value) { 
			if (arguments.length === 0) { 
				return raw().color().alpha();
			} else {
				return update(new ColorWrapper(raw().color().alpha(value))); 
			}
		};
		object.alpha8 = function(value) { 
			if (arguments.length === 0) { 
				return raw().color().alpha8();
			} else {
				return update(new ColorWrapper(raw().color().alpha8(value))); 
			}
		};
		
		// only values (no chaining)
		object.lumin = function() { return raw().color().luminance(); };
		object.lumin8 = function() { return raw().color().luminance8(); };
		object.luminFast = function() { return raw().color().luminanceFast(); };
		object.luminFast8 = function() { return raw().color().luminanceFast8(); };
		object.gray = function() { return raw().color().grayvalue(); };
		object.gray8 = function() { return raw().color().grayvalue8(); };

		// operations (w chaining)
		object.complement = function() { return update(new ColorWrapper(raw().color().complement())); };
		object.contrast = function() { return update(new ColorWrapper(raw().color().contrastWhiteBlack())); };
		object.grayscale = function() { return update(new ColorWrapper(raw().color().contrastGray())); };
		object.tint = function(number) { 
			if (!number) { throw invalidArgument; }
			return update(new ColorWrapper(raw().color().tint(number))); 
		};
		object.shade = function(number) { 
			if (!number) { throw invalidArgument; }
			return update(new ColorWrapper(raw().color().shade(number))); 
		};
		object.tone = function(number) { 
			if (!number) { throw invalidArgument; }
			return update(new ColorWrapper(raw().color().tone(number))); 
		};
		object.scale = function(factor) { 
			if (!factor) { throw invalidArgument; }
			return update(new ColorWrapper(raw().color().scale(factor))); 
		};
		object.blend = function(color, number) { 
			if (!color && !number) { throw invalidArgument; }
			return update(new ColorWrapper(raw().color().blend(color, number))); 
		};
		object.add = function(color) { 
			if (!color) { throw invalidArgument; }
			return update(new ColorWrapper(raw().color().add(color))); 
		};
		object.sub = function(color) { 
			if (!color) { throw invalidArgument; }
			return update(new ColorWrapper(raw().color().subtract(color))); 
		};
		object.mul = function(color) {
			if (!color) { throw invalidArgument; }
			return update(new ColorWrapper(raw().color().multiply(color))); 
		};
		object.xor = function(color) { 
			if (!color) { throw invalidArgument; }
			return update(new ColorWrapper(raw().color().xor(color))); 
		};
	});
}());

;/**
  * JS3 Extension - Math for Numeric Rule Values and Variables
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
/*jslint indent: 4, maxerr: 50, white: true, vars: true, unparam: true, plusplus: true, bitwise: true, continue: true */
/*global window, JS3, object, raw, value, update, css, parent, name */ 
(function() {
	"use strict";
	
	// operations
	JS3.ex.op('mathOperations', {objectType: ['variable', 'rule'], dataType: 'number'}, function() {
		var invalidArgument = 'invalid argument';
		
		object.add = function(number) { 
			if (!number) { throw invalidArgument; }
			return update(raw() + number); 
		};
		object.sub = function(number) { 
			if (!number) { throw invalidArgument; }
			return update(raw() - number); 
		};
		object.mul = function(number) { 
			if (!number) { throw invalidArgument; }
			return update(raw() * number); 
		};
		object.div = function(number) { 
			if (!number) { throw invalidArgument; }
			return update(raw() / number); 
		};
		object.mod = function(number) { 
			if (!number) { throw invalidArgument; }
			return update(raw() % number); 
		};
		
		object.reverseSign = function() { return update(Math.abs(raw() * -1)); };
		
		object.abs = function() { return update(Math.abs(raw())); };
		object.acos = function() { return update(Math.acos(raw())); };
		object.asin = function() { return update(Math.asin(raw())); };
		object.atan = function() { return update(Math.atan(raw())); };
		object.ceil = function() { return update(Math.ceil(raw())); };
		object.cos = function() { return update(Math.cos(raw())); };
		object.exp = function() { return update(Math.exp(raw())); };
		object.floor = function() { return update(Math.floor(raw())); };
		object.log = function() { return update(Math.log(raw())); };
		object.round = function() { return update(Math.round(raw())); };
		object.sin = function() { return update(Math.sin(raw())); };
		object.sqrt = function() { return update(Math.sqrt(raw())); };
		object.tan = function() { return update(Math.tan(raw())); };
	});	
}());
