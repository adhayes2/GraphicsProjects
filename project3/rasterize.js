/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog3/triangles.json"; // triangles file loc
const INPUT_ELLIPSOIDS_URL = "https://ncsucgclass.github.io/prog3/ellipsoids.json"; // ellipsoids file loc
var defaultEye = vec3.fromValues(0.5,0.5,-0.5); // default eye position in world space
var defaultCenter = vec3.fromValues(0.5,0.5,0.5); // default view direction in world space
var defaultUp = vec3.fromValues(0,1,0); // default view up vector
var lightAmbient = vec3.fromValues(1,1,1); // default light ambient emission
var lightDiffuse = vec3.fromValues(1,1,1); // default light diffuse emission
var lightSpecular = vec3.fromValues(1,1,1); // default light specular emission
var lightPosition = vec3.fromValues(2,4,-0.5); // default light position
var rotateTheta = Math.PI/50; // how much to rotate models by with each key press
var blend = 1; //0 = replace, 1 = multiply, 2 = two textures multiplied, 3 = two textures multiplied and color
var blendModeMax = 3; //how many blend modes are there
var blendULoc;
var alphaULoc;
var mMatrixArr = [];
var mMatrixArrOG = [];
var pvmMatrixArr = [];
var modelsArray = [];
var currentObject = -1; //which object is selected?

var ultimateTriangleArray = [];
class Triangle {
  //arr is the vertex array, p1 - 3 are which vertexes (points) to use
  //normArr is the normal array
  //uvArr is the uv array
  constructor( arr, p1, p2, p3, normArr, uvArr ) {
    var t1 = p1 * 3;
    var t2 = p2 * 3;
    var t3 = p3 * 3;
    this.v1 = [ arr[t1], arr[t1+1], arr[t1+2] ];
    this.v2 = [ arr[t2], arr[t2+1], arr[t2+2] ];
    this.v3 = [ arr[t3], arr[t3+1], arr[t3+2] ];
    this.vAll = [ this.v1[0], this.v1[1], this.v1[2], this.v2[0], this.v2[1], this.v2[2], this.v3[0], this.v3[1], this.v3[2] ];
    this.centroid = [ (this.v1[0]+this.v2[0]+this.v3[0])/3, (this.v1[1]+this.v2[1]+this.v3[1])/3, (this.v1[2]+this.v2[2]+this.v3[2])/3 ];
    this.vNormals = [ normArr[t1], normArr[t1+1], normArr[t1+2], normArr[t2], normArr[t2+1], normArr[t2+2], normArr[t3], normArr[t3+1], normArr[t3+2] ];
    var u1 = p1 * 2;
    var u2 = p2 * 2;
    var u3 = p3 * 2;
    this.uvCoords = [ uvArr[u1], uvArr[u1+1], uvArr[u2], uvArr[u2+1], uvArr[u3], uvArr[u3+1] ];

    this.texBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.texBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.uvCoords ), gl.STATIC_DRAW );

    this.vertBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.vAll ), gl.STATIC_DRAW );

    this.normBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.normBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.vNormals ), gl.STATIC_DRAW );

    this.triBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.triBuffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( [0, 1, 2] ), gl.STATIC_DRAW );
  }
  /* other things this guy should have
    mMatrix
    pvmMatrix
    ambient
    diffuse
    specular
    shininess
    alpha
    texture
    texture2
  */
}

var textureSources = []; //texture source files that don't have transparent bits
textureSources.push( "https://ncsucgclass.github.io/prog3/billie.jpg" );
textureSources.push( "https://ncsucgclass.github.io/prog3/glass.gif" );
textureSources.push( "https://ncsucgclass.github.io/prog3/retro.jpg" );
textureSources.push( "https://ncsucgclass.github.io/prog3/rocktile.jpg" );
textureSources.push( "https://ncsucgclass.github.io/prog3/stars.jpg" );
textureSources.push( "https://ncsucgclass.github.io/prog3/sky.jpg" );
textureSources.push( "https://ncsucgclass.github.io/prog3/abe.png" );
textureSources.push( "https://ncsucgclass.github.io/prog3/earth.png" );
textureSources.push( "https://ncsucgclass.github.io/prog3/leaf.small.png" );
textureSources.push( "https://ncsucgclass.github.io/prog3/tree.png" );
shuffle( textureSources );
var texturePrefix = "https://ncsucgclass.github.io/prog3/";

var memeSources = [];
memeSources.push( "https://78.media.tumblr.com/afc4ac3fb6bb0cb373b91121a35d2936/tumblr_ozbz21BBYo1reb6fbo1_250.png" );
memeSources.push( "https://78.media.tumblr.com/e764b1cdbaa3b50a09256588f9c75051/tumblr_ozbzc5eqSg1reb6fbo1_250.png" );
memeSources.push( "https://78.media.tumblr.com/a1e7a8d756a980ec50906eb1de37b1b7/tumblr_ozbzc5eqSg1reb6fbo2_250.png" );
memeSources.push( "https://78.media.tumblr.com/b18eccb66a0ea2282430a627167d9cb7/tumblr_ozbzc5eqSg1reb6fbo3_250.png" );
memeSources.push( "https://78.media.tumblr.com/defeb0f757b009c8245a2c0ec2d6e415/tumblr_ozbzc5eqSg1reb6fbo4_250.png" );
memeSources.push( "https://78.media.tumblr.com/acc68bf2ff7c40194f0c67778512db8b/tumblr_ozbzc5eqSg1reb6fbo5_250.png" );
memeSources.push( "https://78.media.tumblr.com/b1960fbd9915b997a8edbe162c73960f/tumblr_ozbzc5eqSg1reb6fbo6_250.png" );
memeSources.push( "https://78.media.tumblr.com/e1b8d27411309482d7f99d0a659146de/tumblr_ozbzc5eqSg1reb6fbo7_250.png" );
memeSources.push( "https://78.media.tumblr.com/22edc62666080f32e2464cd8b71ec093/tumblr_ozbzc5eqSg1reb6fbo8_250.png" );
memeSources.push( "https://78.media.tumblr.com/1abc40d46df3666ff3ae717b43389de3/tumblr_ozbzc5eqSg1reb6fbo9_250.png" );
memeSources.push( "https://78.media.tumblr.com/a8ebc710c1669807aa7981e2035ebfac/tumblr_ozbzc5eqSg1reb6fbo10_250.png" );
shuffle( memeSources );

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
//randomly orders an array (so the textures aren't the same every time)
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/* webgl and geometry data */
var gl = null; // the all powerful gl object. It's all here folks!
var inputTriangles = []; // the triangle data as loaded from input files
var numTriangleSets = 0; // how many triangle sets in input scene
var inputEllipsoids = []; // the ellipsoid data as loaded from input files
var numEllipsoids = 0; // how many ellipsoids in the input scene

