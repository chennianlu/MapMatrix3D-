const shader = `
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
uniform float time;
varying vec2 vUv;
varying float vRim;
varying float vDepth;
void main() {
    vUv = uv;
    vUv.x += time * 0.0001;
    vUv.y += time * 0.0006;
    vec3 n = normalMatrix * normal;
    vec4 viewPosition = modelViewMatrix * vec4( position, 1. );
    vec3 eye = normalize(-viewPosition.xyz);
    vRim = 1.0 - abs(dot(eye,n));
    vRim = pow(vRim, 5.);
    vec3 worldPosition = (modelMatrix * vec4(position, 1.)).xyz;  
    gl_Position = projectionMatrix * viewPosition;
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
`;
export { shader };
