const fn = require('../src/01.callApplyBind')
fn()

// myCall
test('myCall without arg', () => {
    let fn = function() {
        return this === window
    }
    expect(fn.myCall()).toBeTruthy();
});

test('myCall with 1 arg', () => {
    let obj = {a:1}
    let fn = function() {
        return this === obj
    }
    expect(fn.myCall(obj)).toBeTruthy();
});

test('myCall with more than 1 arg', () => {
    let obj = {a:1}
    let fn = function(...args) {
        let sum = 0
        for (let i=0;i<args.length;i++) {
            sum += args[i]
        }
        return {
            ctxBind: this === obj,
            argSum: sum
        }
    }

    expect(fn.myCall(obj, 1,2,3)).toEqual({ctxBind: true, argSum: 6});
});



// myApply
test('myApply without arg', () => {
    let fn = function() {
        return this === window
    }
    expect(fn.myApply()).toBeTruthy();
});

test('myApply with 1 arg', () => {
    let obj = {a:1}
    let fn = function() {
        return this === obj
    }
    expect(fn.myApply(obj)).toBeTruthy();
});

test('myApply with more than 1 arg', () => {
    let obj = {a:1}
    let fn = function(...args) {
        let sum = 0
        for (let i=0;i<args.length;i++) {
            sum += args[i]
        }
        return {
            ctxBind: this === obj,
            argSum: sum
        }
    }

    expect(fn.myApply(obj, [1,2,3])).toEqual({ctxBind: true, argSum: 6});
});


// myBind
test('myBind without arg', () => {
    let fn = function() {
        return this === window
    }
    let result = fn.myBind()
    expect(result()).toBeTruthy();
});

test('myBind with 1 arg', () => {
    let obj = {a:1}
    let fn = function() {
        return this === obj
    }
    let result = fn.myBind(obj)
    expect(result()).toBeTruthy();
});

test('myBind with more than 1 arg', () => {
    let obj = {a:1}
    let fn = function(...args) {
        let sum = 0
        for (let i=0;i<args.length;i++) {
            sum += args[i]
        }
        return {
            ctxBind: this === obj,
            argSum: sum
        }
    }
    let result = fn.myBind(obj, 1,2,3)
    expect(result()).toEqual({ctxBind: true, argSum: 6});
});

test('myBind with new', () => {
    let obj = {a:1}
    let fn = function(...args) {
        let sum = 0
        for (let i=0;i<args.length;i++) {
            sum += args[i]
        }
        return {
            ctxBind: this !== obj,
            argSum: sum
        }
    }
    let result = fn.myBind(obj, 1,2)
    expect(new result(3)).toEqual({ctxBind: true, argSum: 6});
});