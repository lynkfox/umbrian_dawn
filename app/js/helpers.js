Object.sort = function(obj, prop) {
	var swapped, prev;
	do {
		swapped = false, prev = null;
		for (var i in obj) {
			if (prev && Number(obj[i][prop]) < Number(obj[prev][prop])) {
				var tmp = obj[i];
				obj[i] = obj[prev];
				obj[prev] = tmp;
				swapped = true;
			}
			prev = i;
		}
	} while (swapped);
}

Object.index = function(obj, prop, val, cs) {
	for (var key in obj) {
		if (!cs && obj[key][prop] == val) {
			return key;
		} else if (obj[key][prop] && obj[key][prop].toLowerCase() == val.toLowerCase()) {
			return key;
		}
	}
}

Object.find = function(obj, prop, val, cs) {
	for (var key in obj) {
		if (!cs && obj[key][prop] == val) {
			return obj[key];
		} else if (obj[key][prop] && obj[key][prop].toLowerCase() == val.toLowerCase()) {
			return obj[key];
		}
	}

	return false;
}

Object.maxTime = function(obj, prop) {
	var maxTimeString = "", maxTime;

	for (var key in obj) {
		if (!maxTime || maxTime < new Date(obj[key][prop])) {
			maxTime = new Date(obj[key][prop]);
			maxTimeString = obj[key][prop];
		}
	}
	return maxTimeString;
}

Object.time = function(obj) {
	var dates = [], key;
	for (key in obj) {
		dates.push(new Date(obj[key].time));
	}

	return dates.length ? dates.sort()[dates.length -1].getTime() /1000 : 0;
};

(function($){
    $.fn.serializeObject = function(){

        var self = this,
            json = {},
            push_counters = {},
            patterns = {
                "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
                "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
                "push":     /^$/,
                "fixed":    /^\d+$/,
                "named":    /^[a-zA-Z0-9_]+$/
            };


        this.build = function(base, key, value){
            base[key] = value;
            return base;
        };

        this.push_counter = function(key){
            if(push_counters[key] === undefined){
                push_counters[key] = 0;
            }
            return push_counters[key]++;
        };

        $.each($(this).serializeArray(), function(){

            // skip invalid keys
            if(!patterns.validate.test(this.name)){
                return;
            }

            var k,
                keys = this.name.match(patterns.key),
                merge = this.value,
                reverse_key = this.name;

            while((k = keys.pop()) !== undefined){

                // adjust reverse_key
                reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

                // push
                if(k.match(patterns.push)){
                    merge = self.build([], self.push_counter(reverse_key), merge);
                }

                // fixed
                else if(k.match(patterns.fixed)){
                    merge = self.build([], k, merge);
                }

                // named
                else if(k.match(patterns.named)){
                    merge = self.build({}, k, merge);
                }
            }

            json = $.extend(true, json, merge);
        });

        return json;
    };
})(jQuery);

var letterToNumbers = function(string) {
    string = string.toUpperCase();
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', sum = 0, i;
    for (i = 0; i < string.length; i++) {
        sum += Math.pow(letters.length, i) * (letters.indexOf(string.substr(((i + 1) * -1), 1)) + 1);
    }
    return sum;
};

var sigFormat = function(input, type) {
	if (!input) return "";

	var alpha = /^[a-zA-Z]+$/;
	var numeric = /^[0-9]+$/;
	var format = type == "type" ? options.chain.typeFormat || "" : options.chain.classFormat || "";

	for (var x = 0, l = format.length; x < l; x++) {
		if (format[x].match(alpha)) {
			if (format[x].toUpperCase() == "B" && input == "a") {
				return "";
			} else {
				if (format[x] == format[x].toUpperCase()) {
					format = format.substr(0, x) + input.toUpperCase() + format.substr(x + 1, l);
				} else {
					format = format.substr(0, x) + input + format.substr(x + 1, l);
				}
			}
		} else if (format[x].match(numeric)) {
			if (format[x] == 2 && input == "a") {
				return "";
			} else {
				format = format.substr(0, x) + letterToNumbers(input) + format.substr(x +1, l);
			}
		}
	}

	return format;
};

var isEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
};

/** Find the relative position of one element within the hierarchy tree of another */
function positionRelativeTo(elem, ancestor) {
	const elemPos = elem.getBoundingClientRect(),
		ancestorPos = ancestor.getBoundingClientRect();
	return { 
		left: elemPos.left - ancestorPos.left + ancestor.scrollLeft,
		top: elemPos.top - ancestorPos.top + ancestor.scrollTop
	};
}

/** Look up one or more values in a comma separated string as keys in a data map, and return a property from the results in a new comma separated string.
Convenience function for UI mapping.
Will throw a failure message, unless suppress=true in which case it will return undefined, if 
any of the lookups fail to resolve. */
function lookupMultiple(map, propertyName, lookupString, suppress) {
	const values = lookupString.split(',');
	const results = [];
	for(var i = 0; i < values.length; i++) {
		const v = values[i];
		const r = map[v];
		if(!r) { 
			if(suppress) { return undefined;}
			else { throw 'Value ' + v + ' did not match anything in ' + map; }
		}
		results.push(r[propertyName]);
	}
	return results.join(',');
}

var getCookie = function(c_name) {
	var c_value = document.cookie;

	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1) {
		c_start = c_value.indexOf(c_name + "=");
	}

	if (c_start == -1) {
		c_value = null;
	} else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);

		if (c_end == -1) {
			c_end = c_value.length;
		}

		c_value = unescape(c_value.substring(c_start, c_end));
	}

	return c_value;
};

var setCookie = function(c_name, value, exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value) + ((exdays == null) ? "" : "; expires="+exdate.toUTCString());

	document.cookie = c_name + "=" + c_value + ";" + (document.location.protocol == "https:" ? "secure;" : "");
};

// Global CSS class change event
(function($) {
    var originalAddClassMethod = $.fn.addClass;
	var originalRemoveClassMethod = $.fn.removeClass;

    $.fn.addClass = function(className) {
        // Execute the original method.
        var result = originalAddClassMethod.apply(this, arguments);

        // trigger a custom event
        this.trigger('classchange', className);

        // return the original result
        return result;
    }

	$.fn.removeClass = function(className) {
        // Execute the original method.
        var result = originalRemoveClassMethod.apply(this, arguments);

        // trigger a custom event
        this.trigger('classchange', className);

        // return the original result
        return result;
    }
})(jQuery);

