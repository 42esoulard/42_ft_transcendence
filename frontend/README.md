# app

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## CSS norm

**BEM** (Block \_\_Element --Modifier)

- To identify elements, we should only use .class. It avoids specificity issues.
- BEM is a naming convention that helps us to achieve reusable components and code sharing.
- Here is an example:
  ```
  <nav  class="top-menu">
  	<li  class="top-menu__link">Link</li>
  	<li  class="top-menu__link">Link</li>
  	<li  class="top-menu__link top-menu__link--active">Active Link</li>
  ```
- More at: http://getbem.com/introduction/

**SASS**

- Every CSS should be written using sass, in the appropriate file.
- To include a scss file in a .vue file:
  ```
  <style  lang="scss">
  	@import  "PATH.scss";
  </style>
  ```
- Path: frontend/sass/
- More at: https://sass-lang.com/documentation

**7-1 pattern**

- This is a popular modular way to structure a sass project, in 7 directories.
- More at: https://www.learnhowtoprogram.com/user-interfaces/building-layouts-preprocessors/7-1-sass-architecture
