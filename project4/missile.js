//sound effects from http://codewelt.com/proj/speak

var illuminatiSource = "https://i.imgur.com/qjMCQnC.png";
var desertSource = "https://i.imgur.com/WvdETB4.jpg";
var backgroundSource = "https://i.imgur.com/XVrl8Oq.jpg";
var explosionSource = "https://i.imgur.com/ziMAVdr.png";
var voltorbSource = "https://i.imgur.com/feM6uui.png";
var missileSound = "missile.mp3";
var explosionSound = "explosion.mp3";
var gameOverSound = "gameOver.mp3";
var gameStartSound = "gameStart.mp3";
var gameOverCountdown = 0;

var canvasSize = 768;
var enemyTimerStart = 200;
var enemyTimer = 10;

/* webgl and geometry data */
var gl = null; // the all powerful gl object. It's all here folks!
var imageCanvas, imageContext;

/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var samplerULoc; //texture sampler thingy

/* interaction variables */
var defaultEye = vec3.fromValues(0.0,0.0,-5.0); // default eye position in world space
var defaultCenter = vec3.fromValues(0.0,0.0,1.0); // default view direction in world space
var defaultUp = vec3.fromValues(0,1,0); // default view up vector
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space

var renderList = []; //just dump everything that needs rendering in here
var missileBatteries = []; //one for each of the three batteries; each will have 10 missiles initially
var temples = []; //keeps track of all 6 illuminati temples in case one gets blowed up
var enemies = []; //keeps track of all enemies for collision stuff
var gameOver = false; //true if game is over and can be restarted
var score = 0; //the current score (1 point per voltorb)
var font = "42px Papyrus"; //font to write things in

//for writing score
var textCanvas, textCanvasContext;
var pointsPerVoltorb = 1; //one point per voltorb

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
  
  // Set up mouse
  //document.onmousedown = handleMouseDown; // call this when key pressed
    textCanvas = document.getElementById( "myTextCanvas" );
    textCanvasContext = textCanvas.getContext('2d');
    textCanvasContext.font = font;

    // Get the image canvas, render an image in it
    imageCanvas = document.getElementById("myImageCanvas"); // create a 2d canvas
    var cw = imageCanvas.width, ch = imageCanvas.height; 
    imageContext = imageCanvas.getContext("2d"); 
    var bkgdImage = new Image(); 
    bkgdImage.crossOrigin = "Anonymous";
    bkgdImage.src = backgroundSource;
    bkgdImage.onload = function(){
        var iw = bkgdImage.width, ih = bkgdImage.height;
        imageContext.drawImage(bkgdImage,0,0,iw,ih,0,0,cw,ch);   
   } // end onload callback
  
   // create a webgl canvas and set it up
   var webGLCanvas = document.getElementById("myWebGLCanvas"); // create a webgl canvas
   webGLCanvas.onmousedown = handleMouseDown;
   gl = webGLCanvas.getContext("webgl"); // get a webgl object from it
   try {
     if (gl == null) {
       throw "unable to create gl context -- is your browser gl ready?";
     } else {
       //gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
       gl.clearDepth(1.0); // use max when we clear the depth buffer
       gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
     }
   } // end try
   
   catch(e) {
     console.log(e);
   } // end catch
} // end setupWebGL