var samplerULoc, sampler2ULoc;

var vertexBuffers = []; // this contains vertex coordinate lists by set, in triples
var normalBuffers = []; // this contains normal component lists by set, in triples
var textureBuffers = []; //this contains texture coordinate lists by set, in doubles
var triSetSizes = []; // this contains the size of each triangle set
var triangleBuffers = []; // lists of indices into vertexBuffers by set, in triples

/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var ambientULoc; // where to put ambient reflecivity for fragment shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader
var specularULoc; // where to put specular reflecivity for fragment shader
var shininessULoc; // where to put specular exponent for fragment shader

/* interaction variables */
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space
var viewDelta = 0; // how much to displace view with each key press

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

// does stuff when keys are pressed
function handleKeyDown(event) {
    
    const modelEnum = {TRIANGLES: "triangles", ELLIPSOID: "ellipsoid"}; // enumerated model type
    const dirEnum = {NEGATIVE: -1, POSITIVE: 1}; // enumerated rotation direction
    
    function highlightModel(modelType,whichModel) {
        if (handleKeyDown.modelOn != null)
            handleKeyDown.modelOn.on = false;
        handleKeyDown.whichOn = whichModel;
        if (modelType == modelEnum.TRIANGLES)
            handleKeyDown.modelOn = inputTriangles[whichModel]; 
        else
            handleKeyDown.modelOn = inputEllipsoids[whichModel]; 
        handleKeyDown.modelOn.on = true; 
    } // end highlight model
    
    function translateModel(offset) {
        if (currentObject != -1){
          //vec3.add(handleKeyDown.modelOn.translation,handleKeyDown.modelOn.translation,offset);
          var mMatrix = mMatrixArr[ currentObject ];
          temp = mat4.create();
          mat4.multiply(mMatrix, mat4.fromTranslation(temp, offset), mMatrix);

          recalculatePVMMatrixes();
          makeTree();
        }
    } // end translate model

    function rotateModel(axis,direction) {
        if (currentObject != -1) {
          var mMatrix = mMatrixArr[currentObject];
          var currModel = modelsArray[currentObject];
          var temp = mat4.create();
          var sumRotation = mat4.create();
          var zAxis = vec3.create();
        
          //translate to origin
          var negCtr = vec3.create();
          mat4.fromTranslation(mMatrix,vec3.negate(negCtr,currModel.center));

          //rotate
          var newRotation = mat4.create();
          mat4.fromRotation(newRotation,direction*rotateTheta,axis); // get a rotation matrix around passed axis
          vec3.transformMat4(currModel.xAxis,currModel.xAxis,newRotation); // rotate model x axis tip
          vec3.transformMat4(currModel.yAxis,currModel.yAxis,newRotation); // rotate model y axis tip

          // rotate the model to current interactive orientation
          vec3.normalize(zAxis,vec3.cross(zAxis,currModel.xAxis,currModel.yAxis)); // get the new model z axis
          mat4.set(sumRotation, // get the composite rotation
            currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
            currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
            currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
            0, 0,  0, 1);
          mat4.multiply(mMatrix,sumRotation,mMatrix); // R(ax) * S(1.2) * T(-ctr)

          mat4.multiply(mMatrix,mat4.fromScaling(temp,vec3.fromValues(1.2,1.2,1.2)),mMatrix);

          //translate away from origin
          mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.center),mMatrix);

          recalculatePVMMatrixes();
          makeTree();
        } // end if there is a highlighted model
    } // end rotate model
    
    // set up needed view params
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
    
    // highlight static variables
    handleKeyDown.whichOn = handleKeyDown.whichOn == undefined ? -1 : handleKeyDown.whichOn; // nothing selected initially
    handleKeyDown.modelOn = handleKeyDown.modelOn == undefined ? null : handleKeyDown.modelOn; // nothing selected initially

    switch (event.code) {
        
        // model selection
        case "Space": 
        /*
            if (handleKeyDown.modelOn != null)
                handleKeyDown.modelOn.on = false; // turn off highlighted model
            handleKeyDown.modelOn = null; // no highlighted model
            handleKeyDown.whichOn = -1; // nothing highlighted
            */
            if( currentObject != -1 ) {
              //there is an object selected - unbiggify it
              scaleModel( currentObject, 1 );
              currentObject = -1;
            }
            break;
        case "ArrowRight": // select next triangle set
            if( currentObject != -1 ) {
              //undo selection
              scaleModel( currentObject, 1 );
            }
            //change object
            if( currentObject < numTriangleSets-1 ) {
              currentObject++;
            } else {
              currentObject = 0;
            }
            //do selection
            scaleModel( currentObject, 1.2 );
            break;
        case "ArrowLeft": // select previous triangle set
            if( currentObject != -1 ) {
              //undo selection
              scaleModel( currentObject, 1 );
            }
            //change object
            if( currentObject > 0 && currentObject < numTriangleSets ) {
              currentObject--;
            } else {
              currentObject = numTriangleSets - 1;
            }
            //do selection
            scaleModel( currentObject, 1.2 );
            break;
        case "ArrowUp": // select next ellipsoid
            if( currentObject != -1 ) {
              //undo selection
              scaleModel( currentObject, 1 );
            }
            //change object
            if( currentObject >= numTriangleSets && currentObject < numTriangleSets + numEllipsoids - 1 ) {
              currentObject++;
            } else {
              currentObject = numTriangleSets;
            }
            //do selection
            scaleModel( currentObject, 1.2 );
            break;
        case "ArrowDown": // select previous ellipsoid
            if( currentObject != -1 ) {
            //undo selection
            scaleModel( currentObject, 1 );
            }
            //change object
            if( currentObject > numTriangleSets && currentObject < numTriangleSets + numEllipsoids ) {
              currentObject--;
            } else {
              currentObject = numTriangleSets + numEllipsoids - 1;
            }
            //do selection
            scaleModel( currentObject, 1.2 );
            break;
            
        // view change
        case "KeyA": // translate view left, rotate left with shift
            Center = vec3.add(Center,Center,vec3.scale(temp,viewRight,viewDelta));
            if (!event.getModifierState("Shift"))
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,viewRight,viewDelta));
            recalculatePVMMatrixes();
            break;
        case "KeyD": // translate view right, rotate right with shift
            Center = vec3.add(Center,Center,vec3.scale(temp,viewRight,-viewDelta));
            if (!event.getModifierState("Shift"))
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,viewRight,-viewDelta));
            recalculatePVMMatrixes();
            break;
        case "KeyS": // translate view backward, rotate up with shift
            if (event.getModifierState("Shift")) {
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,viewDelta));
                Up = vec3.cross(Up,viewRight,vec3.subtract(lookAt,Center,Eye)); /* global side effect */
            } else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,lookAt,-viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,lookAt,-viewDelta));
            } // end if shift not pressed
            recalculatePVMMatrixes();
            break;
        case "KeyW": // translate view forward, rotate down with shift
            if (event.getModifierState("Shift")) {
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,-viewDelta));
                Up = vec3.cross(Up,viewRight,vec3.subtract(lookAt,Center,Eye)); /* global side effect */
            } else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,lookAt,viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,lookAt,viewDelta));
            } // end if shift not pressed
            recalculatePVMMatrixes();
            break;
        case "KeyQ": // translate view up, rotate counterclockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up,vec3.add(Up,Up,vec3.scale(temp,viewRight,-viewDelta)));
            else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,viewDelta));
            } // end if shift not pressed
            recalculatePVMMatrixes();
            break;
        case "KeyE": // translate view down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up,vec3.add(Up,Up,vec3.scale(temp,viewRight,viewDelta)));
            else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,-viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,-viewDelta));
            } // end if shift not pressed
            recalculatePVMMatrixes();
            break;
        case "Escape": // reset view to default
            Eye = vec3.copy(Eye,defaultEye);
            Center = vec3.copy(Center,defaultCenter);
            Up = vec3.copy(Up,defaultUp);
            recalculatePVMMatrixes();
            break;
            
        // model transformation
        case "KeyK": // translate left, rotate left with shift
            if (event.getModifierState("Shift"))
                rotateModel(Up,dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp,viewRight,viewDelta));
            break;
        case "Semicolon": // translate right, rotate right with shift
            if (event.getModifierState("Shift"))
                rotateModel(Up,dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp,viewRight,-viewDelta));
            break;
        case "KeyL": // translate backward, rotate up with shift
            if (event.getModifierState("Shift"))
                rotateModel(viewRight,dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp,lookAt,-viewDelta));
            break;
        case "KeyO": // translate forward, rotate down with shift
            if (event.getModifierState("Shift"))
                rotateModel(viewRight,dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp,lookAt,viewDelta));
            break;
        case "KeyI": // translate up, rotate counterclockwise with shift 
            if (event.getModifierState("Shift"))
                rotateModel(lookAt,dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp,Up,viewDelta));
            break;
        case "KeyP": // translate down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                rotateModel(lookAt,dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp,Up,-viewDelta));
            break;
        case "KeyB": // change lighting/texture blend mode
            if ( blend == blendModeMax )
                blend = 0;
            else
                blend++;
            break;
        case "Backspace": // reset model transforms to default
            /*
            for (var whichTriSet=0; whichTriSet<numTriangleSets; whichTriSet++) {
                vec3.set(inputTriangles[whichTriSet].translation,0,0,0);
                vec3.set(inputTriangles[whichTriSet].xAxis,1,0,0);
                vec3.set(inputTriangles[whichTriSet].yAxis,0,1,0);
            } // end for all triangle sets
            for (var whichEllipsoid=0; whichEllipsoid<numEllipsoids; whichEllipsoid++) {
                vec3.set(inputEllipsoids[whichEllipsoid].translation,0,0,0);
                vec3.set(inputEllipsoids[whichTriSet].xAxis,1,0,0);
                vec3.set(inputEllipsoids[whichTriSet].yAxis,0,1,0);
            } // end for all ellipsoids
            */
            for( var i = 0; i < mMatrixArr.length; i++ ) {
              mat4.copy( mMatrixArr[i], mMatrixArrOG[i] );
            }
            recalculatePVMMatrixes();
            break;
    } // end switch
} // end handleKeyDown

