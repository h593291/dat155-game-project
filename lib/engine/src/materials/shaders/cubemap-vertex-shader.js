const glsl = (t, defines) => t.raw[0] + defines + t.raw[1];

export default defines => glsl`#version 300 es

${defines}

precision mediump float;

layout(location = 0) in vec4 POSITION;

out vec3 vCoordinates;

uniform mat4 modelViewProjectionMatrix;

void main() {
    vCoordinates = POSITION.xyz;
    gl_Position = modelViewProjectionMatrix * POSITION;
}`;