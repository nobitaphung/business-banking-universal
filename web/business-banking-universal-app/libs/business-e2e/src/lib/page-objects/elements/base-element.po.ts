import { Locator } from '@playwright/test';

//Need this for declaration merging to have access to Locator methods on BaseElement in compile time
export interface BaseElement extends Locator {
  root: Locator;
}

export class BaseElement {
  constructor(public root: Locator) {
    this.root = root;
    proxyLocatorMethodImplementationsToRoot(root, this);
  }
}

const proxyLocatorMethodImplementationsToRoot = (source: Locator, target: BaseElement): void => {
  const locatorTypeMethods = getMethodsToCopy(source, target);
  proxyCallsToRootObject(target, locatorTypeMethods);
};

const proxyCallsToRootObject = (target: BaseElement, locatorTypeMethods: (string | symbol)[]) => {
  locatorTypeMethods.forEach((name) => {
    const propertyToTransfer = target.root[name];
    if (typeof propertyToTransfer === 'function') {
      Object.defineProperty(target, name, {
        value: (...args: any[]) => Reflect.apply(propertyToTransfer, target.root, args),
      });
    } else {
      Object.defineProperty(target, name, { value: propertyToTransfer });
    }
  });
};

const getMethodsToCopy = (source: Locator, target: BaseElement): (string | symbol)[] => {
  const defaultObjectKeys = getAllKeys(target);
  return getAllKeys(source)
    .filter((name) => !name.toString().startsWith('_'))
    .filter((name) => !defaultObjectKeys.includes(name));
};

const getAllKeys = (obj: object): (string | symbol)[] => {
  let keys: (string | symbol)[] = [];
  // if primitive (primitives still have keys) skip the first iteration
  if (!(obj instanceof Object)) {
    obj = Object.getPrototypeOf(obj);
  }
  while (obj) {
    keys = keys.concat(Reflect.ownKeys(obj));
    obj = Object.getPrototypeOf(obj);
  }
  return keys;
};
