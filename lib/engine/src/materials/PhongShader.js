import Shader from './Shader.js';

import vertexShaderTemplate from './shaders/phong-vertex-shader.js';
import fragmentShaderTemplate from './shaders/phong-fragment-shader.js';

export default class PhongShader extends Shader {
    constructor(gl, material) {
        super(gl, material, vertexShaderTemplate, fragmentShaderTemplate);

        // get uniform locations specific to this shader.
        this.uniformLocations.color = gl.getUniformLocation(this.program, 'materialColor');
        this.uniformLocations.ambient = gl.getUniformLocation(this.program, 'materialAmbient');
        this.uniformLocations.specular = gl.getUniformLocation(this.program, 'materialSpecular');
        this.uniformLocations.shininess = gl.getUniformLocation(this.program, 'shininess');

        this.uniformLocations.lightPosition = gl.getUniformLocation(this.program, "lightPosition");
        this.uniformLocations.lightDiffuse = gl.getUniformLocation(this.program, "lightDiffuse");
        this.uniformLocations.lightSpecular = gl.getUniformLocation(this.program, "lightSpecular");
        this.uniformLocations.lightAmbient = gl.getUniformLocation(this.program, "lightAmbient");
        this.uniformLocations.lightAttenuation = gl.getUniformLocation(this.program, "lightAttenuation");

        this.uniformLocations.map = gl.getUniformLocation(this.program, 'map');
        this.uniformLocations.specularMap = gl.getUniformLocation(this.program, 'specularMap');

        // activate the light uniform block.
        this.uniformBlocks.push('LIGHT');
    }
}