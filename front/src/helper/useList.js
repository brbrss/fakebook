import { useReducer } from "react";

function lstReducer(oldList, action) {
    if (action.type === 'add_back') {
        return oldList.concat(action.newList);
    } else if (action.type === 'add_front') {
        return action.newList.concat(oldList);
    } else if (action.type === 'clear') {
        return [];
    } else {
        throw Error('unknown action type: ' + action.type);
    }
}

/**
 * List with pushing on both ends.
 * 
 * Possible actions on listDispatch: add_back, add_front, clear
 * 
 * @returns [list, listDispatch]
 */
function useList() {
    const [list, listDispatch] = useReducer(lstReducer, []);
    return [list, listDispatch];
}

export { useList };
