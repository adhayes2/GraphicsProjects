// Color constructor
class Color {
  
      // Color constructor default opaque black
  constructor(r=0,g=0,b=0,a=255) {
      try {
          if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
              throw "color component not a number";
          else {
              this.r = clamp(r,0,255); this.g = clamp(g,0,255); this.b = clamp(b,0,255); this.a = clamp(a,0,255); 
          }
      } // end try
      
      catch (e) {
          console.log(e);
      }
  } // end Color constructor

      // Color change method
  change(r,g,b,a) {
      try {
          if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
              throw "color component not a number";
          else {
              this.r = clamp(r,0,255); this.g = clamp(g,0,255); this.b = clamp(b,0,255); this.a = clamp(a,0,255);  
              return(this);
          }
      } // end throw
      
      catch (e) {
          console.log(e);
      }
  } // end Color change method
  
      // Color add method
  add(c) {
      try {
          if (!(c instanceof Color))
              throw "Color.add: non-color parameter";
          else {
              this.r += c.r; this.g += c.g; this.b += c.b; this.a += c.a;
              this.r = clamp(this.r,0,255); this.g = clamp(this.g,0,255); this.b = clamp(this.b,0,255); this.a = clamp(this.a,0,255); 
              return(this);
          }
      } // end try
      
      catch(e) {
          console.log(e);
      }
  } // end color add
  
      // Color subtract method
  subtract(c) {
      try {
          if (!(c instanceof Color))
              throw "Color.subtract: non-color parameter";
          else {
              this.r -= c.r; this.g -= c.g; this.b -= c.b; this.a -= c.a;
              this.r = clamp(this.r,0,255); this.g = clamp(this.g,0,255); this.b = clamp(this.b,0,255); this.a = clamp(this.a,0,255); 
              return(this);
          }
      } // end try
      
      catch(e) {
          console.log(e);
      }
  } // end color subgtract
  
      // Color scale method
  scale(s) {
      try {
          if (typeof(s) !== "number")
              throw "scale factor not a number";
          else {
              this.r *= s; this.g *= s; this.b *= s; this.a *= s; 
              this.r = clamp(this.r,0,255); this.g = clamp(this.g,0,255); this.b = clamp(this.b,0,255); this.a = clamp(this.a,0,255); 
              return(this);
          }
      } // end throw
      
      catch (e) {
          console.log(e);
      }
  } // end Color scale method
  
      // Color copy method
  copy(c) {
      try {
          if (!(c instanceof Color))
              throw "Color.copy: non-color parameter";
          else {
              this.r = c.r; this.g = c.g; this.b = c.b; this.a = c.a;
              this.r = clamp(this.r,0,255); this.g = clamp(this.g,0,255); this.b = clamp(this.b,0,255); this.a = clamp(this.a,0,255); 
              return(this);
          }
      } // end try
      
      catch(e) {
          console.log(e);
      }
  } // end Color copy method
  
      // Color clone method
  clone() {
      var newColor = new Color();
      newColor.copy(this);
      return(newColor);
  } // end Color clone method
  
      // translate color to string
  toString() {
      return(this.r +" "+ this.g +" "+ this.b +" "+ this.a);
  }  // end Color toConsole
  
      // Send color to console
  toConsole() {
      console.log(this.toString());
  }  // end Color toConsole
  
} // end color class

// Vector class
class Vector { 
  constructor(x,y,z) {
      this.set(x,y,z);
  } // end constructor
  
  // sets the components of a vector
  set(x,y,z) {
      try {
          if ((typeof(x) !== "number") || (typeof(y) !== "number") || (typeof(z) !== "number"))
              throw "vector component not a number";
          else
              this.x = x; this.y = y; this.z = z; 
      } // end try
      
      catch(e) {
          console.log(e);
      }
  } // end vector set
  
  // copy the passed vector into this one
  copy(v) {
      try {
          if (!(v instanceof Vector))
              throw "Vector.copy: non-vector parameter";
          else
              this.x = v.x; this.y = v.y; this.z = v.z;
      } // end try
      
      catch(e) {
          console.log(e);
      }
  }
  
  toConsole(prefix="") {
      console.log(prefix+"["+this.x+","+this.y+","+this.z+"]");
  } // end to console
  
