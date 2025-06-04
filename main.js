document.addEventListener("DOMContentLoaded", function () {
    console.log("html2pdf está listo para usarse.");
});



let langOptions = document.querySelectorAll("select");
let fromText = document.querySelector(".fromText");
let a_traducir = document.querySelector(".a_traducir");
let fromvoice = document.querySelector(".desde");
let tovoice = document.querySelector(".a");
let copiar = document.querySelector(".bx-clipboard-plus");
let contadorValores = document.querySelector(".codigo_extencion");
let cambioLenguaje = document.querySelector(".bx-swap-horizontal");
let copyError = document.getElementById("copy_error");
let copyNotification = document.getElementById("notification");
let clearError = document.getElementById("clear_error");
let ErrorDescargar = document.getElementById("descarga_error");

langOptions.forEach((get, con) => {
  for (let countryCode in language) {
    let selected;
    if (con == 0 && countryCode == "es") {
      selected = "selected";
    } else if (con == 1 && countryCode == "en") {
      selected = "selected";
    }
    let option = `<option value="${countryCode}" ${selected}>${language[countryCode]}</option>`;
    get.insertAdjacentHTML("beforeend", option);
  }
});

// RETARDO EN TRADUCCIÓN PARA EVITAR TEXTO INCOMPLETO
let timeout;
fromText.addEventListener("input", function () {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    let content = encodeURIComponent(fromText.value);
    let fromContent = langOptions[0].value;
    let toContent = langOptions[1].value;

    let transLINK = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromContent}&tl=${toContent}&dt=t&q=${content}`;

    fetch(transLINK)
      .then((response) => response.json())
      .then((data) => {
        let translatedText = data[0].map((segment) => segment[0]).join(" "); // Une todas las partes de la traducción
        a_traducir.value = translatedText;
        correcta;
      })
      .catch((error) => console.error("Error en la traducción:", error));
  }, 500);
});

// ACTUALIZAR TRADUCCIÓN CUANDO SE CAMBIA DE IDIOMA
langOptions.forEach((select) => {
  select.addEventListener("change", function () {
    fromText.dispatchEvent(new Event("input"));
  });
});
// CONTADOR DE CARACTERES
fromText.addEventListener("keyup", function () {
  contadorValores.innerHTML = `${fromText.value.length}/5,000`;
});

// REPRODUCCIÓN DE VOZ
fromvoice.addEventListener("click", function () {
  let fromtalk = new SpeechSynthesisUtterance(fromText.value);
  fromtalk.lang = langOptions[0].value;
  speechSynthesis.speak(fromtalk);
});

tovoice.addEventListener("click", function () {
  let totalk = new SpeechSynthesisUtterance(a_traducir.value);
  totalk.lang = langOptions[1].value;
  speechSynthesis.speak(totalk);
});

// COPIAR TEXTO
copiar.addEventListener("click", function () {
  if (a_traducir.value.trim() !== "") {
    navigator.clipboard.writeText(a_traducir.value);
    showMessage(copyNotification);
  } else {
    showMessage(copyError);
  }
});
cambioLenguaje.addEventListener("click", function () {
  let tempText = fromText.value;
  fromText.value = a_traducir.value;
  a_traducir.value = tempText;
  let tempOpt = langOptions[0].value;
  langOptions[0].value = langOptions[1].value;
  langOptions[1].value = tempOpt;
});
function clearText() {
  if (fromText.value.trim() === "" && a_traducir.value.trim() === "") {
    showMessage(clearError);
  } else {
    speechSynthesis.cancel(); 
    fromText.value = "";
    a_traducir.value = "";
    contadorValores.innerHTML = "0/5,000";
  }
}


// Función para mostrar mensajes de alerta
function showMessage(element) {
    element.style.opacity = "1";
    element.style.display = "block";

    setTimeout(() => {
        element.style.opacity = "0";
        setTimeout(() => {
            element.style.display = "none";
        }, 300);
    }, 2000);
}

function downloadTxt() {
  let originalText = document.querySelector(".fromText").value.trim();
  let translatedText = document.querySelector(".a_traducir").value.trim();

  if (originalText === "" && translatedText === "") {
    showMessage(ErrorDescargar);
    return;
  }

  let content = `Texto original:\n${originalText}\n\nTexto traducido:\n${translatedText}`;
  let blob = new Blob([content], { type: "text/plain" });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "traduccion.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
// Función para descargar el contenido como PDF
function downloadPdf() {
    let originalText = document.querySelector(".fromText").value.trim();
    let translatedText = document.querySelector(".a_traducir").value.trim();

    if (originalText === "" && translatedText === "") {
        showMessage(ErrorDescargar);
        return;
    }

    let content = document.createElement("div");
    content.style.fontFamily = "Arial, sans-serif";
    content.style.padding = "20px";
    content.innerHTML = `
        <h2>Traducción</h2>
        <p><strong>Texto original:</strong></p>
        <p>${originalText}</p>
        <p><strong>Texto traducido:</strong></p>
        <p>${translatedText}</p>
    `;

    // Cambia el nombre del archivo PDF
    let nombreArchivo = `Traduccion_${new Date().toISOString().slice(0, 10)}.pdf`;

    html2pdf().from(content).set({
        margin: 10,
        filename: nombreArchivo, // Aquí se cambia el nombre del archivo
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).save();
}





function detectLanguageAndTranslate() {
    let text = fromText.value.trim();
    
    if (text === "") return;

    let detectLink = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langOptions[1].value}&dt=t&q=${encodeURIComponent(text)}`;

    fetch(detectLink)
        .then(response => response.json())
        .then(data => {
            let detectedLang = data[2]; 
            langOptions[0].value = detectedLang; 
            translateText(); 
        })
        .catch(error => console.error("Error en la detección de idioma:", error));
}

function translateText() {
    let content = fromText.value.trim();
    let fromContent = langOptions[0].value; // Ahora el idioma de origen es el detectado
    let toContent = langOptions[1].value;

    if (content === "") return;

    let transLINK = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromContent}&tl=${toContent}&dt=t&q=${encodeURIComponent(content)}`;

    fetch(transLINK)
        .then(response => response.json())
        .then(data => {
            let translatedText = data[0].map(segment => segment[0]).join(" ");
            a_traducir.value = translatedText;
        })
        .catch(error => console.error("Error en la traducción:", error));
}

// Detecta idioma al pegar texto
fromText.addEventListener('paste', function() {
    setTimeout(detectLanguageAndTranslate, 100); // Esperar a que se pegue el texto antes de detectarlo
});
