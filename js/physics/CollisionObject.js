
export default class CollisionObject {

    constructor(mesh) {

        this.mesh = mesh;

        this.dynamic = false;

        this.health = 0;

        this._onIntersect = null;

        this._destroy = false;

    }

    setOnIntersectListener(listener) {
        this._onIntersect = listener.bind(this);
    }

    destroy() {
        this._destroy = true;
    }
 }