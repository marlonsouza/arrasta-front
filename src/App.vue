<template>
  <div id="app">
    <nav class="navigation">
      <router-link to="/@/" class="nav-link">Encurtar URL</router-link>
      <router-link to="/@/lookup" class="nav-link">Consultar Link</router-link>
    </nav>
    
    <router-view />
  </div>
</template>

<script>
import "./assets/style.css";

export default {
  name: 'App',
};
</script>