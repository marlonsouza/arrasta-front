<template>
  <div id="app">
    <nav class="navigation">
      <router-link to="/@/" class="nav-link">Encurtar URL</router-link>
      <router-link to="/@/lookup" class="nav-link">Consultar Link</router-link>
    </nav>

    <router-view />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  overflow-x: hidden;
}

@media (min-width: 1024px) {
  #app {
    height: 100vh;
    overflow: hidden;
  }
}
</style>

<script>
import "./assets/style.css";

export default {
  name: 'App',
};
</script>