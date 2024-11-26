function groupBy(array, func) {
    const groups = {};
    const groupsList = [];
    for (const item of array) {
        const group = func(item);
        if (!groups[group]) {
            groups[group] = [];
            groupsList.push({name: group, arr: groups[group]});
        }
        groups[group].push(item);
    }
    return groupsList;
}

const ThoughtYearGrouper = (props) => {
    let nukids = BrayElem.childrenWithoutWhitespaceStrings(props.children);
    let groups = groupBy(nukids, (child) => child.props['data-title'].split(' ')[0]);
    return <>
        <div class="saira-main-subtitle text-3xl m-2" style="line-height: 1em; color: #aaa"><Subtitle count={nukids.length+""}/></div>
        {groups.map(group =>
            <YearGroup year={group.name}>{group.arr}</YearGroup>)}
    </>;
}
