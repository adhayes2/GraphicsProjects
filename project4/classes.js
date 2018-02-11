//the illuminati pyramids and also the up-going missiles
class Pyramid {
  //gl is the gl thing, tex is the texture url, scale is how big, pos is the position of the center of the thing as a vec3
  constructor( gl, tex, scale, pos ) {

    //just make a square
    this.vertexCoords = [];
    this.vertexCoords.push( -1.0, -1.0, 0.0 ); //down left
    this.vertexCoords.push( -1.0, -1.0, 2.0 ); //up left
    this.vertexCoords.push( 1.0, -1.0, 2.0 ); //up right
    this.vertexCoords.push( 1.0, -1.0, 0.0 ); //down right
    this.vertexCoords.push( 0.0, 1.0, 1.0 ); //top
    //above is for the pyramid, below is for the bottom square
    this.vertexCoords.push( -1.0, -1.0, 0.0 ); //down left
    this.vertexCoords.push( -1.0, -1.0, 2.0 ); //up left
    this.vertexCoords.push( 1.0, -1.0, 2.0 ); //up right
    this.vertexCoords.push( 1.0, -1.0, 0.0 ); //down right
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer ); // activate that buffer
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.vertexCoords ), gl.STATIC_DRAW ); // data in

    //correspond points of square to the texture
    this.uvCoords = [];
    this.uvCoords.push( 0.0, 0.0 ); //down left
    this.uvCoords.push( 1.0, 0.0 ); //up left
    this.uvCoords.push( 0.0, 0.0 ); //up right
    this.uvCoords.push( 1.0, 0.0 ); //down right
    this.uvCoords.push( 0.5, 1.0 ); //top
    //thats the pyramid part, below is the bottom plane thing
    this.uvCoords.push( 0.0, 0.0 ); //down left
    this.uvCoords.push( 0.0, 1.0 ); //up left
    this.uvCoords.push( 1.0, 1.0 ); //up right
    this.uvCoords.push( 1.0, 0.0 ); //down right
    this.textureBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.textureBuffer ); // activate that buffer
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.uvCoords ), gl.STATIC_DRAW ); // data in
    
    //two triangles to make the square
    this.triangles = [];
    this.triangles.push( 0, 1, 4 ); //side 1
    this.triangles.push( 1, 2, 4 ); //side 2
    this.triangles.push( 2, 3, 4 ); //side 3
    this.triangles.push( 3, 0, 4 ); //side 4
    this.triangles.push( 5, 6, 7 ); //up triangle on bottom plate
    this.triangles.push( 5, 7, 8 ); //down triangle on bottom plate
    this.triangleBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer ); // activate that buffer
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.triangles ), gl.STATIC_DRAW ); // data in

    //set other stuff
    this.texture = loadTexture( gl, tex );
    this.mMatrix = mat4.create();
    this.centerPos = vec3.fromValues( pos[0], pos[1], pos[2] );

    //scale
    var temp = mat4.create();
    var scaleMatrix = mat4.fromScaling( temp, vec3.fromValues( scale, scale, scale ) );
    mat4.multiply( this.mMatrix, scaleMatrix, this.mMatrix );

    //translate
    temp = mat4.create();
    mat4.fromTranslation( temp, this.centerPos );
    mat4.multiply( this.mMatrix, temp, this.mMatrix);

    //for missiles
    this.target = null;
  }

  setTarget( targ ) {
    this.target = targ;
    //create the vector to move along toward the target point
    var off = vec3.create();
    vec3.subtract( off, this.target, this.centerPos );
    //how much to move every frame to reach the target?
    var move = vec3.create();
    vec3.normalize( move, off );
    //move length is currently 1
    vec3.divide( move, move, vec3.fromValues( 10, 10, 10 ) );
    this.translateVector = vec3.fromValues( move[0], move[1], move[2] );
  }

  //updates the position of the pyramid (for missiles)
  updatePosition() {
    if( this.target != null ) {
      //only do this if there is a target
      var temp = mat4.create();
      mat4.fromTranslation( temp, this.translateVector );
      mat4.multiply( this.mMatrix, temp, this.mMatrix );
      vec3.add( this.centerPos, this.translateVector, this.centerPos );
      if( this.centerPos[1] >= this.target[1] ) {
        //if we are higher than the target, explod the missile
        remove( this, renderList );
        renderList.push( new Explosion( gl, explosionSource, this.centerPos ) );
      } else {
        //if we hit a voltorb, explod
        for( var i = 0; i < enemies.length; i++ ) {
          //lets be a bit more restrictive on a hit
          if( distance( this.centerPos, enemies[i].centerPos ) < .5 ) {
            remove( this, renderList );
            renderList.push( new Explosion( gl, explosionSource, this.centerPos ) );
          }
        }
      }
    }
  }
}

