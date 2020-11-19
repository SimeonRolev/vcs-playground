class PushNotifier {
    constructor () {
        this.subscriberCallbacks = []
    }

    listen () {
        return {
            subscribe: callback => {
                this.subscriberCallbacks.push(callback)
            }
        }
    }

    post (msg) {
        this.subscriberCallbacks.forEach(cb => cb(msg))
    }
}

export default new PushNotifier();