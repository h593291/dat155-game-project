
import { mat4 } from '../../lib/gl-matrix/src/index.js';
import Node from '../Node.js';

export default class Camera extends Node {

    constructor() {
        super();

        this.viewMatrix = mat4.create();
    }

    tick(parentWorldMatrix = null) {
        super.tick(parentWorldMatrix);
        
        // view matrix is the inverse of the world matrix.
        mat4.invert(this.viewMatrix, this.worldMatrix);
    }

}