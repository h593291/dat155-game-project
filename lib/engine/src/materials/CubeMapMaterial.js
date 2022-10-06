
import Material from './Material.js';
import CubeMapShader from './CubeMapShader.js';

export default class CubeMapMaterial extends Material {

    constructor({
        map = null
    } = {}) {

        super(CubeMapShader);

        if (map === null || map.length < 6) {
            throw Error("WarpGL: CubeMapMaterial must have an array of 6 images.");
        }

        this.uniforms.map = map;

    }

    uploadUniforms(gl) {

        if (this.shader) {

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.uniforms.map);
            gl.uniform1i(this.shader.uniformLocations.map, 0);

        } else {
            throw Error('The shader has not been initialized.');
        }

    }

}