  // static dot method
  static dot(v1,v2) {
      try {
          if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
              throw "Vector.dot: non-vector parameter";
          else
              return(v1.x*v2.x + v1.y*v2.y + v1.z*v2.z);
      } // end try
      
      catch(e) {
          console.log(e);
          return(NaN);
      }
  } // end dot static method
  
  // static cross method
  static cross(v1,v2) {
      try {
          if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
              throw "Vector.cross: non-vector parameter";
          else {
              var crossX = v1.y*v2.z - v1.z*v2.y;
              var crossY = v1.z*v2.x - v1.x*v2.z;
              var crossZ = v1.x*v2.y - v1.y*v2.x;
              return(new Vector(crossX,crossY,crossZ));
          } // endif vector params
      } // end try
      
      catch(e) {
          console.log(e);
          return(NaN);
      }
  } // end dot static method
  
  // static add method
  static add(v1,v2) {
      try {
          if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
              throw "Vector.add: non-vector parameter";
          else
              return(new Vector(v1.x+v2.x,v1.y+v2.y,v1.z+v2.z));
      } // end try
      
      catch(e) {
          console.log(e);
          return(new Vector(NaN,NaN,NaN));
      }
  } // end add static method

  // static subtract method, v1-v2
  static subtract(v1,v2) {
      try {
          if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
              throw "Vector.subtract: non-vector parameter";
          else {
              var v = new Vector(v1.x-v2.x,v1.y-v2.y,v1.z-v2.z);
              return(v);
          }
      } // end try
      
      catch(e) {
          console.log(e);
          return(new Vector(NaN,NaN,NaN));
      }
  } // end subtract static method

  // static divide method, v1/v2
  static divide(v1,v2) {
    try {
        if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
            throw "Vector.subtract: non-vector parameter";
        else {
            var v = new Vector(v1.x/v2.x,v1.y/v2.y,v1.z/v2.z);
            return(v);
        }
    } // end try
    
    catch(e) {
        console.log(e);
        return(new Vector(NaN,NaN,NaN));
    }
} // end subtract static method

  // static scale method
  static scale(c,v) {
      try {
          if (!(typeof(c) === "number") || !(v instanceof Vector))
              throw "Vector.scale: malformed parameter";
          else
              return(new Vector(c*v.x,c*v.y,c*v.z));
      } // end try
      
      catch(e) {
          console.log(e);
          return(new Vector(NaN,NaN,NaN));
      }
  } // end scale static method
  
  // static normalize method
  static normalize(v) {
      try {
          if (!(v instanceof Vector))
              throw "Vector.normalize: parameter not a vector";
          else {
              var lenDenom = 1/Math.sqrt(Vector.dot(v,v));
              return(Vector.scale(lenDenom,v));
          }
      } // end try
      
      catch(e) {
          console.log(e);
          return(new Vector(NaN,NaN,NaN));
      }
  } // end scale static method
  
} // end Vector class

//light has three vector values for each different flavour of light
//the x value is the r value, y is g, z is b
//theres also a position vector where x y z are interpreted normally
class Light {
  //light constructor default white
  //default position is origin
  constructor ( ambient = new Vector( 1,1,1, ), diffuse = new Vector( 1,1,1 ), specular = new Vector( 1,1,1 ), position = new Vector(0,0,0) ) {
    if( ambient instanceof Vector ) {
      this.ambient = new Vector( clamp( ambient.x, 0, 1 ), clamp( ambient.y, 0, 1 ), clamp( ambient.z, 0, 1 ) );
    } else {
      this.ambient = new Vector(1,1,1);
      console.log( "you did it wrong (ambient)" );
    }

    if( diffuse instanceof Vector ) {
      this.diffuse = new Vector( clamp( diffuse.x, 0, 1 ), clamp( diffuse.y, 0, 1 ), clamp( diffuse.z, 0, 1 ) );
    } else {
      this.diffuse = new Vector(1,1,1);
      console.log( "you did it wrong (diffuse)" );
    }

    if( specular instanceof Vector ) {
      this.specular = new Vector( clamp( specular.x, 0, 1 ), clamp( specular.y, 0, 1 ), clamp( specular.z, 0, 1 ) );
    } else {
      this.specular = new Vector(1,1,1);
      console.log( "you did it wrong (specular)" );
    }

    if( position instanceof Vector ) {
      this.position = position;
    } else {
      this.position = new Vector(0,0,0);
      console.log( "you did it wrong (position)" );
    }
  }
} //end Light class

