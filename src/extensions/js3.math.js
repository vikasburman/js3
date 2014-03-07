/**
  * JS3 Extension - Math for Numeric Declarations and Variables
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
/*global window, JS3 */   
(function() {
	"use strict";
	JS3.ex('math', {objectType: ['variable', 'rule'], dataType: 'number'}, function(wrapper) {
		// extend wrapper
		wrapper.add = function(number) {
			if (typeof number !== 'number') { throw 'invalid argument'; }
			wrapper(wrapper.raw.value() + number); // update
		};
		wrapper.subtract = function(number) {
			if (typeof number !== 'number') { throw 'invalid argument'; }
			wrapper(wrapper.raw.value() - number); // update			
		};
		wrapper.multiply = function(number) {
			if (typeof number !== 'number') { throw 'invalid argument'; }
			wrapper(wrapper.raw.value() * number); // update			
		};
		wrapper.divide = function(number) {
			if (typeof number !== 'number') { throw 'invalid argument'; }
			wrapper(wrapper.raw.value() / number); // update			
		};
	});	
}());