class Explosion {
  //gl is the gl thing, tex is the texture url, scale is how big, pos is the position of the center of the thing as a vec3
  constructor( gl, tex, pos ) {

    //make a ball
    this.vertexCoords = [];
    this.uvCoords = [];
    this.triangles = [];
    var numLongSteps = 32;

    this.vertexCoords.push( 0, -1, 0 ); // vertices to return, init to south pole
    this.uvCoords.push( 0.5, 1.0 ); // add south pole uv
    var angleIncr = (Math.PI+Math.PI) / numLongSteps; // angular increment 
    var latLimitAngle = angleIncr * (Math.floor(numLongSteps/4)-1); // start/end lat angle
    var latRadius, latY; // radius and Y at current latitude
    for (var latAngle=-latLimitAngle; latAngle<=latLimitAngle; latAngle+=angleIncr) {
        latRadius = Math.cos(latAngle); // radius of current latitude
        latY = Math.sin(latAngle); // height at current latitude
        for (var longAngle=0; longAngle<2*Math.PI+angleIncr; longAngle+=angleIncr) {// for each long
          this.vertexCoords.push(latRadius*Math.sin(longAngle), latY, latRadius*Math.cos(longAngle));
          this.uvCoords.push( longAngle/(Math.PI * 2), (1-(latAngle+latLimitAngle)/(Math.PI))-.0625 );
        }
    } // end for each latitude
    this.vertexCoords.push(0,1,0); // add north pole
    this.uvCoords.push( 0.5, 0.0 ); //add north pole uv

    for (var whichLong=1; whichLong<numLongSteps; whichLong++) { // south pole
      this.triangles.push(0,whichLong,whichLong+1);
    }
    this.triangles.push(0,numLongSteps,1); // longitude wrap tri
    var llVertex; // lower left vertex in the current quad
    for (var whichLat=0; whichLat<(numLongSteps/2 - 2); whichLat++) { // middle lats
        for (var whichLong=0; whichLong<numLongSteps-1; whichLong++) {
            llVertex = whichLat*numLongSteps + whichLong + 1;
            this.triangles.push(llVertex,llVertex+numLongSteps,llVertex+numLongSteps+1);
            this.triangles.push(llVertex,llVertex+numLongSteps+1,llVertex+1);
        } // end for each longitude
        this.triangles.push(llVertex+1,llVertex+numLongSteps+1,llVertex+2);
        this.triangles.push(llVertex+1,llVertex+2,llVertex-numLongSteps+2);
    } // end for each latitude
    for (var whichLong=llVertex+2; whichLong<llVertex+numLongSteps+1; whichLong++) {// north pole
      this.triangles.push(whichLong,this.vertexCoords.length/3-1,whichLong+1);
    }
    this.triangles.push(this.vertexCoords.length/3-numLongSteps/2-1, this.vertexCoords.length/3-1,
      this.vertexCoords.length/3-numLongSteps-numLongSteps/2); // seal up that weird triangle hole

    //make all the buffers
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer ); // activate that buffer
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.vertexCoords ), gl.STATIC_DRAW ); // data in
    this.textureBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.textureBuffer ); // activate that buffer
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.uvCoords ), gl.STATIC_DRAW ); // data in
    this.triangleBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer ); // activate that buffer
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.triangles ), gl.STATIC_DRAW ); // data in

    //set other stuff
    this.texture = loadTexture( gl, tex );
    this.mMatrix = mat4.create();
    this.centerPos = vec3.fromValues( pos[0], pos[1], pos[2] );

    //scale
    this.scale = .1;
    var temp = mat4.create();
    var scaleMatrix = mat4.fromScaling( temp, vec3.fromValues( this.scale, this.scale, this.scale ) );
    mat4.multiply( this.mMatrix, scaleMatrix, this.mMatrix );

    //translate
    temp = mat4.create();
    mat4.fromTranslation( temp, this.centerPos );
    mat4.multiply( this.mMatrix, temp, this.mMatrix);
    
    //ok so if this explosion hit any voltorbs it should get rid of the voltorbs
    for( var i = 0; i < enemies.length; i++ ) {
      if( distance( this.centerPos, enemies[i].centerPos ) < 1.0 ) {
        enemies[i].destroy();
        i--;
        score += pointsPerVoltorb;
      }
    }

    //play sound effect
    var temp = new Audio( explosionSound );
    temp.play();
  }

  //makes the explosion get bigger over time
  updatePosition() {
    this.scale += .1;
    //update model matrix:
    this.mMatrix = mat4.create();
    var temp = mat4.create();
    var scaleMatrix = mat4.fromScaling( temp, vec3.fromValues( this.scale, this.scale, this.scale ) );
    mat4.multiply( this.mMatrix, scaleMatrix, this.mMatrix );

    //translate
    temp = mat4.create();
    mat4.fromTranslation( temp, this.centerPos );
    mat4.multiply( this.mMatrix, temp, this.mMatrix);

    //is the explosion big enough yet
    if( this.scale > 1.5 ) {
      //if we are big enough
      remove( this, renderList );
    }
  }
}

