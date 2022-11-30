let PENDING = 'pending'
let RESOLVED = 'resolved'
let REJECTED = 'rejected'

function myPromise (fn) {
    let that = this
    that.status = PENDING
    that.value = null
    that.resolvedCallbacks = []
    that.rejectedCallbacks = []

    try {
        fn(resolve, reject)
    } catch (e) {
        reject(e)
    }

    function resolve (value) {
        if (that.status === PENDING) {
            that.status = RESOLVED
            that.value = value
            that.resolvedCallbacks.map((cb)=>{
                return cb(that.value)
            })
        }
    }

    function reject (value) {
        if (that.status === PENDING) {
            that.status = REJECTED
            that.value = value
            that.rejectedCallbacks.map((cb)=>{
                return cb(that.value)
            })
        }
    }
}

myPromise.then = function (onFulfilled, onRejected) {
    const that = this
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : (r) => { throw r}

    if (that.status === PENDING) {
        that.resolvedCallbacks.push(onFulfilled)
        that.rejectedCallbacks.push(onRejected)
    }

    if (that.status === RESOLVED) {
        onFulfilled(that.value)
    }   

    if (that.status === REJECTED) {
        onRejected(that.value)
    }
}

Promise.myAll = function (arr) {
    let index = 0
    let result = []

    return new Promise((resolve, reject)=>{
        for (let i=0;i<arr.length;i++) {
            arr[i].then((res)=>{
                result[i] = res
                index ++

                if (index === arr.length) {
                    resolve(result)
                }
            }, reject)
        }
    })
}

Promise.myRace = function (arr) {
    return new Promise((resolve, reject)=>{
        for (let i=0;i<arr.length;i++) {
            arr[i].then((res)=>{
                resolve(res)
            }, reject)
        }
    })
}