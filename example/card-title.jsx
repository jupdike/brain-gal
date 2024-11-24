function round5(x) {
    return Math.ceil(x / 5) * 5;
}

const CardTitle = (props) => {
    const str = props.title;
    let n = props.title.length;
    let ps = props.title.split(' ');
    let w = ps.length;
    let narrower = Math.max(0, w - 1) * 7 + Math.max(0, n - 8) * 1.3;
    if(narrower > 50) {
        narrower = 50;
    }
    narrower = 100 - narrower;
    narrower = round5(narrower);
    // console.error('narrower:', narrower);
    let more = "";
    if(narrower > 0) {
        more = "narrow-"+narrower;
    }
    return <div class={"text-l saira-card-title pt-2 px-1 "+more}>{str}</div>;
}
