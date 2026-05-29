import { render } from "preact";

export const renderToElement = (node) => {
  const container = document.createElement("div");
  render(node, container);
  return container.firstElementChild;
};
