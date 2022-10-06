
import { mat4 } from '../../lib/gl-matrix/src/index.js';
import Camera from './Camera.js';

export default class PerspectiveCamera extends Camera {

    constructor(fovy, aspect, near, far) {
        super();

        this.fovy = fovy;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this.projectionMatrix = mat4.perspective(mat4.create(), fovy, aspect, near, far);
    }

    updateProjectionMatrix() {
        mat4.perspective(this.projectionMatrix, this.fovy, this.aspect, this.near, this.far);
    }

}