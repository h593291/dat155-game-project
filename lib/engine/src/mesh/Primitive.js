
import { vec3, vec2 } from '../../lib/gl-matrix/src/index.js';
import { COMPONENT, IS_LITTLE_ENDIAN } from '../constants.js';

import BufferView from './BufferView.js';
import Accessor from './Accessor.js';

/**
* A drawable part of a mesh.
*
* @export
* @class Primitive
*/
export default class Primitive {
    
    /**
    * Creates an instance of Primitive.
    * @param {object} attributes An object containing accessors. A POSITION-attribute accessor must be specified.
    * @param {Material} material
    * @param {Accessor} [indices=null] An accessor pointing to an index buffer.
    * @param {integer} [mode=4]
    * 
    * @memberof Primitive
    */
    constructor(attributes, material, indices = null, mode = 4) {
        
        this.attributes = attributes;
        this.indices = indices;
        
        this.material = material;
        this.mode = mode;
        
        this.vao = null;
        
    }
    
    /**
    * Creates a new Primitive from an existing one, using the same attributes and indices (geomtry in other words).
    * This is useful when you want to have multiple objects with the same geometry, but different materials.
    * 
    * @param {Primitive} primitive
    * @param {Material} material
    * @param {integer} mode
    * @returns {Primitive}
    */
    static from(primitive, material, mode) {
        if (primitive instanceof Primitive) {
            return new Primitive(primitive.attributes, material, primitive.indices, mode);
        } else {
            throw new Error('Expected Primitive-instance as first argument (primitive).');
        }
    }
    
    static getMinMax(vertices) {
        
        let min = vec3.fromValues(+Infinity, +Infinity, +Infinity);
        let max = vec3.fromValues(-Infinity, -Infinity, -Infinity);
        
        for (let i = 0; i < vertices.length; i += 3) {
            
            min[0] = Math.min(min[0], vertices[i + 0]);
            min[1] = Math.min(min[1], vertices[i + 1]);
            min[2] = Math.min(min[2], vertices[i + 2]);
            
            max[0] = Math.max(max[0], vertices[i + 0]);
            max[1] = Math.max(max[1], vertices[i + 1]);
            max[2] = Math.max(max[2], vertices[i + 2]);
            
        }
        
        return { min, max };
    }
    
