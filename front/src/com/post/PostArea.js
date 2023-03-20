import React, { useState, useCallback, useEffect } from "react";

import { useContext } from "react";
import { UserContext } from '../../context/UserContext';

import { Timeline } from './timeline';
import { WritePost } from './WritePost';

import './PostArea.css';
import { useMyFetch } from '../../helper/useMyFetch';
import { useList } from '../../helper/useList';

function buildUrl(uid, start, count, rev) {

    const url = new URL('/post/timeline/' + uid, 'http://www.example.com');
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


function PostArea(props) {
    const ctx = useContext(UserContext);

    const [isSelf, setIsSelf] = useState(false);
    const [err, setErr] = useState('');
    const [postList, postListDispatch] = useList();
    const [hasMore, setHasMore] = useState(true);
    const [earliest, setEarliest] = useState(null);
    const [get, cancel] = useMyFetch();
    const k = 3;

    const getPost = useCallback(async function (uid, start, count, rev) {
        //const url = "/post/timeline/" + props.uid + "?&count=" + k;
        const url = buildUrl(uid, start, count, rev);
        try {
            const res = await get(url);
            if (res.status === 200) {
                const newList = await res.json();
                if (!Array.isArray(newList)) {
                    setErr("Return value is not array.");
                    return;
                }
                if (rev) {
                    postListDispatch({ type: 'add_front', newList: newList });
                } else {
                    postListDispatch({ type: 'add_back', newList: newList });
                    if (newList.length !== 0) {
                        setEarliest(newList[newList.length - 1]._id);
                    }
                    setHasMore(newList.length !== 0);
                }
                setErr('');
                if (newList.length < k) {
                    setHasMore(false);
                }
            } else {
                setErr('Timeline returned with status: ' + res.status);
            }
        } catch (err) {
            setErr(err.message);
            return;
        }
    }, [postListDispatch, get]);

    const getEarlier = useCallback(() => {
        getPost(props.uid, earliest, k, false);
    }, [earliest, getPost, props.uid]);

    const getLater = useCallback(() => {
        const start = postList.length > 0 ? postList[0]._id : null;
        getPost(props.uid, start, 999, true);
    }, [postList, getPost, props.uid]);

    useEffect(() => {
        postListDispatch({ type: 'clear' });
        setEarliest(null);
        setIsSelf(ctx.profile.uid === props.uid);
        getPost(props.uid, null, k, false);
        return () => cancel();
    }, [props.uid, ctx.profile.uid, postListDispatch, getPost, cancel]);

    return (
        <div className="post-area">
            {isSelf ? <WritePost refreshCb={getLater}></WritePost> : ''}
            <Timeline postList={postList} />
            {hasMore ? <button onClick={getEarlier}>Load More</button> : 'No more'}
            <div className="error">
                {err ? <div>{err}</div> : ''}
            </div>
        </div>
    );
}

export { PostArea };
