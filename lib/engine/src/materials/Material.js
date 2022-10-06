
export default class Material {
    constructor(Shader) {
        if (Shader === undefined) {
            throw Error('You must provide a Shader-class when extending Material.');
        }
        this.Shader = Shader;
        this.shader = null;

        this.uniforms = {};
        this.defines = {};
    }
}