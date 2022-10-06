import Node from './Node.js';

import Mesh from './mesh/Mesh.js';
import Light from './light/Light.js';
import { vec4 } from '../lib/gl-matrix/src/index.js';

export default class Scene extends Node {
    constructor() {
        super();

        this.ambient = vec4.fromValues(0.2, 0.2, 0.2, 1.0);
    }

    /**
     * Update world matrices in the scene.
    */
    update() {
        this.tick();
    }

    static getMeshNodes(node) {

        if (node instanceof Mesh) {
            return [node].concat(...node.children.map(this.getMeshNodes.bind(this)));
        } else {
            return [].concat(...node.children.map(this.getMeshNodes.bind(this)));
        }

    }

    static getLightNodes(node) {

        if (node instanceof Light) {
            return [node].concat(...node.children.map(this.getLightNodes.bind(this)));
        } else {
            return [].concat(...node.children.map(this.getLightNodes.bind(this)));
        }

    }

    getMeshNodes() {
        return this.constructor.getMeshNodes(this);
    }

    getLightNodes() {
        return this.constructor.getLightNodes(this);
    }
}