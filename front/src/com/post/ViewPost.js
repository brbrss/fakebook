import React, { useContext, useState } from "react";
import './ViewPost.css';
import { UserContext } from "../../context/UserContext";
import { CommentArea } from './CommentArea';
import { Link } from "react-router-dom";
import { ViewImage } from './ViewImage';




function LikeButton(props) {
    async function cb() {
        const url = '/post/like/' + props.pid;
        const res = await fetch(url, {
            method: "POST"
        });
        console.log(await res.text());
        props.cb();
    };
    const b = <button onClick={cb}>Like {props.nlike}</button>;
    const span = <span>Like  {props.nlike}</span>
    return props.canLike ? b : span;
}

function PostImage(props) {
    const [selected, setSelected] = useState(false);

    return (<>
        <img className="post-image" alt=""
            onClick={() => setSelected(true)}
            src={'/' + props.src}></img>

        {selected ? <ViewImage src={props.src}
            cb={() => setSelected(false)}></ViewImage> : ''}
    </>);
}

function ViewPost(props) {
    const ctx = useContext(UserContext);

    const [showComment, setShowComment] = useState(false);


    const date = new Date(props.post.date);
    const dateStr = date.toLocaleDateString('en-CA');
    const [ncomment, setNcomment] = useState(props.post.comment.length);
    const [nlike, setNlike] = useState(props.post.like.length);
    const [liked, setLiked] = useState(props.post.like.includes(ctx.profile.uid));
    const isSelf = props.post.author === ctx.profile.uid;
    function likeFun() {
        setNlike(nlike + 1);
        setLiked(true);
    }
    function commentFun() {
        setShowComment(oldVal => !oldVal);
    }
    return (
        <div className="view-post">
            <div className="post-heading">
                <Link to={"/profile/" + props.post.author}><span className="author">{props.post.name}</span></Link>
                <span className="date">{dateStr}</span>
            </div>
            <div className="post-content">
                {props.post.content}
            </div>
            {props?.post?.imgList?.length ? <div className="post-img">
                {props.post.imgList.map(img => <PostImage key={img.path} src={img.path} />)}
            </div> : ''}

            <LikeButton nlike={nlike} pid={props.post._id} cb={likeFun} canLike={!liked && !isSelf} />
            <button onClick={commentFun}>Comments: {ncomment}</button>
            {showComment ?
                <CommentArea
                    pid={props.post._id}
                    ncomment={ncomment}
                    setNcomment={setNcomment}
                    collapseFun={() => setShowComment(false)} />
                : ''}
        </div>
    );
}


export { ViewPost };

