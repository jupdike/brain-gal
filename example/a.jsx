const A = (props) => {
    let lower = props.href.toLowerCase();
    if(lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.gif')) {
        return <img src={props.href} class="poster" />;
    }
    return <u>URL here</u>;
}

