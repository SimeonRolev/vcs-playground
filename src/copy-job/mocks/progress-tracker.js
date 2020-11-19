class ProgressTracker {
    constructor (items = []) {
        this.items = items
    }

    get (id) {
        return this.items.find(item => item.id === id);
    }
    
    add (item) {
        this.items.push(item);
    }
}

export default new ProgressTracker();