//has a position vector with xzy coordinates
//radii vector with xyz radiuses
//vectors for each flavour of light, with x=r y=g z=b
//specular exponent n
class Ellipsoid {
  constructor( position = new Vector(0,0,0), radii = new Vector( 1,1,1 ), ambient = new Vector( 1,1,1, ), diffuse = new Vector( 1,1,1 ), specular = new Vector( 1,1,1 ), n=1 ) {
    if( position instanceof Vector ) {
      this.position = position;
    } else {
      this.position = new Vector(0,0,0);
      console.log( "you did it wrong (position)" );
    }

    if( radii instanceof Vector ) {
      this.radii = radii;
    } else {
      this.radii = new Vector(1,1,1);
      console.log( "you did it wrong (radii)" );
    }
    
    if( ambient instanceof Vector ) {
      this.ambient = new Vector( clamp( ambient.x, 0, 1 ), clamp( ambient.y, 0, 1 ), clamp( ambient.z, 0, 1 ) );
    } else {
      this.ambient = new Vector(1,1,1);
      console.log( "you did it wrong (ambient)" );
    }

    if( diffuse instanceof Vector ) {
      this.diffuse = new Vector( clamp( diffuse.x, 0, 1 ), clamp( diffuse.y, 0, 1 ), clamp( diffuse.z, 0, 1 ) );
    } else {
      this.diffuse = new Vector(1,1,1);
      console.log( "you did it wrong (diffuse)" );
    }

    if( specular instanceof Vector ) {
      this.specular = new Vector( clamp( specular.x, 0, 1 ), clamp( specular.y, 0, 1 ), clamp( specular.z, 0, 1 ) );
    } else {
      this.specular = new Vector(1,1,1);
      console.log( "you did it wrong (specular)" );
    }

    if( typeof( n ) === "number" ) {
      this.n = Math.abs( n );
    } else {
      this.n = 1;
      console.log( "you did it wrong (n)" );
    }
    
  }

  //takes an eye point and a pixel point, checks if a ray from the eye in direction of pixel would hit this ellipse
  //returns closest point hit as a vector or null if no hit
  hit( eye = new Vector( 0,0,0 ), pixel = new Vector( 1,0,0 ) ) {
    var d = new Vector( 0,0,0 );
    d = Vector.subtract( pixel, eye );

    var dOverA = Vector.divide( d, this.radii );
    var a = Vector.dot( dOverA, dOverA );

    var b = 2 * Vector.dot( dOverA, Vector.divide( Vector.subtract( eye, this.position ), this.radii ) );

    var eMinusCOverA = Vector.divide( Vector.subtract( eye, this.position ), this.radii );
    var c = Vector.dot( eMinusCOverA, eMinusCOverA ) - 1;

    var discr = ( b * b ) - ( 4 * a * c );
    if( discr < 0 ) {
      return null;
    } else {
      //return the point that we hit
      var t1 = ( -1*b - Math.sqrt( discr ) ) / ( 2 * a );
      var t2 = ( -1*b + Math.sqrt( discr ) ) / ( 2 * a );
      var t = -1;
      if( t1 < 1 && t2 < 1 ) {
        //both intersections in front of the window, ignore
        return null;
      } else if ( t1 < 1 ) {
        //t1 is in front of window but t2 is not
        t = t2;
      } else if ( t2 < 1 ) {
        //t2 is in front of window but t1 is not
        t = t1;
      } else {
        //both are behind window, take smallest
        t = Math.min( t1, t2 );
      }
      var tVector = Vector.add( eye, Vector.scale( t, d ) );
      return tVector;
    }
  }

  //calculates the normal vector at a given point on the elipsoid's surface
  normal( point ) {
    var n = new Vector( 2*(point.x-this.position.x)/Math.pow(this.radii.x, 2), 2*(point.y-this.position.y)/Math.pow(this.radii.y, 2), 2*(point.z-this.position.z)/Math.pow(this.radii.z, 2) );
    //n = Vector.scale( -1, n );
    return Vector.normalize( n );
  }
}