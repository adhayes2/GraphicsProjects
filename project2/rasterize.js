//used this tutorial: http://learningwebgl.com/blog/?p=134 to help figure out coloring

/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog2/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog2/ellipsoids.json"; // ellipsoids file loc
var eye = new vec4.fromValues(0.5,0.5,-0.5,1.0); // default eye position in world space
var eyeVec3 = new vec3.fromValues( eye[0], eye[1], eye[2] );
var viewUp = new vec3.fromValues( 0.0, 1.0, 0.0 );
var lookAt = new vec3.fromValues( 0.0, 0.0, 1.0 );
var rotationAngle = 0;

class Light {
  constructor ( position, ambient, diffuse, specular ) {
    this.position = position;
    this.ambient = ambient;
    this.diffuse = diffuse;
    this.specular = specular;
  }
} //end Light class

var light = new Light( vec3.fromValues( -1, 3, -0.5 ), vec3.fromValues( 1, 1, 1 ), vec3.fromValues( 1, 1, 1 ), vec3.fromValues( 1, 1, 1 ) );

//input globals
var inputTriangles; // the triangles read in from json
var numTriangleSets = 0; // the number of sets of triangles
var triSetSizes = []; // the number of triangles in each set

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffers = []; // this contains vertex coordinates in triples
var triangleBuffers = []; // this contains indices into vertexBuffer in triples
var colorBuffers = []; //this will have colors? i hope?
var normalBuffers = []; //this will have normals? i hope?
var triBufferSize = 0; // the number of indices in the triangle buffer
var vertexPositionAttrib; // where to put position for vertex shader
var vertexColorAttrib; // where to put color for vertex shader
var modelMatrixULoc; // where to put the model matrix for vertex shader

var pMatrixUniform;
var mvMatrixUniform;

var lightPosUniform;
var lightAmbUniform;
var lightSpecUniform;
var lightDifUniform;
var eyeUniform;

var ambUniform;
var specUniform;
var specHighlightUniform;
var difUniform;

var shaderProgram;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();



// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        return(String.null);
    }
} // end get json file

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL

function getColorTri( tri ) {
  var arr = [];

  //only use diffuse colors, fully opaque - for now
  arr.push( tri.material.diffuse[0] );
  arr.push( tri.material.diffuse[1] );
  arr.push( tri.material.diffuse[2] );
  arr.push( 1.0 );

  return arr;
}

function getColorEll( ell ) {
  var arr = [];

  //only use diffuse colors, fully opaque - for now
  arr.push( ell.diffuse[0] );
  arr.push( ell.diffuse[1] );
  arr.push( ell.diffuse[2] );
  arr.push( 1.0 );

  return arr;
}

