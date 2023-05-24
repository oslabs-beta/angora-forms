class tags {
  tagsLogicName = (param1, param2) => {
  // logic wanted
  console.log(param1 + param2);
  }
}

class selectDropDown {
  selectDropDownLogicName = (param3, param4) => {
  // logic wanted
  console.log(param3 + param4);
  }
}

class xxxx {
  xxxxLogicName = (param5, param6) => {
  // logic wanted
  console.log(param5 + param6);
  }
}

class ratings {
  // logic wanted
  template = `
      <input
        [value]="value"
        (input)="onChange($event.target.value)"
        (blur)="onTouched()"
      />
    `;
}

class hadarComp1 {
  template = `
        <h1>{{num}}</hi>
        <button (click)='increment()'></button>
        <button (click)='decrement()'></button>
    `;
  onChange = (num) => {};

  onTouched = () => {};

  num = 0;

  increment() {
    this.num++;
    this.onChange(this.num);
    this.onTouched();
  }

  decrement() {
    this.num--;
    this.onChange(this.num);
    this.onTouched();
  }
}

class hadarComp2 {
  template = `
        <input type="file" class="file-input" (change)="onFileSelected($event)" #fileUpload>

        <div>
            <input class="form-control" [disabled]="true" [value]="fileName">
            <button class="btn btn-primary" (click)="onClick(fileUpload)" [disabled]="disabled">Attach File</button>
        </div>
    `;

  onChange = (fileName) => {};

  onTouched = () => {};

  fileName = '';

  disabled = false;

  onFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      console.log(this.fileName);
      this.onChange(this.fileName);
    }
  }

  onClick(fileUpload) {
    this.onTouched();
    fileUpload.click();
  }
}

module.exports = [tags, selectDropDown, xxxx, ratings, hadarComp1, hadarComp2]

// export class instead functions


