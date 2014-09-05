module.exports = function Responses() {
	this.sendSuccess = function (res, sendObject, statCode, logMessage) {
	    if (!!logMessage) {
	        console.info(logTimeBuilder(), logMessage);
	    } 
	    res.statusCode = statCode;
	    res.send(sendObject);
	};

	this.sendError = function (res, err, statCode) {
	    console.error(logTimeBuilder(), strings.errors.errorType.connection, err);
	    res.statusCode = statCode;
	    res.send({
	        result: 'error',
	        err: err.code
	    });
	};

	this.sendCustomError = function (res, err, statCode) {
	    console.error(logTimeBuilder(), strings.errors.errorType.application, err.message);
	    res.statusCode = statCode;
	    res.send({
	        result: err.message,
	        err: err.code
	    });
	};

	function logTimeBuilder() {
	    var d = new Date;
	    return d.toISOString();
	}
};