const glsl = (t, defines) => t.raw[0] + defines + t.raw[1];

export default defines => glsl`#version 300 es

${defines}

precision mediump float;

layout(location = 0) in vec4 in_position;
layout(location = 1) in vec3 in_normal;
layout(location = 3) in vec2 in_texcoord_0;

uniform mat4 modelViewProjectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

out vec3 position;
out vec3 normal;
out vec2 texcoord_0;

void main() {

    vec4 pos = modelViewMatrix * in_position;
    position = vec3(pos.xyz) / pos.w;

    normal = normalize(normalMatrix * in_normal);

    texcoord_0 = in_texcoord_0;
    
    gl_Position = modelViewProjectionMatrix * in_position;

}`;