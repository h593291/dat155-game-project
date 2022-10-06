
import Shader from './Shader.js';

import vertexShaderTemplate from './shaders/cubemap-vertex-shader.js';
import fragmentShaderTemplate from './shaders/cubemap-fragment-shader.js';

export default class CubeMapShader extends Shader {
    constructor(gl, material) {
        super(gl, material, vertexShaderTemplate, fragmentShaderTemplate);

        // get specific uniform locations.
        this.uniformLocations.map = gl.getUniformLocation(this.program, "map");
    }
}
