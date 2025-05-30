#if defined(USE_LOGDEPTHBUF)&&defined(USE_LOGDEPTHBUF_EXT)
uniform float logDepthBufFC;
varying float vFragDepth;
varying float vIsPerspective;
#endif
uniform float time;
varying vec2 vUv;
uniform vec3 glow_color;
uniform vec3 glow_color2;
varying float intensity;
varying vec3 vPosition;
void main(){
  vec3 glow=glow_color*intensity;
  vec3 glow2=glow_color2*intensity;
  vec3 glow3=mix(glow,glow2,intensity);
  
  float light=.1;
  float now=smoothstep(0.,1.,fract(time));
  float alpha=mod((vUv.y-now)*1.,1.);
  
  if(-.005<now-vUv.y&&now-vUv.y<.005){
    if(now==1.){
      light=0.;
    }else{
      light+=.5;
    }
    
  }
  gl_FragColor=vec4(glow3+light,alpha);
  #if defined(USE_LOGDEPTHBUF)&&defined(USE_LOGDEPTHBUF_EXT)
  // 将片元的深度值转换为对数深度值，并将结果存储到gl_FragDepthEXT 变量中。
  // 三目判断当前投影矩阵是否为正交矩阵，如果是，则使用gl_FragCoord.z 作为深度值，否则，使用以2为底vFragDepth深度信息为指数的对数值计算深度值
  // logDepthBufFC 是一个常量，用于控制深度值得精度。计算方式为1.0/(log2(far + 1.0)/log2(2.0)),far 表示相机得远裁剪面距离
  // * 0.5 是为了将对数深度值映射到[0,1]范围内
  gl_FragDepthEXT=vIsPerspective==0.?gl_FragCoord.z:log2(vFragDepth)*logDepthBufFC*.5;
  #endif
}