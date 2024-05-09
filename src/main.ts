import './userWorker'
import * as monaco from "monaco-editor"
import {
  useMonacoEx,
  useUnocss,
  useModuleResolve,
  useModuleSuggest,
  useDirective,
  useJavascriptSuggestFilter
} from "../lib";

useMonacoEx(monaco)
useUnocss()
useModuleResolve(path => {
  console.log(path)
  if (path.startsWith("file:///node_modules/@types/module:myLib/index")) {
    return Promise.resolve(`
import {User} from './fileA';
export function myLib():User{ 
  return {
    name:"jobs"
  }
}
    `)
  }
  return Promise.resolve(`
export interface User{ 
  name:string;
  age:number
}
  `)
});

useJavascriptSuggestFilter((position, suggestions) => {
  console.log(position)
  return suggestions.filter(f => f.insertText != "JSON");
})

useModuleSuggest(["./main", "./user.ts", "order", "order.ts"])
useDirective([{
  language: "javascript",
  matcher: "k-for",
  appendContent
}, {
  language: "javascript",
  matcher: "k-content",
}, {
  language: "javascript",
  matcher: "k-if",
}]);

function appendContent(value: string): string {
  let result = "";
  let target = "";
  if (!value) return result;
  let splitIndex = value.indexOf(" in ");
  if (splitIndex < 1) splitIndex = value.indexOf(" of ");
  if (splitIndex > 0) target = value.substring(splitIndex + 4).trim();
  else {
    splitIndex = value.indexOf(" ");
    if (splitIndex > 0) target = value.substring(splitIndex).trim();
  }
  if (splitIndex < 1) return result;
  if (!target) return result;
  value = value.substring(0, splitIndex).trim();
  while (value.startsWith("(")) {
    value = value.substring(1);
  }
  while (value.endsWith(")")) {
    value = value.substring(0, value.length - 1);
  }

  const params = value.split(",");
  if (params[0]) {
    result += `let ${params[0]} = Object.values(${target})[0];`;
  }

  if (params[1]) {
    result += `let ${params[1]}:keyof ${target};`;
  }

  return result;
}


// monaco.editor.createModel(`
// export const customObject={
//   name:""
// }
// `, "javascript", monaco.Uri.file("myModule.js"))

const model = monaco.editor.createModel(`
<html>
<body>
<style>
.abc{
  color:red;
}
</style>
<div style="color:red;"></div>

<script>
  var arr=[1,2,3];
  var obj={name:'alex',age:23};
</script>
<div k-for="item arr" k-if="!!abc">
  <div k-content="item"></div>
</div>
<div k-for="item obj" k-if="!!abc">
  <div k-content="item"></div>
</div>
</body>
</html>
`, "html", monaco.Uri.parse("file:///main.html"))

monaco.editor.create(document.querySelector("#app")!, {
  model
})
