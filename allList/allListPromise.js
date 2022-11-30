// Promise 简易版
const PENDING = 'pendding'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

function myPromise(fn) {
    // 代码可能异步执行
    const that = this
    that.state = PENDING
    that.value = null
    that.resolvedCallbacks = []
    that.rejectedCallbacks = []

    try {
        fn(resolve, reject)
    } catch (e) {
        reject(e)
    }

    function resolve(value) {
        if (that.state === PENDING) {
            that.state = RESOLVED
            that.value = value
            that.resolvedCallbacks.map(cb => cb(that.value))
        }
    }
    
    function reject(value) {
        if (that.state === PENDING) {
            that.state = REJECTED
            that.value = value
            that.rejectedCallbacks.map(cb => cb(that.value))
        }
    }
}

myPromise.prototype.then = function (onFulfilled, onRejected) {
    const that = this
    // 透传
    // Promise.resolve(4).then().then((value) => console.log(value))
    onFulfilled = typeof onFulfilled === 'function' ? 
                    onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? 
                    onRejected : v => { throw v }
    
    if (that.state === PENDING) {
        that.resolvedCallbacks.push(onFulfilled)
        that.rejectedCallbacks.push(onRejected)
    }
    if (that.state === RESOLVED) {
        onFulfilled(that.value)
    }
    if (that.state === REJECTED) {
        onRejected(that.value)
    }
}

Promise.myAll = function (arr) {
    let result = []
    let index = 0

    return new Promise((resolve, reject)=>{
        for (let i=0;i<arr.length;i++) {
            arr[i].then((res)=>{
                result[i] = res
                index++
                // 不能采用result.length来比较
                // result[i] 最后一个promise可能先执行完导致长度直接相等
                if (arr.length === index) {
                    resolve(result)
                }
            }, reject)
        }
    })
}

Promise.myRace = function (arr) {
    return new Promise((resolve, reject) => {
        for (let i=0;i<arr.length;i++) {
            arr[i].then((data)=>{
                resolve(data)
            }, reject)
        }
    })
}