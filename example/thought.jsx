// keep a parent, but only if parent of parent (pop) is one of these
const popKeeprs = ["By Tag", "Person", "Organization"];
const Thought = (props) => <div class="card rounded" data-title={props.title}>
    <div>{props.children}</div>
    <div class="text-l saira-card-title">{props.title.substring(5)}</div>
</div>
