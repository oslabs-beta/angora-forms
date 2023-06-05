const fs = require("fs");
const path = require("path");

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
    imports.push(fileName) 

    console.log(this.resourcePath)

    // Create the file path using the current working directory and the filename
    const filePath = path.resolve(process.cwd(), fileName); // change process.cwd() to generate files into node modules?

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

const importedClassNames = fileNames; // Get the imported class names from the fileNames array
const existingClassNames = new Set()

// traversal through ast of app.module file
traverse(ast, {
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

          // // Get the imported class names from the fileNames array
          // const importedClassNames = fileNames; 

          // console.log(importedClassNames)
          // console.log(declarationsProp.value.elements.slice(-importedClassNames.length))

          console.log(declarationsProp.value)

          for(let i = 0; i < declarationsProp.value.elements.slice(-importedClassNames.length).length; i++){
            existingClassNames.add(declarationsProp.value.elements.slice(-importedClassNames.length)[i].name)
          }

          // console.log(existingClassNames)

          // Create an identifier for each imported class and add to the declarations array
          importedClassNames.forEach((className) => {
            if(!existingClassNames.has(className)){
              const importedClassIdentifier = t.identifier(className);
              declarationsProp.value.elements.push(importedClassIdentifier);
            }
            // check whether each className already exists in the declarations array
            
          });

          modified = true; // Set the flag to indicate modification
          modifiedNgModule = path.node; // Mark the NgModule decorator as modified
        }
      }
    }
  },
  ImportDeclaration(path) {
    
    
    // identify where new import declarations will be inserted
    if (
      t.isStringLiteral(path.node.source, { value: './app.component' }) &&
      !modifiedNgModule // Skip further traversal if NgModule is already modified
    ) {

      let counter = 1 // initialize counter to act as input for file name 
      // console.log(existingClassNames)

      importedClassNames.forEach((className) => {
        if(!path.scope.bindings[className]){
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
        }
      });
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
  const typeScript = ': any'
  return (
    methods.slice(1)
      // filter through methods return only functions
      // iterate through methods and add the function to the new component in the right format
      .map((method) => {

        const functionCode = instance[method].toString();

        const position = functionCode.indexOf(')')
        const params = functionCode.substring(functionCode.indexOf('('), position+1)
         // if there are multiple parameters add : any to other parameters
        if(functionCode[position - 1].match(/[A-Z]|[a-z]/g)){
          return functionCode.replace(params, typescriptIfy(params))
        } else {
          return functionCode
        }
      })
      .join("\n")
  );
}

// add ': any' to any number of parameters
const typescriptIfy = (functionCode, result = '', typescript = ': any') => {
  if(!functionCode.length){
    return result
  }
  if(functionCode[0] === ',' || functionCode[0] === ')'){
    return typescriptIfy(functionCode.slice(1), result += (typescript + functionCode[0]), typescript)
  }
  return typescriptIfy(functionCode.slice(1), result += functionCode[0], typescript)
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
  const typeScript = ': any'
  const properties = Object.entries(instance)
    // iterate through the class object and add the properties to the new component
    const newProps = properties.filter((el) => el[0] !== 'template').map((el) => {
      console.log(el[1])
        if(el[0].toString() === 'onChange'){
          const position = el[1].toString().indexOf(')')
          return `${el[0]} = ${[el[1].toString().slice(0, position), typeScript, el[1].toString().slice(position)].join('')}`;
        }
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



module.exports = {
  formatValue,
  generateProperties,
  toKebabCase,
  generateTemplate,
  typescriptIfy,
  generateMethods,
  generateAngularComponent,
  myLoader(source) {

  const options = this.getOptions();

  const { customComponents } = options;

  const fileNames = []

  const imports = []

  customComponents.forEach((ComponentClass, index) => {
    const className = ComponentClass.name
    fileNames.push(className)

    const fileName = `customComponent${index + 1}.ts`; // Generate a unique filename
    imports.push(fileName) 

    console.log(this.resourcePath)

    // Create the file path using the current working directory and the filename
    const filePath = path.resolve(process.cwd(), fileName); // change process.cwd() to generate files into node modules?

    // Generate the code for the Angular class component
    const componentCode = generateAngularComponent(ComponentClass);

    // Write the code to the file
    fs.writeFileSync(filePath, componentCode);

  });

// read and stringify app.module file
// const code = fs.readFileSync("./src/app/app.module.ts").toString();

// generate ast for app.module file
const ast = parser.parse(source, {
  sourceType: "module",
  plugins: ["typescript", "decorators-legacy"],
});

let modified = false; // Flag to track modification
let modifiedNgModule = null; // Store the NgModule decorator node that is modified

const importedClassNames = fileNames; // Get the imported class names from the fileNames array
const existingClassNames = new Set()

// traversal through ast of app.module file
traverse(ast, {
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

          // // Get the imported class names from the fileNames array
          // const importedClassNames = fileNames; 

          // console.log(importedClassNames)
          // console.log(declarationsProp.value.elements.slice(-importedClassNames.length))

          console.log(declarationsProp.value)

          for(let i = 0; i < declarationsProp.value.elements.slice(-importedClassNames.length).length; i++){
            existingClassNames.add(declarationsProp.value.elements.slice(-importedClassNames.length)[i].name)
          }

          // console.log(existingClassNames)

          // Create an identifier for each imported class and add to the declarations array
          importedClassNames.forEach((className) => {
            if(!existingClassNames.has(className)){
              const importedClassIdentifier = t.identifier(className);
              declarationsProp.value.elements.push(importedClassIdentifier);
            }
            // check whether each className already exists in the declarations array
            
          });

          modified = true; // Set the flag to indicate modification
          modifiedNgModule = path.node; // Mark the NgModule decorator as modified
        }
      }
    }
  },
  ImportDeclaration(path) {
    
    
    // identify where new import declarations will be inserted
    if (
      t.isStringLiteral(path.node.source, { value: './app.component' }) &&
      !modifiedNgModule // Skip further traversal if NgModule is already modified
    ) {

      let counter = 1 // initialize counter to act as input for file name 
      // console.log(existingClassNames)

      importedClassNames.forEach((className) => {
        if(!path.scope.bindings[className]){
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
        }
      });
    }
  },
});

const newCode = `${generator(ast).code}`;

fs.writeFileSync("./src/app/app.module.ts", newCode)

return source;
}
};



