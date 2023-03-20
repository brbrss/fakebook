

function Avatar(props) {
    const defaultPath = process.env.REACT_APP_DEFAULT_AVATAR;
    const src = props.src ? props.src : defaultPath;
    return <img className='avatar' src={'/' + src} />;
}

export { Avatar };
