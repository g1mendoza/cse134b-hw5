//Custom Element #2: console-greet prints "Hello World!" to the browser console.
class ConsoleGreet extends HTMLElement {
  connectedCallback() {
    console.log("Hello World!");
  }
}
customElements.define("console-greet", ConsoleGreet);

// Custom Element #1: skill-tag is a semantic CSS custom element
class SkillTag extends HTMLElement{
}
customElements.define("skill-tag", SkillTag);