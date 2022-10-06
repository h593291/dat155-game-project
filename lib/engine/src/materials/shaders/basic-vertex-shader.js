const glsl = (t, defines) => t.raw[0] + defines + t.raw[1];

export default defines => glsl`#version 300 es

${defines}

precision mediump float;

layout(location = 0) in vec4 POSITION;
layout(location = 3) in vec2 TEXCOORD_0;

out vec2 fTextureCoordinate;

uniform mat4 modelViewProjectionMatrix;

void main() {
	fTextureCoordinate = TEXCOORD_0;
    gl_Position = modelViewProjectionMatrix * POSITION;
    gl_PointSize = 10.0;
}`;