//the down-going missiles
class Sphere {
  constructor( gl, tex, scale, pos, target, split ) {
    //make a ball
    this.vertexCoords = [];
    this.uvCoords = [];
    this.triangles = [];
    var numLongSteps = 32;

    this.vertexCoords.push( 0, -1, 0 ); // vertices to return, init to south pole
    this.uvCoords.push( 0.5, 1.0 ); // add south pole uv
    var angleIncr = (Math.PI+Math.PI) / numLongSteps; // angular increment 
    var latLimitAngle = angleIncr * (Math.floor(numLongSteps/4)-1); // start/end lat angle
    var latRadius, latY; // radius and Y at current latitude
    for (var latAngle=-latLimitAngle; latAngle<=latLimitAngle; latAngle+=angleIncr) {
        latRadius = Math.cos(latAngle); // radius of current latitude
        latY = Math.sin(latAngle); // height at current latitude
        for (var longAngle=0; longAngle<2*Math.PI+angleIncr; longAngle+=angleIncr) {// for each long
          this.vertexCoords.push(latRadius*Math.sin(longAngle), latY, latRadius*Math.cos(longAngle));
          this.uvCoords.push( longAngle/(Math.PI * 2), (1-(latAngle+latLimitAngle)/(Math.PI))-.0625 );
        }
    } // end for each latitude
    this.vertexCoords.push(0,1,0); // add north pole
    this.uvCoords.push( 0.5, 0.0 ); //add north pole uv

    for (var whichLong=1; whichLong<numLongSteps; whichLong++) { // south pole
      this.triangles.push(0,whichLong,whichLong+1);
    }
    this.triangles.push(0,numLongSteps,1); // longitude wrap tri
    var llVertex; // lower left vertex in the current quad
    for (var whichLat=0; whichLat<(numLongSteps/2 - 2); whichLat++) { // middle lats
        for (var whichLong=0; whichLong<numLongSteps-1; whichLong++) {
            llVertex = whichLat*numLongSteps + whichLong + 1;
            this.triangles.push(llVertex,llVertex+numLongSteps,llVertex+numLongSteps+1);
            this.triangles.push(llVertex,llVertex+numLongSteps+1,llVertex+1);
        } // end for each longitude
        this.triangles.push(llVertex+1,llVertex+numLongSteps+1,llVertex+2);
        this.triangles.push(llVertex+1,llVertex+2,llVertex-numLongSteps+2);
    } // end for each latitude
    for (var whichLong=llVertex+2; whichLong<llVertex+numLongSteps+1; whichLong++) {// north pole
      this.triangles.push(whichLong,this.vertexCoords.length/3-1,whichLong+1);
    }
    this.triangles.push(this.vertexCoords.length/3-numLongSteps/2-1, this.vertexCoords.length/3-1,
      this.vertexCoords.length/3-numLongSteps-numLongSteps/2); // seal up that weird triangle hole

    //make all the buffers
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer ); // activate that buffer
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.vertexCoords ), gl.STATIC_DRAW ); // data in
    this.textureBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.textureBuffer ); // activate that buffer
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.uvCoords ), gl.STATIC_DRAW ); // data in
    this.triangleBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer ); // activate that buffer
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.triangles ), gl.STATIC_DRAW ); // data in

    //set other stuff
    this.texture = loadTexture( gl, tex );
    this.mMatrix = mat4.create();
    this.centerPos = vec3.fromValues( pos[0], pos[1], pos[2] );
    this.split = split;

    //scale
    var temp = mat4.create();
    var scaleMatrix = mat4.fromScaling( temp, vec3.fromValues( scale, scale, scale ) );
    mat4.multiply( this.mMatrix, scaleMatrix, this.mMatrix );

    //translate
    temp = mat4.create();
    mat4.fromTranslation( temp, this.centerPos );
    mat4.multiply( this.mMatrix, temp, this.mMatrix);

    //target should be one of the six bases or one of the three batteries.  i guess i can pass that in
    if( target < temples.length ) {
      //target a temple
      this.target = temples[target].centerPos;
    } else {
      //target a base
      this.target = missileBatteries[ target-temples.length ].centerPos;
    }
    //create the vector to move along toward the target point
    var off = vec3.create();
    vec3.subtract( off, this.target, this.centerPos );
    //how much to move every frame to reach the target?
    var move = vec3.create();
    vec3.normalize( move, off );
    //move length is currently 1
    vec3.divide( move, move, vec3.fromValues( 50, 50, 50 ) );
    this.translateVector = vec3.fromValues( move[0], move[1], move[2] );
  }

  updatePosition() {
    //only do this if there is a target
    var temp = mat4.create();
    mat4.fromTranslation( temp, this.translateVector );
    mat4.multiply( this.mMatrix, temp, this.mMatrix );
    vec3.add( this.centerPos, this.translateVector, this.centerPos );

    //split
    if( this.split == true && this.centerPos[1] < 3.5 ) {
      //split
      this.split = false;
      var targ = Math.floor( Math.random()*( temples.length + missileBatteries.length ) );
      while( getTarget( targ ) == this.target ) {
        //don't want the split missile to target the same thing, that'd be a waste of time
        targ = Math.floor( Math.random()*( temples.length + missileBatteries.length ) );
      }
      enemies.push( new Sphere( gl, voltorbSource, .2, vec3.fromValues( this.centerPos[0], this.centerPos[1], this.centerPos[2] ), targ, false ) );
      renderList.push( enemies[ enemies.length-1 ] );
    }

    if( this.centerPos[1] <= this.target[1] + .6 ) {
      //if we hit a base, explode and also explode the base
      for( var i = 0; i < temples.length; i++ ) {
        if( this.target == temples[i].centerPos ) {
          remove( temples[i], renderList );
          remove( temples[i], temples );
          i--;
        }
      }

      //also also if we hit a battery get rid of that
      for( var i = 0; i < missileBatteries.length; i++ ) {
        if( this.target == missileBatteries[i].centerPos ) {
          missileBatteries[i].destroy();
        }
      }

      //since the explosion will give us a point just take one away at the same time
      score -= pointsPerVoltorb;
      renderList.push( new Explosion( gl, explosionSource, this.centerPos ) );
    }
  }

  destroy() {
    remove( this, enemies );
    remove( this, renderList );
  }
}