// set up the webGL environment
function setupWebGL() {
    
    // Set up keys
    document.onkeydown = handleKeyDown; // call this when key pressed

      // Get the image canvas, render an image in it
     var imageCanvas = document.getElementById("myImageCanvas"); // create a 2d canvas
      var cw = imageCanvas.width, ch = imageCanvas.height; 
      imageContext = imageCanvas.getContext("2d"); 
      var bkgdImage = new Image(); 
      bkgdImage.crossOrigin = "Anonymous";
      bkgdImage.src = "https://ncsucgclass.github.io/prog3/sky.jpg";
      bkgdImage.onload = function(){
          var iw = bkgdImage.width, ih = bkgdImage.height;
          imageContext.drawImage(bkgdImage,0,0,iw,ih,0,0,cw,ch);   
     } // end onload callback
    
     // create a webgl canvas and set it up
     var webGLCanvas = document.getElementById("myWebGLCanvas"); // create a webgl canvas
     gl = webGLCanvas.getContext("webgl"); // get a webgl object from it
     try {
       if (gl == null) {
         throw "unable to create gl context -- is your browser gl ready?";
       } else {
         //gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
         gl.clearDepth(1.0); // use max when we clear the depth buffer
         gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
         gl.depthMask(false); //do something
         gl.disable(gl.DEPTH_TEST);
         gl.enable(gl.BLEND);
         gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
       }
     } // end try
     
     catch(e) {
       console.log(e);
     } // end catch
} // end setupWebGL