// read triangles in, load them into webgl buffers
function loadTriangles() {
    inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles");

    if (inputTriangles != String.null) { 
        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set
        var vtxBufferSize = 0; // the number of vertices in the vertex buffer
        var vtxToAdd = []; // vtx coords to add to the coord array
        var indexOffset = vec3.create(); // the index offset for the current set
        var triToAdd = vec3.create(); // tri indices to add to the index array
        
        numTriangleSets = inputTriangles.length;
        for (var whichSet=0; whichSet<numTriangleSets; whichSet++) {
            vec3.set(indexOffset,vtxBufferSize,vtxBufferSize,vtxBufferSize); // update vertex offset
            inputTriangles[whichSet].transforms = [];
            
            // set up the vertex coord array
            inputTriangles[whichSet].coordArray = [];
            inputTriangles[whichSet].colorArray = [];
            inputTriangles[whichSet].normalArray = [];
            var vertexTotalX = 0;
            var vertexTotalY = 0;
            var vertexTotalZ = 0;
            var numVertex = 0;
            for (whichSetVert=0; whichSetVert<inputTriangles[whichSet].vertices.length; whichSetVert++) {
                vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
                inputTriangles[whichSet].coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]);

                vertexTotalX += vtxToAdd[0];
                vertexTotalY += vtxToAdd[1];
                vertexTotalZ += vtxToAdd[2];
                numVertex++;

                //determine the color of this vertex
                var c = getColorTri( inputTriangles[whichSet] );
                inputTriangles[whichSet].colorArray.push( c[0], c[1], c[2], c[3] );

                //normal
                inputTriangles[whichSet].normalArray.push( inputTriangles[whichSet].normals[whichSetVert][0], inputTriangles[whichSet].normals[whichSetVert][1], inputTriangles[whichSet].normals[whichSetVert][2] );

                inputTriangles[whichSet].ambient = vec3.fromValues( inputTriangles[whichSet].material.ambient[0], inputTriangles[whichSet].material.ambient[1], inputTriangles[whichSet].material.ambient[2] );
                inputTriangles[whichSet].specular = vec3.fromValues( inputTriangles[whichSet].material.specular[0], inputTriangles[whichSet].material.specular[1], inputTriangles[whichSet].material.specular[2] );
                inputTriangles[whichSet].diffuse = vec3.fromValues( inputTriangles[whichSet].material.diffuse[0], inputTriangles[whichSet].material.diffuse[1], inputTriangles[whichSet].material.diffuse[2] );
                inputTriangles[whichSet].highlight = vec3.fromValues( inputTriangles[whichSet].material.n, inputTriangles[whichSet].material.n, inputTriangles[whichSet].material.n );
            } // end for vertices in set

            /*//example on using the built in transformation list thing i made:
            var bob = mat4.create();
            mat4.fromZRotation( bob, 45 );
            inputTriangles[whichSet].transforms.push( bob );
            */

            //save the center location of this set
            inputTriangles[whichSet].center = vec3.fromValues( vertexTotalX / numVertex, vertexTotalY / numVertex, vertexTotalZ / numVertex );

            // send the vertex coords to webGL
            vertexBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
            gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].coordArray),gl.STATIC_DRAW); // coords to that buffer

            // send the vertex normals to webGL
            normalBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
            gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].normalArray),gl.STATIC_DRAW); // coords to that buffer

            // send the colors to webgl
            colorBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
            gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].colorArray),gl.STATIC_DRAW); // coords to that buffer
            
            // set up the triangle index array, adjusting indices across sets
            inputTriangles[whichSet].indexArray = []; // create a list of tri indices for this tri set
            triSetSizes[whichSet] = inputTriangles[whichSet].triangles.length;
            for (whichSetTri=0; whichSetTri<triSetSizes[whichSet]; whichSetTri++) {
              triToAdd = inputTriangles[whichSet].triangles[whichSetTri];
              inputTriangles[whichSet].indexArray.push(triToAdd[0],triToAdd[1],triToAdd[2]);
            } // end for triangles in set

            // send the triangle indices to webGL
            triangleBuffers[whichSet] = gl.createBuffer(); // init empty triangle index buffer for current tri set
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inputTriangles[whichSet].indexArray),gl.STATIC_DRAW); // indices to that buffer

            vtxBufferSize += inputTriangles[whichSet].vertices.length; // total number of vertices
            triBufferSize += inputTriangles[whichSet].triangles.length; // total number of tris
        } // end for each triangle set 
        triBufferSize *= 3; // now total number of indices

        // console.log("coordinates: "+coordArray.toString());
        // console.log("numverts: "+vtxBufferSize);
        // console.log("indices: "+indexArray.toString());
        // console.log("numindices: "+triBufferSize);

        /*
        // send the vertex coords to webGL
        vertexBuffer = gl.createBuffer(); // init empty vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(coordArray),gl.STATIC_DRAW); // coords to that buffer

        //send the colors to webgl
        colorBuffer = gl.createBuffer(); // init empty vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( colorArray ), gl.STATIC_DRAW); // coords to that buffer
        
        // send the triangle indices to webGL
        triangleBuffer = gl.createBuffer(); // init empty triangle index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer); // activate that buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexArray),gl.STATIC_DRAW); // indices to that buffer
        */

    } // end if triangles found

    //now for the fun of ellipsoids
    inputEllipsoids = getJSONFile(INPUT_SPHERES_URL,"ellipsoids");
    if (inputEllipsoids != String.null) {
      numEllipsoidSets = inputEllipsoids.length;

      for (var whichSet=numTriangleSets; whichSet<numEllipsoidSets+numTriangleSets; whichSet++) {
        //this is a dirty trick so that the position in inputTriangles i'm messing with actually exists
        inputTriangles.push( {
          "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.1,0.1,0.1], "specular": [0.1,0.1,0.1], "n":1}, 
          "vertices": [[0.0, 0.0, 0.0],[0.1, 0.0, 0.0],[0.0,0.1,0.0]],
          "normals": [[0, 0, -1],[0, 0, -1],[0, 0, -1]],
          "triangles": [[0,1,2]] } );

        //anyway now for the other stuff
        inputTriangles[whichSet].transforms = [];

        var e = new Ellipsoid( inputEllipsoids[whichSet-numTriangleSets] );

        // set up the vertex coord array
        inputTriangles[whichSet].coordArray = e.getVertexData();
        inputTriangles[whichSet].colorArray = e.getColorData();
        inputTriangles[whichSet].normalArray = e.getNormalData();
        inputTriangles[whichSet].center = vec3.fromValues( 0, 0, 0 );
        vec3.copy( inputTriangles[whichSet].center, e.getPosition() );

        inputTriangles[whichSet].ambient = vec3.fromValues( inputEllipsoids[whichSet-numTriangleSets].ambient[0], inputEllipsoids[whichSet-numTriangleSets].ambient[1], inputEllipsoids[whichSet-numTriangleSets].ambient[2] );
        inputTriangles[whichSet].specular = vec3.fromValues( inputEllipsoids[whichSet-numTriangleSets].specular[0], inputEllipsoids[whichSet-numTriangleSets].specular[1],inputEllipsoids[whichSet-numTriangleSets].specular[2] );
        inputTriangles[whichSet].diffuse = vec3.fromValues( inputEllipsoids[whichSet-numTriangleSets].diffuse[0], inputEllipsoids[whichSet-numTriangleSets].diffuse[1], inputEllipsoids[whichSet-numTriangleSets].diffuse[2] );
        inputTriangles[whichSet].highlight = vec3.fromValues( inputEllipsoids[whichSet-numTriangleSets].n, inputEllipsoids[whichSet-numTriangleSets].n, inputEllipsoids[whichSet-numTriangleSets].n );

        // send the vertex coords to webGL
        vertexBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].coordArray),gl.STATIC_DRAW); // coords to that buffer

        // send the vertex normals to webGL
        normalBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
        gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichSet]); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].normalArray),gl.STATIC_DRAW); // coords to that buffer

        // send the colors to webgl
        colorBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
        gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffers[whichSet]); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].colorArray),gl.STATIC_DRAW); // coords to that buffer
        
        // set up the triangle index array?
        inputTriangles[whichSet].indexArray = e.getIndexData(); // create a list of tri indices for this tri set
        triSetSizes[whichSet] = inputTriangles[whichSet].indexArray.length/3;

        // send the triangle indices to webGL
        triangleBuffers[whichSet] = gl.createBuffer(); // init empty triangle index buffer for current tri set
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inputTriangles[whichSet].indexArray),gl.STATIC_DRAW); // indices to that buffer
        
      }
    } //end if ellipsoids found

} // end load triangles

