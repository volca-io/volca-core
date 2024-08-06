export default async () => {
  if (globalThis.__DATABASE__) {
    await globalThis.__DATABASE__.destroy();
  }

  if (globalThis.__CONTAINER__) {
    await globalThis.__CONTAINER__.stop();
  }
};
