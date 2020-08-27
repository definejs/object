
function copy(A, B) {
    A = A || {};

    for (let key in B) {
        let source = A[key];
        let target = B[key];

        if (exports.isPlain(target)) {
            source = exports.isPlain(source) ? copy({}, source) : {};
            target = copy(source, target);
        }

        A[key] = target;
    }

    return A;
}


/**
* Object 对象工具。
*/
module.exports = exports = {
    /**
    * 深度扩展（拷贝）多个对象到目标对象上。
    * @param {Object} target 目标对象。
    * @param {Array} ...args 需要拷贝的对象列表。
    */
    deepAssign(target, ...args) {
        args.forEach((item) => {
            target = copy(target, item);
        });

        return target;
    },
    /**
    * 检测对象是否是空对象(不包含任何属性)。
    * 该方法既检测对象本身的属性，也检测从原型继承的属性(因此没有使用 hasOwnProperty )。
    * 该实现为 jQuery 的版本。
    * @param {Object} obj 要进行检测的对象，可以是任何类型。
    * @return {boolean} 一个检测结果，如果为空对象则返回 true；否则返回 false。
    * @example
    *   $Object.isEmpty({});      //true
    * @example
    *   function Person(){ }
    *   Person.prototype.name = 'abc';
    *   var p = new Person();
    *   $Object.isEmpty( p );   //false
    */
    isEmpty(obj) {
        for (let name in obj) {
            return false;
        }

        return true;
    },
    /**
    * 检测一个对象是否是纯粹的对象（通过 "{}" 或者 "new Object" 创建的）。
    * 该实现为 jQuery 的版本。
    * @param {Object} obj 要进行检测的对象，可以是任何类型。
    * @return {boolean} 一个检测结果，如果为纯粹的对象则返回 true；否则返回 false。
    * @example
    *   $Object.isPlain( {} );             //true
    *   $Object.isPlain( {a: 1, b: {} } );  //true
    * @example      
    *   function Person(){ }
    *   var p = new Person();
    *   $Object.isPlain( p );   //false
    */
    isPlain(obj) {
        if (!obj || typeof obj != 'object' /*|| obj.nodeType || exports.isWindow(obj) */) {
            return false;
        }

        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var constructor = obj.constructor;

        try {
            // Not own constructor property must be Object
            if (constructor &&
                !hasOwnProperty.call(obj, "constructor") &&
                !hasOwnProperty.call(constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        }
        catch (e) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        var key;
        for (key in obj) {
        }

        return key === undefined || hasOwnProperty.call(obj, key);
    },
    /**
    * 把一个对象的键/值对深层次地扁平化成一个数组。
    * @param {Object} obj 要进行线性化的纯对象。
    * @return {Array} 返回一个线性化表示的一维数组。
    *   数组的每项都为一个 { keys: [], value: ... } 的结构。
    * @example
        var list = $Object.flat({
            name: {
                a: 1,
                b: 2,
                c: {
                    aa: 11,
                    bb: 22,
                },
            },
            tag: {
                a: 'a0',
                b: 'b0',
            },
            id: 1000,
        });
        console.dir(list);
        //得到: 
        [
            { keys: ['name', 'a'], value: 1 },
            { keys: ['name', 'b'], value: 2 },
            { keys: ['name', 'c', 'aa'], value: 11 },
            { keys: ['name', 'c', 'bb'], value: 22 },
            { keys: ['tag', 'a'], value: 'a0' },
            { keys: ['tag', 'b'], value: 'b0' },
            { keys: ['id'], value: 1000 },
        ]
    */
    flat(obj) {
        let isPlain = exports.isPlain;
        let list = [];

        if (!obj || !isPlain(obj)) {
            return list;
        }


        let keys = [];

        /**
        * @inner
        * 内部使用的迭代函数。
        * @param {Object} obj 要进行迭代的对象。
        * @param {number} level 用来跟踪当前迭代键值所处的层次深度，辅助用的。
        */
        function each(obj, level) {
            for (let key in obj) {
                let value = obj[key];

                keys = keys.slice(0, level);
                keys.push(key);

                if (isPlain(value)) {   //还是一个纯对象
                    each(value, level + 1);     //递归处理
                    continue;
                }

                //叶子结点
                list.push({
                    'keys': keys,
                    'value': value
                });
            }
        }

        each(obj, 0);

        return list;
    },
    /**
    * 使用过滤函数对指定的对象进行过滤数，返回一个新对象。
    * @param {Object} target 要进行过滤的对象。
    * @param {function} fn 过滤函数。
    *   过滤函数会接收到两个参数：当前对象中迭代中的 key 和 value。
    *   过滤函数必须明确返回 true 以保留该成员，其它值则删除该成员。
    * @return {Object} 返回一个过滤后的纯对象。
    */
    grep(target, fn) {
        let obj = {};

        for (let key in target) {
            let value = target[key];
            let test = fn(key, value);

            //只有回调函数中明确返回 true 才保留该成员。
            if (test === true) {
                obj[key] = value;
            }
        }

        return obj;
    },
    /**
    * 对一个对象进行迭代。
    * 该方法可以代替 `for...in` 的语句。
    * 只有在回调函数中明确返回 false 才停止循环。
    * 已重载 each(obj, fn);
    * 已重载 each(deep, obj, fn);
    * @param {boolen} [deep=false] 
    *   指示是否要进行深层次的迭代，如果是，请指定 true；
    *   否则请指定 false 或不指定。 默认为 false，即浅迭代。
    * @param {Object} obj 要进行迭代处理的对象
    * @param {function} fn 要进行迭代处理的回调函数。
    *   该函数中会接收到当前对象迭代的到 key 和 value 作为参数。
    *   只有在此函数中明确返回 false 才会停止迭代。
    */
    each(deep, obj, fn) {
        //重载 each(obj, fn); 此时 deep 为 false。
        if (typeof deep != 'boolean') {
            fn = obj;
            obj = deep;
            deep = false;
        }


        for (let key in obj) {
            let value = obj[key];
            let test = fn(key, value, obj);

            // 只有在 fn 中明确返回 false 才停止循环。
            if (test === false) {
                break;
            }

            //指定了深迭代，并且当前 value 为非 null 的对象。
            if (deep === true && value && typeof value == 'object') {
                exports.each(true, value, fn); //递归
            }
        }
    },

    /**
    * 对一个对象进行迭代。
    * 该方法可以代替 `for...in` 的语句。
    * 只有在回调函数中明确返回 false 才停止循环。
    * 已重载 each(obj, fn);
    * @param {boolen} [deep=false] 指示是否要进行深层次的迭代。
    *   如果是，请指定 true；
    *   否则请指定 false 或不指定。 默认为 false，即浅迭代。
    * @param {Object} obj 要进行迭代处理的对象。
    * @param {function} fn 要进行迭代处理的回调函数，该函数中会接收到当前对象迭代的到 key 和 value 作为参数。
    */
    map(deep, obj, fn) {
        //重载 map(obj, fn); 此时 deep 为 false。
        if (typeof deep != 'boolean') {
            fn = obj;
            obj = deep;
            deep = false;
        }

        let isPlain = exports.isPlain;
        let map = exports.map;
        let target = {};

        for (let key in obj) {
            let value = obj[key];

            //指定了深迭代，并且当前 value 为纯对象。
            if (deep && isPlain(value)) {
                target[key] = map(true, value, fn); //递归
            }
            else {
                target[key] = fn(key, value);
            }
        }

        return target;
    },
    /**
    * 用指定的多个键和单个值组合生成一个深层次的对象。
    * 已重载 make(keys, value);        //没有显式提供一个容器对象，则内部提供一个空的。
    * 已重载 make(obj, keys, value);   //使用指定的容器对象。
    * 如：make(['A', 'B', 'C'], 100) => { A: { B: { C: 100, }, }, }
    * 参数：
    *   obj: {},    //容器对象。 如果(可以)不指定，则内部提供一个空白的全新对象。
    *   keys: [],   //键列表。 如 ['A', 'B', 'C']。
    *   value: any, //值。
    */
    make(obj, keys, value) {
        //重载 make(keys, value);
        //没有显式提供一个容器对象，则内部提供一个空的。
        if (Array.isArray(obj)) {
            value = keys;
            keys = obj;
            obj = {};
        }

        if (!obj || typeof obj != 'object') {
            throw new Error('参数 obj 必须为一个非空的对象，以作为容器对象。');
        }

        let item = obj;
        let maxIndex = keys.length - 1; //判断是否为最后一个。

        //依次组装。
        keys.map(function (key, index) {
            let old = item[key];

            //非最后一项，则保证创建一个 {} 作为容器。
            //这意味着，如果原来的值不是对象，则会因为给新的 {} 覆盖而丢失。
            if (index < maxIndex) {
                item = item[key] = (typeof old == 'object') ? old || {} : {};
            }
            else { //最后一项，直接赋值。
                item[key] = value;
            }

        });

        return obj;
    },
    /**
    * 对一个对象进行成员过滤，返回一个过滤后的新对象。
    * 该方法可以以某个模板对指定对象进行成员拷贝。
    * @param {Object} src 要进行拷贝的对象，即数据来源。
    * @param {Array|Object|string} samples 要拷贝的成员列表(模板)。
    * @return {Object} 返回一个过滤后的新对象。
    * @example
        var src = {
            a: 100,
            b: 200,
            c: 300,
            d: 400
        };
 
        var samples = {
            a: 1,
            b: 2
        };
 
        //或 samples = ['a', 'b'];
 
        var obj = $Object.filter(src, samples);
        console.dir(obj); //得到 obj = { a: 100, b: 200 }; 只保留 samples 中指定的成员，其他的去掉.
    */
    filter(src, samples) {
        let obj = {};

        if (Array.isArray(samples)) {
            samples.forEach(function (key, index) {
                if (key in src) {
                    obj[key] = src[key];
                }
            });
        }
        else if (exports.isPlain(samples)) {
            exports.each(samples, function (key, value) {
                if (key in src) {
                    obj[key] = src[key];
                }
            });
        }
        else if (typeof samples == 'string') {
            let key = samples;
            if (key in src) {
                obj[key] = src[key];
            }
        }
        else {
            throw new Error('无法识别参数 samples 的类型');
        }

        return obj;
    },
    /**
    * 删除对象中指定的成员，返回一个新对象。
    * 指定的成员可以以单个的方式指定，也可以以数组的方式指定(批量)。
    * @param {Object} obj 要进行处理的对象。
    * @param {String|Array|Object} keys 要删除的成员名称，可以是单个，也可以是批量。
    * @return {Object} 返回一个被删除相应成员后的新对象。
    * @example
        var obj = {
            a: 1, 
            b: 2, 
            c: 3
        };

        var o = $Object.delete(obj, ['a', 'c']); //移除成员 a 和 c 
        console.dir(o); //得到 o = { b: 2 };

        o = $Object.delete(obj, {a: 1, b: 2});
        console.dir(o); //得到 o = { c: 3 };
    */
    delete(obj, keys) {
        let target = Object.assign({}, obj); //浅拷贝一份

        if (typeof keys == 'string') {
            delete target[keys];
        }
        else if (Array.isArray(keys)) {
            for (let i = 0, len = keys.length; i < len; i++) {
                delete target[keys[i]];
            }
        }
        else {
            for (let key in keys) {
                delete target[key];
            }
        }

        return target;
    },
};