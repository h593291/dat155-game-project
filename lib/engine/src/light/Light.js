import { vec4 } from '../../lib/gl-matrix/src/index.js';

import Node from '../Node.js';

export default class Light extends Node {
    constructor({
        diffuse = vec4.fromValues(1.0, 1.0, 1.0, 1.0),
        specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0)
    } = {}) {
        super();
        
        this.diffuse = diffuse;
        this.specular = specular;
    }
}