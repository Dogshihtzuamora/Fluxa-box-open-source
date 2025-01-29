// FLBXG.js

        class FLBXG {
            static async converterFlbxg(files) {
                const archiveContent = {};
                for (const [path, file] of files) {
                    const content = await this.#readFileAsText(file);
                    archiveContent[path] = content;
                }
                return JSON.stringify(archiveContent);
            }

            static async desconverterFlbxg(flbxgContent) {
                try {
                    if (flbxgContent instanceof File) {
                        flbxgContent = await this.#readFileAsText(flbxgContent);
                    }
                    const content = JSON.parse(flbxgContent);
                    const fileStructure = {};
                    
                    for (const path in content) {
                        let current = fileStructure;
                        const parts = path.split('/');
                        
                        parts.forEach((part, index) => {
                            if (index === parts.length - 1) {
                                current[part] = {
                                    type: 'file',
                                    path: path,
                                    content: content[path],
                                    name: part
                                };
                            } else {
                                current[part] = current[part] || {
                                    type: 'directory',
                                    name: part,
                                    children: {}
                                };
                                current = current[part].children;
                            }
                        });
                    }

                    return {
                        structure: fileStructure,
                        files: content
                    };
                } catch (error) {
                    throw new Error('Erro ao desconverter arquivo FLBXG: ' + error.message);
                }
            }

            static #readFileAsText(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(e);
                    reader.readAsText(file);
                });
            }
        }

