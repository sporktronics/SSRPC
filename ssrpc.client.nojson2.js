
/*
  
  Stupid-Simple RPC
  (c) 2012 Sporktronics, LLC
  http://www.sporktronics.com/
  
  Licensed under the Lesser GPL, version 3.0:
     http://www.gnu.org/licenses/lgpl-3.0.html
  
*/

var SSRPC = ( SSRPC || {} );

(function() {
    
    var _this = this;
    
    _this._data    = [];
    _this._onError = [];
    _this._onInfo  = [];
    _this._onWarn  = [];
    _this._onData  = [];
    
    // Syntactic sugar for sending a command with some data.
    SSRPC.cmd = function(cmd, data, url, callback) {
	if (data) {
	    SSRPC.send({cmd: cmd, data: data}, url, callback);
	} else {
	    SSRPC.send({cmd: cmd}, url, callback);
	}
    };

    // Send an object, can be anything JSON-serializable.
    //
    // Arguments:
    //
    // data - Object to send
    // url - URL of the SSRPC-speaking server
    // callback - Optionally give what we get back to this function
    // progress - Optionally give XMLHttpRequestProgressEvent objects
    //            to this function

    SSRPC.send = function(data, url, callback, progress) {

	function getHTTPObject() {
	    var http = false;
	    if(typeof ActiveXObject !== 'undefined') {
		try {
		    http = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
		    try {
			http = new ActiveXObject("Microsoft.XMLHTTP");
		    } catch (E) {
			http = false;
		    }
		}
	    } else if (window.XMLHttpRequest) {
		try {
		    http = new XMLHttpRequest();
		} catch (e) {
		    http = false;
		}
	    }
	    return http;
	}
	
	var http = getHTTPObject();
	if (http) {
	    http.open('POST', url, true);
	    http.setRequestHeader("Content-type", "application/json");
	    http.onprogress = progress;
	    http.send(JSON.stringify({ ssrpc: data }));
	    http.onreadystatechange = function() {
		if(http.readyState === 4) {
		    if(http.status === 200) {
			if (!http.responseText) {
			    _this._handleResponse({}, callback);
			} else {
			    _this._handleResponse(
						  JSON.parse(http.responseText),
						  callback);
			}
		    } else {
			_this._handleResponse({ssrpc:
					       {error: 
						{request:
						 'Error making asynchronous request'}
					       }}, callback);
		    }
		}
	    };
	} else {
	    _this._handleResponse({ssrpc: 
				   {error:
				    {noAjax:
				     'Asynchronous requests not supported'}
				   }}, callback);
	}
	
    };
    
    // Here you can set handlers to be triggered whenever we get
    // certain responses back. Just keep setting them, they'll be
    // called in order.
    
    SSRPC.onError = function(callback) {
	_this._onError.push(callback);
    };
    
    SSRPC.onInfo = function(callback) {
	_this._onInfo.push(callback);
    };

    SSRPC.onWarn = function(callback) {
	_this._onWarn.push(callback);
    };

    SSRPC.onData = function(callback) {
	_this._onData.push(callback);
    };

    // Get the array of all the data we've received from any server.
    SSRPC.getData = function() {
	return _this._data;
    };

    // Get the last data we've received from the server.
    SSRPC.getLastData = function() {
	return _this._data[_this._data.length - 1];
    };

    /* Private functions... */

    // Call this whenever we get something back from the server.
    _this._handleResponse = function(response, callback) {

	if (!response) {
	    response = {};
	}

	if (response.ssrpc) { // Add this data to our fistful of
			      // datas..
	    _this._data.push(response.ssrpc);
	} else { // The response was empty, so let's put something
		 // there.
	    response.ssrpc = { warn: 
			       { emptyResponse:
				 "The response from the server was empty." } };
	}

	// For each kind of data or message we might have gotten, run
	// our handlers...

	if (response.ssrpc.error) {
	    _this._handleAll(_this._onError, response.ssrpc.error);
	}

	if (response.ssrpc.info) {
	    _this._handleAll(_this._onInfo, response.ssrpc.info);
	}

	if (response.ssrpc.warn) {
	    _this._handleAll(_this._onWarn, response.ssrpc.warn);
	}

	if (response.ssrpc.data) {
	    _this._handleAll(_this._onData, response.ssrpc.data);
	}

	if (callback) {
	    callback(response);
	}
    };

    // Used for each of the types of data or messages we might
    // recieve. Iterate through an array of functions and hand each of
    // them the data.
    _this._handleAll = function(callbacks, data) {
	for (i in callbacks) {
	    for (j in data) {
		callbacks[i]({name: j, message: data[j]});
	    }
	}
    };

})();