// setup the webGL shaders
function setupShaders() {
    
  // define fragment shader in essl using es6 template strings
  var fShaderCode = `
    precision mediump float;
  
    varying vec4 vColor;
  
    void main(void) {
      gl_FragColor = vColor;
    }
  `;
    
  // define vertex shader in essl using es6 template strings
  var vShaderCode = `
    attribute vec3 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec3 aVertexNormal;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    uniform vec3 uLightPos;
    uniform vec3 uLightAmb;
    uniform vec3 uLightDif;
    uniform vec3 uLightSpec;
    uniform vec3 uEyePos;

    uniform vec3 uVertexAmb;
    uniform vec3 uVertexDif;
    uniform vec3 uVertexSpec;
    uniform vec3 specHighlight;

    varying vec4 vColor;
    varying vec3 vColorAmb;
    varying vec3 vColorDif;
    varying vec3 vColorSpec;

    varying vec3 l;
    varying float NdotL;
    varying vec3 v;
    varying vec3 h;
    varying float NdotH;
    varying vec4 tempNorm;
    varying vec3 vVertexNormal;

    void main(void) {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
      tempNorm = uPMatrix * uMVMatrix * vec4(aVertexNormal, 0.0);
      vVertexNormal = vec3( tempNorm[0], tempNorm[1], tempNorm[2] );
    
      vColor = vec4( aVertexColor[0], aVertexColor[1], aVertexColor[2], 1.0 );

      vColorAmb = uLightAmb * uVertexAmb;
      if( vColorAmb[0] < 0.0 ) {
        vColorAmb[0] = 0.0;
      }
      if( vColorAmb[1] < 0.0 ) {
        vColorAmb[1] = 0.0;
      }
      if( vColorAmb[2] < 0.0 ) {
        vColorAmb[2] = 0.0;
      }

      l = vec3( uLightPos[0] - gl_Position[0], uLightPos[1] - gl_Position[1], uLightPos[2] - gl_Position[2] );
      l = normalize( l );
      NdotL = dot( vVertexNormal, l );
      if( NdotL < 0.0 ) {
        NdotL = 0.0;
      }
      vColorDif = ( uLightDif * uVertexDif ) * NdotL;
      if( vColorDif[0] < 0.0 ) {
        vColorDif[0] = 0.0;
      }
      if( vColorDif[1] < 0.0 ) {
        vColorDif[1] = 0.0;
      }
      if( vColorDif[2] < 0.0 ) {
        vColorDif[2] = 0.0;
      }

      v = vec3( uEyePos[0] - gl_Position[0], uEyePos[1] - gl_Position[1], uEyePos[2] - gl_Position[2] );
      //v = normalize( v );
      h = normalize( v + l );
      NdotH = dot( vVertexNormal, h );
      if( NdotH < 0.0 ) {
        NdotH = 0.0;
      }
      NdotH = pow( NdotH, specHighlight[0] );
      vColorSpec = uLightSpec * uVertexSpec * NdotH;
      if( vColorSpec[0] < 0.0 ) {
        vColorSpec[0] = 0.0;
      }
      if( vColorSpec[1] < 0.0 ) {
        vColorSpec[1] = 0.0;
      }
      if( vColorSpec[2] < 0.0 ) {
        vColorSpec[2] = 0.0;
      }

      vColor = vec4( vColorAmb + vColorDif + vColorSpec, 1.0 );
      if ( vColor[0] > 1.0 ) {
        vColor[0] = 1.0;
      }
      if ( vColor[1] > 1.0 ) {
        vColor[1] = 1.0;
      }
      if ( vColor[2] > 1.0 ) {
        vColor[2] = 1.0;
      }

      //vColor = vec4( vColorDif, 1.0 );

    }
  `;

    var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
    gl.shaderSource(fShader,fShaderCode); // attach code to shader
    gl.compileShader(fShader); // compile the code for gpu execution
 
    var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
    gl.shaderSource(vShader,vShaderCode); // attach code to shader
    gl.compileShader(vShader); // compile the code for gpu execution
 
    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(fShader));
      return null;
    }
 
   if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
     alert(gl.getShaderInfoLog(vShader));
     return null;
   }

   shaderProgram = gl.createProgram();
   gl.attachShader(shaderProgram, vShader);
   gl.attachShader(shaderProgram, fShader);
   gl.linkProgram(shaderProgram);

   if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram);

  vertexPositionAttrib = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttrib);

  vertexColorAttrib = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(vertexColorAttrib);
  
  vertexNormalAttrib = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(vertexNormalAttrib);

  pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

  /*
      uniform vec3 uLightPos;
    uniform vec3 uLightAmb;
    uniform vec3 uLightDif;
    uniform vec3 uLightSpec;
    uniform vec3 uEyePos;
    */

  lightPosUniform = gl.getUniformLocation(shaderProgram, "uLightPos");
  lightAmbUniform = gl.getUniformLocation(shaderProgram, "uLightAmb");
  lightSpecUniform = gl.getUniformLocation(shaderProgram, "uLightSpec");
  lightDifUniform = gl.getUniformLocation(shaderProgram, "uLightDif");
  eyeUniform = gl.getUniformLocation(shaderProgram, "uEyePos");

  ambUniform = gl.getUniformLocation(shaderProgram, "uVertexAmb");
  difUniform = gl.getUniformLocation(shaderProgram, "uVertexDif");
  specUniform = gl.getUniformLocation(shaderProgram, "uVertexSpec");
  specHighlightUniform = gl.getUniformLocation(shaderProgram, "specHighlight");


} // end setup shaders

