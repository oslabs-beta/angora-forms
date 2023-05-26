const fs = require("fs");
const path = require("path");
// const { validateOptions } = require('schema-utils');
// const schema = require("./schema.js");
// const customComponents = require('../../form/src/app/customcomponent/angora.components.js')
// const { getOptions } = require('loader-utils')

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const t = require("@babel/types");

module.exports = function myLoader(source) {

  const options = this.getOptions();

  const { customComponents } = options;

  const fileNames = []

  const imports = []

  customComponents.forEach((ComponentClass, index) => {
    const className = ComponentClass.name
    fileNames.push(className)

    const fileName = `customComponent${index + 1}.ts`; // Generate a unique filename
    imports.push(fileName.toString())

    // Create the file path using the current working directory and the filename
    const filePath = path.resolve(process.cwd(), fileName);

    // Generate the code for the Angular class component
    const componentCode = generateAngularComponent(ComponentClass);

    // Write the code to the file
    fs.writeFileSync(filePath, componentCode);

  });

// read and stringify app.module file
const code = fs.readFileSync("./src/app/app.module.ts").toString();

// generate ast for app.module file
const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["typescript", "decorators-legacy"],
});

let modified = false; // Flag to track modification
let modifiedNgModule = null; // Store the NgModule decorator node that is modified

// traversal through ast of app.module file
traverse(ast, {
  ImportDeclaration(path) {
    // identify where new import declarations will be inserted
    if (
      t.isStringLiteral(path.node.source, { value: './app.component' }) &&
      !modifiedNgModule // Skip further traversal if NgModule is already modified
    ) {
      
      const importedClassNames = fileNames; // Get the imported class names from the fileNames array

      let counter = 1 // initialize counter to act as input for file name 

      importedClassNames.forEach((className) => {
        // Create an import specifier for the class name
        const importSpecifier = t.importSpecifier(
          t.identifier(className),
          t.identifier(className)
        );

        // Create a new import declaration for the class name
        const newImportDeclaration = t.importDeclaration(
          [importSpecifier],
          t.stringLiteral(`../../customComponent${counter}`)
        );

        counter++

        // Insert the new import declaration after the existing one
        path.insertAfter(newImportDeclaration);
      });
    }
  },
  Decorator(path) {
    // identify where new declarations will be added
    if (
      t.isCallExpression(path.node.expression) &&
      t.isIdentifier(path.node.expression.callee, { name: 'NgModule' }) &&
      !modified // Check if modification has not been applied yet
    ) {
      const ngModuleArg = path.node.expression.arguments[0];

      if (t.isObjectExpression(ngModuleArg)) {
        const declarationsProp = ngModuleArg.properties.find((prop) =>
          t.isIdentifier(prop.key, { name: 'declarations' })
        );

        if (
          declarationsProp &&
          t.isArrayExpression(declarationsProp.value)
        ) {

          // Get the imported class names from the fileNames array
          const importedClassNames = fileNames; 

          // Create an identifier for each imported class and add to the declarations array
          importedClassNames.forEach((className) => {
            const importedClassIdentifier = t.identifier(className);
            declarationsProp.value.elements.push(importedClassIdentifier);
          });

          modified = true; // Set the flag to indicate modification
          modifiedNgModule = path.node; // Mark the NgModule decorator as modified
        }
      }
    }
  },
});

const newCode = `${generator(ast).code}`;

fs.writeFileSync("./src/app/app.module.ts", newCode)

return source;
};


function generateAngularComponent(ComponentClass) {
  const className = ComponentClass.name;
  

  // Get the class methods
  const methods = Object.getOwnPropertyNames(ComponentClass.prototype);
  // Create an instance of each component class
  const instance = new ComponentClass();
  // identify the html code provided by the user
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
    methods.slice(1)
      // filter through methods return only functions
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

// kebab
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// generate all properties to be added to new component
function generateProperties(instance) {
  const properties = Object.entries(instance)
    // iterate through the class object and add the properties to the new component
    const newProps = properties.filter((el) => el[0] !== 'template').map((el) => {
        return `${el[0]} = ${formatValue(el[1])}`;
    }).join("\n")

    return newProps
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