//handle mouse down
function handleMouseDown( e ) {
  //if mouse is clicked in bounds
  if( e.clientX >= 0 && e.clientX <= canvasSize && e.clientY >= 0 && e.clientY <= canvasSize ) {
    //if the game is over or not
    if( gameOver ) {
      //game is over
      //start a new game on click
      
      //play gameStart sound
      var temp = new Audio( gameStartSound );
      temp.play();

      //reset variables
      score = 0;
      enemyTimer = enemyTimerStart;
      gameOver = false;

      //remove old batteries
      for( var i = missileBatteries.length-1; i >= 0; i-- ) {
        missileBatteries[i].destroy();
        remove( missileBatteries[i], missileBatteries );
      }

      //place 6 temples
      temples.push( new Pyramid( gl, illuminatiSource, 0.5, vec3.fromValues( -3.3, -2.5, 0 ) ) );
      temples.push( new Pyramid( gl, illuminatiSource, 0.5, vec3.fromValues( -2.2, -2.5, 0 ) ) );
      temples.push( new Pyramid( gl, illuminatiSource, 0.5, vec3.fromValues( -1.1, -2.5, 0 ) ) );
      temples.push( new Pyramid( gl, illuminatiSource, 0.5, vec3.fromValues( 1.1, -2.5, 0 ) ) );
      temples.push( new Pyramid( gl, illuminatiSource, 0.5, vec3.fromValues( 2.2, -2.5, 0 ) ) );
      temples.push( new Pyramid( gl, illuminatiSource, 0.5, vec3.fromValues( 3.3, -2.5, 0 ) ) );
      for( var i = 0; i < temples.length; i++ ) {
        renderList.push( temples[i] );
      }

      //place 3 batteries with 10 missilluminatis each
      missileBatteries.push( new Battery( gl, illuminatiSource, vec3.fromValues( -4, -2.5, .3 ) ) );
      missileBatteries.push( new Battery( gl, illuminatiSource, vec3.fromValues( 0, -2.5, 0 ) ) );
      missileBatteries.push( new Battery( gl, illuminatiSource, vec3.fromValues( 4, -2.5, .3 ) ) );
      
    } else {
      //game not over
      var targetPoint = vec3.fromValues( adjustPoint( e.clientX ), adjustPoint( e.clientY ), 0 );
      //choose which battery should shoot
      var dist1 = distance( targetPoint, missileBatteries[0].centerPos );
      var dist2 = distance( targetPoint, missileBatteries[1].centerPos );
      var dist3 = distance( targetPoint, missileBatteries[2].centerPos );
      if( dist1 < dist2 && dist1 < dist3 ) {
        //choose battery 0
        missileFire( missileBatteries[0], targetPoint );
      } else if ( dist2 < dist3 ) {
        //choose battery 1
        missileFire( missileBatteries[1], targetPoint );
      } else {
        //choose battery 2
        missileFire( missileBatteries[2], targetPoint );
      }
    }
  }
}

function adjustPoint( p ) {
  //adjust point to be in world coords rather than canvas coords
  //or you know like close enough at least
  p = p - ( canvasSize/2 );
  p = p / ( canvasSize/2 );
  p = p * -1;
  p = p * 5;
  return p;
}

function distance( v1, v2 ) {
  //calculates distance between two points but throws out the z coordinate because this game is 2d
  return Math.sqrt( Math.pow( v1[0]-v2[0], 2 ) + Math.pow( v1[1]-v2[1], 2 ) );
}

function missileFire( bat, target ) {
  //fires a missile from the selected battery at the target
  //if the battery is empty, tries the other batteries
  //if all are empty, does nothing
  if( bat.missiles.length > 0 ) {
    //shoot this one
    setTarget( bat, target );
  } else {
    //try the others
    if( missileBatteries[0].missiles.length > 0 ) {
      //shoot this one
      setTarget( missileBatteries[0], target );
    } else if( missileBatteries[1].missiles.length > 0 ) {
      //shoot this one
      setTarget( missileBatteries[1], target );
    } else if( missileBatteries[2].missiles.length > 0 ) {
      //shoot this one
      setTarget( missileBatteries[2], target );
    }
    //if none of those had any, we're out of missiles - do nothing
  }
}

function setTarget( bat, target ) {
  //sets the target of a missile and starts it moving and removes it from the battery
  var missile = bat.missiles[ bat.missiles.length - 1 ];
  missile.setTarget( target );
  remove( missile, bat.missiles );
  //sound effect
  var temp = new Audio( missileSound );
  temp.play();
}

//removes an object from an array if the object is in the array
//THIS FUNCTION IS COPY/PASTED DIRECTLY FROM OUR GAME ENGINE CODE
function remove( obj, arr ) {
  var index = arr.indexOf( obj );
  if( index > -1 ) {
    arr.splice( index, 1 );
  }
}

