# Angora Forms
Angora Forms is a custom form component abstraction library designed for Angular that streamlines and simplies the process of creating custom form components in Angular. 

Custom form components 

## Documentation
The official documentation website is [website address].

Angora Forms [version number] was released on [date]. You can find more details on [version changes address]

## Key Features
- **Ease of Use:** Getting started with Angora Forms is simple. Visit our documentations for a quick start up guide.
- **Static Typing:** Custom components created with our abstraction library accomodate for TypeScript to adhere to the philosophy of the Angular framework and improve overall deveoper experience.
- **Customizable Components:** Angora Forms does not come with component styling.  Developers are free to style any components to their own tastes.
- **Maintainability:** Custom components are aggregated in a single location with minimal boilerplate code normally required by the Angular framework, aiding maintainability and improving reviewability.

## Getting Started
1. Install [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

2. Install Angora Forms [npm library link].
```
npm install angora-forms
```

3. Configure webpackConfig.ts:
```typescript
const path = require("path");
const customComponents = require('/* path to custom components (e.g. ./src/app/customcomponent/angora.components.ts) */')

module.exports = {
    mode: "development",
    entry: ["./src/main.ts"],
    output: {},
    devtool: false,
    module: {
    rules: [
        {
        test: /\.ts$/, 
        use: [
            {
            loader: "webpack-loader",
            options: {
                customComponents: customComponents
            }},
        ]},
    ]},
};
```

4. Create Custom Component File:
```TypeScript
class CustomComponent {

    template = '/* html template */'
  
    onChange = (value: any) => {};
  
    onTouched = () => {};
  
    value: any = 0;
  
    disabled = false
  }

```
Each custom component class will require a tempalte, onChange, onTouched, value and disabled property.

5. Insert html into value of template within backticks. 

Example:
```TypeScript
  template = `
        <h1>{{value}}</h1>
        <button (click)='increment()'>Increment</button>
        <button (click)='decrement()'>Decrement</button>
    `;
```

6. Customise value and/or disabled if/as required.

7. Add custom methods to component if/as required.
Example:
```TypeScript
  increment() {
    this.value++;
    this.onChange(this.value);
    this.onTouched();
  }

  decrement() {
    this.value--;
    this.onChange(this.value);
    this.onTouched();
  }
```

8. Additional custom components are added following the first custom component class.

Example:
```TypeScript
class customComponent1 {
  template = `
        <h1>{{value}}</h1>
        <button (click)='increment()'>Increment</button>
        <button (click)='decrement()'>Decrement</button>
    `;

  onChange = (value: any) => {};

  onTouched = () => {};

  value = 0;

  disabled = false

  increment() {
    this.value++;
    this.onChange(this.value);
    this.onTouched();
  }

  decrement() {
    this.value--;
    this.onChange(this.value);
    this.onTouched();
  }
}

class customComponent2 {
  template = `
        <input type="file" class="file-input" (change)="onFileSelected($event)" #fileUpload>

        <div>
            <input class="form-control" [disabled]="true" [value]="value">
            <button class="btn btn-primary" (click)="onClick(fileUpload)" [disabled]="disabled">Attach File</button>
        </div>
    `;

  onChange = (value: any) => {};

  onTouched = () => {};

  value = '';

  disabled = false;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.value = file.name;
      console.log(this.value);
      this.onChange(this.value);
    }
  }

  onClick(fileUpload: any) {
    this.onTouched();
    fileUpload.click();
  }
}

```
9. Export custom component classes within an array.

Example:
```TypeScript
module.exports = [customComponent1, customComponent2]
```

10. Run `npx webpack` in terminal before running `ng serve`.

Custom component files will be generated and required modifications to the app.modules file will be made.

## Contributors
- Aaron Chen - [Github](https://github.com/achen220)
- Ryan Hastings - [Github](https://github.com/rhaasti)
- Wayne Leung - [Github](https://github.com/waynetwleung)
- Curtis Lovrak - [Github](https://github.com/CurtisLovrak)
- Hadar Weinstein - [Github](https://github.com/HWein8)
