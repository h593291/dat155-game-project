
export default class PhysicsManager {

    /**
     * MDN article on intersection: https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection
     */
    static intersectAABB(a, b) {
        return (a.min[0] <= b.max[0] && a.max[0] >= b.min[0])
            && (a.min[1] <= b.max[1] && a.max[1] >= b.min[1])
            && (a.min[2] <= b.max[2] && a.max[2] >= b.min[2]);
    }

    constructor() {
        this.entities = [];
    }

    add(entity) {
        if (entity && this.entities.indexOf(entity) === -1) {
            this.entities.push(entity);
        }
    }

    /**
     * Note! Do not use this method in an intersect listener. It will cause undefined behaviour.
     * Instead call .destroy() on the entity you want to delete.
     * @param {} entity 
     */
    remove(entity) {
        if (entity) {
            let index = this.entities.indexOf(entity);

            if (index !== -1) {
                this.entities.splice(index, 1);
            }
        }
    }

    update(delta) {

        // remove entities marked for destruction.
        this.entities = this.entities.filter(entity => !entity._destroy);

        // Currently we assume that the meshes have axis-aligned bounding boxes,
        // but if a rotation is introduced to the worldMatrix we will have a problem.
        // We can implement some way to calculate a bounding box after having rotated the mesh,
        // i.e. transform the original bounding box and take the min-max of the new vertices (inaccurate but fast),
        // or transform every vertex of the model and take the min-max (precise but slow).
        // Alternatively use the separating axis theorem (SAT).

        for (let i = 0; i < this.entities.length; i += 1) {

            if (this.entities[i].dynamic === false) continue;

            for (let j = 0; j < this.entities.length; j += 1) {

                if (i === j) {
                    continue;
                }

                const e1 = this.entities[i];
                const e2 = this.entities[j];

                // assume axis-aligned bounding box.
                if (PhysicsManager.intersectAABB(e1.mesh.boundingBox, e2.mesh.boundingBox)) {

                    if (e1._onIntersect !== null) {
                        e1._onIntersect(delta, e2);
                    }

                    if (e2._onIntersect !== null) {
                        e2._onIntersect(delta, e1);
                    }
                    
                }

            }
        }

    }
}