// render the loaded model
function renderTriangles() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    //mat4.translate( pMatrix, pMatrix,vec3.negate( vec3.create(), eye ) );
    mat4.translate( pMatrix, pMatrix, vec3.fromValues( 0, -.5, 0) ) ;
    mat4.rotate( pMatrix, pMatrix, rotationAngle, vec3.fromValues( 0, 0, 1 ) );

    //for each set of triangles, do the transformations it has listed
    for( var i=0; i < inputTriangles.length; i++ ) {
      inputTriangles[i].mMatrix = mat4.create(); // modeling mat for tri set
      mat4.fromTranslation(inputTriangles[i].mMatrix,vec3.negate(vec3.create(),inputTriangles[i].center)); //translate to origin
      
      if( i < numTriangleSets ) {
        //working with a regular ol triangle set
        mat4.translate( inputTriangles[i].mMatrix, inputTriangles[i].mMatrix, vec3.fromValues( 0, 0, -3 ) ); //this seems to put them in the right spot??
      } else {
        //working with one of them newfangled ellipsoid sets
        mat4.translate( inputTriangles[i].mMatrix, inputTriangles[i].mMatrix, vec3.fromValues( 0.5, 0, -2.25 ) );
      }

      //do transforms in inputTriangles[i].transforms
      for( var j = 0; j < inputTriangles[i].transforms.length; j++ ) {

        mat4.multiply( inputTriangles[i].mMatrix, inputTriangles[i].mMatrix, inputTriangles[i].transforms[j] );

      }
      //translate back to center
      mat4.multiply(inputTriangles[i].mMatrix, mat4.fromTranslation(mat4.create(),inputTriangles[i].center), inputTriangles[i].mMatrix);

      ///color
      gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffers[i]); // activate
      gl.vertexAttribPointer(vertexColorAttrib,4,gl.FLOAT,false,0,0); // feed

      ///normals
      gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[i]); // activate
      gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false,0,0); // feed

      // vertex buffer: activate and feed into vertex shader
      gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[i]); // activate
      gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed

      // triangle buffer: activate and render
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[i]); // activate
      gl.uniformMatrix4fv(pMatrixUniform, false, pMatrix);
      gl.uniformMatrix4fv(mvMatrixUniform, false, inputTriangles[i].mMatrix);

      gl.uniform3fv(lightPosUniform, light.position);
      gl.uniform3fv(lightAmbUniform, light.ambient);
      gl.uniform3fv(lightSpecUniform, light.specular);
      gl.uniform3fv(lightDifUniform, light.diffuse);
      gl.uniform3fv(eyeUniform, eyeVec3);

      gl.uniform3fv( ambUniform, inputTriangles[i].ambient );
      gl.uniform3fv( difUniform, inputTriangles[i].diffuse );
      gl.uniform3fv( specUniform, inputTriangles[i].specular );
      gl.uniform3fv( specHighlightUniform, inputTriangles[i].highlight );


      gl.drawElements(gl.TRIANGLES,3*triSetSizes[i],gl.UNSIGNED_SHORT,0); // render
    }
    
    /*
    ///color
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer); // activate
    gl.vertexAttribPointer(vertexColorAttrib,4,gl.FLOAT,false,0,0); // feed

    // vertex buffer: activate and feed into vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed

    // triangle buffer: activate and render
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer); // activate
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES,triBufferSize,gl.UNSIGNED_SHORT,0); // render
    */
} // end render triangles


