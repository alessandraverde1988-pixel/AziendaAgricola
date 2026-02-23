// Struttura Lotti
const lottiAgricoli = [
    { id: 1, nome: "Lotto Nord A", areaHa: 5.0, colturaCorrente_ID: 101 },
    { id: 2, nome: "Vigna Collina", areaHa: 3.5, colturaCorrente_ID: 102 },
    { id: 3, nome: "Serra 1", areaHa: 0.5, colturaCorrente_ID: 103 },
    { id: 4, nome: "Campo Sud", areaHa: 10.0, colturaCorrente_ID: 101 }
];

// Struttura Colture
const coltureDisponibili = [
    { id: 101, nome: "Grano Tenero", durataGiorni: 180 },
    { id: 102, nome: "Uva Sangiovese", durataGiorni: 365 },
    { id: 103, nome: "Pomodoro", durataGiorni: 90 },
    { id: 104, nome: "Mais", durataGiorni: 120 }
];

// Struttura Tipi Intervento (con costo unitario stimato per calcoli)
const tipiIntervento = [
    { id: 'I01', nome: "Semina", unita: "Kg/Ha", costoUnitario: 50 }, // 50€ per Kg di seme
    { id: 'I02', nome: "Irrigazione", unita: "Litri/Ha", costoUnitario: 0.05 }, // 0.05€ per Litro
    { id: 'I03', nome: "Concimazione", unita: "Kg/Ha", costoUnitario: 2.5 }, // 2.5€ per Kg concime
    { id: 'I04', nome: "Raccolta", unita: "Ore", costoUnitario: 35 }, // 35€ all'ora (manodopera/macchina)
    { id: 'I05', nome: "Trattamento Fito", unita: "Litri/Ha", costoUnitario: 15 } // 15€ per Litro prodotto
];

// Inizializzazione Registro (Simulazione DB con LocalStorage)
let registroInterventi = JSON.parse(localStorage.getItem('registroInterventi')) || [];

// --- LOGICA GENERALE ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Identifica la pagina corrente
    const path = window.location.pathname;
    const page = path.split("/").pop();

    if (page === 'index.html' || page === '') {
        inizializzaCarosello();
    } else if (page === 'registro.html') {
        popolaDropdowns();
        setupFormListener();
    } else if (page === 'report.html') {
        setupReportPage();
    }
});


// --- 2. FUNZIONALITÀ INDEX.HTML (CAROSELLO) ---
let slideIndex = 0;

function inizializzaCarosello() {
    const slides = document.getElementsByClassName("slide");
    if (slides.length === 0) return; // Sicurezza se non ci sono slide

    mostraSlides();
}

function mostraSlides() {
    let i;
    const slides = document.getElementsByClassName("slide");
    
    // Nascondi tutte le slide
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}    
    
    // Mostra la slide corrente
    slides[slideIndex-1].style.display = "block";  
    
    // Cambio automatico ogni 5 secondi
    setTimeout(mostraSlides, 5000); 
}


// --- 3. FUNZIONALITÀ REGISTRO.HTML ---

function popolaDropdowns() {
    const selectLotto = document.getElementById('lotto');
    const selectColtura = document.getElementById('coltura');
    const selectIntervento = document.getElementById('tipoIntervento');

    // Popola Lotti
    lottiAgricoli.forEach(lotto => {
        const option = document.createElement('option');
        option.value = lotto.id;
        option.text = `${lotto.nome} (${lotto.areaHa} Ha)`;
        selectLotto.appendChild(option);
    });

    // Popola Colture
    coltureDisponibili.forEach(coltura => {
        const option = document.createElement('option');
        option.value = coltura.id;
        option.text = coltura.nome;
        selectColtura.appendChild(option);
    });

    // Popola Tipi Intervento
    tipiIntervento.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.id;
        option.text = `${tipo.nome} (${tipo.unita})`;
        selectIntervento.appendChild(option);
    });
}

function calcolaCostoOperazione(tipoID, quantita) {
    // Trova il costo unitario
    const intervento = tipiIntervento.find(t => t.id === tipoID);
    if (!intervento) return 0;
    
    // Calcolo semplice: Quantità inserita * Costo Unitario
    // Nota: Nella realtà si moltiplicherebbe anche per gli ettari se la quantità fosse "per Ha"
    // Qui assumiamo che l'utente inserisca la quantità TOTALE usata o calcoliamo in base logica.
    // Per semplicità simulativa: Costo = Qta * CostoUnitario
    return (quantita * intervento.costoUnitario).toFixed(2);
}