function getTarget( t ) {
  if( t < temples.length ) {
    return temples[t].centerPos;
  } else {
    return missileBatteries[ t - temples.length ].centerPos;
  }
}

class ReloadBall {
  constructor( gl, tex, scale, pos ) {
    //make a ball
    this.vertexCoords = [];
    this.uvCoords = [];
    this.triangles = [];
    var numLongSteps = 32;

    this.vertexCoords.push( 0, -1, 0 ); // vertices to return, init to south pole
    this.uvCoords.push( 0.5, 1.0 ); // add south pole uv
    var angleIncr = (Math.PI+Math.PI) / numLongSteps; // angular increment 
    var latLimitAngle = angleIncr * (Math.floor(numLongSteps/4)-1); // start/end lat angle
    var latRadius, latY; // radius and Y at current latitude
    for (var latAngle=-latLimitAngle; latAngle<=latLimitAngle; latAngle+=angleIncr) {
        latRadius = Math.cos(latAngle); // radius of current latitude
        latY = Math.sin(latAngle); // height at current latitude
        for (var longAngle=0; longAngle<2*Math.PI+angleIncr; longAngle+=angleIncr) {// for each long
          this.vertexCoords.push(latRadius*Math.sin(longAngle), latY, latRadius*Math.cos(longAngle));
          this.uvCoords.push( longAngle/(Math.PI * 2), (1-(latAngle+latLimitAngle)/(Math.PI))-.0625 );
        }
    } // end for each latitude
    this.vertexCoords.push(0,1,0); // add north pole
    this.uvCoords.push( 0.5, 0.0 ); //add north pole uv

    for (var whichLong=1; whichLong<numLongSteps; whichLong++) { // south pole
      this.triangles.push(0,whichLong,whichLong+1);
    }
    this.triangles.push(0,numLongSteps,1); // longitude wrap tri
    var llVertex; // lower left vertex in the current quad
    for (var whichLat=0; whichLat<(numLongSteps/2 - 2); whichLat++) { // middle lats
        for (var whichLong=0; whichLong<numLongSteps-1; whichLong++) {
            llVertex = whichLat*numLongSteps + whichLong + 1;
            this.triangles.push(llVertex,llVertex+numLongSteps,llVertex+numLongSteps+1);
            this.triangles.push(llVertex,llVertex+numLongSteps+1,llVertex+1);
        } // end for each longitude
        this.triangles.push(llVertex+1,llVertex+numLongSteps+1,llVertex+2);
        this.triangles.push(llVertex+1,llVertex+2,llVertex-numLongSteps+2);
    } // end for each latitude
    for (var whichLong=llVertex+2; whichLong<llVertex+numLongSteps+1; whichLong++) {// north pole
      this.triangles.push(whichLong,this.vertexCoords.length/3-1,whichLong+1);
    }
    this.triangles.push(this.vertexCoords.length/3-numLongSteps/2-1, this.vertexCoords.length/3-1,
      this.vertexCoords.length/3-numLongSteps-numLongSteps/2); // seal up that weird triangle hole

    //make all the buffers
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer ); // activate that buffer
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.vertexCoords ), gl.STATIC_DRAW ); // data in
    this.textureBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.textureBuffer ); // activate that buffer
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.uvCoords ), gl.STATIC_DRAW ); // data in
    this.triangleBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer ); // activate that buffer
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.triangles ), gl.STATIC_DRAW ); // data in

    //set other stuff
    this.texture = loadTexture( gl, tex );
    this.mMatrix = mat4.create();
    this.centerPos = vec3.fromValues( pos[0], pos[1], pos[2] );

    //scale
    var temp = mat4.create();
    var scaleMatrix = mat4.fromScaling( temp, vec3.fromValues( scale, scale, scale ) );
    mat4.multiply( this.mMatrix, scaleMatrix, this.mMatrix );

    //translate
    temp = mat4.create();
    mat4.fromTranslation( temp, this.centerPos );
    mat4.multiply( this.mMatrix, temp, this.mMatrix);

    if( pos[0] < 0 ) {
      this.translateVector = vec3.fromValues( .05, 0, 0 );
    } else {
      this.translateVector = vec3.fromValues( -.05, 0, 0 );
    }
  }

  destroy() {
    for( var i = missileBatteries.length - 1; i >= 0; i-- ) {
      missileBatteries[i].destroy();
      remove( missileBatteries[i], missileBatteries );
    }
    missileBatteries.push( new Battery( gl, illuminatiSource, vec3.fromValues( -4, -2.5, .3 ) ) );
    missileBatteries.push( new Battery( gl, illuminatiSource, vec3.fromValues( 0, -2.5, 0 ) ) );
    missileBatteries.push( new Battery( gl, illuminatiSource, vec3.fromValues( 4, -2.5, .3 ) ) );
    remove( this, enemies );
    remove( this, renderList );
  }

  updatePosition() {
    var temp = mat4.create();
    mat4.fromTranslation( temp, this.translateVector );
    mat4.multiply( this.mMatrix, temp, this.mMatrix );
    vec3.add( this.centerPos, this.translateVector, this.centerPos );

    if( this.centerPos[0] <= -6.0 || this.centerPos[0] >= 6.0 ) {
      remove( this, enemies );
      remove( this, renderList );
    }
  }
}

