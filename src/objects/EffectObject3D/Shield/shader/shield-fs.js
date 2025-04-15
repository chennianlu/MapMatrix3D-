const shader = `
#include <common>
#include <packing>
#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
  uniform float logDepthBufFC;
  varying float vFragDepth;
  varying float vIsPerspective;
#endif
uniform sampler2D depthBuffer;
uniform vec2 resolution;
uniform float time;
uniform sampler2D u_tex;
uniform vec3 cellColor;
uniform float cellOpacity;
varying float vRim;
varying vec2 vUv;
varying float vDepth;
const vec4 baseColor = vec4(0.0, 0.0, 0.9, 0.1);
void main() {
    // 基础色
    vec4 color = vec4(cellColor, cellOpacity);
    // 动态纹理
    vec4 maskA = texture(u_tex, vUv);
    maskA.a = maskA.r;
    color += maskA;
    // 边界高亮
    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 packedDepth = texture(depthBuffer, uv);
    float sceneDepth = unpackRGBAToDepth(packedDepth);
    float depth = (vDepth - .1) / ( 10.0 -.1);
    float diff = abs(depth - sceneDepth);
    float contact = diff * 20.;
    contact = 1. - contact;
    contact = max(contact, 0.);
    contact = pow(contact, 20.);
    contact *= diff*1000.;
    float a = max(contact, vRim);
    float fade = 1. - pow(vRim, 10.);
    color += a * fade;
    gl_FragColor = color;
    #if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
      // 将片元的深度值转换为对数深度值，并将结果存储到gl_FragDepthEXT 变量中。
      // 三目判断当前投影矩阵是否为正交矩阵，如果是，则使用gl_FragCoord.z 作为深度值，否则，使用以2为底vFragDepth深度信息为指数的对数值计算深度值
      // logDepthBufFC 是一个常量，用于控制深度值得精度。计算方式为1.0/(log2(far + 1.0)/log2(2.0)),far 表示相机得远裁剪面距离
      // * 0.5 是为了将对数深度值映射到[0,1]范围内
      gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
    #endif 
}
`;
export { shader };
