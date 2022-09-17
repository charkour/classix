// Using this to debug: https://astexplorer.net/#/gist/fba4c418522f58af2c299ffe75685f40/f6793cf0bed45bab028c4245f462d2a5adfec5a9

const callees = ["classnames", "cn", "clsx"];

export default function transformer(file, api) {
  const j = api.jscodeshift;
  console.log(api);
  const root = j(file.source);
  console.log(root);

  const newImport = j.importDeclaration([j.importDefaultSpecifier(j.identifier("cx"))], j.stringLiteral("classix"));
  let addedCx = false;

  const classnamesImportDeclarations = root
    .find(j.ImportDeclaration)
    .filter((path) => callees.includes(path.node.source.value));
  classnamesImportDeclarations.forEach((importStatement) => {
    importStatement.prune();
    if (!addedCx) {
      root.get().node.program.body.unshift(newImport);
      addedCx = true;
    }
  });

  callees.forEach((callee) => {
    const calls = root.find(j.CallExpression, {
      callee: {
        name: callee
      }
    });
    calls.forEach((call) => {
      console.log({ call });
      const args = [];
      call.value.callee.name = "cx";
      console.log(call);

      call.value.arguments.forEach((arg) => {
        arg.properties.forEach((prop) => {
          const key = prop.key;
          const value = prop.value;
          console.log({ key, value });
          args.push({ key, value });
        });
      });
      console.log({ args });
      call.value.arguments = [];
      args.forEach((argPair) => {
        const exp = j.logicalExpression("&&", argPair.key, argPair.value);
        call.value.arguments.push(exp);
      });
    });
  });

  return root.toSource();
}
