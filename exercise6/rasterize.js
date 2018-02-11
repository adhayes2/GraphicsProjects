/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://pages.github.ncsu.edu/cgclass/exercise5/triangles.json"; // triangles file loc
const INPUT_ELLIPSOIDS_URL = "https://pages.github.ncsu.edu/cgclass/exercise5/ellipsoids.json"; // ellipsoids file loc
var Eye = new vec4.fromValues(0.5,0.5,-0.5,1.0); // default eye position in world space

/* input globals */
var inputTriangles; // the triangles read in from json
var numTriangleSets = 0; // the number of sets of triangles
var triSetSizes = []; // the number of triangles in each set

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffers = []; // this contains vertex coordinates in triples, organized by tri set
var triangleBuffers = []; // this contains indices into vertexBuffers in triples, organized by tri set
var vertexPositionAttrib; // where to put position for vertex shader
var modelMatrixULoc; // where to put the model matrix for vertex shader


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
        console.log(e);
        return(String.null);
    }
} // end get input json file

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it
    
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.3411764706, 0.0, 0.4980392157, 1.0); // use purple when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL

// read triangles in, load them into webgl buffers
function loadTriangles() {
    inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles");

    if (inputTriangles != String.null) { 
        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set
        var vtxToAdd; // vtx coords to add to the coord array
        var triToAdd; // tri indices to add to the index array

        // for each set of tris in the input file
        numTriangleSets = inputTriangles.length;
        for (var whichSet=0; whichSet<numTriangleSets; whichSet++) {
            
            // set up the vertex coord array
            inputTriangles[whichSet].coordArray = []; // create a list of coords for this tri set
            for (whichSetVert=0; whichSetVert<inputTriangles[whichSet].vertices.length; whichSetVert++) {
                vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
                inputTriangles[whichSet].coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]);
            } // end for vertices in set

            // send the vertex coords to webGL
            vertexBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
            gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].coordArray),gl.STATIC_DRAW); // coords to that buffer
            
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
        } // end for each triangle set 
    } // end if triangles found
} // end load triangles

// setup the webGL shaders
function setupShaders() {
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        void main(void) {
            gl_FragColor = vec4(1.0, 0.0784313725, 0.5764705882, 1.0); // all fragments are deep pink
        }
    `;
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 vertexPosition;
        uniform mat4 uModelMatrix; // the model matrix
        void main(void) {
            gl_Position = uModelMatrix * vec4(vertexPosition, 1.0);
        }
    `;
    
    try {
        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                vertexPositionAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderProgram, "vertexPosition"); 
                modelMatrixULoc = gl.getUniformLocation(shaderProgram, "uModelMatrix"); // ptr to mmat

                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function renderTriangles() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    // define the modeling matrix for the first set 
    inputTriangles[0].mMatrix = mat4.create(); // modeling mat for tri set
    var setCenter = vec3.fromValues(.25,.75,0);  // center coords of tri set 
    mat4.fromTranslation(inputTriangles[0].mMatrix,vec3.negate(vec3.create(),setCenter)); // translate to origin
    mat4.multiply(inputTriangles[0].mMatrix,
                  mat4.fromRotation(mat4.create(),Math.PI*(3/4),vec3.fromValues(0,0,1)),
                  inputTriangles[0].mMatrix); // rotate 135 degs

    //this is supposed to translate but i make no promises
    mat4.translate(inputTriangles[0].mMatrix, inputTriangles[0].mMatrix, vec3.fromValues(0,1.41,0));

    mat4.multiply(inputTriangles[0].mMatrix,
                  mat4.fromTranslation(mat4.create(),setCenter),
                  inputTriangles[0].mMatrix); // move back to center
        
    // define the modeling matrix for the second set
    inputTriangles[1].mMatrix = mat4.create();
    setCenter = vec3.fromValues(.25,.25,0);  // center coords of tri set 
    mat4.fromTranslation(inputTriangles[1].mMatrix,vec3.negate(vec3.create(),setCenter)); // translate to origin
    mat4.multiply(inputTriangles[1].mMatrix,
                  mat4.fromRotation(mat4.create(),Math.PI/4,vec3.fromValues(0,0,1)),
                  inputTriangles[1].mMatrix); // rotate 45 degs

    //got this from a tutorial: https://www.tutorialspoint.com/webgl/webgl_scaling.htm
    var Sx = 2.0, Sy = 2.0, Sz = 1.0;
    var xformMatrix = new Float32Array([
     Sx,   0.0,  0.0,  0.0,
     0.0,  Sy,   0.0,  0.0,
     0.0,  0.0,  Sz,   0.0,
     0.0,  0.0,  0.0,  1.0  
    ]);
    //then i just guessed this part
    mat4.multiply(inputTriangles[1].mMatrix, inputTriangles[1].mMatrix, xformMatrix);

    //this is supposed to translate but i make no promises
    mat4.translate(inputTriangles[1].mMatrix, inputTriangles[1].mMatrix, vec3.fromValues(-.565,-.214,0));

    mat4.multiply(inputTriangles[1].mMatrix,
                  mat4.fromTranslation(mat4.create(),setCenter),
                  inputTriangles[1].mMatrix); // move back to center
    
    for (var whichTriSet=0; whichTriSet<numTriangleSets; whichTriSet++) { 
        
        // pass modeling matrix for set to shadeer
        gl.uniformMatrix4fv(modelMatrixULoc, false, inputTriangles[whichTriSet].mMatrix);

        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[whichTriSet]); // activate
        gl.drawElements(gl.TRIANGLES,3*triSetSizes[whichTriSet],gl.UNSIGNED_SHORT,0); // render
    } // end for each tri set
} // end render triangles


/* MAIN -- HERE is where execution begins after window load */

function main() {
  
  setupWebGL(); // set up the webGL environment
  loadTriangles(); // load in the triangles from tri file
  setupShaders(); // setup the webGL shaders
  renderTriangles(); // draw the triangles using webGL
  
} // end main