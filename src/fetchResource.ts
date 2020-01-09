import memOne from "memoize-one";

import { ResourcePromise } from "./ResourcePromise";

function randomInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function timeoutRandom(fn: Function) {
  const timeout = setTimeout(() => {
    clearTimeout(timeout);
    fn();
  }, randomInterval(400, 1000));
}

export function fetchResource<T>(value: T) {
  return new ResourcePromise<T>(
    new Promise(resolve => {
      timeoutRandom(() => {
        resolve(value);
      });
    })
  );
}

export const fetchImage = memOne(function fetchImage(src: string) {
  return new ResourcePromise(
    new Promise(resolve => {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        timeoutRandom(() => resolve(src));
      };
    })
  );
});
