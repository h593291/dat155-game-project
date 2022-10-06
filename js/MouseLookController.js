
import { quat } from '../lib/engine/index.js';

export default class MouseLookController {

    constructor(camera) {
        this.camera = camera;

        this.pitch = 0;
        this.yaw = 0;
    }

    static toDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    update(pitch, yaw) {

        // Add new rotation to the current one:
        this.pitch += pitch;
        this.yaw += yaw;

        // Set camera rotation from euler angles:
        quat.fromEuler(this.camera.rotation, this.constructor.toDegrees(this.pitch), this.constructor.toDegrees(this.yaw), 0);

    }
    
}