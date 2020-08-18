# Object.js

Object 对象工具。



``` javascript
const $Object = require('@definejs/object');

const objt = {
    a: 1,
    b: 2,
    c: {
        aa: 11,
        bb: 22,
    },
};

//指定第一个参数为 true，则可以深层次迭代。
$Object.each(true, obj, (key, value) => {
    console.log(key, value);
});

//依次输出
//a 1
//b 2
//aa 11
//bb 22

```

## 方法

### deepAssign(target, ...args)
深度扩展（拷贝）多个对象到目标对象上。
``` javascript
const $Object = require('@definejs/object');

var objA = {
    a: 1,
    b: 2,
    c: {
    	aa: 11,
        bb: 22,
    },
};

var objB = {
	v: 4,
    c: {
    	aa: 100,
        vv: 200,
    },
    
};

$Object.deepAssign(objA, objB);

//结果如下：

objA = {
    a: 1,
    b: 2,
    v: 4,
    c: {
    	aa: 100,
        bb: 22,
        vv: 200,
    },
};

```

### filter(src, samples) 
对一个对象进行成员过滤，返回一个过滤后的新对象。

``` javascript
const $Object = require('@definejs/object');

var src = {
    a: 100,
    b: 200,
    c: 300,
    d: 400,
};

var samples = {
    a: 1,
    b: 2,
};

//或 samples = ['a', 'b'];

var target = $Object.filter(src, samples);
//得到 
target = { 
	a: 100, 
    b: 200, 
}; 
//只保留 samples 中指定的成员，其他的去掉.
```