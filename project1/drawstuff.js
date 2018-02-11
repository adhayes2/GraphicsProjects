// draw random pixels
function drawRandPixels(context) {
    var c = new Color(0,0,0,0); // the color at the pixel: black
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    const PIXEL_DENSITY = 0.01;
    var numPixels = (w*h)*PIXEL_DENSITY; 
    
    // Loop over 1% of the pixels in the image
    for (var x=0; x<numPixels; x++) {
        c.change(Math.random()*255,Math.random()*255,
            Math.random()*255,255); // rand color
        drawPixel(imagedata,
            Math.floor(Math.random()*w),
            Math.floor(Math.random()*h),
                c);
    } // end for x
    context.putImageData(imagedata, 0, 0);
} // end draw random pixels

// put random points in the ellipsoids from the class github
function drawRandPixelsInInputEllipsoids(context) {
    var inputEllipsoids = getInputEllipsoids();
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    const PIXEL_DENSITY = .1;
    var numCanvasPixels = (w*h)*PIXEL_DENSITY; 
    
    if (inputEllipsoids != String.null) { 
        var x = 0; var y = 0; // pixel coord init
        var cx = 0; var cy = 0; // init center x and y coord
        var ellipsoidXRadius = 0; // init ellipsoid x radius
        var ellipsoidYRadius = 0; // init ellipsoid y radius
        var numEllipsoidPixels = 0; // init num pixels in ellipsoid
        var c = new Color(0,0,0,0); // init the ellipsoid color
        var n = inputEllipsoids.length; // the number of input ellipsoids
        //console.log("number of ellipses: " + n);

        // Loop over the ellipsoids, draw rand pixels in each
        for (var e=0; e<n; e++) {
            cx = w*inputEllipsoids[e].x; // ellipsoid center x
            cy = h - h*inputEllipsoids[e].y; // ellipsoid center y
            ellipsoidXRadius = Math.round(w*inputEllipsoids[e].a); // x radius
            ellipsoidYRadius = Math.round(h*inputEllipsoids[e].b); // y radius
            numEllipsoidPixels = inputEllipsoids[e].a*inputEllipsoids[e].b*Math.PI; // projected ellipsoid area
            numEllipsoidPixels *= PIXEL_DENSITY * w * h; // percentage of ellipsoid area to render to pixels
            numEllipsoidPixels = Math.round(numEllipsoidPixels);
            console.log("ellipsoid x radius: "+ellipsoidXRadius);
            console.log("ellipsoid y radius: "+ellipsoidYRadius);
            console.log("num ellipsoid pixels: "+numEllipsoidPixels);
            c.change(
                inputEllipsoids[e].diffuse[0]*255,
                inputEllipsoids[e].diffuse[1]*255,
                inputEllipsoids[e].diffuse[2]*255,
                255); // ellipsoid diffuse color
            for (var p=0; p<numEllipsoidPixels; p++) {
                do {
                    x = Math.random()*2 - 1; // in unit square 
                    y = Math.random()*2 - 1; // in unit square
                } while (Math.sqrt(x*x + y*y) > 1) // a circle is also an ellipse
                drawPixel(imagedata,
                    cx+Math.round(x*ellipsoidXRadius),
                    cy+Math.round(y*ellipsoidYRadius),c);
                //console.log("color: ("+c.r+","+c.g+","+c.b+")");
                //console.log("x: "+Math.round(w*inputEllipsoids[e].x));
                //console.log("y: "+Math.round(h*inputEllipsoids[e].y));
            } // end for pixels in ellipsoid
        } // end for ellipsoids
        context.putImageData(imagedata, 0, 0);
    } // end if ellipsoids found
} // end draw rand pixels in input ellipsoids

// draw 2d projections read from the JSON file at class github
function drawInputEllipsoidsUsingArcs(context) {
    var inputEllipsoids = getInputEllipsoids();
    
    
    if (inputEllipsoids != String.null) { 
        var c = new Color(0,0,0,0); // the color at the pixel: black
        var w = context.canvas.width;
        var h = context.canvas.height;
        var n = inputEllipsoids.length; 
        //console.log("number of ellipsoids: " + n);

        // Loop over the ellipsoids, draw each in 2d
        for (var e=0; e<n; e++) {
            context.fillStyle = 
                "rgb(" + Math.floor(inputEllipsoids[e].diffuse[0]*255)
                +","+ Math.floor(inputEllipsoids[e].diffuse[1]*255)
                +","+ Math.floor(inputEllipsoids[e].diffuse[2]*255) +")"; // diffuse color
            context.save(); // remember previous (non-) scale
            context.translate(w*inputEllipsoids[e].x,h - h*inputEllipsoids[e].y); // translate ellipsoid to ctr
            context.scale(1, inputEllipsoids[e].b/inputEllipsoids[e].a); // scale by ellipsoid ratio 
            context.beginPath();
            context.arc(0,0,Math.round(w*inputEllipsoids[e].a),0,2*Math.PI);
            context.restore(); // undo scale before fill so stroke width unscaled
            context.fill();
            //console.log(context.fillStyle);
            //console.log("x: "+Math.round(w*inputEllipsoids[e].x));
            //console.log("y: "+Math.round(h*inputEllipsoids[e].y));
            //console.log("a: "+Math.round(w*inputEllipsoids[e].a));
            //console.log("b: "+Math.round(h*inputEllipsoids[e].b));
        } // end for ellipsoids
    } // end if ellipsoids found
} // end draw input ellipsoids


