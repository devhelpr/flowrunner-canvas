/* tslint:disable */
import * as wasm from './crate_wasm_bg.wasm';

/**
* @returns {void}
*/
export function init() {
    return wasm.init();
}

let cachedTextEncoder = new TextEncoder('utf-8');

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

let WASM_VECTOR_LEN = 0;

function passStringToWasm(arg) {

    if (typeof(arg) !== 'string') throw new Error('expected a string argument');

    const buf = cachedTextEncoder.encode(arg);
    const ptr = wasm.__wbindgen_malloc(buf.length);
    getUint8Memory().set(buf, ptr);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8');

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

let cachedGlobalArgumentPtr = null;
function globalArgumentPtr() {
    if (cachedGlobalArgumentPtr === null) {
        cachedGlobalArgumentPtr = wasm.__wbindgen_global_argument_ptr();
    }
    return cachedGlobalArgumentPtr;
}

let cachegetUint32Memory = null;
function getUint32Memory() {
    if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory;
}
/**
* @param {string} arg0
* @returns {string}
*/
export function greet(arg0) {
    const ptr0 = passStringToWasm(arg0);
    const len0 = WASM_VECTOR_LEN;
    const retptr = globalArgumentPtr();
    try {
        wasm.greet(retptr, ptr0, len0);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getStringFromWasm(rustptr, rustlen).slice();
        wasm.__wbindgen_free(rustptr, rustlen * 1);
        return realRet;


    } finally {
        wasm.__wbindgen_free(ptr0, len0 * 1);

    }

}

/**
*/
export const FlowTask = Object.freeze({ Nop:0,Assign:1,Matrix:2,SetVariable:3,GetVariable:4,GetParameter:5,Operation:6,OperationVariable:7,If:8, });
/**
*/
export const FlowTaskCondition = Object.freeze({ Nop:0,Equals:1,LowerEquals:2,Lower:3, });
/**
*/
export const FlowTaskMode = Object.freeze({ Nop:0,IntegerMode:1,FloatMode:2,StringMode:3, });

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}
/**
*/
export const Cell = Object.freeze({ Dead:0,Alive:1, });

function _assertNum(n) {
    if (typeof(n) !== 'number') throw new Error('expected a number argument');
}

const __widl_f_log_1__target = console.log;

export function __widl_f_log_1_(arg0) {
    __widl_f_log_1__target(getObject(arg0));
}

function freeUniverse(ptr) {

    wasm.__wbg_universe_free(ptr);
}
/**
*/
export class Universe {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        const obj = Object.create(Universe.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        freeUniverse(ptr);
    }

    /**
    * @returns {void}
    */
    tick() {
        if (this.ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        return wasm.universe_tick(this.ptr);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @param {string} arg2
    * @returns {Universe}
    */
    static new(arg0, arg1, arg2) {
        _assertNum(arg0);
        _assertNum(arg1);
        const ptr2 = passStringToWasm(arg2);
        const len2 = WASM_VECTOR_LEN;
        try {
            return Universe.__wrap(wasm.universe_new(arg0, arg1, ptr2, len2));

        } finally {
            wasm.__wbindgen_free(ptr2, len2 * 1);

        }

    }
    /**
    * @returns {string}
    */
    render() {
        if (this.ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const retptr = globalArgumentPtr();
        wasm.universe_render(retptr, this.ptr);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getStringFromWasm(rustptr, rustlen).slice();
        wasm.__wbindgen_free(rustptr, rustlen * 1);
        return realRet;

    }
}

function freeFlowrunner(ptr) {

    wasm.__wbg_flowrunner_free(ptr);
}
/**
*/
export class Flowrunner {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    static __wrap(ptr) {
        const obj = Object.create(Flowrunner.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        freeFlowrunner(ptr);
    }

    /**
    * @param {string} arg0
    * @returns {any}
    */
    convert(arg0) {
        if (this.ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ptr0 = passStringToWasm(arg0);
        const len0 = WASM_VECTOR_LEN;
        try {
            return takeObject(wasm.flowrunner_convert(this.ptr, ptr0, len0));

        } finally {
            wasm.__wbindgen_free(ptr0, len0 * 1);

        }

    }
    /**
    * @returns {void}
    */
    test() {
        if (this.ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        return wasm.flowrunner_test(this.ptr);
    }
    /**
    * @param {string} arg0
    * @param {string} arg1
    * @returns {Flowrunner}
    */
    static new(arg0, arg1) {
        const ptr0 = passStringToWasm(arg0);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm(arg1);
        const len1 = WASM_VECTOR_LEN;
        try {
            return Flowrunner.__wrap(wasm.flowrunner_new(ptr0, len0, ptr1, len1));

        } finally {
            wasm.__wbindgen_free(ptr0, len0 * 1);
            wasm.__wbindgen_free(ptr1, len1 * 1);

        }

    }
}

function freeFlow(ptr) {

    wasm.__wbg_flow_free(ptr);
}
/**
*/
export class Flow {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        freeFlow(ptr);
    }

}

function freePayload(ptr) {

    wasm.__wbg_payload_free(ptr);
}
/**
*/
export class Payload {

    constructor() {
        throw new Error('cannot invoke `new` directly');
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        freePayload(ptr);
    }

}

export function __wbindgen_object_drop_ref(i) { dropObject(i); }

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    if (typeof(heap_next) !== 'number') throw new Error('corrupt heap');

    heap[idx] = obj;
    return idx;
}

export function __wbindgen_string_new(p, l) {
    return addHeapObject(getStringFromWasm(p, l));
}

export function __wbindgen_json_parse(ptr, len) {
    return addHeapObject(JSON.parse(getStringFromWasm(ptr, len)));
}

export function __wbindgen_throw(ptr, len) {
    throw new Error(getStringFromWasm(ptr, len));
}

