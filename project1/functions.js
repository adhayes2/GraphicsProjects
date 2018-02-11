// draw a pixel at x,y using color
function drawPixel(imagedata,x,y,color) {
  
  try {
      if ((typeof(x) !== "number") || (typeof(y) !== "number"))
          throw "drawpixel location not a number";
      else if ((x<0) || (y<0) || (x>=imagedata.width) || (y>=imagedata.height))
          throw "drawpixel location outside of image";
      else if (color instanceof Color) {
          var pixelindex = (y*imagedata.width + x) * 4;
          imagedata.data[pixelindex] = color.r;
          imagedata.data[pixelindex+1] = color.g;
          imagedata.data[pixelindex+2] = color.b;
          imagedata.data[pixelindex+3] = color.a;
      } else 
          throw "drawpixel color is not a Color";
  } // end try
  
  catch(e) {
      drawPixel.numExcepts = (drawPixel.numExcepts == "undefined") ? 0 : drawPixel.numExcepts;
      if (drawPixel.numExcepts++ < 10)
          console.log(e);
  }
} // end drawPixel



// get the input ellipsoids from the standard class URL
function getInputEllipsoids() {
  const INPUT_ELLIPSOIDS_URL = 
      "https://ncsucgclass.github.io/prog1/ellipsoids.json";
      
  // load the ellipsoids file
  var httpReq = new XMLHttpRequest(); // a new http request
  httpReq.open("GET",INPUT_ELLIPSOIDS_URL,false); // init the request
  httpReq.send(null); // send the request
  var startTime = Date.now();
  while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
      if ((Date.now()-startTime) > 3000)
          break;
  } // until its loaded or we time out after three seconds
  if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
      console.log*("Unable to open input ellipses file!");
      return String.null;
  } else
      return JSON.parse(httpReq.response); 
} // end get input ellipsoids

//restricts a number to a certain range
function clamp ( val, min, max ) {
  if( val > max ) {
    return max;
  } else if ( val < min ) {
    return min;
  } else {
    return val;
  }
}

//uses getInputEllipsoids to get input, then makes ellipse objects and jams them into an array
function putEllipsoidsInArray( a, windowHeight ) {
  var input = getInputEllipsoids();

  if (input != String.null) {
    
    for (var e=0; e<input.length; e++) {

      var pos = new Vector( input[e].x, input[e].y, input[e].z );
      var rad = new Vector( input[e].a, input[e].b, input[e].c );
      var amb = new Vector( input[e].ambient[0], input[e].ambient[1], input[e].ambient[2] );
      var dif = new Vector( input[e].diffuse[0], input[e].diffuse[1], input[e].diffuse[2] );
      var spec = new Vector( input[e].specular[0], input[e].specular[1], input[e].specular[2] );
      a.push( new Ellipsoid( pos, rad, amb, dif, spec, input[e].n ) );

    }

  }
  return a;
}