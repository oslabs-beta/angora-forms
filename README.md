<div align="center">
  <img width="400" src="https://i.ibb.co/QmqpnBL/angoralogo.png">
</div>

# Angora Forms
Angora Forms is a custom form component abstraction library designed for Angular that streamlines and simplifies the process of creating reactive custom form components in Angular. 

Custom form components in Angular come with a bit of boilerplate code; Angora Forms' components abstract away ~90% of that boilerplate code.

See https://www.angoraforms.com/ or below for example code comparison.

## Documentation
The official documentation website is https://www.angoraforms.com/docs.

Angora Forms version 1.0.4 was released on 6/20/23. You can find more details on https://www.npmjs.com/package/@angoraforms/angora-loader/v/1.0.3?activeTab=versions

## Key Features
- **Ease of Use:** Getting started with Angora Forms is simple. Visit our documentation for a quick start up guide.
- **Static Typing:** Custom components created with our abstraction library accomodate for TypeScript to adhere to the philosophy of the Angular framework and improve overall deveoper experience.
- **Customizable Components:** Angora Forms does not come with component styling.  Developers are free to style any components to their own tastes.
- **Maintainability:** Custom components are aggregated in a single location with minimal boilerplate code normally required by the Angular framework, aiding maintainability and improving reviewability.

## Getting Started
1. Install [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

2. Install Angora Forms [npm library link](https://www.npmjs.com/package/@angoraforms/angora-loader).
```
npm i @angoraforms/angora-loader
```

3. Configure webpack.config.ts:
```typescript
const path = require("path");
const customComponents = require('./src/app/customComponents.ts')

module.exports = {
  mode: "development",
  entry: ["./src/app/app.module.ts"],
  output: {},
  devtool: false,
  module: {
    rules: [
      {
        test: /\.ts$/, 
        use: [
          {
            loader: "@angoraforms/angora-loader",

            options: {
              customComponents: customComponents
            }
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
```

4. Create Custom Component File:
```TypeScript
class customComponent1 {

    template = '/* html template */'
  
    onChange = (value: any) => {};
  
    onTouched = () => {};
  
    value: any = 0;
  
    disabled = false
  }

```
Each custom component class will require a template, onChange, onTouched, value and disabled property.

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

## Example Comparison

### Without Angora Forms:

customComponent1.ts
```TypeScript
import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'custom-comp1',
  template: `
    
        <h1>{{value}}</h1>
        <button (click)='increment()'>Increment</button>
        <button (click)='decrement()'>Decrement</button>
    
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: customComp1
    }
  ]
})
export class customComp1 implements ControlValueAccessor {

onChange = (value: any) => { }
onTouched = () => { }
value = 0
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
```
customComponent2.ts
```TypeScript

import { Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'custom-comp2',
  template: `
    
        <input type="file" class="file-input" (change)="onFileSelected($event)" #fileUpload>

        <div>
            <input class="form-control" [disabled]="true" [value]="value">
            <button class="btn btn-primary" (click)="onClick(fileUpload)" [disabled]="disabled">Attach File</button>
        </div>
    
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: customComp2
    }
  ]
})
export class customComp2 implements ControlValueAccessor {

onChange = (value: any) => { }
onTouched = () => { }
value = ''
disabled = false 

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
```

### With Angora Forms:

```TypeScript
class customComp1 {
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

class customComp2 {
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

module.exports = [customComp1, customComp2]
```
## Other Information

AngoraForms is in beta and will be updated in the future. 

https://medium.com/@wayneleung_2900/making-angular-custom-form-components-easier-to-work-with-e2f7ace48cb2

You should also take a look at the companion Form Builder web application and its github repo https://www.angoraforms.com/FormBuilder (https://github.com/AngoraForms/AngoraFormApp)!

## Contributors

- Aaron Chen - [Github](https://github.com/achen220) [Github](https://www.linkedin.com/in/aaronchen9149)
- Ryan Hastings - [Github](https://github.com/rhaasti) [Github] (https://www.linkedin.com/in/rhaasti)
- Wayne Leung - [Github](https://github.com/waynetwleung) [Github] (https://www.linkedin.com/in/wayne-leung-1242422a)
- Curtis Lovrak - [Github](https://github.com/CurtisLovrak) [Github] (https://www.linkedin.com/in/curtislovrak)
- Hadar Weinstein - [Github](https://github.com/HWein8) [Github] (https://www.linkedin.com/in/hadarweinstein)

## License

This project is licensed under the MIT License.
