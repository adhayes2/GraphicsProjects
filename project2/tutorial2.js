//http://learningwebgl.com/blog/?p=28

function webGLStart() {
  var canvas = document.getElementById("lesson01-canvas");
  initGL(canvas);
  initShaders();
  initBuffers();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  drawScene();
}

var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;
var squareVertexPositionBuffer;
var squareVertexColorBuffer;

function initBuffers() {
  triangleVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  var vertices = [
       0.0,  1.0,  0.0,
      -1.0, -1.0,  0.0,
       1.0, -1.0,  0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangleVertexPositionBuffer.itemSize = 3;
  triangleVertexPositionBuffer.numItems = 3;

  triangleVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  var colors = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  triangleVertexColorBuffer.itemSize = 4;
  triangleVertexColorBuffer.numItems = 3;

  squareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  vertices = [
       1.0,  1.0,  0.0,
      -1.0,  1.0,  0.0,
       1.0, -1.0,  0.0,
      -1.0, -1.0,  0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 4;

  squareVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  colors = [];
  for (var i=0; i < 4; i++) {
      colors = colors.concat([0.5, 0.5, 1.0, 1.0]);
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  squareVertexColorBuffer.itemSize = 4;
  squareVertexColorBuffer.numItems = 4;
}

function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
  mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

  mat4.identity(mvMatrix);

  mat4.translate(mvMatrix, mvMatrix, vec3.fromValues(-1.5, 0.0, -7.0));
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);


  mat4.translate(mvMatrix, mvMatrix, vec3.fromValues( 3.0, 0.0, 0.0 ) );
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

var gl;
function initGL(canvas) {
  try {
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch(e) {
  }
  if (!gl) {
    alert("Could not initialise WebGL, sorry :-( ");
  }
}

function getShaders() {
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

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    varying vec4 vColor;

    void main(void) {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
      vColor = aVertexColor;
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

  var ret = [];
  ret.push( fShader, vShader );
  return ret;
}


var shaderProgram;

function initShaders() {
  var arr = getShaders();
  var fragmentShader = arr[0];
  var vertexShader = arr[1];

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}