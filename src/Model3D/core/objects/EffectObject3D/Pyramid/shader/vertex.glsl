#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif
bool isPerspectiveMatrix(mat4){
  return true;
}
varying vec2 vUv;
uniform vec3 view_vector;
uniform float c;
uniform float p;
uniform float time;
varying vec3 vPosition;
varying float intensity;
void main() {
  vUv = uv;
  vec3 v_normal = normalize(normalMatrix * normal);
  vec3 v_view = normalize(normalMatrix * view_vector);
  float c2 = c * abs(sin(time/10.0)/10.0) + c;
  intensity = pow(c2 - dot(v_normal, v_view), p);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  #ifdef USE_LOGDEPTHBUF
    #ifdef USE_LOGDEPTHBUF_EXT
      vFragDepth = 1.0 + gl_Position.w;
      vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
    #else
      if ( isPerspectiveMatrix( projectionMatrix ) ) {
        gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
        gl_Position.z *= gl_Position.w;
      }
    #endif
  #endif
}