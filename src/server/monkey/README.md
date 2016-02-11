# Monkey Patching

Any `.js` files included here are automatically bootstrapped on application startup. This is useful for monkey patching dependencies in order to modify code at runtime.

For example, we are using the following to implement proxy support.

```js
var https = require('https');
var tunnel = require('tunnel');

var tunnelingAgent = tunnel.httpsOverHttp({
    proxy: {
        host: 'mycompany.com',
        port: 8080
    }
});

module.exports = function() {

    var _request = https.request;

    https.request = function(options, callback) {

        if(!/^.*.mycompany.com$/.test(options.host)) {
            options.agent = tunnelingAgent;
        }

        return _request.call(null, options, callback);
    };

}();
```
