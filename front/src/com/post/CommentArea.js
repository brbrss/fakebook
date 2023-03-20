import React, { useCallback, useEffect, useState } from "react";

import './CommentArea.css';

import WriteComment from './WriteComment';
import CommentRow from './CommentRow';
import { useMyFetch } from '../../helper/useMyFetch';
import { useList } from '../../helper/useList';


function buildUrl(pid, start, count, rev) {

    const url = new URL('/post/comment/' + pid, 'http://www.example.com');
    if (start) {
        url.searchParams.set('start', start);
    }
    if (count) {
        url.searchParams.set('count', count);
    }
    if (rev) {
        url.searchParams.set('rev', true);
    }
    return url.pathname + url.search;
}



function CommentArea(props) {

    const [clist, listDispatch] = useList();
    const [earliest, setEarliest] = useState(null); //earliest id
    const setNcomment = props.setNcomment;
    const [get, cancel] = useMyFetch();


    const k = 10;

    const loadComment = useCallback(async function (pid, start, count, rev) {
        try {
            const url = buildUrl(pid, start, count, rev);
            const res = await get(url, { method: "GET" });
            const newlst = await res.json();

            if (rev) {
                setNcomment(oldVal => oldVal + newlst.length);
                listDispatch({ type: 'add_front', newList: newlst });  // later = higher in page
            } else {
                listDispatch({ type: 'add_back', newList: newlst }); // early = lower in page
                setEarliest(newlst[newlst.length - 1]._id);
            }
        } catch (err) {
            return;
        }
    }, [get, setNcomment, listDispatch]);

    useEffect(() => {
        loadComment(props.pid, null, k, false);

        return function () {
            //listDispatch({ type: 'clear' });
            cancel();
        };
    }, [loadComment, props.pid, cancel, listDispatch]);

    function afterAddComment() {
        const latest = clist.length > 0 ? clist[0]._id : null;
        loadComment(props.pid, latest, k, true);
    }
    function loadMore() {
        loadComment(props.pid, earliest, k, false);
    }

    const inner = clist.map(c => <CommentRow data={c} key={c._id} />);
    return (
        <div className="comment-area">
            <WriteComment pid={props.pid} refreshCb={afterAddComment} />
            {clist.length ? inner : <div>No Comment yet!</div>}
            {clist.length < props.ncomment ? <button onClick={loadMore}>Load More</button> : ''}
            <button onClick={props.collapseFun}>Collapse</button>
        </div>
    );
}

export { CommentArea };