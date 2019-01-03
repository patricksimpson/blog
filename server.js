/**
 * Static HTTP Server
 *
 * Create a static file server instance to serve files
 * and folder in the './public' folder
 */

// modules
const static = require( 'node-static' ),
    port = 8080,
    http = require( 'http' );

// config
const file = new static.Server( './build', {
    cache: 0,
    gzip: true
} );

// serve
http.createServer( function ( request, response ) {
    request.addListener( 'end', function () {
        file.serve( request, response );
    } ).resume();
} ).listen( port );
