const waitForNode = (getter, callback) => {
    const node = getter()
    callback(node)
}
    
export { waitForNode }