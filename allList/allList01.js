Function.prototype.myCall = function (ctx, ...args) {
    if (typeof this !== 'function') {
        throw new TypeError('Error')
    }
    ctx = ctx || window
    let symbolFn = Symbol('fn')
    ctx[symbolFn] = this
    const result = ctx.fn(...args)
    delete ctx.symbolFn
    return result
}

Function.prototype.myApply = function (ctx, args) {
    if (typeof this !== 'function') {
        throw new TypeError('Error')
    }
    ctx = ctx || window
    let symbolFn = Symbol('fn')
    let result
    ctx[symbolFn] = this
    if (args) {
        result = ctx.symbolFn(...args)
    } else {
        result = ctx.symbolFn()
    }
    
    delete ctx.symbolFn
    return result
}

Function.prototype.myBind = function(ctx, ...args) {
    if (typeof this !== 'function') {
        throw new TypeError('Error')
    }
    const _this = this
    return function F() {
        // new 不会被任何方式改变this
        if(this instanceof F) {
            return new _this(...args, ...arguments)
        }
        return _this.apply(context, args.concat(...arguments))
    }
}

function myNew(Con, ...args) {
    let obj = {}
    obj.__proto__ = Con.prototype
    let result = Con.apply(obj, args)
    return result instanceof Object ? result : obj
}

function myInstanceof(left, right) {
    let l = left.__proto__
    let r = right.prototype

    while (l) {
        if (l===r) {
            return true
        }
        l = l.__proto__
    }
    return false
}


function throttle(fn, delay) {
    let last = 0
    return function (...args) {
        let now = new Date().getTime()
        if (now - last > delay ) {
            fn.apply(this, args)
            last = now
        }
    }
}

function debounce(fn, delay) {
    let timer = null
    return function (...args) {
        clearTimeout(timer)
        timer = setTimeout(()=>{
            fn.apply(this, args)
        }, delay)
    }
} 


// 去重
// 测试用例
// [1, 1, '1', '1', null, null, undefined, 
// undefined, new String('1'), new String('1'), /a/, /a/, NaN, NaN];
function unique(arr) {
    // for循环 indexOf NaN不去重

    // 对象不去重，正则不去重，NaN去重（等同于[...new Set(arr)] ） 
    let map = new Map()
    return arr.filter((item)=>{
        return map.has(item) ? false : (map.set(item, 1))
    })

    // 全部去重
    var obj = {};
    return arr.filter(function(item){
        return obj[typeof item + item] ? false : (obj[typeof item + item] = true)
    })
}

let arr = [1, 1, '1', '1', null, null, undefined, undefined, new String('1'), new String('1'), /a/, /a/, NaN, NaN];
console.log(unique(arr))

