const {
  generateAngularComponent,
  generateMethods,
  typescriptIfy,
  generateTemplate,
  toKebabCase,
  generateProperties,
  formatValue,
// eslint-disable-next-line @typescript-eslint/no-var-requires
} = require('../');

test('generateAngularComponent should generate a valid component', () => {
  class TestClass {
    template = '<div>Hello World</div>';
    testMethod() {
      return true;
    }
  }

  const componentCode = generateAngularComponent(TestClass);
  expect(componentCode).toContain(
    'export class TestClass implements ControlValueAccessor'
  );
});

test('generateMethods should generate method string', () => {
  const methods = ['', 'testMethod'];
  const instance = {
    testMethod() { return true; },
  };

  const methodString = generateMethods(instance, methods);
  expect(methodString).toContain('testMethod() { return true; }');
});

test('typescriptIfy should add : any to function parameters', () => {
  const functionCode = '(param1, param2)';
  expect(typescriptIfy(functionCode)).toBe('(param1: any, param2: any)');
});

test('generateTemplate should wrap HTML in backticks', () => {
  const html = '<div>Hello World</div>';
  expect(generateTemplate(html)).toBe(`\n    ${html}\n  `);
});

test('toKebabCase should convert CamelCase to kebab-case', () => {
  const str = 'CamelCase';
  expect(toKebabCase(str)).toBe('camel-case');
});

test('generateProperties should generate properties string', () => {
  const instance = {
    template: '<div>Hello World</div>',
    testProp: 'testValue',
    onChange: (value: any) => {},
  };

  const propertiesString = generateProperties(instance);
  expect(propertiesString).toContain('testProp = \'testValue\'');
  expect(propertiesString).toContain('onChange = (value: any) => { }');
});

test('formatValue should format value correctly', () => {
  expect(formatValue('test')).toBe('\'test\'');
  expect(formatValue(true)).toBe('true');
  expect(formatValue(123)).toBe(123);
});

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
}));

jest.mock('path', () => ({
  resolve: jest.fn(),
}));