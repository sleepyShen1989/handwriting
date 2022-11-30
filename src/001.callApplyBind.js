function fn() {
    Function.prototype.myCall = function (ctx, ...args) {
        if (typeof this !== 'function') {
            throw new TypeError('Error')
        }
        let symbolFn = Symbol()
        ctx = ctx || window
        ctx[symbolFn] = this
        let result = ctx[symbolFn](...args)
        delete ctx[symbolFn]
        return result
    }
    
    Function.prototype.myApply = function (ctx, args) {
        if (typeof this !== 'function') {
            throw new TypeError('Error')
        }
        let symbolFn = Symbol()
        ctx = ctx || window
        ctx[symbolFn] = this
        let result
        if (args) {
            result = ctx[symbolFn](...args)
        } else {
            result = ctx[symbolFn]()
        }
        delete ctx[symbolFn]
        return result
    }
    
    Function.prototype.myBind = function (ctx, ...args) {
        if (typeof this !== 'function') {
            throw new TypeError('Error')
        }
        let _this = this
        return function F() {
            if (this instanceof F) {
                return new _this(...args, ...arguments)
            }
            return _this.apply(ctx, args.concat(...arguments))
        }
    }
}


module.exports = fn