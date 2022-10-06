const glsl = (t, defines) => t.raw[0] + defines + t.raw[1];

export default defines => glsl`#version 300 es

${defines}

precision mediump float;

uniform vec4 color;

#ifdef HAS_MAP
uniform sampler2D map;
#endif

out vec4 fColor;
in vec2 fTextureCoordinate;

void main() {

    #ifdef HAS_MAP
    fColor = color * texture(map, fTextureCoordinate);
    #else
    fColor = color;
    #endif

}`;