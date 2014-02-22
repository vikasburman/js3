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
(function() {
	"use strict";
	// TODO: 3rd and 4th para should also support array
	JS3.ex('math', ['declaration', 'variable'], 'number', '*', function(wrapper) {
		// extend wrapper
		wrapper.add = function(number) {
			if (typeof number !== 'number') { throw 'invalid argument'; }
			wrapper(wrapper.raw.value() + number); // update
		};
		wrapper.substract = function(number) {
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
