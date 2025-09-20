/// <reference types="react-scripts" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.modules.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: string | { readonly [key: string]: string };
  export default content;
}