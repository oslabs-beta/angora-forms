const fs = require("fs");
const path = require("path");
// const { validateOptions } = require('schema-utils');
<<<<<<< HEAD
// const schema = require("./schema.js");
// const customComponents = require('../../form/src/app/customcomponent/angora.components.js')
// const { getOptions } = require('loader-utils')

// module part requires
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const t = require("@babel/types");

module.exports = function myLoader(source) {
  // source = `${source}`
  const options = this.getOptions();
  // console.log('before AST func source: ', source);
=======
const schema = require("./schema.js");
// const customComponents = require('../../form/src/app/customcomponent/angora.components.js')
// const { getOptions } = require('loader-utils')

module.exports = function myLoader(source) {
  const options = this.getOptions();
  console.log(options);
>>>>>>> 12953d0c65f8f14fc5fdb74684cd0eb077502761

  // validateOptions(schema, options, 'My Loader');

  const { customComponents } = options;

  // Assuming customComponents is an array of component classes

  customComponents.forEach((ComponentClass, index) => {
    const filename = `customComponent${index + 1}.ts`; // Generate a unique filename

    // Create the file path using the current working directory and the filename
    const filePath = path.resolve(process.cwd(), filename);

    // Generate the code for the Angular class component
    const componentCode = generateAngularComponent(ComponentClass);

    // Write the code to the file
    fs.writeFileSync(filePath, componentCode);

    console.log(`Generated file: ${filePath}`);
  });

<<<<<<< HEAD
  // insert app.module insertion logic

  const code = fs.readFileSync("./index.ts").toString();
  console.log("code: ", code);

  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["typescript", "decorators-legacy"],
  });

  traverse(ast, {
    Decorator(path) {
      if (
        t.isCallExpression(path.node.expression) &&
        t.isIdentifier(path.node.expression.callee, { name: "NgModule" })
      ) {
        const ngModuleArg = path.node.expression.arguments[0];

        if (t.isObjectExpression(ngModuleArg)) {
          const declarationsProp = ngModuleArg.properties.find((prop) =>
            t.isIdentifier(prop.key, { name: "declarations" })
          );

          if (declarationsProp && t.isArrayExpression(declarationsProp.value)) {
            // Insert 'here' into the declarations array
            declarationsProp.value.elements.push(t.stringLiteral("here"));
          }
        }
      }
    },
  });

  const newCode = `${generator(ast).code}`;
  // console.log('after AST func source: ', source)
  // console.log('newCode: ', newCode)

  // console.log(`${newCode}`)
  fs.writeFileSync(this.resourcePath, newCode);
  console.log("fs write success");
  // console.log('this.resourcePath: ', this.resourcePath)
  // return `${newCode}`;
=======
>>>>>>> 12953d0c65f8f14fc5fdb74684cd0eb077502761
  return source;
};

function generateAngularComponent(ComponentClass) {
  const className = ComponentClass.name;

  // Get the class methods
  const methods = Object.getOwnPropertyNames(ComponentClass.prototype);
  const instance = new ComponentClass();
  const html = instance.template;

  // Generate the code for the Angular class component
  const componentCode = `
import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: '${toKebabCase(className)}',
  template: \`${generateTemplate(html)}\`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: ${className}
    }
  ]
})
export class ${className} implements ControlValueAccessor {

${generateProperties(instance)}

${generateMethods(ComponentClass.prototype, methods)}

writeValue(value: any) {
    this.value = value
  }
  
  registerOnChange(onChange: any) {
    this.onChange = onChange
  }
  
  registerOnTouched(onTouched: any){
    this.onTouched = onTouched
  }
  
  setDisabledState(disabled: boolean): void {
    this.disabled = disabled
  }
}
`;

  return componentCode;
}

// generate all methods to be added to new component
function generateMethods(instance, methods) {
  return (
    methods
      // filter through methods return only functions
      .filter((method) => typeof instance[method] === "function")
      // iterate through methods and add the function to the new component in the right format
      .map((method) => {
        const functionCode = instance[method].toString();
        return `${functionCode}`;
      })
      .join("\n")
  );
}

// generate html to be added to new component
function generateTemplate(html) {
  return `
    ${html}
  `;
}

// kebab-case
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// generate all properties to be added to new component
function generateProperties(instance) {
  const properties = Object.entries(instance)
    // iterate through the class object and add the properties to the new component
    .map(([key, value]) => {
      if (key !== "template") {
        `${key}= ${formatValue(value)}`;
      }
    })
    .join("\n");

  return properties;
}

// format values of properties so that they are added in number, boolean, or string
function formatValue(value) {
  if (typeof value === "string") {
    return `'${value}'`;
  } else if (typeof value === "boolean") {
    return value ? "true" : "false";
  } else {
    return value;
  }
}
