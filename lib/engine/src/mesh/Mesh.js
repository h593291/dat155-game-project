import Primitive from './Primitive.js';
import { vec3 } from '../../lib/gl-matrix/src/index.js';

import Node from '../Node.js';
/**
 * A drawable scenegraph node representing a number of primitives.
 *
 * @class Mesh
 * @extends {Node}
 */
export default class Mesh extends Node {

    /**
     * @param {Primitive[]} primitives 
     */
    constructor(primitives) {
        super();

        this.primitives = primitives;

        this.boundingBox = {
            min: vec3.create(),
            max: vec3.create()
        };

        this.localBoundingBox = null;
        this.updateLocalBoundingBox();
    }

    tick(parentWorldMatrix = null) {
        super.tick(parentWorldMatrix);

        vec3.transformMat4(this.boundingBox.min, this.localBoundingBox.min, this.worldMatrix);
        vec3.transformMat4(this.boundingBox.max, this.localBoundingBox.max, this.worldMatrix);
    }

    updateLocalBoundingBox() {

        let vertices = [];

        for (let primitive of this.primitives) {
            let { min, max } = primitive.attributes.POSITION;

            vertices.push(...min);
            vertices.push(...max);
        }

        this.localBoundingBox = Primitive.getMinMax(vertices);

    }
    
}