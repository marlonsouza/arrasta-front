<template>
  <div id="app">
    <h1>Arrasta.click</h1>

    <input type="text" v-model="urlInput" placeholder="Cole seu link aqui">
    <input type="text" v-model="customAlias" placeholder="Alias">
    <input type="date" v-model="expiryDate">
    <br />
    <button @click="shortenUrl">Se sabe</button>

    <div v-if="shortenedUrl" class="result">
      <p>Link arrasta: <a :href="shortenedUrl" target="_blank">{{ shortenedUrl }}</a></p>
      <img :src="qrCode" alt="QR Code" />
      <br />
      <button @click="copyUrl">Copiar URL</button>
      <button @click="downloadQrCode">Baixar QR Code</button>
    </div>
  </div>
</template>

<script>

import "./assets/style.css";

export default {
  data() {
    return {
      urlInput: '',
      customAlias: '',
      expiryDate: new Date().toISOString().split('T')[0],
      shortenedUrl: null,
      qrCode: null,
    };
  },
  methods: {
    async shortenUrl() {
      try {
        const response = await fetch('https://arrasta.click/shorten', { // Assuming you're using the _redirects file
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ originalUrl: this.urlInput, customAlias: this.customAlias, expiryDate: this.expiryDate }),
        });

        if (!response.ok) {
          const errorData = await response.json(); // Get error details from response
          throw new Error(errorData.error || 'Failed to shorten URL'); // Throw an error with the message
        }

        const data = await response.json();
        this.shortenedUrl = data.shortUrl;
        this.qrCode = data.qrCode;
      } catch (error) {
        // Handle errors here (e.g., display an error message to the user)
        console.error('Error shortening URL:', error);
        alert(error.message); // Example: Display an alert with the error message
      }
    },
    copyUrl() {
      navigator.clipboard.writeText(this.shortenedUrl)
      .then(() => {
          alert('URL copiada!');
        })
      .catch(err => {
          console.error('Failed to copy URL: ', err);
          // Optional: Display an error message
        });
    },

    downloadQrCode() {
      const link = document.createElement('a');
      link.href = this.qrCode;
      link.download = 'qrcode.png'; // Set the filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};
</script>