// read models in, load them into webgl buffers
function loadModels() {

    // make an ellipsoid, with numLongSteps longitudes.
    // start with a sphere of radius 1 at origin
    // Returns verts, tris and normals.
    function makeEllipsoid(currEllipsoid,numLongSteps) {

        try {
            if (numLongSteps % 2 != 0)
                throw "in makeSphere: uneven number of longitude steps!";
            else if (numLongSteps < 4)
                throw "in makeSphere: number of longitude steps too small!";
            else { // good number longitude steps
            
                console.log("ellipsoid xyz: "+ ellipsoid.x +" "+ ellipsoid.y +" "+ ellipsoid.z);
                
                var ellipsoidTextures = []; //should have two texture coordinates for every vertex

                // make vertices
                var ellipsoidVertices = [0,-1,0]; // vertices to return, init to south pole
                ellipsoidTextures.push( 0.5, 1.0 ); // add south pole uv
                var angleIncr = (Math.PI+Math.PI) / numLongSteps; // angular increment 
                var latLimitAngle = angleIncr * (Math.floor(numLongSteps/4)-1); // start/end lat angle
                var latRadius, latY; // radius and Y at current latitude
                for (var latAngle=-latLimitAngle; latAngle<=latLimitAngle; latAngle+=angleIncr) {
                    latRadius = Math.cos(latAngle); // radius of current latitude
                    latY = Math.sin(latAngle); // height at current latitude
                    for (var longAngle=0; longAngle<2*Math.PI+angleIncr; longAngle+=angleIncr) {// for each long
                        ellipsoidVertices.push(latRadius*Math.sin(longAngle), latY, latRadius*Math.cos(longAngle));
                        ellipsoidTextures.push( longAngle/(Math.PI * 2), (1-(latAngle+latLimitAngle)/(Math.PI))-.0625 );
                    }
                } // end for each latitude
                ellipsoidVertices.push(0,1,0); // add north pole
                ellipsoidTextures.push( 0.5, 0.0 ); //add north pole uv
                ellipsoidVertices = ellipsoidVertices.map(function(val,idx) { // position and scale ellipsoid
                    switch (idx % 3) {
                        case 0: // x
                            return(val*currEllipsoid.a+currEllipsoid.x);
                        case 1: // y
                            return(val*currEllipsoid.b+currEllipsoid.y);
                        case 2: // z
                            return(val*currEllipsoid.c+currEllipsoid.z);
                    } // end switch
                }); 

                // make normals using the ellipsoid gradient equation
                // resulting normals are unnormalized: we rely on shaders to normalize
                var ellipsoidNormals = ellipsoidVertices.slice(); // start with a copy of the transformed verts
                ellipsoidNormals = ellipsoidNormals.map(function(val,idx) { // calculate each normal
                    switch (idx % 3) {
                        case 0: // x
                            return(2/(currEllipsoid.a*currEllipsoid.a) * (val-currEllipsoid.x));
                        case 1: // y
                            return(2/(currEllipsoid.b*currEllipsoid.b) * (val-currEllipsoid.y));
                        case 2: // z
                            return(2/(currEllipsoid.c*currEllipsoid.c) * (val-currEllipsoid.z));
                    } // end switch
                }); 
                
                // make triangles, from south pole to middle latitudes to north pole
                var ellipsoidTriangles = []; // triangles to return
                for (var whichLong=1; whichLong<numLongSteps; whichLong++) { // south pole
                    ellipsoidTriangles.push(0,whichLong,whichLong+1);
                }
                ellipsoidTriangles.push(0,numLongSteps,1); // longitude wrap tri
                var llVertex; // lower left vertex in the current quad
                for (var whichLat=0; whichLat<(numLongSteps/2 - 2); whichLat++) { // middle lats
                    for (var whichLong=0; whichLong<numLongSteps-1; whichLong++) {
                        llVertex = whichLat*numLongSteps + whichLong + 1;
                        ellipsoidTriangles.push(llVertex,llVertex+numLongSteps,llVertex+numLongSteps+1);
                        ellipsoidTriangles.push(llVertex,llVertex+numLongSteps+1,llVertex+1);
                    } // end for each longitude
                    ellipsoidTriangles.push(llVertex+1,llVertex+numLongSteps+1,llVertex+2);
                    ellipsoidTriangles.push(llVertex+1,llVertex+2,llVertex-numLongSteps+2);
                } // end for each latitude
                for (var whichLong=llVertex+2; whichLong<llVertex+numLongSteps+1; whichLong++) {// north pole
                    ellipsoidTriangles.push(whichLong,ellipsoidVertices.length/3-1,whichLong+1);
                }
                ellipsoidTriangles.push(ellipsoidVertices.length/3-numLongSteps/2-1, ellipsoidVertices.length/3-1,
                  ellipsoidVertices.length/3-numLongSteps-numLongSteps/2); // seal up that weird triangle hole
            } // end if good number longitude steps
            return({vertices:ellipsoidVertices, normals:ellipsoidNormals, triangles:ellipsoidTriangles, textures:ellipsoidTextures});
        } // end try
        
        catch(e) {
            console.log(e);
        } // end catch
    } // end make ellipsoid
    
    inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles"); // read in the triangle data

    try {
        if (inputTriangles == String.null)
            throw "Unable to load triangles file!";
        else {
            var whichSetVert; // index of vertex in current triangle set
            var whichSetTri; // index of triangle in current triangle set
            var vtxToAdd; // vtx coords to add to the coord array
            var normToAdd; // vtx normal to add to the coord array
            var uvToAdd; // uv coords to add to the uv arry
            var triToAdd; // tri indices to add to the index array
            var maxCorner = vec3.fromValues(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE); // bbox corner
            var minCorner = vec3.fromValues(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE); // other corner
        
            // process each triangle set to load webgl vertex and triangle buffers
            numTriangleSets = inputTriangles.length; // remember how many tri sets
            for (var whichSet=0; whichSet<numTriangleSets; whichSet++) { // for each tri set
                
                //texture stuff
                var whichTexture = whichSet;
                inputTriangles[whichSet].texture = loadTexture( gl, texturePrefix + inputTriangles[whichSet].material.texture );
                inputTriangles[whichSet].texture2 = loadTexture( gl, memeSources[whichTexture % memeSources.length] );
                inputTriangles[whichSet].textureCoordinates = [];

                // set up hilighting, modeling translation and rotation
                inputTriangles[whichSet].center = vec3.fromValues(0,0,0);  // center point of tri set
                inputTriangles[whichSet].on = false; // not highlighted
                inputTriangles[whichSet].translation = vec3.fromValues(0,0,0); // no translation
                inputTriangles[whichSet].xAxis = vec3.fromValues(1,0,0); // model X axis
                inputTriangles[whichSet].yAxis = vec3.fromValues(0,1,0); // model Y axis 

                // set up the vertex and normal arrays, define model center and axes
                inputTriangles[whichSet].glVertices = []; // flat coord list for webgl
                inputTriangles[whichSet].glNormals = []; // flat normal list for webgl
                var numVerts = inputTriangles[whichSet].vertices.length; // num vertices in tri set
                for (whichSetVert=0; whichSetVert<numVerts; whichSetVert++) { // verts in set
                    vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert]; // get vertex to add
                    normToAdd = inputTriangles[whichSet].normals[whichSetVert]; // get normal to add
                    inputTriangles[whichSet].glVertices.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); // put coords in set coord list
                    inputTriangles[whichSet].glNormals.push(normToAdd[0],normToAdd[1],normToAdd[2]); // put normal in set coord list
                    vec3.max(maxCorner,maxCorner,vtxToAdd); // update world bounding box corner maxima
                    vec3.min(minCorner,minCorner,vtxToAdd); // update world bounding box corner minima
                    vec3.add(inputTriangles[whichSet].center,inputTriangles[whichSet].center,vtxToAdd); // add to ctr sum

                    //texture stuff
                    inputTriangles[whichSet].textureCoordinates.push( inputTriangles[whichSet].uvs[whichSetVert][0], 1-inputTriangles[whichSet].uvs[whichSetVert][1] );
                } // end for vertices in set
                vec3.scale(inputTriangles[whichSet].center,inputTriangles[whichSet].center,1/numVerts); // avg ctr sum

                // send the vertex coords and normals to webGL
                vertexBuffers[whichSet] = gl.createBuffer(); // init empty webgl set vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glVertices),gl.STATIC_DRAW); // data in
                normalBuffers[whichSet] = gl.createBuffer(); // init empty webgl set normal component buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glNormals),gl.STATIC_DRAW); // data in
                textureBuffers[whichSet] = gl.createBuffer();
                gl.bindBuffer( gl.ARRAY_BUFFER,textureBuffers[whichSet] );
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].textureCoordinates),gl.STATIC_DRAW);
               
                //set up the things that the triangle needs to have included that can be calculated per set
                calculateMatrixes( inputTriangles[whichSet] );

                // set up the triangle index array, adjusting indices across sets
                inputTriangles[whichSet].glTriangles = []; // flat index list for webgl
                triSetSizes[whichSet] = inputTriangles[whichSet].triangles.length; // number of tris in this set
                for (whichSetTri=0; whichSetTri<triSetSizes[whichSet]; whichSetTri++) {
                    triToAdd = inputTriangles[whichSet].triangles[whichSetTri]; // get tri to add
                    inputTriangles[whichSet].glTriangles.push(triToAdd[0],triToAdd[1],triToAdd[2]); // put indices in set list

                    //ok so let's just treat each triangle as it's own dealio
                    var tri = new Triangle( inputTriangles[whichSet].glVertices, triToAdd[0], triToAdd[1], triToAdd[2], inputTriangles[whichSet].glNormals, inputTriangles[whichSet].textureCoordinates );
                    tri.whichSet = whichSet;
                    var mat = inputTriangles[whichSet].material;
                    tri.amb = mat.ambient;
                    tri.dif = mat.diffuse;
                    tri.spec = mat.specular;
                    tri.shine = mat.n;
                    tri.alpha = mat.alpha;
                    tri.texture = inputTriangles[whichSet].texture;
                    tri.texture2 = inputTriangles[whichSet].texture2;

                    ultimateTriangleArray.push( tri );
                } // end for triangles in set

                // send the triangle indices to webGL
                triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inputTriangles[whichSet].glTriangles),gl.STATIC_DRAW); // data in

            } // end for each triangle set 
        
            inputEllipsoids = getJSONFile(INPUT_ELLIPSOIDS_URL,"ellipsoids"); // read in the ellipsoids

            if (inputEllipsoids == String.null)
                throw "Unable to load ellipsoids file!";
            else {
                
                // init ellipsoid highlighting, translation and rotation; update bbox
                var ellipsoid; // current ellipsoid
                var ellipsoidModel; // current ellipsoid triangular model
                var temp = vec3.create(); // an intermediate vec3
                var minXYZ = vec3.create(), maxXYZ = vec3.create();  // min/max xyz from ellipsoid
                numEllipsoids = inputEllipsoids.length; // remember how many ellipsoids
                for (var whichEllipsoid=0; whichEllipsoid<numEllipsoids; whichEllipsoid++) {
                    
                  //texture stuff
                  var whichTexture = whichEllipsoid+numTriangleSets;
                  inputEllipsoids[whichEllipsoid].texture = loadTexture( gl, texturePrefix + inputEllipsoids[whichEllipsoid].texture );
                  inputEllipsoids[whichEllipsoid].texture2 = loadTexture( gl, memeSources[whichTexture % memeSources.length] );
                  inputEllipsoids[whichEllipsoid].textureCoordinates = [];

                    // set up various stats and transforms for this ellipsoid
                    ellipsoid = inputEllipsoids[whichEllipsoid];
                    ellipsoid.on = false; // ellipsoids begin without highlight
                    ellipsoid.translation = vec3.fromValues(0,0,0); // ellipsoids begin without translation
                    ellipsoid.xAxis = vec3.fromValues(1,0,0); // ellipsoid X axis
                    ellipsoid.yAxis = vec3.fromValues(0,1,0); // ellipsoid Y axis 
                    ellipsoid.center = vec3.fromValues(ellipsoid.x,ellipsoid.y,ellipsoid.z); // locate ellipsoid ctr
                    vec3.set(minXYZ,ellipsoid.x-ellipsoid.a,ellipsoid.y-ellipsoid.b,ellipsoid.z-ellipsoid.c); 
                    vec3.set(maxXYZ,ellipsoid.x+ellipsoid.a,ellipsoid.y+ellipsoid.b,ellipsoid.z+ellipsoid.c); 
                    vec3.min(minCorner,minCorner,minXYZ); // update world bbox min corner
                    vec3.max(maxCorner,maxCorner,maxXYZ); // update world bbox max corner

                    // make the ellipsoid model
                    ellipsoidModel = makeEllipsoid(ellipsoid,32);
    
                    // send the ellipsoid vertex coords and normals to webGL
                    vertexBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex coord buffer
                    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[vertexBuffers.length-1]); // activate that buffer
                    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ellipsoidModel.vertices),gl.STATIC_DRAW); // data in
                    normalBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex normal buffer
                    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[normalBuffers.length-1]); // activate that buffer
                    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ellipsoidModel.normals),gl.STATIC_DRAW); // data in
                    textureBuffers.push( gl.createBuffer() );
                    gl.bindBuffer( gl.ARRAY_BUFFER,textureBuffers[textureBuffers.length-1] );
                    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ellipsoidModel.textures),gl.STATIC_DRAW);

                    triSetSizes.push(ellipsoidModel.triangles.length);
    
                    // send the triangle indices to webGL
                    triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[triangleBuffers.length-1]); // activate that buffer
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(ellipsoidModel.triangles),gl.STATIC_DRAW); // data in

                    //set up the things that the triangle needs to have included that can be calculated per set
                    calculateMatrixes( ellipsoid );

                    //put each triangle into the array
                    for( var i = 0; i < ellipsoidModel.triangles.length; i += 3 ) {
                      var arr = ellipsoidModel.triangles;
                      var tri = new Triangle( ellipsoidModel.vertices, arr[i], arr[i+1], arr[i+2], ellipsoidModel.normals, ellipsoidModel.textures );
                      tri.whichSet = whichEllipsoid + numTriangleSets;
                      tri.amb = ellipsoid.ambient;
                      tri.dif = ellipsoid.diffuse;
                      tri.spec = ellipsoid.specular;
                      tri.shine = ellipsoid.n;
                      tri.alpha = ellipsoid.alpha;
                      tri.texture = ellipsoid.texture;
                      tri.texture2 = ellipsoid.texture2;
                      ultimateTriangleArray.push( tri );
                    }

                } // end for each ellipsoid
                
                viewDelta = vec3.length(vec3.subtract(temp,maxCorner,minCorner)) / 100; // set global
            } // end if ellipsoid file loaded
        } // end if triangle file loaded
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end load models

