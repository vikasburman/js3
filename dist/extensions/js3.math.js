/**
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
