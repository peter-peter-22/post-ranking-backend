/**
 * Executes a function periodically while being called.
 * 
 * @param fn Function to execute.
 * @param interval The waiting time between executions in ms.
 * @param lastExecutionTime The last time the execution occured in ms.
 */
export function executePerTime(fn:Function, interval:number, lastExecutionTime:number){
    const currentTime=Date.now()
    if (currentTime - lastExecutionTime >= interval) {
        fn()
        lastExecutionTime = currentTime;
    }
}