//calculate view and model matrixes
function calculateMatrixes( obj ) {
  //set up the things that the triangle needs to have included that can be calculated per set
  var pMatrix = mat4.create(); // projection matrix
  var vMatrix = mat4.create(); // view matrix
  var mMatrix = mat4.create(); // model matrix
  var pvMatrix = mat4.create(); // hand * proj * view matrices
  var pvmMatrix = mat4.create(); // hand * proj * view * model matrices
  mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
  mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
  mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
  mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view
  mat4.copy( mMatrix, makeModelTransform( obj ) );
  mat4.multiply(pvmMatrix,pvMatrix,mMatrix);
  mMatrixArr.push( mMatrix );
  var mMatrixBackup = mat4.create();
  mat4.copy( mMatrixBackup, mMatrix );
  mMatrixArrOG.push( mMatrixBackup );
  pvmMatrixArr.push( pvmMatrix );
}

function recalculatePVMMatrixes() {
  pvmMatrixArr = [];
  var pMatrix = mat4.create();
  var vMatrix = mat4.create();
  var pvMatrix = mat4.create();
  mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
  mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
  mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
  mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view
  for( var i = 0; i < mMatrixArr.length; i++ ) {
    var pvmMatrix = mat4.create();
    mat4.multiply(pvmMatrix,pvMatrix,mMatrixArr[i]);
    pvmMatrixArr.push( pvmMatrix );
  }
}

