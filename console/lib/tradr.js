function tradr(key) { 
      const idioma = navigator.language || navigator.userLanguage;
      const idiomaBase = idioma.split('-')[0]; 

      const xhr = new XMLHttpRequest();
      xhr.open("GET", "../lib/lang.json", false);

      try {  
        xhr.send();
        
        if (xhr.status === 200) {
          const translations = JSON.parse(xhr.responseText);
        
          if (translations[key]) {      
            return translations[key][idiomaBase] || translations[key]['en'];
          } else {
            return key; 
          }
        } else {
          console.error("Erro ao carregar o arquivo lang.json:", xhr.status);
          return key; 
        }
      } catch (error) {
        console.error("Erro ao carregar o arquivo de traduções:", error);
        return key; 
      }
    }
   
    function traduzirElementos() {
      const elementos = document.querySelectorAll('[data-tradr]'); 
      elementos.forEach((elemento) => {
        const chave = elemento.getAttribute('data-tradr');
        const traducao = tradr(chave);
        elemento.textContent = traducao; 
      });
    }

    window.onload = traduzirElementos; 
