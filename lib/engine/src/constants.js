
export const COMPONENT = Object.freeze({
    SIZE: Object.freeze({
        '5120': 1,
        '5121': 1,
        '5122': 2,
        '5123': 2,
        '5125': 4,
        '5126': 4
    }),
    TYPE: Object.freeze({
        BYTE: 5120,
        UNSIGNED_BYTE: 5121,
        SHORT: 5122,
        UNSIGNED_SHORT: 5123,
        UNSIGNED_INT: 5125,
        FLOAT: 5126
    }),
    ID: Object.freeze({
        '5120': 'BYTE',
        '5121': 'UNSIGNED_BYTE',
        '5122': 'SHORT',
        '5123': 'UNSIGNED_SHORT',
        '5125': 'UNSIGNED_INT',
        '5126': 'FLOAT'
    })
});

export const TYPE = Object.freeze({
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
});

export const ATTRIBUTE = Object.freeze({
    POSITION: 0,
    NORMAL: 1,
    TANGENT: 2,
    TEXCOORD_0: 3,
    TEXCOORD_1: 4,
    COLOR_0: 5,
    JOINTS_0: 6,
    WEIGHTS_0: 7
});

export const BINDING = Object.freeze({
    LIGHT: 0
});

export const IS_LITTLE_ENDIAN = new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] === 0x78;