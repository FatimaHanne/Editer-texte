// Éditeur de texte - Script JavaScript complet

const content = document.getElementById('content');
const fileOptions = document.getElementById('file-options');
const stylesSelect = document.getElementById('styles');
const fontSelect = document.getElementById('font-select');
const zoomSelect = document.getElementById('zoom-select');
const fontSizeSelect = document.getElementById('font-size');
const filenameInput = document.querySelector('input[type="text"]');

// Fonction principale pour formater le document
function formatDoc(cmd, value = null) {
    if (value) {
        document.execCommand(cmd, false, value);
    } else {
        document.execCommand(cmd);
    }
    content.focus();
}

// Gestion des boutons de la barre d'outils
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn-toolbar button');
    
    buttons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const commands = [
                'undo',           // Annuler
                'redo',           // Rétablir
                'bold',           // Gras
                'italic',         // Italique
                'underline',      // Souligner
                'strikeThrough',  // Barré
                'justifyLeft',    // Aligner à gauche
                'justifyCenter',  // Centrer
                'justifyRight',   // Aligner à droite
                'justifyFull',    // Justifier
                'insertUnorderedList', // Liste non ordonnée
                'insertOrderedList'    // Liste ordonnée
            ];
            
            if (commands[index]) {
                formatDoc(commands[index]);
            }
        });
    });
});

// Gestion des styles de texte (H1, H2, etc.)
stylesSelect.addEventListener('change', function() {
    const value = this.value;
    if (value) {
        formatDoc('formatBlock', value);
        this.selectedIndex = 0; // Reset selection
    }
});

// Gestion de la police
fontSelect.addEventListener('change', function() {
    const fontName = this.value;
    
    // Méthode alternative plus fiable pour changer la police
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        // Si du texte est sélectionné
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
            const span = document.createElement('span');
            span.style.fontFamily = fontName;
            try {
                range.surroundContents(span);
            } catch (e) {
                // Si surroundContents échoue, utiliser extractContents
                const contents = range.extractContents();
                span.appendChild(contents);
                range.insertNode(span);
            }
            selection.removeAllRanges();
        } else {
            // Si aucun texte n'est sélectionné, appliquer à tout le contenu
            content.style.fontFamily = fontName;
        }
    } else {
        // Aucune sélection, appliquer à tout le contenu
        content.style.fontFamily = fontName;
    }
    
    // Essayer aussi la méthode execCommand comme fallback
    try {
        formatDoc('fontName', fontName);
    } catch (e) {
        console.log('execCommand fontName non supporté');
    }
    
    content.focus();
});

// Gestion de la taille de police
fontSizeSelect.addEventListener('change', function() {
    const size = parseInt(this.value);
    // Conversion px vers taille HTML (1-7)
    let htmlSize;
    if (size <= 12) htmlSize = 1;
    else if (size <= 14) htmlSize = 2;
    else if (size <= 16) htmlSize = 3;
    else if (size <= 18) htmlSize = 4;
    else if (size <= 20) htmlSize = 5;
    else if (size <= 24) htmlSize = 6;
    else htmlSize = 7;
    
    formatDoc('fontSize', htmlSize);
});

// Gestion du zoom
zoomSelect.addEventListener('change', function() {
    const zoomValue = this.value + '%';
    content.style.zoom = zoomValue;
});

// Gestion des options de fichier
fileOptions.addEventListener('change', function() {
    const option = this.value;
    
    switch(option) {
        case 'new':
            newFile();
            break;
        case 'download-pdf':
            downloadAsPDF();
            break;
        case 'download-doc':
            downloadAsDoc();
            break;
    }
    
    this.selectedIndex = 0; // Reset selection
});

// Fonction pour créer un nouveau fichier
function newFile() {
    if (confirm('Voulez-vous créer un nouveau document ? Le contenu actuel sera perdu.')) {
        content.innerHTML = '<p>Votre texte ici...</p>';
        filenameInput.value = 'Nouveau document';
    }
}

// Fonction pour télécharger en PDF (simulation)
function downloadAsPDF() {
    // Note: Pour une vraie conversion PDF, vous devriez utiliser une bibliothèque comme jsPDF
    const filename = filenameInput.value || 'document';
    
    // Simulation d'un téléchargement PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>${filename}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
            </style>
        </head>
        <body>
            ${content.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Fonction pour télécharger en DOC
function downloadAsDoc() {
    const filename = filenameInput.value || 'document';
    const htmlContent = content.innerHTML;
    
    // Créer un blob avec le contenu HTML formaté pour Word
    const blob = new Blob([
        `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
         xmlns:w='urn:schemas-microsoft-com:office:word' 
         xmlns='http://www.w3.org/TR/REC-html40'>
         <head><meta charset='utf-8'><title>${filename}</title></head>
         <body>${htmlContent}</body></html>`
    ], { type: 'application/msword' });
    
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Sauvegarde automatique dans localStorage
function autoSave() {
    localStorage.setItem('editorContent', content.innerHTML);
    localStorage.setItem('editorFilename', filenameInput.value);
}

// Chargement automatique au démarrage
function autoLoad() {
    const savedContent = localStorage.getItem('editorContent');
    const savedFilename = localStorage.getItem('editorFilename');
    
    if (savedContent) {
        content.innerHTML = savedContent;
    }
    if (savedFilename) {
        filenameInput.value = savedFilename;
    }
}

// Événements pour la sauvegarde automatique
content.addEventListener('input', autoSave);
filenameInput.addEventListener('input', autoSave);

// Charger le contenu sauvegardé au démarrage
document.addEventListener('DOMContentLoaded', autoLoad);
// Fonction utilitaire pour maintenir le focus sur l'éditeur
function maintainFocus() {
    if (document.activeElement !== content) {
        content.focus();
    }
}

