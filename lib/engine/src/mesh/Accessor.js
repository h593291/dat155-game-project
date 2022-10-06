/**
 * Accessor
 * Data for primitives are stored in buffers and retrieved via accessors.
 */

export default class Accessor {

    /**
     * Creates an instance of Accessor.
     * @param {BufferView} bufferView
     * @param {integer} componentType
     * @param {string} type
     * @param {integer} count
     * @param {number[]} min
     * @param {number[]} max
     * @param {number} [byteOffset=0]
     * @param {boolean} [normalized=false]
     * @memberof Accessor
     */
    constructor(bufferView, componentType, type, count, byteOffset = 0, min, max, normalized = false) {

        this.bufferView = bufferView;

        this.type = type;
        this.componentType = componentType;

        this.byteOffset = byteOffset;
        this.count = count;

        this.min = min;
        this.max = max;

        this.normalized = normalized;

    }
}