/**
 * BufferView
 * A bufferView represents a subset of data in a buffer, defined by an integer offset into the buffer specified in the byteOffset property and a byteLength property to specify length of the buffer view.
 */

 /**
  * TODO: use target.
  */

export default class BufferView {
    constructor(buffer, byteLength, byteOffset = 0, target = null) {

        if (typeof buffer === 'undefined' || !(buffer instanceof ArrayBuffer)) {
            throw Error('Missing or invalid parameter \'buffer\'. Must be of type ArrayBuffer.');
        }

        this.buffer = buffer;

        if (byteLength === null) {
            this.byteLength = buffer.byteLength;
        } else {
            this.byteLength = byteLength;
        }

        this.byteOffset = byteOffset;

        this.target = target;

        // Reference to GL-buffer.
        this.glBuffer = null;

    }
}