    /**
    * Generates a cube.
    * 
    * @param {Material} material 
    * @param {integer} mode 
    * @param {boolean} [flipNormals=false]
    * @returns {Primitive}
    */
    static createCube(material, flipNormals = false, mode) {
        
        const indices = [];
        const vertices = [];
        const uvs = [];
        const normals = [];
        
        const baseVertices = [
            vec3.fromValues(-0.5, -0.5, 0.5),
            vec3.fromValues(-0.5, 0.5, 0.5),
            vec3.fromValues(0.5, 0.5, 0.5),
            vec3.fromValues(0.5, -0.5, 0.5),
            vec3.fromValues(-0.5, -0.5, -0.5),
            vec3.fromValues(-0.5, 0.5, -0.5),
            vec3.fromValues(0.5, 0.5, -0.5),
            vec3.fromValues(0.5, -0.5, -0.5)
        ];
        
        const faces = [
            [1, 0, 3, 2],
            [2, 3, 7, 6],
            [3, 0, 4, 7],
            [6, 5, 1, 2],
            [4, 5, 6, 7],
            [5, 4, 0, 1]
        ];
        
        for (let f = 0; f < faces.length; ++f) {
            
            // generate indices.
            const offset = f * 4;
            
            if (flipNormals) {
                indices.push(offset, offset + 2, offset + 1); // face 1 reversed
                indices.push(offset, offset + 3, offset + 2); // face 2 reversed
            } else {
                indices.push(offset, offset + 1, offset + 2); // face 1
                indices.push(offset, offset + 2, offset + 3); // face 2
            }
            
            // generate vertices.
            const a = baseVertices[faces[f][0]];
            const b = baseVertices[faces[f][1]];
            const c = baseVertices[faces[f][2]];
            const d = baseVertices[faces[f][3]];
            
            vertices.push(...a, ...b, ...c, ...d);
            
            // generate uvs.
            uvs.push(0, 0);
            uvs.push(1, 0);
            uvs.push(1, 1);
            uvs.push(0, 1);
            
            // generate normals.
            const ab = vec3.subtract(vec3.create(), a, b);
            const bc = vec3.subtract(vec3.create(), b, c);
            
            const normal = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), ab, bc));
            
            normals.push(...normal, ...normal, ...normal, ...normal); // same normal for every vertex in this face.
            
        }
        
        const attributeBuffer = new ArrayBuffer(vertices.length * 4 + normals.length * 4 + uvs.length * 4); // 4, as in 4 bytes per element.
        
        const dataView = new DataView(attributeBuffer);
        
        // copy over vertices.
        for (let i = 0; i < vertices.length; i++) {
            dataView.setFloat32(i * 4, vertices[i], IS_LITTLE_ENDIAN);
        }
        
        // copy over normals.
        for (let i = 0; i < normals.length; i++) {
            dataView.setFloat32((vertices.length + i) * 4, normals[i], IS_LITTLE_ENDIAN);
        }
        
        // copy over uvs.
        for (let i = 0; i < uvs.length; i++) {
            dataView.setFloat32((vertices.length + normals.length + i) * 4, uvs[i], IS_LITTLE_ENDIAN);
        }
        
        const bufferView = new BufferView(attributeBuffer);
        
        let { min, max } = Primitive.getMinMax(vertices);
        
        
        const attributes = {
            POSITION: new Accessor(bufferView, COMPONENT.TYPE.FLOAT, 'VEC3', vertices.length, 0, min, max),
            NORMAL: new Accessor(bufferView, COMPONENT.TYPE.FLOAT, 'VEC3', normals.length, vertices.length * 4),
            TEXCOORD_0: new Accessor(bufferView, COMPONENT.TYPE.FLOAT, 'VEC2', uvs.length, vertices.length * 4 + normals.length * 4)
        };
        
        // set the size of indices dynamically based on the total number of vertices.
        let componentType = null;
        let indexBuffer = null;
        
        if (vertices.count < Math.pow(2, 8)) {
            componentType = COMPONENT.TYPE.UNSIGNED_BYTE;
            indexBuffer = new Uint8Array(indices);
        } else if (vertices.count < Math.pow(2, 16)) {
            componentType = COMPONENT.TYPE.UNSIGNED_SHORT;
            indexBuffer = new Uint16Array(indices);
        } else {
            componentType = COMPONENT.TYPE.UNSIGNED_INT;
            indexBuffer = new Uint32Array(indices);
        }
        
        const indicesAccessor = new Accessor(new BufferView(indexBuffer.buffer), componentType, 'SCALAR', indices.length);
        
        return new Primitive(attributes, material, indicesAccessor, mode);
    }
    
    /**
    * Generates a plane.
    * 
    * @param {Material} material 
    * @param {integer} mode 
    * @returns {Primitive}
    */
    static createPlane(material, mode) {
        
        if (typeof material === 'undefined') {
            throw Error('A Material-instance must be passed as an argument.');
        }
        
        const vertices = [
            -0.5, 0, 0.5, // a
            0.5, 0, 0.5,  // b
            0.5, 0, -0.5, // c
            
            -0.5, 0, 0.5, // a
            0.5, 0, -0.5, // c
            -0.5, 0, -0.5 // d
        ];
        
        const normals = [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ];
        
        const uvs = [
            0, 0, // a
            1, 0, // b
            1, 1, // c
            0, 0, // a
            1, 1, // c
            0, 1  // d
        ];
        
        
        const bufferView = new BufferView(new Float32Array(vertices.concat(normals, uvs)).buffer);
        
        const { min, max } = Primitive.getMinMax(vertices);
        
        const attributes = {
            POSITION: new Accessor(bufferView, COMPONENT.TYPE.FLOAT, 'VEC3', vertices.length, 0, min, max),
            NORMAL: new Accessor(bufferView, COMPONENT.TYPE.FLOAT, 'VEC3', normals.length, vertices.length * 4),
            TEXCOORD_0: new Accessor(bufferView, COMPONENT.TYPE.FLOAT, 'VEC2', uvs.length, vertices.length * 4 + normals.length * 4)
        };
        
        return new Primitive(attributes, material, null, mode);
    }
    
    /**
    * Utility functions for createSphere:
    */
    /**
    * Converts spherical coordinates to cartesian.
    * @param {float} theta 
    * @param {float} phi 
    */
    static sphericalToCartesian(theta, phi) {
        return vec3.fromValues(Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta));
    }
    
    /**
     * Swaps the Y- and Z-component.
     * @param {vec3} v 
     */
    static swapYZ(v) {
        let z = v[2];
        v[2] = v[1];
        v[1] = z;
        return v;
    }
    
    /**
    * Generates a box, and returns a primitive.
    * 
    * @param {segments} number of vertical segments
    * @param {rings} number of horizontal rings
    * @param {Material} material 
    * @param {integer} mode 
    * @param {boolean} [flipNormals=false]
    * @returns {Primitive}
    */
    static createSphere(material, numLatitudeLines = 32, numLongitudeLines = 32, mode) {
        
        const vertices = [];
        const uvs = [];
        const normals = [];
        
        for (let t = 0; t < numLatitudeLines; t++) {
            
            let theta1 = (t / numLatitudeLines) * Math.PI;
            let theta2 = ((t + 1) / numLatitudeLines) * Math.PI;
            
            for (let p = 0; p < numLongitudeLines; p++) {
                
                let phi1 = (p / numLongitudeLines) * 2 * Math.PI;
                let phi2 = ((p + 1) / numLongitudeLines) * 2 * Math.PI;
                
                //phi2   phi1
                // |      |
                // 2------1 -- theta1
                // |\ _   |
                // |    \ |
                // 3------4 -- theta2
                
                const vertex1 = Primitive.swapYZ(Primitive.sphericalToCartesian(theta1, phi1));
                const vertex2 = Primitive.swapYZ(Primitive.sphericalToCartesian(theta1, phi2));
                const vertex3 = Primitive.swapYZ(Primitive.sphericalToCartesian(theta2, phi2));
                const vertex4 = Primitive.swapYZ(Primitive.sphericalToCartesian(theta2, phi1));

                // Flip u.
                const u1 = 1.0 - (p / numLongitudeLines);
                const u2 = 1.0 - ((p + 1) / numLongitudeLines);
                const v1 = (t / numLatitudeLines);
                const v2 = ((t + 1) / numLatitudeLines);
                
                const uv1 = vec2.fromValues(u1, v1);
                const uv2 = vec2.fromValues(u2, v1);
                const uv3 = vec2.fromValues(u2, v2);
                const uv4 = vec2.fromValues(u1, v2);
                
                const normal1 = vec3.normalize(vec3.create(), vertex1);
                const normal2 = vec3.normalize(vec3.create(), vertex2);
                const normal3 = vec3.normalize(vec3.create(), vertex3);
                const normal4 = vec3.normalize(vec3.create(), vertex4);
                
                if (t == 0) {
                    vertices.push(...vertex1, ...vertex3, ...vertex4);
                    uvs.push(...uv1, ...uv3, ...uv4);
                    normals.push(...normal1, ...normal3, ...normal4);
                } else if (t + 1 == numLatitudeLines) {
                    vertices.push(...vertex3, ...vertex1, ...vertex2);
                    uvs.push(...uv3, ...uv1, ...uv2);
                    normals.push(...normal3, ...normal1, ...normal2);
                } else {
                    vertices.push(...vertex1, ...vertex2, ...vertex4);
                    vertices.push(...vertex2, ...vertex3, ...vertex4);
                    
                    uvs.push(...uv1, ...uv2, ...uv4);
                    uvs.push(...uv2, ...uv3, ...uv4);
                    
                    normals.push(...normal1, ...normal2, ...normal4);
                    normals.push(...normal2, ...normal3, ...normal4);
                }
            }
        }
        
        const attributeBuffer = new ArrayBuffer(vertices.length * 4 + normals.length * 4 + uvs.length * 4); // 4, as in 4 bytes per element.
        const dataView = new DataView(attributeBuffer);
        
        // copy over vertices.
        for (let i = 0; i < vertices.length; i++) {
            dataView.setFloat32(i * 4, vertices[i], IS_LITTLE_ENDIAN);
        }
        
        // copy over normals.
        for (let i = 0; i < normals.length; i++) {
            dataView.setFloat32((vertices.length + i) * 4, normals[i], IS_LITTLE_ENDIAN);
        }
        
        // copy over uvs.
        for (let i = 0; i < uvs.length; i++) {
            dataView.setFloat32((vertices.length + normals.length + i) * 4, uvs[i], IS_LITTLE_ENDIAN);
        }
        
        const bufferView = new BufferView(attributeBuffer);
        
        let { min, max } = Primitive.getMinMax(vertices); // Get the bounding box.
        
        const attributes = {
            POSITION: new Accessor(bufferView, COMPONENT.TYPE.FLOAT, 'VEC3', vertices.length, 0, min, max),
            NORMAL: new Accessor(bufferView, COMPONENT.TYPE.FLOAT, 'VEC3', normals.length, vertices.length * 4),
            TEXCOORD_0: new Accessor(bufferView, COMPONENT.TYPE.FLOAT, 'VEC2', uvs.length, vertices.length * 4 + normals.length * 4)
        };
        
        return new Primitive(attributes, material, null, mode);
        
    }
    
}