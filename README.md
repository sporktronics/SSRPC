# SSRPC

SSRPC (Stupid-Simple RPC) is a nifty way of sending messages and data
structures back and forth between a JavaScript client and a PHP
server, using JSON as a carrier. It differs from JSON-RPC in that it
is data and message oriented rather than method/command oriented. Any
object that can be JSON serialized can be sent back and forth, no
problem.

## How to Use
Just include "ssrpc.client.min.js" in your JavaScript code and
"ssrpc.server.js" in your PHP code.

There's also a version that does not include Douglas Crockford's
"json2.js" parser/stringifier combo; it's almost 3K smaller (if you
know you'll never need it).

## Examples
Send some data over to the server:

    var callback = function(data) { ... };     /* A callback is optional! */
    var progress = function(progress) { ... }; /* You can optionally track progress!
                                                  (for receiving only) */
    SSRPC.send( { someSuch: "Some object", someOther: 123 }, "yourserver.php", callback, progress );

Get that data on the server end:

    $ssrpc = new SSRPC();
    $data = $ssrpc->getData();
    echo $data->someSuch;
    echo $data->someOther;

Prepare the client to get something back:

    SSRPC.onInfo( function(info) {
        console.log('info: '+info.name, info.message);
    } );

    SSRPC.onData( function(data) {
        console.log('data: '+data.name, data.message);
    } );

Send something back to the client:

    $ssrpc->info('someReply', 'HEY CLIENT, WASSUP??');
    $ssrpc->data('someObject', $object);

Stupid-simple? Too easy? We hope you agree!