// setup the webGL shaders
function setupShaders() {
  
  // define vertex shader in essl using es6 template strings
  var vShaderCode = `
      attribute vec3 aVertexPosition; // vertex position
      attribute vec2 aTextureCoord;
      
      uniform mat4 umMatrix; // the model matrix
      uniform mat4 upvmMatrix; // the project view model matrix
      
      varying vec3 vWorldPos; // interpolated world position of vertex
      varying highp vec2 vTextureCoord;

      void main(void) {
          
          // vertex position
          vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
          vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
          gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

          vTextureCoord = aTextureCoord;
      }
  `;
  
  // define fragment shader in essl using es6 template strings
  var fShaderCode = `
      precision mediump float; // set float to medium precision

      // eye location
      uniform vec3 uEyePosition; // the eye's position in world
      
      // geometry properties
      varying vec3 vWorldPos; // world xyz of fragment

      // texture
      varying highp vec2 vTextureCoord;
      uniform sampler2D uSampler;
          
      void main(void) {
          gl_FragColor = texture2D(uSampler, vTextureCoord);
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
              vTextureCoordAttribLoc = gl.getAttribLocation( shaderProgram, "aTextureCoord");
              gl.enableVertexAttribArray( vTextureCoordAttribLoc );
              
              
              // locate vertex uniforms
              mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
              pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat
              
              // locate fragment uniforms
              var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
              samplerULoc = gl.getUniformLocation(shaderProgram, "uSampler"); // ptr to sampler1 position
              
              // pass global constants into fragment uniforms
              gl.uniform3fv(eyePositionULoc,Eye); // pass in the eye's position

          } // end if no shader program link errors
      } // end if no compile errors
  } // end try 
  
  catch(e) {
      console.log(e);
  } // end catch
} // end setup shaders

//load things
function loadModels() {
  //play gameStart sound
  var temp = new Audio( gameStartSound );
  temp.play();

  //floor
  renderList.push( new Pyramid( gl, desertSource, -10.0, vec3.fromValues( 0.0, -13.0, 16.0 ) ) );

  //place 6 temples
  temples.push( new Pyramid( gl, illuminatiSource, 0.5, vec3.fromValues( -3.3, -2.5, 0 ) ) );
  temples.push( new Pyramid( gl, illuminatiSource, 0.5, vec3.fromValues( -2.2, -2.5, 0 ) ) );
  temples.push( new Pyramid( gl, illuminatiSource, 0.5, vec3.fromValues( -1.1, -2.5, 0 ) ) );
  temples.push( new Pyramid( gl, illuminatiSource, 0.5, vec3.fromValues( 1.1, -2.5, 0 ) ) );
  temples.push( new Pyramid( gl, illuminatiSource, 0.5, vec3.fromValues( 2.2, -2.5, 0 ) ) );
  temples.push( new Pyramid( gl, illuminatiSource, 0.5, vec3.fromValues( 3.3, -2.5, 0 ) ) );
  for( var i = 0; i < temples.length; i++ ) {
    renderList.push( temples[i] );
  }

  //place 3 batteries with 10 missilluminatis each
  missileBatteries.push( new Battery( gl, illuminatiSource, vec3.fromValues( -4, -2.5, .3 ) ) );
  missileBatteries.push( new Battery( gl, illuminatiSource, vec3.fromValues( 0, -2.5, 0 ) ) );
  missileBatteries.push( new Battery( gl, illuminatiSource, vec3.fromValues( 4, -2.5, .3 ) ) );

}

//makes a new enemy and plops it somewhere
function newEnemy( count = 1 ) {
  if( temples.length > 0 ) {
    for( var i = 0; i < count; i++ ) {
      //will it split
      var split = false;
      if( Math.random() < .1 ) {
        split = true;
      }
      //k make the enemy
      enemies.push( new Sphere( gl, voltorbSource, .3, vec3.fromValues( (Math.random()-.5)*7.0, (Math.random()*2)+6.0, 0.0 ), Math.floor( Math.random()*( temples.length + missileBatteries.length ) ), split ) );
      renderList.push( enemies[enemies.length-1] );
    }
    //maybe put a reload ball?
    if( Math.random() < .2 ) {
      if( Math.random() < .5 ) {
        enemies.push( new ReloadBall( gl, illuminatiSource, .4, vec3.fromValues( 6, (Math.random()*2)+3, 0 ) ) );
      } else {
        enemies.push( new ReloadBall( gl, illuminatiSource, .4, vec3.fromValues( -6, (Math.random()*2)+3, 0 ) ) );
      }
      renderList.push( enemies[enemies.length-1] );
    }
  } /*else {
    if( enemies.length == 0 ) {
      gameOver = true;
      //sound effect
      var temp = new Audio( gameOverSound );
      temp.play();
    }
  }*/
  enemyTimer = enemyTimerStart;
}

// render the loaded model
function renderModels() {
  
  // var hMatrix = mat4.create(); // handedness matrix
  var pMatrix = mat4.create(); // projection matrix
  var vMatrix = mat4.create(); // view matrix
  var mMatrix = mat4.create(); // model matrix
  var pvMatrix = mat4.create(); // hand * proj * view matrices
  var pvmMatrix = mat4.create(); // hand * proj * view * model matrices
  
  window.requestAnimationFrame(renderModels); // set up frame render callback
  
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
  
  // set up projection and view
  // mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
  mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
  mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
  mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
  mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view

  // render each thing in the array
  var currentObj; // the thing what is being rendered
  for (var i=0; i<renderList.length; i++) {
      currentObj = renderList[i];
        
      // make model transform, add to view project
      mMatrix = currentObj.mMatrix;
      mat4.multiply( pvmMatrix,pvMatrix,mMatrix ); // project * view * model
      gl.uniformMatrix4fv( mMatrixULoc, false, mMatrix ); // pass in the m matrix
      gl.uniformMatrix4fv( pvmMatrixULoc, false, pvmMatrix ); // pass in the hpvm matrix
      
      //texture file
      gl.uniform1i( samplerULoc, 0 );
      gl.activeTexture( gl.TEXTURE0 );
      gl.bindTexture( gl.TEXTURE_2D, currentObj.texture );

      //texture coords
      gl.bindBuffer( gl.ARRAY_BUFFER, currentObj.textureBuffer ); // activate
      gl.vertexAttribPointer( vTextureCoordAttribLoc, 2, gl.FLOAT, false, 0,0 ); // feed
      
      // vertex buffer: activate and feed into vertex shader
      gl.bindBuffer( gl.ARRAY_BUFFER, currentObj.vertexBuffer ); // activate
      gl.vertexAttribPointer(vPosAttribLoc, 3, gl.FLOAT, false, 0, 0 ); // feed

      // triangle buffer: activate and render
      gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, currentObj.triangleBuffer ); // activate
      gl.drawElements( gl.TRIANGLES, currentObj.triangles.length, gl.UNSIGNED_SHORT, 0); // render

      currentObj.updatePosition();
  } // end for each object

  //update enemy timer thing
  enemyTimer--;
  if( enemyTimer == 0 ) {
    newEnemy( 3 );
  }

  //does the game over
  if( gameOver == false && enemies.length == 0 && temples.length == 0 && missileBatteries[0].missiles.length == 0 && missileBatteries[1].missiles.length == 0 && missileBatteries[2].missiles.length == 0 ) {
    gameOver = true;
    gameOverCountdown = 100;
  }
  gameOverCountdown--;

  if( gameOver == true && gameOverCountdown == 0 ) {
    //sound effect
    var temp = new Audio( gameOverSound );
    temp.play();
  }

  textCanvasContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
  textCanvasContext.fillText( "Score: " + score, 50, 100 );
  if( gameOver == true ) {
    textCanvasContext.fillText( "Game over!  Click to play again!", 50, 200 );
  }
  
}

//do things
function main() {
  
  setupWebGL(); // set up the webGL environment
  setupShaders(); // setup the webGL shaders
  loadModels(); // load in the models - pyramids, missiles, teapots
  renderModels(); // draw the triangles using webGL
  
} // end main