/* MAIN -- HERE is where execution begins after window load */

function main() {
  
  setupWebGL(); // set up the webGL environment
  loadTriangles(); // load in the triangles from tri file
  setupShaders(); // setup the webGL shaders
  renderTriangles(); // draw the triangles using webGL
  
} // end main

//based on http://learningwebgl.com/blog/?p=1253
class Ellipsoid {
  constructor( e ) {
    this.position = vec3.fromValues( -e.x, e.y, e.z );
    this.radius = vec3.fromValues( e.a, e.b, e.c );
    this.amb = vec3.fromValues( e.ambient[0], e.ambient[1], e.ambient[2] );
    this.spec = vec3.fromValues( e.specular[0], e.specular[1], e.specular[2] );
    this.dif = vec3.fromValues( e.diffuse[0], e.diffuse[1], e.diffuse[2] );
    this.exp = e.n;
    var latitudeBands = 30;
    var longitudeBands = 30;

    this.vertexPositionData = [];
    this.colorData = [];
    this.normalData = [];
    
    for( var latNumber = 0; latNumber <= latitudeBands; latNumber++ ) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for( var longNumber = 0; longNumber <= longitudeBands; longNumber++ ) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var z = cosPhi * sinTheta;
        var y = cosTheta;
        var x = sinPhi * sinTheta;
        var u = 1 - (longNumber/longitudeBands);
        var v = 1 - (latNumber/latitudeBands);

        //normal data
        var normX = 2 * ( x - this.position[0] ) / Math.pow( this.radius[0], 2 );
        var normY = 2 * ( y - this.position[1] ) / Math.pow( this.radius[1], 2 );
        var normZ = 2 * ( z - this.position[2] ) / Math.pow( this.radius[2], 2 );
        var n = vec3.fromValues( x, y, z );
        vec3.normalize( n, n );
        this.normalData.push( n[0], n[1], n[2] );

        //this.vertexPositionData.push( this.radius[0]*x + this.position[0] );
        this.vertexPositionData.push( this.radius[0]*x + this.position[0] );
        this.vertexPositionData.push( this.radius[1]*y + this.position[1] );
        this.vertexPositionData.push( this.radius[2]*z + this.position[2] );
        var c = getColorEll( e );
        this.colorData.push( c[0], c[1], c[2], c[3] );
      }
    }

    this.indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
        var first = (latNumber * (longitudeBands + 1)) + longNumber;
        var second = first + longitudeBands + 1;
        this.indexData.push(first);
        this.indexData.push(second);
        this.indexData.push(first + 1);

        this.indexData.push(second);
        this.indexData.push(second + 1);
        this.indexData.push(first + 1);
      }
    }
  }

  getIndexData() {
    return this.indexData;
  }

  getVertexData() {
    return this.vertexPositionData;
  }
  getColorData() {
    return this.colorData;
  }
  getPosition() {
    return this.position;
  }
  getNormalData() {
    var bob = vec3.create();
    return this.normalData;
  }
}

