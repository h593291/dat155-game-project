import { Mesh, Primitive, PhongMaterial } from '../../lib/engine/index.js';
import { CollisionObject } from '../physics/index.js';

export default class ObstacleManager {
    constructor(scene, physicsManager, floorTexture, blockTexture) {

        this.scene = scene;
        this.physicsManager = physicsManager;

        const boxMaterial = new PhongMaterial({
            shininess: 15,
            map: blockTexture
        });

        this.boxPrimitive = Primitive.createCube(boxMaterial);

        const floorMaterial = new PhongMaterial({
            shininess: 3,
            map: floorTexture
        });

        this.planePrimitive = Primitive.createPlane(floorMaterial);

        this.sizeX = 8;
        this.sizeY = 8 * 2;
        this.density = 0.10;

        this.nextChunk = null;
        this.currentChunk = null;
        this.previousChunk = null;

        this.offset = 6;

        this.reset();
    }

    generateChunk(offset, noBlocks = false) {

        const sizeX = this.sizeX;
        const sizeY = this.sizeY;
        const density = this.density;

        // create the floor:
        const floor = new Mesh([this.planePrimitive]);
        floor.applyScale(sizeX, 1, sizeY);
        floor.applyTranslation(0, -0.5, offset - (sizeY / 2));
        this.scene.add(floor);

        // generate blocks:
        const numberOfBlocks = Math.floor((sizeX * sizeY) * density);

        const blocks = [];
        const populated = new Map();

        if (noBlocks === false) {
            for (let i = 0; i < numberOfBlocks; i++) {

                let x = Math.floor(Math.random() * sizeX);
                let y = Math.floor(Math.random() * sizeY);

                while (true) {

                    if (populated.has((y * sizeX) + x)) {

                        x = Math.floor(Math.random() * sizeX);
                        y = Math.floor(Math.random() * sizeY);

                    } else {
                        break;
                    }

                }

                let block = new Mesh([this.boxPrimitive]);
                block.setTranslation(x - (sizeX / 2) + 0.5, 0, (y - (sizeY - 0.5)) + offset);
                this.scene.add(block);

                // add collision object.
                const blockCollisionObject = new CollisionObject(block);
                this.physicsManager.add(blockCollisionObject);

                blocks.push(blockCollisionObject);

            }
        }

        return { floor, blocks, offset };

    }

    destroyChunk(chunk) {

        if (chunk !== null) {
            this.scene.remove(chunk.floor);

            for (let block of chunk.blocks) {

                this.scene.remove(block.mesh);
                this.physicsManager.remove(block);

            }
        }

    }

    update(positionZ) {

        const offset = Math.floor(positionZ / this.sizeY) * this.sizeY; // position[2] is the z-component of the position vector.

        if (offset < this.offset && offset < this.currentChunk.offset) {

            // the player just entered the next chunk.

            // destroy the previous chunk.
            this.destroyChunk(this.previousChunk);
            this.previousChunk = this.currentChunk;

            // set next chunk as current chunk.
            this.currentChunk = this.nextChunk;

            // create a new next chunk.
            this.nextChunk = this.generateChunk(offset);

        }

        this.offset = offset;
    }

    reset() {

        this.offset = 6;

        if (this.previousChunk !== null) {
            this.destroyChunk(this.previousChunk);
            this.previousChunk = null;
        }

        if (this.currentChunk !== null) {
            this.destroyChunk(this.currentChunk);
            this.currentChunk = null;
        }

        if (this.nextChunk !== null) {
            this.destroyChunk(this.nextChunk);
            this.nextChunk = null;
        }


        this.nextChunk = this.generateChunk(0); // negative z is forward.
        this.currentChunk = this.generateChunk(this.sizeY, true);

    }
}