//a battery of missiles; each starts with 10
class Battery {
  constructor( gl, tex, pos ) {
    var missileScale = .15;
    this.centerPos = vec3.fromValues( pos[0], pos[1], pos[2] );
    this.missiles = []; //array of all missiles here
    //bottom row
    this.missiles.push( new Pyramid( gl, tex, missileScale, vec3.fromValues( pos[0]-.4, pos[1], pos[2]-1.2 ) ) );
    this.missiles.push( new Pyramid( gl, tex, missileScale, vec3.fromValues( pos[0]-.15, pos[1], pos[2]-1.2 ) ) );
    this.missiles.push( new Pyramid( gl, tex, missileScale, vec3.fromValues( pos[0]+.15, pos[1], pos[2]-1.2 ) ) );
    this.missiles.push( new Pyramid( gl, tex, missileScale, vec3.fromValues( pos[0]+.4, pos[1], pos[2]-1.2 ) ) );
    //pre-bottom row
    this.missiles.push( new Pyramid( gl, tex, missileScale, vec3.fromValues( pos[0]-.25, pos[1], pos[2]-.8 ) ) );
    this.missiles.push( new Pyramid( gl, tex, missileScale, vec3.fromValues( pos[0], pos[1], pos[2]-.8 ) ) );
    this.missiles.push( new Pyramid( gl, tex, missileScale, vec3.fromValues( pos[0]+.25, pos[1], pos[2]-.8 ) ) );
    //pre-top row
    this.missiles.push( new Pyramid( gl, tex, missileScale, vec3.fromValues( pos[0]-.15, pos[1], pos[2]-.4 ) ) );
    this.missiles.push( new Pyramid( gl, tex, missileScale, vec3.fromValues( pos[0]+.15, pos[1], pos[2]-.4 ) ) );
    //top row
    this.missiles.push( new Pyramid( gl, tex, missileScale, vec3.fromValues( pos[0], pos[1], pos[2]+.0 ) ) );

    //set all of these as missiles
    for( var i = 0; i < this.missiles.length; i++ ) {
      this.missiles[i].missile = true;
      renderList.push( this.missiles[i] );
    }
  }

  destroy() {
    for( var j = this.missiles.length - 1; j >= 0; j-- ) {
      remove( this.missiles[j], renderList );
      remove( this.missiles[j], this.missiles );
    }
  }
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
  const pixel = new Uint8Array([38, 253, 238, 255]);  // teal is a weird color
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.crossOrigin = "";
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
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