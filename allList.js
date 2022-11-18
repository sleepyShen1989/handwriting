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