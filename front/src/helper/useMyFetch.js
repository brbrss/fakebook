import { useCallback, useRef } from "react";


function useSmartRef(cb) {
    const ref = useRef(undefined);
    if (ref.current === undefined) {
        ref.current = cb();
    }
    return ref;
}


function initState() {
    const x = new AbortController();
    return x;
}

/**
 * Wrapped version of fetch with abort signal built in,
 * handles all relevant state management. Auto-aborts previous
 * request if `get` is called again before previous call returns.
 * Use this hook multiple times for multiple simultaneous fetch.
 * 
 * Example use: pass `get(url,options)` to one button to make request,
 * pass `cancel` to another button to allow aborting at anytime.
 * 
 * @returns `[get,cancel]` 
 * 
 * `get` wrapped version of fetch, has the same signature.
 *  Do not set `signal` in options as it is already set.
 * 
 * `cancel` will cancel request when called.
 */
function useMyFetch() {
    const controller = useSmartRef(initState);

    const cancel = useCallback(function () {
        controller.current.abort();
    }, [controller]);

    const get = useCallback(async function (url, options) {
        cancel();
        const newController = new AbortController();
        controller.current = newController;
        const res = await fetch(url, { ...options, signal: newController.signal });
        return res;
    }, [cancel, controller]);

    return [get, cancel];
}

export { useMyFetch };