function setupFormListener() {
    const form = document.getElementById('formRegistro');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const lottoID = parseInt(document.getElementById('lotto').value);
        const dataStr = document.getElementById('data').value;
        const oraStr = document.getElementById('ora').value;
        const interventoID = document.getElementById('tipoIntervento').value;
        const quantita = parseFloat(document.getElementById('quantita').value);
        const colturaID = parseInt(document.getElementById('coltura').value);

        // Oggetto Dati Intervento
        const nuoviDati = {
            lottoID, dataStr, oraStr, interventoID, quantita, colturaID
        };

        if (validaRegistrazione(nuoviDati)) {
            // Calcolo Costo
            const costo = calcolaCostoOperazione(interventoID, quantita);
            
            // Creazione Oggetto Record
            const record = {
                id: Date.now(), // ID univoco temporale
                lottoID: lottoID,
                colturaID: colturaID,
                tipoInterventoID: interventoID,
                dataOra: `${dataStr}T${oraStr}`,
                quantita: quantita,
                costoOperazione: parseFloat(costo)
            };

            // Salvataggio
            registroInterventi.push(record);
            localStorage.setItem('registroInterventi', JSON.stringify(registroInterventi));

            alert(`Intervento registrato con successo! Costo stimato: €${costo}`);
            form.reset();
        }
    });
}

function validaRegistrazione(dati) {
    // Passo 1: Campi obbligatori (HTML5 lo fa già, ma rinforziamo)
    if (!dati.lottoID || !dati.dataStr || !dati.interventoID || !dati.quantita) {
        alert("Compilare tutti i campi obbligatori.");
        return false;
    }

    // Passo 2: Validazione Logica (No date future)
    const dataInserita = new Date(`${dati.dataStr}T${dati.oraStr}`);
    const dataOdierna = new Date();

    if (dataInserita > dataOdierna) {
        alert("Errore: Non è possibile registrare interventi nel futuro.");
        return false;
    }

    if (dati.quantita <= 0) {
        alert("Errore: La quantità deve essere positiva.");
        return false;
    }

    return true;
}


// --- 4. FUNZIONALITÀ REPORT.HTML ---

function setupReportPage() {
    // Mostra data odierna
    const oggi = new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('dataOdierna').innerText = oggi;

    // Render iniziale
    mostraStatoLotti();
    renderReport(); // Tutti i record

    // Listener Filtro
    document.getElementById('cercaLotto').addEventListener('input', (e) => {
        renderReport(e.target.value);
    });
}

function mostraStatoLotti() {
    const tbody = document.querySelector('#tabellaStatoLotti tbody');
    tbody.innerHTML = '';

    lottiAgricoli.forEach(lotto => {
        // Calcola costo cumulativo per questo lotto
        const totaleSpeso = registroInterventi
            .filter(r => r.lottoID === lotto.id)
            .reduce((acc, curr) => acc + curr.costoOperazione, 0);

        const coltura = coltureDisponibili.find(c => c.id === lotto.colturaCorrente_ID);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${lotto.nome}</td>
            <td>${lotto.areaHa} Ha</td>
            <td>${coltura ? coltura.nome : 'Nessuna'}</td>
            <td>€ ${totaleSpeso.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderReport(filtroTesto = "") {
    const tbody = document.querySelector('#tabellaStorico tbody');
    tbody.innerHTML = '';

    // Filtra array
    const recordFiltrati = registroInterventi.filter(record => {
        const lotto = lottiAgricoli.find(l => l.id === record.lottoID);
        const nomeLotto = lotto ? lotto.nome.toLowerCase() : "";
        const dataRecord = record.dataOra.split('T')[0];
        
        // Filtra per nome lotto o data (semplice)
        return nomeLotto.includes(filtroTesto.toLowerCase()) || dataRecord.includes(filtroTesto);
    });

    // Ordina per data decrescente (più recente in alto)
    recordFiltrati.sort((a, b) => new Date(b.dataOra) - new Date(a.dataOra));

    if (recordFiltrati.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nessun intervento trovato</td></tr>';
        return;
    }

    recordFiltrati.forEach(record => {
        const lotto = lottiAgricoli.find(l => l.id === record.lottoID);
        const coltura = coltureDisponibili.find(c => c.id === record.colturaID);
        const intervento = tipiIntervento.find(t => t.id === record.tipoInterventoID);
        
        const dataFormattata = new Date(record.dataOra).toLocaleString('it-IT');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${lotto ? lotto.nome : 'N/D'}</td>
            <td>${coltura ? coltura.nome : 'N/D'}</td>
            <td>${intervento ? intervento.nome : 'N/D'}</td>
            <td>${dataFormattata}</td>
            <td>${record.quantita}</td>
            <td>${intervento ? intervento.unita : ''}</td>
            <td>€ ${record.costoOperazione.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}