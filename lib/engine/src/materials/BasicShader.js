import Shader from './Shader.js';

import vertexShaderTemplate from './shaders/basic-vertex-shader.js';
import fragmentShaderTemplate from './shaders/basic-fragment-shader.js';

export default class BasicShader extends Shader {
    constructor(gl, material) {
        super(gl, material, vertexShaderTemplate, fragmentShaderTemplate);

        // get uniform locations specific to this shader.
        this.uniformLocations.color = gl.getUniformLocation(this.program, 'color');
        this.uniformLocations.map = gl.getUniformLocation(this.program, 'map');

    }
}