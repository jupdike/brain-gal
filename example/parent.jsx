// keep a parent, but only if parent of parent (pop) is one of these
const popKeepers = ["By Tag", "Person", "Organization"];

// function hasAllowedPop(props) {
//     if(!props.children || props.children.length == 0 || props.children[0].length == 0) {
//         return false;
//     }
//     console.error('hasAllowedPop1:', props);
//     console.error('hasAllowedPop2:', props.children);
//     let guts = BrayElem.childrenWithoutWhitespaceStrings(props.children[0][0].props.children).map(x => x.props);
//     console.error('hasAllowedPop3:', guts);
//     //let hasAny = guts.filter((x) => x.title && popKeepers.includes(x.title)).length > 0;
//     //return props.title && hasAny;
//     return false;
// }

function hasHref(props) {
    if(props.href) {
        return props.href;
    }
    // if(!props.children || props.children.length == 0 || props.children[0].length == 0) {
    //     return false;
    // }
    // // if(props.href) {
    // //     return props.href;
    // // }
    // console.error('hasAllowedPop1:', props);
    // console.error('hasAllowedPop2:', props.children);
    // let guts = BrayElem.childrenWithoutWhitespaceStrings(props.children[0][0].props.children).map(x => x.props);
    // console.error('hasAllowedPop3:', guts);
    // //let hasAny = guts.filter((x) => x.title && popKeepers.includes(x.title)).length > 0;
    // //return props.title && hasAny;
    return null;
}

function isAllowed(x) {
    // console.error('isAllowed:', x);
    return popKeepers.includes(x);
}

function getParentJson(props) {
    let ret = {};
    let guts = BrayElem.childrenWithoutWhitespaceStrings(props.children).map(x => x.props);
    // if(guts.length > 0) {
    //     console.error('getParentJson -- guts:', guts);
    // }
    guts.filter((x) => x.title && isAllowed(x.title)).forEach(x => { ret.ptitle = props.title; ret.ptype = x.title; });
    guts.filter((x) => hasHref(x)).forEach(x => { ret.phref = hasHref(x); });
    // if(Object.keys(ret).length > 0) {
    //     console.error('getJson:', ret);
    // }
    return ret;
}

const strToEmoji = {
    "By Tag": "🏷️", // not used
    "Person": "👤",
    "Organization": "🏢",
    "Upcoming": "⏱️",
    "Find": "🟩",
    "Yes": "✅",
    "Replace/Update": "❇️",
    "Thumbs Down": "👎",
    "Play Me": "▶️",
    "Not for Kids": "🚫", // 🧔🏻‍♂️
}

const Parent = (props) => {
    let json = getParentJson(props);
    if(json.ptype == "By Tag") {
        return <span kind="tag">{strToEmoji[json.ptitle]}</span>;
    }
    if(json.ptype && json.phref && json.ptitle) {
        return <Maker kind="maker" href={json.phref} title={json.ptitle} type={json.ptype} />;
    }
    return <div kind="skip" title={props.title}> </div>; // empty div for types that are not relevant to the visualization
}
