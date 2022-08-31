/**
 * mock ajax request
 */

const timeout = time => new Promise((resolve) => {
    setTimeout(resolve, time);
}); 

/**
 * 1 - 并发控制
 */
 class Schedule{

    constructor(maxNum){
        this.list = [];
        this.maxNum = maxNum;
        this.cnt = 0;
    }
    
    add(promiseCreator){
        this.list.push(promiseCreator);
        this.excute();
    }

    excute(){
        if (this.list.length && this.cnt < this.maxNum){
            this.cnt++;
            const promise = this.list.shift();
            promise().then(() => {
                this.cnt--;
                this.excute();
            });
        }
    }
}

const schedule = new Schedule(2);

const addTask = (time, order) => {
    schedule.add(() => timeout(time).then(() => {
        console.log(order);
    }));
};

// addTask(1000, 1);
// addTask(500, 2);
// addTask(600, 3);
// addTask(400, 4);


/**
 * 2. 链式调用
 */

{
    const createPromise = (time, order) => {
        return timeout(time).then(() => {
            console.log(order);
        })
    }
    const list = [
        () => createPromise(1000, 1),
        () => createPromise(200, 2),
        () => createPromise(3000, 3),
        () => createPromise(400, 4),
    ]

    const callList = (list) => {
        let p = Promise.resolve();
        for (let i = 0; i < list.length; i++) {
            p = p.then(() => {
                return list[i]();
            });
        }
    }

    // callList(list);
}

/**
 * 3. Promise _allSettled
 */

{
    const createPromise = (time, flag) => {
        return new Promise((resolve, rejected) => {
            setTimeout(() => {
                if (flag) {
                    resolve(time);
                } else {
                    rejected(time);
                }
            }, time);
        })
    }
    const list = [
        () => createPromise(1000, true),
        () => createPromise(200, true),
        () => createPromise(1000, false),
        () => createPromise(400, true),
    ]
    Promise._allSettled = function(promises) {
        const n = promises.length;
        return new Promise((resolve) => {
            const list = Array.from({length: n});
            let idx = 0;
            for (let i = 0; i < n; i++) {
                const p = promises[i];
                p().then((value) => {
                    list[i] = {status: "fulfilled", value}
                }).catch((value) => {
                    list[i] = {status: "rejected", value}
                }).finally(() => {
                    idx++;
                    if (idx === n) {
                        resolve(list); 
                    }
                })
            }
        })
    }
    // Promise._allSettled(list).then((result) => {
    //     console.log(result);
    // });
    // [
    //     {status: "fulfilled", value: 1},
    //     {status: "fulfilled", value: 2},
    //     {status: "rejected", value: 3},
    // ]
}