/* main -- here is where execution begins after window load */

function main() {

    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var imageData = context.createImageData(w,h);
 
    // Create the image
    //drawRandPixels(context);
      // shows how to draw pixels
    
    //drawRandPixelsInInputEllipsoids(context);
      // shows how to draw pixels and read input file
      
    //drawInputEllipsoidsUsingArcs(context);
      // shows how to read input file, but not how to draw pixels

    //copy numbers from the instructions
    var eye = new Vector( 0.5, 0.5, -0.5 );
    var lookUp = new Vector (0, 1, 0 );
    var lookAt = new Vector( 0, 0, 1 );
    var light = new Light( new Vector( 1,1,1 ), new Vector( 1,1,1 ), new Vector( 1,1,1 ), new Vector( -1,3,-0.5 ) );
    var ellipses = new Array();

    var windowUL = new Vector( 0, 0, 0 );
    var windowCenter = new Vector( .5, .5, 0 );
    var windowLR = new Vector( 1, 1, 0 );

    putEllipsoidsInArray( ellipses, Math.abs( windowUL.y - windowLR.y ) );

    var worldX = 0;
    var worldY = 0;
    var worldZ = 0;

    //start doing something i guess
    for( var x = 0; x < w; x++ ) {
      for( var y = 0; y < h; y++ ) {
        //step one: get world coordinates of pixel

        //get x coord in terms of world coordinates
        //formula: left edge of window + ( xth pixel / window width in pixels )*window width in world
        worldX = windowUL.x + ( x/w ) * ( windowLR.x - windowUL.x );

        //get y coord in terms of world coordinates
        //formula: top edge of window + ( yth pixel / window height in pixels )*window height in world
        worldY = windowUL.y + ( y/h ) * ( windowLR.y - windowUL.y );
        worldY = Math.abs( windowUL.y - windowLR.y ) - worldY;

        // do i need a worldZ
        //worldZ is just gonna be 0 for now; will figure that out if i need it later

        //step two: fire a ray from the eye through the pixel and see if it hit anything

        var closestIntersection = null;
        var closestObject = null;
        for( var i = 0; i < ellipses.length; i++ ) {
        //for( var i = ellipses.length - 1; i > -1; i-- ) {
          var hit = ellipses[i].hit( eye, new Vector( worldX, worldY, worldZ ) )
          //if hit is not null, see if it's the closest hit so far
          if( hit != null ) {
            if( closestIntersection != null ) {
              //closestIntersection is not null
              if( closestIntersection.z >= hit.z ) {
                closestIntersection = new Vector( hit.x, hit.y, hit.z );
                closestObject = ellipses[i];
              }

            } else {
              //closestIntersection is null
              closestIntersection = new Vector( hit.x, hit.y, hit.z );
              closestObject = ellipses[i];
            }
          }
        }

        if( closestIntersection == null ) {
          //we didn't hit anything
          drawPixel(imageData, x, y, new Color( 0, 0, 0, 255 ) );
        } else {
          //we need to calculate shading and all that jazz
          //ka*la - ambient term
          var r = clamp( closestObject.ambient.x * light.ambient.x, 0, 10000000 );
          var g = clamp( closestObject.ambient.y * light.ambient.y, 0, 10000000 );
          var b = clamp( closestObject.ambient.z * light.ambient.z, 0, 10000000 );

          
          //add in kd * ld * (N dot L) - diffuse term
          //bugger now i need the normal
          var n = closestObject.normal( closestIntersection );
          //n.toConsole();
          var l = Vector.normalize( Vector.subtract( light.position, closestIntersection ) );
          var NdotL = clamp( Vector.dot( n, l ), 0, 10000000 );
          //console.log( NdotL );
          r += clamp( closestObject.diffuse.x * light.diffuse.x * NdotL, 0, 10000000 );
          g += clamp( closestObject.diffuse.y * light.diffuse.y * NdotL, 0, 10000000 );
          b += clamp( closestObject.diffuse.z * light.diffuse.z * NdotL, 0, 10000000 );
          

          
          //add in ks * ls * ( N dot H )^n - specular term
          var v = Vector.subtract( eye, closestIntersection );
          var half = Vector.normalize( Vector.add( l, v ) );
          var NdotH = clamp( Vector.dot( n, half ), 0, 10000000 );
          var specularTerm = Math.pow( NdotH, closestObject.n );
          r += clamp( closestObject.specular.x * light.specular.x * specularTerm, 0, 10000000 );
          g += clamp( closestObject.specular.y * light.specular.y * specularTerm, 0, 10000000 );
          b += clamp( closestObject.specular.z * light.specular.z * specularTerm, 0, 10000000 );
          
        
          
          r = clamp( r, 0, 1 );
          g = clamp( g, 0, 1 );
          b = clamp( b, 0, 1 );
          //console.log( "r " + r + " g " + g + " b " + b );
          drawPixel(imageData, x, y, new Color( Math.floor( 255 * r ), Math.floor( 255 * g ), Math.floor( 255 * b ), 255 ) );
        }

        
      }
    }

    context.putImageData(imageData, 0, 0);
}
 