// setup the webGL shaders
function setupShaders() {
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        attribute vec2 aTextureCoord;
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader
        varying highp vec2 vTextureCoord;

        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 

            vTextureCoord = aTextureCoord;
        }
    `;
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        uniform float uAlpha; //the alpha of the orbject
        
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment

        // texture
        varying highp vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform sampler2D uSampler2;
        uniform int uBlendMode;
            
        void main(void) {
        
            if( uBlendMode == 0 ) {
              gl_FragColor = texture2D(uSampler, vTextureCoord);
            } else {
             
              // ambient term
              vec3 ambient = uAmbient*uLightAmbient; 
              
              // diffuse term
              vec3 normal = normalize(vVertexNormal); 
              vec3 light = normalize(uLightPosition - vWorldPos);
              float lambert = max(0.0,dot(normal,light));
              vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
              
              // specular term
              vec3 eye = normalize(uEyePosition - vWorldPos);
              vec3 halfVec = normalize(light+eye);
              float highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
              vec3 specular = uSpecular*uLightSpecular*highlight; // specular term
              
              // combine to output color
              vec3 colorOut = ambient + diffuse + specular;
              vec4 texColor = texture2D( uSampler, vTextureCoord);
              vec4 texColor2 = texture2D( uSampler2, vTextureCoord );
              if( uBlendMode == 1 ) {
                //texture1 multiplied with color
                gl_FragColor = vec4( colorOut[0]*texColor[0], colorOut[1]*texColor[1], colorOut[2]*texColor[2], uAlpha*texColor[3] );
              } else if( uBlendMode == 2 ) {
                //texture1 multiplied with texture2
                gl_FragColor = vec4( texColor[0]*texColor2[0], texColor[1]*texColor2[1], texColor[2]*texColor2[2], texColor[3]*texColor2[3] );
              } else if( uBlendMode == 3 ) {
                //texture1 multiplied with texture2 multiplied with color
                gl_FragColor = vec4( colorOut[0]*texColor[0]*texColor2[0], colorOut[1]*texColor[1]*texColor2[1], colorOut[2]*texColor[2]*texColor2[2], uAlpha*texColor[3]*texColor2[3] );
              }

            }
        }
    `;
    
    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

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
                
                // locate and enable vertex attributes
                vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
                vNormAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(vNormAttribLoc); // connect attrib to array
                vTextureCoordAttribLoc = gl.getAttribLocation( shaderProgram, "aTextureCoord");
                gl.enableVertexAttribArray( vTextureCoordAttribLoc );
                
                
                // locate vertex uniforms
                mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
                pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat
                
                // locate fragment uniforms
                var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
                var lightAmbientULoc = gl.getUniformLocation(shaderProgram, "uLightAmbient"); // ptr to light ambient
                var lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                var lightSpecularULoc = gl.getUniformLocation(shaderProgram, "uLightSpecular"); // ptr to light specular
                var lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
                samplerULoc = gl.getUniformLocation(shaderProgram, "uSampler"); // ptr to sampler1 position
                sampler2ULoc = gl.getUniformLocation(shaderProgram, "uSampler2"); // ptr to sampler2 position
                ambientULoc = gl.getUniformLocation(shaderProgram, "uAmbient"); // ptr to ambient
                diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
                specularULoc = gl.getUniformLocation(shaderProgram, "uSpecular"); // ptr to specular
                shininessULoc = gl.getUniformLocation(shaderProgram, "uShininess"); // ptr to shininess
                blendULoc = gl.getUniformLocation( shaderProgram, "uBlendMode");
                alphaULoc = gl.getUniformLocation( shaderProgram, "uAlpha" );
                
                // pass global constants into fragment uniforms
                gl.uniform3fv(eyePositionULoc,Eye); // pass in the eye's position
                gl.uniform3fv(lightAmbientULoc,lightAmbient); // pass in the light's ambient emission
                gl.uniform3fv(lightDiffuseULoc,lightDiffuse); // pass in the light's diffuse emission
                gl.uniform3fv(lightSpecularULoc,lightSpecular); // pass in the light's specular emission
                gl.uniform3fv(lightPositionULoc,lightPosition); // pass in the light's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function renderModels() {
    
    // var hMatrix = mat4.create(); // handedness matrix
    var pMatrix = mat4.create(); // projection matrix
    var vMatrix = mat4.create(); // view matrix
    var mMatrix = mat4.create(); // model matrix
    var pvMatrix = mat4.create(); // hand * proj * view matrices
    var pvmMatrix = mat4.create(); // hand * proj * view * model matrices
    
    window.requestAnimationFrame(renderModels); // set up frame render callback
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    // set up projection and view
    // mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
    mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
    mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
    mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
    mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view

    // render each triangle set
    var currSet; // the tri set and its material properties
    for (var whichTriSet=0; whichTriSet<numTriangleSets; whichTriSet++) {
    //for (var whichTriSet=numTriangleSets-1; whichTriSet>=0; whichTriSet--) {
        currSet = inputTriangles[whichTriSet];
        
        // make model transform, add to view project
        mMatrix = makeModelTransform(currSet);
        mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix
        
        // reflectivity: feed to the fragment shader
        //THIS HERE IS WHERE THE COLOR IS for the triangles
        gl.uniform3fv(ambientULoc,currSet.material.ambient); // pass in the ambient reflectivity
        gl.uniform3fv(diffuseULoc,currSet.material.diffuse); // pass in the diffuse reflectivity
        gl.uniform3fv(specularULoc,currSet.material.specular); // pass in the specular reflectivity
        gl.uniform1f(shininessULoc,currSet.material.n); // pass in the specular exponent
        gl.uniform1i( blendULoc, blend);
        gl.uniform1f( alphaULoc, currSet.material.alpha );

        gl.uniform1i( samplerULoc, 0);
        gl.uniform1i( sampler2ULoc, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, currSet.texture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, currSet.texture2);

        gl.bindBuffer(gl.ARRAY_BUFFER,textureBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vTextureCoordAttribLoc,2,gl.FLOAT,false,0,0); // feed
        
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[whichTriSet]); // activate
        gl.drawElements(gl.TRIANGLES,3*triSetSizes[whichTriSet],gl.UNSIGNED_SHORT,0); // render
        
    } // end for each triangle set
    
    // render each ellipsoid
    var ellipsoid, instanceTransform = mat4.create(); // the current ellipsoid and material
    
    for (var whichEllipsoid=0; whichEllipsoid<numEllipsoids; whichEllipsoid++) {
        ellipsoid = inputEllipsoids[whichEllipsoid];
        
        // define model transform, premult with pvmMatrix, feed to vertex shader
        mMatrix = makeModelTransform(ellipsoid);
        pvmMatrix = mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // premultiply with pv matrix
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in model matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in project view model matrix

        // reflectivity: feed to the fragment shader
        //COLORS FOR ELLIPSOIDS
        gl.uniform3fv(ambientULoc,ellipsoid.ambient); // pass in the ambient reflectivity
        gl.uniform3fv(diffuseULoc,ellipsoid.diffuse); // pass in the diffuse reflectivity
        gl.uniform3fv(specularULoc,ellipsoid.specular); // pass in the specular reflectivity
        gl.uniform1f(shininessULoc,ellipsoid.n); // pass in the specular exponent
        gl.uniform1i( blendULoc, blend);
        gl.uniform1f( alphaULoc, ellipsoid.alpha );
        
        gl.uniform1i( samplerULoc, 0);
        gl.uniform1i( sampler2ULoc, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, ellipsoid.texture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, ellipsoid.texture2);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,textureBuffers[numTriangleSets+whichEllipsoid]); // activate
        gl.vertexAttribPointer(vTextureCoordAttribLoc,2,gl.FLOAT,false,0,0); // feed

        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[numTriangleSets+whichEllipsoid]); // activate vertex buffer
        gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed vertex buffer to shader
        gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[numTriangleSets+whichEllipsoid]); // activate normal buffer
        gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed normal buffer to shader
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[numTriangleSets+whichEllipsoid]); // activate tri buffer
        
        // draw a transformed instance of the ellipsoid
        gl.drawElements(gl.TRIANGLES,triSetSizes[numTriangleSets+whichEllipsoid],gl.UNSIGNED_SHORT,0); // render
    } // end for each ellipsoid
} // end render model

