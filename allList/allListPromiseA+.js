'use strict';

// Promise A+ 规范地址 https://promisesaplus.com/

const PENDING = 'PENDING'
const RESOLVED = 'RESOLVED'
const REJECTED = 'REJECTED'

/**
 * 
 * 如果一个Promise的then方法中的函数（成功和失败）
 * 返回的结果是一个Promise，会自动将这个Promise执行，并且**采用**他的状态,并将他的结果向外层的下一个then传递
 * 返回的结果是一个普通值， 会将这个普通值作为下一次的成功的结果
 * 返回一个pending的Promise，可以终止继续执行
 * 
 */
const resolvePromise = (promise2, x, resolve, reject) => {
    // 防止循环引用
    if (promise2 === x) {
        return reject(new TypeError('TypeError: Chaining cycle detected for promise #<Promise>'))
    }

    if (typeof x === 'function' || (typeof x === 'object' && x != null)) {
        // 成功和失败都调用的情况下 做屏蔽
        let called
        /**
         * try catch 是为了防止
         * Object.defineProperty(x,then, {
         *   get() {
         *      throw new Error()
         *   }
         * })
         * 来定义x
         */
        try {
            let then = x.then
            if (typeof then === 'function') {
                // 认为这是一个Promise
                // 少取一次then的值 规范2.3.3.3

                // y也可能是个promise,递归，直到解析出来的结果是一个普通值为止
                then.call(x, y => {
                    if (called) {
                        return
                    }
                    called = true
                    resolvePromise(promise2, y, resolve, reject)
                }, r => {
                    if (called) {
                        return
                    }
                    called = true
                    reject(r)
                }) 
            } else {
                // x是普通对象
                resolve(x)
            }
        } catch (e) {
            if (called) {
                return
            }
            called = true
            reject(e)
        }

    } else {
        // x是普通值
        resolve(x)
    }
}
class Promise {
    constructor (executor) {
        this.status = PENDING
        this.value = undefined
        this.reason = undefined

        this.onResolvedCallbacks = []
        this.onRejectedCallbacks = []
        // 使用箭头函数 保证this指向
        // === PENDING 屏蔽多次调用
        let resolve = (value) => {
            if (this.status === PENDING) {
                this.status = RESOLVED
                this.value = value
                this.onResolvedCallbacks.forEach(fn => fn()) // 发布
            }
        }

        let reject = (reason) => {
            if (this.status === PENDING) {
                this.status = REJECTED
                this.reason = reason
                this.onRejectedCallbacks.forEach(fn => fn())
            }
        }

        // 默认执行器立刻执行
        // 如果执行时发生错误 等价于调用了失败方法
        try {
            executor(resolve,reject)
        } catch (err) {
            reject(err)
        }
    }
    then (onfulfilled, onrejected) {
        // onfulfilled,onrejected 不传 则data直接穿透到下一层 
        /**
         * let p = new Promise((resolve,reject) => {
         *      resolve(1)
         * })
         * p.then().then().then((data) =>{ console.log(data) }) // 1
         * 
         */
        onfulfilled = typeof onfulfilled === 'function' ? onfulfilled : data => data
        onrejected = typeof onrejected === 'function' ? onrejected : err => { 
            throw err
        }

        // 因为需要链式调用 所以new了个promise
        let promise2 = new Promise((resolve,reject) => {
            if (this.status === RESOLVED) {
                // 通过异步 使得promise2能被执行完 从而拿到promise2
                // 但是遇到throw Error的情况 无法通过try catch捕获
                // 所以在内部添加了try catch
                setTimeout(()=>{
                    try {
                        // 规范2.2.4定义onfulfilled不能被调用在当前的执行上下文中
                        // 所以把onfulfilled放在setTimeout里面
                        let x = onfulfilled(this.value)
                        // 判断返回值x与promise2的关系
                        resolvePromise(promise2, x, resolve, reject)    
                    } catch (e) {
                        reject(e)
                    }
                }, 0)
            }
    
            if (this.status === REJECTED) {
                setTimeout(()=>{
                    try {
                        let x = onrejected(this.reason)
                        // 判断x的值与promise2的状态
                        resolvePromise(promise2, x, resolve, reject)    
                    } catch (e) {
                        reject(e)
                    }
                }, 0)
            }
    
            // Promise内部为异步函数，就先订阅
            if (this.status === PENDING) {
                /** 
                    为了给onfulfilled、onrejected传值
                */
                this.onResolvedCallbacks.push(()=>{
                    setTimeout(()=>{
                        try {
                            let x = onfulfilled(this.value)
                            // 判断x的值与promise2的状态
                            resolvePromise(promise2, x, resolve, reject)    
                        } catch (e) {
                            reject(e)
                        }
                    }, 0)
                })
                this.onRejectedCallbacks.push(()=>{
                    setTimeout(()=>{
                        try {
                            let x = onrejected(this.reason)
                            // 判断x的值与promise2的状态
                            resolvePromise(promise2, x, resolve, reject)    
                        } catch (e) {
                            reject(e)
                        }
                    }, 0)
                })
            }
        })
        
        return promise2
    }
}

// 延迟对象 测试这个库是否符合promise A+规范
Promise.defer = Promise.deferred = function () {
    let dfd = {}

    dfd.promise = new Promise((resolve, reject) => {
        dfd.resolve = resolve
        dfd.reject = reject
    })

    return dfd
}

// 非A+规范上的扩展方法
const isPromise = (value) => {
    if (typeof value === 'function' || (typeof value === 'object' && value != null)) {
        if (typeof value.then === 'function') {
            return true
        }
    }

    return false
}
Promise.all = function (values) {
    return new Promise((resolve, reject) => {
        let arr = []
        let index = 0

        function processData(key, value) {
            arr[key] = value
            index ++
            if (index === values.length) {
                resolve(arr)
            }
            // 异步会产生问题 
            // [1,2,async,4] 4完成了 异步尚未完成 长度已经是4了
            // if (arr.length === values.length) {
            //     resolve(arr)
            // }
        }

        
        // 因为promise是异步 所以注意这里不能用var(let var作用域问题)
        for (let i=0;i<values.length;i++) {
            let current = values[i]
            if(isPromise(current)) {
                current.then((data)=>{
                    processData(i,data)
                }, reject) // Promise.all全部成功才成功
            } else {
                processData(i,current)
            }
        }
    })
}

Promise.resolve = function(value){
    return new Promise((resolve,reject)=>{
        resolve(value);
    })
}
Promise.reject = function(value){
    return new Promise((resolve,reject)=>{
        reject(value);
    })
}

/** 
 * 
 * finally
 * 之后还能继续then、catch
 * 所以 finally 返回的是一个promise实例
 * 
*/
Promise.prototype.finally = function(callback){
    return this.then((data)=>{
        // 如果callback是一个函数返回promise 就等待这个promise执行完毕
        return Promise.resolve(callback()).then(()=>data);
    },(err)=>{
        return Promise.resolve(callback()).then(()=>{throw err});
    }); 
};

module.exports = Promise