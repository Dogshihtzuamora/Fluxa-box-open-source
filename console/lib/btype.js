const Btype = {
    bimg: function(id, src, width = 'auto', height = 'auto', alt = '', filter = '') {      
        this.Bimg.createAndInsert(id, src, width, height, alt, filter);
    },

    Bimg: {
        convertAndDisplay: function() {
            const bimgElements = document.querySelectorAll('bimg');
            bimgElements.forEach(element => {
                const src = element.getAttribute('src');
                const width = element.getAttribute('width') || 'auto';
                const height = element.getAttribute('height') || 'auto';
                const alt = element.getAttribute('alt') || '';
                const filter = element.getAttribute('filter') || '';
                const id = element.getAttribute('id') || '';

                const base64Data = this.content(src);

                const img = document.createElement('img');
                img.src = 'data:image/png;base64,' + base64Data;
                img.width = width === 'auto' ? null : width;
                img.height = height === 'auto' ? null : height;
                img.alt = alt;

                img.style.maxWidth = '100%';
                img.style.filter = filter;

                if (id) img.id = id;

                element.replaceWith(img);
            });
        },

        createAndInsert: function(id, src, width = 'auto', height = 'auto', alt = '', filter = '') {
            const element = document.createElement('bimg');
            if (id) element.setAttribute('id', id);
            element.setAttribute('src', src);
            if (width !== 'auto') element.setAttribute('width', width);
            if (height !== 'auto') element.setAttribute('height', height);
            if (alt) element.setAttribute('alt', alt);
            if (filter) element.setAttribute('filter', filter);

            document.body.appendChild(element);
            this.convertAndDisplay();
        },
       
        remove: function(id) {
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            } else {
                console.warn('Elemento com ID ' + id + ' não encontrado.');
            }
        },
       
        canvas: function(id, src, width = 'auto', height = 'auto', filter = '') {
            const base64Data = this.content(src); 
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = function() {
                canvas.width = width === 'auto' ? img.width : width;
                canvas.height = height === 'auto' ? img.height : height;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.style.filter = filter;

                if (id) canvas.id = id;
                document.body.appendChild(canvas);
            };

            img.src = 'data:image/png;base64,' + base64Data;
        },
        
        content: function(src) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', src, false); 
            xhr.send(); 

            if (xhr.status === 200) {
                return xhr.responseText;
            } else {
                console.error('Erro ao carregar a imagem:', xhr.status);
                return '';
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    Btype.Bimg.convertAndDisplay();
});