function renderModelsNew() {

  ultimateTriangleArray = [];
  traverseTree( tree );

  window.requestAnimationFrame(renderModelsNew); // set up frame render callback
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers

  gl.uniform1i( blendULoc, blend );
  gl.uniform1i( samplerULoc, 0);
  gl.uniform1i( sampler2ULoc, 1);

  var currentTri;
  var triArray = [0, 1, 2];
  for( var i = 0; i < ultimateTriangleArray.length; i++ ) {
    currentTri = ultimateTriangleArray[i];
    //uniform matrixes
    gl.uniformMatrix4fv(mMatrixULoc, false, mMatrixArr[currentTri.whichSet]); // pass in the m matrix
    gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrixArr[currentTri.whichSet]); // pass in the hpvm matrix
    //material properties
    gl.uniform3fv(ambientULoc, currentTri.amb); // pass in the ambient reflectivity
    gl.uniform3fv(diffuseULoc, currentTri.dif); // pass in the diffuse reflectivity
    gl.uniform3fv(specularULoc, currentTri.spec); // pass in the specular reflectivity
    gl.uniform1f(shininessULoc, currentTri.shine); // pass in the specular exponent
    gl.uniform1f( alphaULoc, currentTri.alpha );
    //textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, currentTri.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, currentTri.texture2);
    //texture buffer
    gl.bindBuffer( gl.ARRAY_BUFFER, currentTri.texBuffer );
    gl.vertexAttribPointer(vTextureCoordAttribLoc,2,gl.FLOAT,false,0,0); // feed
    //vertex buffer
    gl.bindBuffer( gl.ARRAY_BUFFER, currentTri.vertBuffer );
    gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed vertex buffer to shader
    //normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, currentTri.normBuffer ); // activate normal buffer
    gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed normal buffer to shader
    //triangle buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, currentTri.triBuffer ); // activate tri buffer
    gl.drawElements(gl.TRIANGLES,3,gl.UNSIGNED_SHORT,0); // render
  }
}

class TreeNode {
  constructor() {
    this.left = null;
    this.right = null;
    this.tri = null;
    this.unsorted = [];
    this.leftSide = [];
    this.rightSide = [];
  }
}
var tree = new TreeNode();

