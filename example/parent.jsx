// keep a parent, but only if parent of parent (pop) is one of these
const popKeepers = ["By Tag", "Person", "Organization", "Place", "Organization, Defunct"];

function hasHref(props) {
    if(props.href) {
        return props.href;
    }
    return null;
}

function isAllowed(x) {
    const ret = popKeepers.includes(x);
    //console.error('isAllowed:', x, ret);
    return ret;
}

function getParentJson(props) {
    let ret = {};
    let guts = BrayElem.childrenWithoutWhitespaceStrings(props.children).map(x => x.props);
    // if(guts.length > 0) {
    //     console.error('getParentJson -- guts:', guts);
    // }
    //console.error('getParentJson - props.title:', props.title);
    guts.filter((x) => x.title && isAllowed(x.title)).forEach(x => { ret.ptitle = props.title; ret.ptype = x.title; });
    guts.filter((x) => hasHref(x)).forEach(x => { ret.phref = hasHref(x); });
    // if(Object.keys(ret).length > 0) {
    //     console.error('getJson:', ret);
    // }
    return ret;
}

const strToEmoji = {
    "By Tag": "🏷️", // not used
    "2-D": "✏️",
    "Person": "👤",
    "Organization": "🏢",
    "Organization, Defunct": "⚰️",
    "Upcoming": "⏱️",
    "Find": "🟩",
    "Yes": "✅",
    "Replace/Update": "❇️",
    "Mixed Animation/Live Action": "☯️",
    "Thumbs Down": "👎",
    "Play Me": "▶️",
    "Stop Motion": "📸",
    "Not for Kids": "🚫", // 🧔🏻‍♂️
    "Place": "🌐",
}

const Parent = (props) => {
    let json = getParentJson(props);
    if(json.ptype == "By Tag") {
        return <span title={props.title} kind="tag">{strToEmoji[json.ptitle]}</span>;
    }
    else if(json.ptype && json.phref && json.ptitle) {
        return <Maker kind="maker" href={json.phref} title={json.ptitle} type={json.ptype} />;
    }
    else {
        console.error('Skipping', props.title, '::', json);
    }

    return <div kind="skip" title={props.title}> </div>; // empty div for types that are not relevant to the visualization
}
