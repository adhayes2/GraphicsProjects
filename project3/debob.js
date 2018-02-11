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