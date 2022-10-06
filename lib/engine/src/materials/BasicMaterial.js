
import { vec4 } from '../../lib/gl-matrix/src/index.js';

import Material from './Material.js';
import BasicShader from './BasicShader.js';

export default class BasicMaterial extends Material {

    constructor({
        color = vec4.fromValues(1.0, 1.0, 1.0, 1.0),
        map = null
    } = {}) {
        
        super(BasicShader);

        this.uniforms.color = color;
        this.uniforms.map = map;

        if (map !== null) {
            this.defines.HAS_MAP = true;
        }

    }

    uploadUniforms(gl) {

        if (this.shader) {

            gl.uniform4fv(this.shader.uniformLocations.color, this.uniforms.color);

            if (this.uniforms.map) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.uniforms.map);
                gl.uniform1i(this.shader.uniformLocations.map, 0);
            }

        } else {
            throw Error('The shader has not been initialized.');
        }

    }
    
}