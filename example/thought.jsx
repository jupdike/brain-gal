// keep a parent, but only if parent of parent (pop) is one of these
const popKeepers = ["By Tag", "Person", "Organization"];

function isImg(x) {
    let lower = x.toLowerCase();
    return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.gif');
}

function getJson(props) {
    let ret = {};
    let guts = BrayElem.childrenWithoutWhitespaceStrings(props.children).map(x => x.props);
    guts.filter((x) => x.href && isImg(x.href)).forEach(x =>  { ret.imgsrc = x.href; });
    guts.filter((x) => x.href && !isImg(x.href)).forEach(x => { ret.href = x.href; });
    //console.error('getJson:', ret);
    return ret;
}

const Thought = (props) => {
    const json = getJson(props);
    return <div class="card rounded" data-title={props.title}>
        <div>{props.children}</div>
        <a href={json.href}><div class="text-l saira-card-title">{props.title.substring(5)}</div></a>
    </div>
}