//builds the BSP tree
function buildTree( node ) {
  //put triangles in front of this one on left and in back of this one on right
  for( var i = 0; i < node.unsorted.length; i++ ) {
    if( node.tri != node.unsorted[i] ) {
      if( inFrontOf( node.tri, node.unsorted[i] ) ) {
        node.leftSide.push( node.unsorted[i] );
      } else {
        node.rightSide.push( node.unsorted[i] );
      }
    }
  }
  if( node.leftSide.length > 0 ) {
    node.left = new TreeNode();
    node.left.tri = node.leftSide[0];
    node.left.unsorted = node.leftSide;
    buildTree( node.left );
  }
  if( node.rightSide.length > 0 ) {
    node.right = new TreeNode();
    node.right.tri = node.rightSide[0];
    node.right.unsorted = node.rightSide;
    buildTree( node.right );
  }
}

var debob = true;
//true if t2 is in front of t1
function inFrontOf( t1, t2 ) {
  var temp = vec4.create();
  var normVec = vec3.fromValues( t1.vNormals[0], t1.vNormals[1], t1.vNormals[2] );
  vec4.transformMat4( temp, vec4.fromValues( normVec[0], normVec[1], normVec[2], 1.0 ), mMatrixArr[ t1.whichSet ] );
  normVec = vec3.fromValues( temp[0], temp[1], temp[2] );

  var A = vec3.fromValues( t1.centroid[0], t1.centroid[1], t1.centroid[2] );
  vec4.transformMat4( temp, vec4.fromValues( A[0], A[1], A[2], 1.0 ), mMatrixArr[ t1.whichSet ] );
  A = vec3.fromValues( temp[0], temp[1], temp[2] );

  var B = vec3.fromValues( t2.centroid[0], t2.centroid[1], t2.centroid[2] );
  vec4.transformMat4( temp, vec4.fromValues( B[0], B[1], B[2], 1.0 ), mMatrixArr[ t2.whichSet ] );
  B = vec3.fromValues( temp[0], temp[1], temp[2] );

  var AB = vec3.fromValues( B[0]-A[0], B[1]-A[1], B[2]-A[2] );
  var dot = vec3.dot( AB, normVec );
  debob = false;
  return ( dot > 0 );
}

function remove( obj, arr ) {
  var index = arr.indexOf( obj );
  if( index > -1 ) {
    arr.splice( index, 1 );
  }
}

function traverseTree( node ) {
  if( node == null )
    return;
  
  var t1 = node.tri;
  //compare eye to node
  var temp = vec4.create();
  var normVec = vec3.fromValues( t1.vNormals[0], t1.vNormals[1], t1.vNormals[2] );
  vec4.transformMat4( temp, vec4.fromValues( normVec[0], normVec[1], normVec[2], 1.0 ), mMatrixArr[ t1.whichSet ] );
  normVec = vec3.fromValues( temp[0], temp[1], temp[2] );

  var A = vec3.fromValues( t1.centroid[0], t1.centroid[1], t1.centroid[2] );
  vec4.transformMat4( temp, vec4.fromValues( A[0], A[1], A[2], 1.0 ), mMatrixArr[ t1.whichSet ] );
  A = vec3.fromValues( temp[0], temp[1], temp[2] );

  var B = Eye;
  var AB = vec3.fromValues( B[0]-A[0], B[1]-A[1], B[2]-A[2] );
  var dot = vec3.dot( AB, normVec );

  //recurse on side further from eye
  if( dot > 0 ) {
    //eye is in front of triangle
    //recurse on right array
    traverseTree( node.right );
  } else {
    //eye is behind triangle
    //recurse on left array
    traverseTree( node.left );
  } 

  //output root
  ultimateTriangleArray.push( node.tri );

  //recurse on closer side - opposite of last time
  if( dot > 0 ) {
    traverseTree( node.left );
  } else {
    traverseTree( node.right );
  } 
}

function distance( x1, y1, z1, x2, y2, z2 ) {
  return Math.sqrt( Math.pow( x1 - x2, 2) + Math.pow( y1 - y2, 2 ) + Math.pow( z1 - z2, 2) );
}

function makeTree () {
  tree = new TreeNode();
  tree.tri = ultimateTriangleArray[0];
  tree.unsorted = ultimateTriangleArray;
  buildTree( tree );
}

/* MAIN -- HERE is where execution begins after window load */

function main() {
  
  setupWebGL(); // set up the webGL environment
  loadModels(); // load in the models from tri file
  setupShaders(); // setup the webGL shaders
  makeTree();
  //renderModels(); // draw the triangles using webGL
  renderModelsNew();
} // end main

// construct the model transform matrix, based on model state
function makeModelTransform(currModel) {
  modelsArray.push( currModel );
  var pMatrix = mat4.create(); // projection matrix
  var vMatrix = mat4.create(); // view matrix
  var mMatrix = mat4.create(); // model matrix
  var pvMatrix = mat4.create(); // hand * proj * view matrices
  var pvmMatrix = mat4.create(); // hand * proj * view * model matrices

  mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
  mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
  mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
  mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view
  
  var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCtr = vec3.create();

  // move the model to the origin
  mat4.fromTranslation(mMatrix,vec3.negate(negCtr,currModel.center)); 
      
  // scale for highlighting if needed
  if (currModel.on)
    mat4.multiply(mMatrix,mat4.fromScaling(temp,vec3.fromValues(1.2,1.2,1.2)),mMatrix); // S(1.2) * T(-ctr)
      
  // rotate the model to current interactive orientation
  vec3.normalize(zAxis,vec3.cross(zAxis,currModel.xAxis,currModel.yAxis)); // get the new model z axis
  mat4.set(sumRotation, // get the composite rotation
    currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
    currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
    currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
    0, 0,  0, 1);
  mat4.multiply(mMatrix,sumRotation,mMatrix); // R(ax) * S(1.2) * T(-ctr)
      
  // translate back to model center
  mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.center),mMatrix); // T(ctr) * R(ax) * S(1.2) * T(-ctr)

  // translate model to current interactive orientation
  mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.translation),mMatrix); // T(pos)*T(ctr)*R(ax)*S(1.2)*T(-ctr)

  return mMatrix;
      
} // end make model transform

function scaleModel( index, scale ) {
  var mMatrix = mMatrixArr[index];
  var currModel = modelsArray[index];
  var temp = mat4.create();
  var scaleMatrix = mat4.fromScaling(temp, vec3.fromValues( scale, scale, scale ) );

  //translate to origin
  var negCtr = vec3.create();
  mat4.fromTranslation(mMatrix,vec3.negate(negCtr,currModel.center));
  //scale
  mat4.multiply(mMatrix,scaleMatrix,mMatrix);
  //translate away from origin
  mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.center),mMatrix);
  recalculatePVMMatrixes();
  makeTree();
}

//https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([255, 0, 255, 255]);  // opaque purple
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.crossOrigin = "";
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}