// take an argument on the commandline and load the text file as an array of strings
// then print the array to the console

// Example usage: node films.js films.txt

const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error('Expected usage:\n\tnode outline2jsx.js <outline-filepath.txt> "Thought Name"\n\nPlease provide a file path for text outline to parse, and a parent thought to list the children');
  return;
}

// missing core code, as they say
class StringHash {
  constructor() {
    this._ob = {};
    this._size = 0;
  }
  has(k) {
    //console.log(this._size + ' keys, looking for ' + k);
    return this._ob.hasOwnProperty('_'+k);
  }
  get(k) {
    return this._ob['_'+k];
  }
  set(k, v) {
    if(!this._ob.hasOwnProperty('_'+k)) {
      this._size++;
    }
    this._ob['_'+k] = v;
  }
  count() {
    return this._size;
  }
  *[Symbol.iterator]() {
    for(const key in this._ob) {
      if(!this._ob.hasOwnProperty(key)) {
        continue;
      }
      yield [key.slice(1), this._ob[key]];
    }
  }
}

class MultiMap {
  constructor() {
    this._ob = {};
    this._size = 0;
  }
  has(k) {
    //console.log(this._size + ' keys, looking for ' + k);
    return this._ob.hasOwnProperty('_'+k);
  }
  get(k) {
    return this._ob['_'+k];
  }
  add(k, v) {
    if(!this._ob.hasOwnProperty('_'+k)) {
      this._size++;
      this._ob['_'+k] = [];
    }
    if(!this._ob['_'+k].includes(v)) {
      this._ob['_'+k].push(v);
    }
  }
  count() {
    return this._size;
  }
  *[Symbol.iterator]() {
    for(const key in this._ob) {
      if(!this._ob.hasOwnProperty(key)) {
        continue;
      }
      yield [key.slice(1), this._ob[key]];
    }
  }
}

let filePath = process.argv[2];
// if(!filePath.startsWith('/')) {
//   filePath = path.join(__dirname, process.argv[2]);
// }

function tabCount(line) {
  let count = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '\t') {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function linesToGraph(lines) {
  let graph = {
    parentsOf: new MultiMap(),
    childrenOf: new MultiMap(),
    urlsFor: new MultiMap(),
  };
  let { parentsOf, childrenOf, urlsFor } = graph;

  let parentStack = [];
  let lastNode = null;

  for (let line of lines) {
    const indentLevel = tabCount(line);

    let node = line.trim();
    if(node.startsWith('-')) { // notes are exported with a leading hyphen
      lastIndentLevel = indentLevel;
      continue;
    }
    if(node.startsWith('#')) {
      node = node.slice(1).trim();
    }
    if(node.startsWith('+')) {
      const url = node.slice(1).trim();
      // console.log(lastNode, ' --U-->', url);
      urlsFor.add(lastNode, url);
      lastIndentLevel = indentLevel;
      continue;
    }

    if(indentLevel === 0) {
      parentStack = [node];
      // console.log('PUSH.', '{', parentStack.join(' | '), '}');
      // console.log('\n');
      continue;
    }

    //console.log('>', line);
    let parent = null;
    if(indentLevel - 1 >= 0 && indentLevel - 1 < parentStack.length) {
      parent = parentStack[indentLevel - 1];
    } else {
      // only happens when we are on top-level guys, but it is not an error
      //throw new Error('No parent found for node: ' + node);
    }
    if(parent) {
      //console.log('parent:', parent);
      // console.log(parent, '<--P-- ', node);
      parentsOf.add(node, parent);
      //console.log(parent, ' --C-->', node);
      childrenOf.add(parent, node);
    }
    
    let popped = null;
    let stackLevel = parentStack.length - 1; // 1 item in stack is level 0
    //console.log('indentLevel:', indentLevel);
    //console.log('stackLevel:', stackLevel);

    if(indentLevel < stackLevel) { // TODO maybe need a WHILE loop here! in case indentation changes by more than one level
      popped = parentStack.pop();
      //console.log('POP. ', '[', parentStack.join(' | '), ']');
    }
    if(indentLevel > stackLevel) {
      parentStack.push(node);
      //console.log('PUSH.', '{', parentStack.join(' | '), '}');
    }
    if(indentLevel <= stackLevel) { // replace if at the same level
      parentStack[indentLevel] = node;
      //console.log('REPL. ', '[', parentStack.join(' | '), ']');
    }

    lastNode = node;
    //console.log('\n');
  }

  return graph;
}

function parents2jsx(graph, childName, parentGens) {
  let { parentsOf, childrenOf, urlsFor } = graph;
  let parents = parentsOf.get(childName);
  parents.sort();
  let pieces = [];
  for(let parent of parents) {
    if(parentGens - 1 > 0) {
      let more = parents2jsx(graph, parent, parentGens - 1);
      pieces.push(`\t<Parent title='${parent}'>${more}</Parent>`);
    } else {
      pieces.push(`\t<Parent title='${parent}' />`);
    }
  }
  return pieces.join('\n');
}

function graph2jsx(graph, parentThoughtName, withTag='Thought', parentGens=2) {
  let { parentsOf, childrenOf, urlsFor } = graph;
  let children = childrenOf.get(parentThoughtName);
  children.sort();
  let pieces = [];
  for(let child of children) {
    //console.log(child);
    let body = [];
    let urls = urlsFor.get(child);
    if(urls) {
      for(let url of urls) {
        body.push(`\t<A href='${url}' />`);
      }
    }
    let parents = parentsOf.get(child);
    if(parents) {
      parents.sort();
      for(let parent of parents) {
        if(parent === parentThoughtName) {
          continue;
        }
        if(parentGens - 1 > 0) {
          let more = parents2jsx(graph, parent, parentGens - 1);
          body.push(`\t<Parent title='${parent}'>${more}</Parent>`);
        } else {
          body.push(`\t<Parent title='${parent}' />`);
        }
      }
    }
    let str = `<${withTag} title='${child}'>\n${body.join('\n')}\n</${withTag}>`;
    pieces.push(str);

    //console.log(str);
  }
  let jsx = `<>\n${pieces.join('\n')}\n</>`;
  return jsx;
}

let lines = fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const lines = data.split('\n');
  let graph = linesToGraph(lines);
  //console.log(graph);
  let parentThoughtName = process.argv[3];

  let jsx = graph2jsx(graph, parentThoughtName);
  console.log(jsx);
});

