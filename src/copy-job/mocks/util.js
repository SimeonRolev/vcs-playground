function waitForNode (getNode) {
    return new Promise(function (resolve, reject) {
        let retry = 0;
        const renderer = setInterval(() => {
            const node = getNode();
            if (node) {
                clearInterval(renderer);
                resolve(node);
            } else {
                if (retry > 500) {
                    clearInterval(renderer);
                    reject();
                }
            }
        }, 100);
    });
}

export { waitForNode }
