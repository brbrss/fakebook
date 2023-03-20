import React, { useEffect, useState, useReducer, useCallback, useRef } from "react";

function promisify(cb) {
    return function ff(...args) {
        function f(res, rej) {
            cb(...args, res);
        }
        return new Promise(f);
    }
}


function useSmartRef(cb) {
    const ref = useRef(undefined);
    if (ref.current === undefined) {
        ref.current = cb();
    }
    return ref;
}

function useSmartRef2(cb) {
    const ref = useRef(null);
    useEffect(() => {
        ref.current = cb();
    }, [cb]);
    return ref;
}


const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));

function initState() {
    const x = new AbortController();
    x.id = Math.random();
    return x;
}

function useMyFetch() {
    //const [controller, setController] = useState(initState);
    const ref = useRef(null);
    const getcontroller = useCallback(function () {
        if (ref.current === null) {
            ref.current = initState();
        }
        return ref.current;
    }, []);
    const cancel = useCallback(function () {
        getcontroller().abort();
        console.log('cancelled', getcontroller().id);
    }, [getcontroller]);

    const get = useCallback(async function (url, options) {
        console.log('fetch start');
        cancel();
        console.log('fetch has cancelled previous');
        const newController = new AbortController();
        newController.id = Math.random();
        ref.current = newController;
        await waitFor(5000);
        console.log(newController.id);
        const res = await fetch(url, { ...options, signal: newController.signal });
        console.log(res);
        return res;
    }, [cancel]);
    return [get, cancel];
}

// function useMyFetch() {
//     const [[get, cancel]] = useState(useMyFetch_());
//     return [promisify(get), cancel];
// }

function Foo(props) {
    //const [[get, cancel]] = useState(useMyFetch());
    const [get, cancel] = useMyFetch();

    const [s, setS] = useState('');
    const initGet = useCallback(async function () {
        try {
            const res = await get('/', {});
            setS(String(res.status));
        } catch (err) {
        }
    }, [get]);
    useEffect(() => {
        initGet();
        return () => { cancel() };
    }, [initGet, cancel]);
    return (
        <div>
            This is Foo. Foo str: {s}
        </div>
    );
}

function redfun(state, action) {
    return { x: state.x + 1 };
}

function randPoint() {
    return { x: Math.random(), y: Math.random() };
}


function useCounter() {
    function fn(state) {
        return state + 1;
    }
    return useReducer(fn, 0);
}

function Bar(props) {
    const [val, d] = useCounter();
    const [s, setS] = useState(100);
    function dd() {
        d();
        setS(_ => _ + 1);
    }
    return (
        <div>
            bar str: {props.s}
            <br />
            <button onClick={dd}>inc</button>
            <br />
            <input type="number" disabled value={val} />
            <input type="number" disabled value={s} />
        </div>
    );
}
export function TrialPage(props) {
    const [state, dispatch] = useReducer(redfun, { x: 0 });

    return (
        <div>
            This page is for debugging purpose.
            <br />
            <input type="text" disabled value={state.x} />

            <br />
            <button onClick={() => dispatch()}>change</button>

            <Bar s={state.x} />
        </div>
    );
}
