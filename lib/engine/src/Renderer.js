import { COMPONENT, TYPE, ATTRIBUTE, BINDING } from './constants.js';
import { mat4, mat3, vec4 } from '../lib/gl-matrix/src/index.js';

/**
 * A WebGL2 renderer.
 *
 * @class Renderer
 */
export default class Renderer {
    constructor(width, height) {
        this.domElement = document.createElement('canvas');
        this.domElement.width = width;
        this.domElement.height = height;

        this.gl = this.domElement.getContext('webgl2');

        if (!this.gl) {
            alert('WebGL 2.0 isn\'t available');
        }

        this.gl.viewport(0, 0, this.domElement.width, this.domElement.height);
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);

        this.lightUniformBuffer = this.gl.createBuffer();
        this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, BINDING.LIGHT, this.lightUniformBuffer);

        this.lightBuffer = null;
        this.numberOfLights = 0;

    }

    setSize(width, height) {
        this.domElement.width = width;
        this.domElement.height = height;
        this.gl.viewport(0, 0, this.domElement.width, this.domElement.height);
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    }

    initializeShader(primitive, numberOfLights = 0) {

        /// initiate shaderprogram
        let material = primitive.material;

        material.defines.NUMBER_OF_LIGHTS = numberOfLights;
        material.shader = new material.Shader(this.gl, material);

        const shader = material.shader;

        for (const name of shader.uniformBlocks) {
            this.gl.uniformBlockBinding(shader.program, this.gl.getUniformBlockIndex(shader.program, name), BINDING[name]);
        }

    }

    load(primitive, numberOfLights) {

        if (primitive.vao === null) {

            let vao = this.gl.createVertexArray();
            this.gl.bindVertexArray(vao);

            if (primitive.indices !== null) {

                let accessor = primitive.indices;
                let bufferView = accessor.bufferView;

                if (bufferView.glBuffer) {

                    // a buffer already exists on the GPU.
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, bufferView.glBuffer);

                } else {

                    // create buffer (allocates a buffer on the GPU and gives us a reference)
                    let buffer = this.gl.createBuffer();

                    // bind buffer to the ELEMENT_ARRAY_BUFFER target.
                    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);

                    let dataView = new DataView(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);

                    // upload the data.
                    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, dataView, this.gl.STATIC_DRAW);

                    bufferView.glBuffer = buffer;

                }

            }


            // create and link attribute accessors, and possibly upload bufferView to GPU.
            for (const name in primitive.attributes) {

                const accessor = primitive.attributes[name];
                const bufferView = accessor.bufferView;

                if (bufferView.glBuffer) {

                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferView.glBuffer);

                } else {

                    // create buffer and upload data.

                    const buffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

                    const dataView = new DataView(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);

                    this.gl.bufferData(this.gl.ARRAY_BUFFER, dataView, this.gl.STATIC_DRAW);

                    bufferView.glBuffer = buffer;

                }

                // setup and enable vertex attributes (Using the predefined and constant locations.)
                this.gl.vertexAttribPointer(ATTRIBUTE[name], TYPE[accessor.type], accessor.componentType, accessor.normalized, bufferView.byteStride, accessor.byteOffset);
                this.gl.enableVertexAttribArray(ATTRIBUTE[name]);

            }

            primitive.vao = vao;

            this.gl.bindVertexArray(null);

        }

        if (primitive.material.shader === null) {

            this.initializeShader(primitive, numberOfLights);

        }

    }

    draw(mesh, camera, numberOfLights) {

        const modelViewMatrix = mat4.multiply(mat4.create(), camera.viewMatrix, mesh.worldMatrix);
        const modelViewProjectionMatrix = mat4.multiply(mat4.create(), camera.projectionMatrix, modelViewMatrix);

        const normalMatrix = mat3.normalFromMat4(mat3.create(), modelViewMatrix);

        for (const primitive of mesh.primitives) {

            if (primitive.vao === null || primitive.material.shader === null) {
                this.load(primitive, numberOfLights);
            }

            if (primitive.material.defines.NUMBER_OF_LIGHTS !== numberOfLights) {

                // TODO: this is unneccessary if the shader does not use lights.
                // recompile shader with new number of lights.
                this.initializeShader(primitive, numberOfLights);

            }

            let shader = primitive.material.shader;
            this.gl.useProgram(shader.program);

            // upload the projection matrix, and the model view matrix:
            this.gl.uniformMatrix4fv(shader.uniformLocations.modelViewProjectionMatrix, false, modelViewProjectionMatrix);
            this.gl.uniformMatrix4fv(shader.uniformLocations.modelViewMatrix, false, modelViewMatrix);
            this.gl.uniformMatrix3fv(shader.uniformLocations.normalMatrix, false, normalMatrix);

            // upload shader specific uniforms:
            primitive.material.uploadUniforms(this.gl);

            // bind the geometry:
            this.gl.bindVertexArray(primitive.vao);

            if (primitive.indices) {

                const indices = primitive.indices;
                const offset = indices.byteOffset / COMPONENT.SIZE[indices.componentType];

                this.gl.drawElements(primitive.mode, indices.count, indices.componentType, offset);

            } else {
                this.gl.drawArrays(primitive.mode, 0, primitive.attributes.POSITION.count / 3);
            }

        }

    }

    render(scene, camera) {

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const lights = scene.getLightNodes();

        if (this.numberOfLights !== lights.length || this.lightBuffer === null) {
            this.lightBuffer = new Float32Array(4 + (lights.length * 12));
            this.numberOfLights = lights.length;
        }

        for (let i = 0; i < lights.length; i++) {

            const light = lights[i];

            const modelViewMatrix = mat4.multiply(mat4.create(), camera.viewMatrix, light.worldMatrix);
            const position = vec4.transformMat4(vec4.create(), [...light.translation, 1.0], modelViewMatrix);

            const offset = i * 12;

            this.lightBuffer[offset + 0] = position[0];
            this.lightBuffer[offset + 1] = position[1];
            this.lightBuffer[offset + 2] = position[2];
            this.lightBuffer[offset + 3] = position[3];

            this.lightBuffer[offset + 4] = light.diffuse[0];
            this.lightBuffer[offset + 5] = light.diffuse[1];
            this.lightBuffer[offset + 6] = light.diffuse[2];
            this.lightBuffer[offset + 7] = light.diffuse[3];
            
            this.lightBuffer[offset + 8] = light.specular[0];
            this.lightBuffer[offset + 9] = light.specular[1];
            this.lightBuffer[offset + 10] = light.specular[2];
            this.lightBuffer[offset + 11] = light.specular[3];

        }

        this.lightBuffer[lights.length * 12 + 0] = scene.ambient[0];
        this.lightBuffer[lights.length * 12 + 1] = scene.ambient[1];
        this.lightBuffer[lights.length * 12 + 2] = scene.ambient[2];
        this.lightBuffer[lights.length * 12 + 3] = scene.ambient[3];

        // TODO: Use bufferSubData when we're just updating data.
        this.gl.bufferData(this.gl.UNIFORM_BUFFER, this.lightBuffer, this.gl.DYNAMIC_DRAW);

        const meshes = scene.getMeshNodes();

        for (let mesh of meshes) {

            this.draw(mesh, camera, lights.length);

        }

    }

    loadTexture(url) {
        let image = new Image();

        image.src = url;

        let texture = this.gl.createTexture();

        this.gl.activeTexture(this.gl.TEXTURE0);

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.pixelStorei(this.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this.gl.NONE);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

        image.addEventListener('load', () => {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST_MIPMAP_LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        });

        return texture;
    }

    loadCubeMap(urls) {
        let ct = 0;
        let image = new Array(6);

        let cubeMap = this.gl.createTexture();

        for (let i = 0; i < 6; i++) {
            image[i] = new Image();
            image[i].addEventListener('load', () => {
                ct++;
                if (ct == 6) {

                    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, cubeMap);
                    this.gl.pixelStorei(this.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this.gl.NONE);

                    for (let j = 0; j < 6; j++) {

                        let target = this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + j;

                        this.gl.texImage2D(target, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image[j]);
                        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                        this.gl.texParameterf(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
                    }

                    this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
                }
            });
            image[i].src = urls[i];
        }

        return cubeMap;
    }
}