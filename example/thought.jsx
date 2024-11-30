function isImg(x) {
    let lower = x.toLowerCase();
    return lower.endsWith('.png') || lower.endsWith('.jpeg') || lower.endsWith('.jpg') || lower.endsWith('.gif');
}

// TODO need a way to check parent of parent

function getJson(props) {
    let ret = {};
    let guts = BrayElem.childrenWithoutWhitespaceStrings(props.children).map(x => x.props);
    // if(guts.length > 0) {
    //     console.error('getJson -- guts:', guts);
    // }
    guts.filter((x) => x.href && isImg(x.href)).forEach(x =>  { ret.imgsrc = x.href; });
    guts.filter((x) => x.href && !isImg(x.href)).forEach(x => { ret.href = x.href; });
    //guts.filter((x) => x.title == "").forEach(x => { ret
    // console.error('getJson:', ret);
    return ret;
}

const Thought = (props) => {
    const json = getJson(props);
    const kids = BrayElem.childrenWithoutWhitespaceStrings(props.children);
    return <div class="card shadow-md rounded" data-title={props.title}>
        {json.imgsrc
            ? <img src={json.imgsrc} class="rounded" alt={"Movie poster for "+props.title.substring(5)} />
            : <div class="rounded emptyposter">&nbsp;</div> }
        <a href={json.href} target="_blank">
            <CardTitle title={props.title.substring(5)} />
        </a>
        <div class="card-body">
            {/* force desired ordered */}
            {kids.filter(kid => kid.props.kind == "tag")}
            {kids.filter(kid => kid.props.kind == "maker")}
        </div>
    </div>
}
