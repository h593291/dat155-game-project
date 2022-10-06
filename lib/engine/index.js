
/**
 * A simple WebGL2 graphics engine.
 */

export { default as Renderer } from './src/Renderer.js';
export { default as Node } from './src/Node.js';
export { default as Scene } from './src/Scene.js';

export { default as Mesh } from './src/mesh/Mesh.js';
export { default as Primitive } from './src/mesh/Primitive.js';
export { default as Light } from './src/light/Light.js';

export { default as Shader } from './src/materials/Shader.js';
export { default as Material } from './src/materials/Material.js';

export { default as PhongMaterial } from './src/materials/PhongMaterial.js';
export { default as BasicMaterial } from './src/materials/BasicMaterial.js';
export { default as CubeMapMaterial } from './src/materials/CubeMapMaterial.js';

export { default as PerspectiveCamera } from './src/camera/PerspectiveCamera.js';

export {
    glMatrix,
    mat2, mat2d, mat3, mat4,
    quat, quat2,
    vec2, vec3, vec4,
} from './lib/gl-matrix/src/index.js';