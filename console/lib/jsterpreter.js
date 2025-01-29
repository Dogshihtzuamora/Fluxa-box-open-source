function require(filePath) {   
    if (require.cache[filePath]) {
        return;
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', filePath, false); 
    xhr.send();

    if (xhr.status === 200) {       
        const script = document.createElement('script');
        script.textContent = xhr.responseText;
        document.head.appendChild(script);
       
        require.cache[filePath] = true;
    } else {
        throw new Error(`Erro ao carregar o arquivo: ${filePath} - ${xhr.statusText}`);
    }
}

require.cache = {};
(function() {
    const create = {};
   
    create.fluxaElement = function(tag) {
        const element = document.createElement(tag);
        const viewport = document.getElementById('gameViewport');
       
        element.style.position = 'absolute'; 
        element.style.maxWidth = '100%';     
        element.style.maxHeight = '100%';     
        element.style.boxSizing = 'border-box'; 
       
        element.style.left = '50%';
        element.style.top = '50%';
        element.style.transform = 'translate(-50%, -50%)'; 
       
        viewport.appendChild(element);
              
        function autoAdjust() {
            const viewportWidth = viewport.clientWidth;
            const viewportHeight = viewport.clientHeight;
            
           
            const elementWidth = element.offsetWidth;
            const elementHeight = element.offsetHeight;

         
            const newLeft = (viewportWidth - elementWidth) / 2;
            const newTop = (viewportHeight - elementHeight) / 2;

           
            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
        }
      
        window.addEventListener('resize', autoAdjust);
       
        autoAdjust();

        return element;
    };
  
    window.create = create;
})();

