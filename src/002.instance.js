function myInstance(left, right) {
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