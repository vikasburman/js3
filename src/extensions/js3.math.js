/**
  * JS3 Extension - Math for Numeric Declarations and Variables
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
(function() {
	"use strict";
	JS3.ex('math', ['declaration', 'variable'], 'number', '*', function() {
		var wrapper = this;
		var self = wrapper.parent;

		// build extension
		var ex = {};
		ex.add = function(number) {
			if (typeof number !== 'number') { throw 'invalid argument'; }
			wrapper(wrapper.raw.value() + number); // update
		};
		ex.substract = function(number) {
			if (typeof number !== 'number') { throw 'invalid argument'; }
			wrapper(wrapper.raw.value() - number); // update			
		};
		ex.multiply = function(number) {
			if (typeof number !== 'number') { throw 'invalid argument'; }
			wrapper(wrapper.raw.value() * number); // update			
		};
		ex.divide = function(number) {
			if (typeof number !== 'number') { throw 'invalid argument'; }
			wrapper(wrapper.raw.value() / number); // update			
		};
		return ex;
	});	
}());
