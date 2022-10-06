const glsl = (t, defines) => t.raw[0] + defines + t.raw[1];

export default defines => glsl`#version 300 es

${defines}

precision mediump float;

in vec3 vCoordinates;
out vec4 fColor;

uniform samplerCube map;

void main() {
    fColor = texture(map, vCoordinates);
}`;