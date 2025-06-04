"use strict";

let quizData = {
    it: [
        {
            frage: "Was bedeutet HTML?",
            answers: ["HyperText Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Multi Language"],
        },
        {
            frage: "Was macht CSS?",
            answers: ["Farbe und Layout", "Struktur", "Programmiert Logik", "Verwaltet Datenbanken"],
        }
    ]
    // weitere Kategorien später möglich
};

document.addEventListener('DOMContentLoaded', function () {
    let m = new Model();
    let p = new Presenter();
    let v = new View(p);
    p.setModelAndView(m, v);
});

function getXhr() { // API für asynchrone Aufrufe
    if (window.XMLHttpRequest) {
      var xhr = new XMLHttpRequest();
      return xhr;
    } 
    else return false;
}


// ################ Model ###########################
class Model {
    
    constructor() {
        this.quiznr = 1595; //Nummer auf Quizserver, wo Quiz startet
        this.randomArray=[];
        this.currentIndex = 0;
        this.correctAnswers = 0;
        this.jsondata = {};
        this.xhrdata = {};
        this.question = "";
        this.options = []
        this.answer = "";
        this.isCorrect = false; 
        this.quizLen = 0;
        this.context = new (window.AudioContext || window.webkitAudioContext)();

        const username=  "richter_georg@outlook.com";
        const pw = "secret";
        this.userdata = btoa(username + ":" + pw); //Base-64
        this.xhr = getXhr();
    }

    setCategory(cat) {
        //if (this.quizData[cat]) {
            this.currentCategory = cat;
            this.currentIndex = 0;
            this.correctAnswers = 0;
            this.randomArray = [];
            if(cat == "allg") {
                this.quiznr = 1595
                this.quizLen = 10;
            }
            if(cat == "it") {
                this.quizLen = 10;
            }
            if(cat == "mathe"){
                this.quizLen=10;
            }
            if(cat == "noten"){
                this.quizLen = 10;
            }
            if(cat == "akkorde"){
                this.quizLen = 10;
            }
            for(let i=0;i<this.quizLen;i++)
                this.randomArray.push(i);
            this.randomizeArray(this.randomArray);
        //}
    }

    randomizeArray(zahlen){
        // Fisher-Yates Shuffle
        for (let i = zahlen.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [zahlen[i], zahlen[j]] = [zahlen[j], zahlen[i]]; 
        }
        return zahlen;
    }

    async getTask() {
        if(this.currentIndex>=this.quizLen)
            return;
        if(this.currentCategory == "allg"){
            let success = await this.sendQstXhr(this.quiznr+this.randomArray[this.currentIndex])
            if (!success || !this.question) {
                alert("Frage konnte nicht geladen werden.\nÜberprüfe deine Verindung und versuche es erneut");
                return;
            }
        }
        else{
            let success = await this.getLocalXhr(this.randomArray[this.currentIndex])
            if (!success || !this.question) {
                alert("Frage konnte nicht geladen werden.\nÜberprüfe deine Verindung und versuche es erneut");
                return;
            }
        }  
    }

    async checkAnswer() {
        if(this.currentCategory == "allg")
        {
            let i=0;
            for(i=0; i< 4; i++) //4: Anzahl der Options
                if(this.answer === this.options[i])
                    break;
            let success = await this.sendAnsXhr(this.quiznr+this.currentIndex -1 , i);
            return success;
        }
        else
        {
            let correct = this.options[0];
            if (this.answer == correct) {
                this.isCorrect = true;
                return(true);
            }
            else
                return(false);
        }  
    }

    getProgress() {
        return {
            total: this.quizLen,
            current: this.currentIndex,
            correct: this.correctAnswers
        };
    }

    reset() {
        this.currentIndex = 0;
        this.correctAnswers = 0;
    }

    convertNote(note){
        let notenteile = note.split("/");
        switch (notenteile[0]){
            case "c#":
                notenteile[0]="db";
                break;
            case "d#":
                notenteile[0]="eb";
                break;
            case "f#":
                notenteile[0]="gb";
                break;
            case "g#":
                notenteile[0]="ab";
                break;
            case "a#":
                notenteile[0]="bb";
                break;
        }
        return notenteile[0]+notenteile[1]
    }

    playSound(buffer) {

        //creating source node
        console.log("AudioBuffer erfolgreich geladen.");
        var source = this.context.createBufferSource();
        //passing in data
        source.buffer = buffer;
        //giving the source which sound to play
        source.connect(this.context.destination);
        //start playing
        source.start(0);
    }

    playMultipleSounds(buffers) {
    for (let buffer of buffers) {
        if (!(buffer instanceof AudioBuffer)) {
            console.warn("Überspringe ungültigen Buffer:", buffer);
            continue;
        }
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(this.context.destination);
        source.start(0);
    }
}

    async getTone(note){
        this.xhr = getXhr();
        this.xhr.responseType = 'arraybuffer';

        return new Promise((resolve) =>{
            this.xhr.onreadystatechange = () => {
                if (this.xhr.readyState !== 4) return;

                if (this.xhr.status === 200) {
                    this.context.decodeAudioData(this.xhr.response,
                        (buffer) => {
                            this.playSound(buffer);
                            resolve(buffer);
                        },
                        (error) => {
                            console.error("Fehler beim Dekodieren der Audiodaten", error);
                            resolve(null);
                    });
                } else {
                    console.error("Fehler beim Laden des Tons "+note);
                    resolve(null);
                }
            };
            this.xhr.open('GET', 'Data/'+note+'.mp3');
            this.xhr.send(null);
        });
    }

    async getLocalXhr(index) {
        this.xhr = getXhr();

        return new Promise((resolve) =>{
            this.xhr.onreadystatechange = () => {
                if (this.xhr.readyState !== 4) return;

                if (this.xhr.status === 200) {
                    try{
                        this.jsondata = JSON.parse(this.xhr.responseText);
                        console.log("Daten aus JSON geladen:");
                        this.question = this.jsondata[this.currentCategory][index].a;
                        this.options = this.jsondata[this.currentCategory][index].l;
                        resolve(true);  // Text ist Ergebnis
                    }catch(e){
                        console.log("Fehler beim Parsen der Daten", e);
                        resolve(false);
                    }
                } else {
                    console.error("Fehler beim Laden der Aufgabe.");
                    resolve(false);
                }
            };
            this.xhr.open('GET', 'Data/quizdata.json');
            this.xhr.send(null);
        });

    }
    
    async sendQstXhr(nr) {
        this.xhr = getXhr();
        const TIMEOUT_MS = 5000;

        return new Promise((resolve) => {

            const timeoutId = setTimeout(() => {
                this.xhr.abort();
                console.error("Zeitüberschreitung beim Laden der Frage.");
                return (false);
            }, TIMEOUT_MS);
            this.xhr.onreadystatechange = () => {
                if (this.xhr.readyState !== 4) return;
                clearTimeout(timeoutId);

                if (this.xhr.status === 200) {
                    try{
                        this.xhrdata = JSON.parse(this.xhr.responseText);
                        console.log("Daten geladen:", this.xhrdata);
                        this.question = this.xhrdata.text;
                        this.options = this.xhrdata.options;
                        resolve (true);  // Text ist Ergebnis
                    }catch(e){
                        console.error("Fehler beim Parsen der Daten", e);
                        resolve(false);
                    }
                } else {
                    console.log("Fehler beim Laden der Aufgabe.");
                    resolve(false);
                }
            };
            this.xhr.open('GET', 'https://idefix.informatik.htw-dresden.de:8888/api/quizzes/' + nr);
            this.xhr.setRequestHeader("Authorization", "Basic " + this.userdata);
            this.xhr.send(null);
        });
    }

    async sendAnsXhr(nr, index) {
        this.xhr = getXhr();

        return new Promise((resolve) => {
            this.xhr.onreadystatechange = () => {
                if (this.xhr.readyState !== 4)
                    return;

                if (this.xhr.status === 200) {
                    try{
                        this.xhrdata= JSON.parse(this.xhr.responseText);
                        this.isCorrect = this.xhrdata.success;
                        console.log("Daten erhalten:", this.xhrdata);
                        resolve(true);  // Text ist Ergebnis
                    }catch(e){
                        console.error("Fehler beim Parsen der Daten", e);
                        resolve(false);
                    }
                } else {
                    console.error("Fehler beim Laden der Lösung.");
                    resolve(false);
                }
            };
            this.xhr.open('POST', 'https://idefix.informatik.htw-dresden.de:8888/api/quizzes/'+nr+'/solve');
            this.xhr.setRequestHeader("Authorization", "Basic " + this.userdata);
            this.xhr.setRequestHeader("Content-Type", "application/json");
            this.xhr.send("["+index+"]");
        });
    }
}

// ################ Presenter (Controller) ######################
class Presenter {
    constructor() {
        this.anr = 0;
    }

    setModelAndView(m, v) {
        this.m = m;
        this.v = v;
    }

    showStats(){
        const stats = this.m.getProgress();
        View.renderErgebnis(`Du hast ${stats.correct} von ${stats.total} Fragen richtig beantwortet.`);
    }
    
    
    async getNoten(notenString){
        
        const {
            Renderer,
            Stave,
            StaveNote,
            Accidental,
            Voice,
            Formatter
        } = Vex.Flow;


        let notes = [];
        let note = notenString[0];
        let akkord = note.split(',');
        
        let staveNote = new StaveNote({
            keys: akkord,
            duration: 'q'
        });

        let buffers = [];
        let tones = [];
        for(let i=0;i<akkord.length;i++)
        {
            const teilnote = akkord[i];
                          
            if(teilnote.includes('##'))
                staveNote.addModifier(new Accidental("##"),i);
            else if(teilnote.includes('#'))
                staveNote.addModifier(new Accidental("#"),i);
            else if(teilnote.includes('b') && teilnote.length != 1)
                staveNote.addModifier(new Accidental("b"),i);

            tones[i] = this.m.convertNote(teilnote);

        }

        //Auf Laden aller Töne warten und abspielen
        if(akkord.length == 1){
            let buffer = await this.m.getTone(tones[0]);
            this.m.playSound(buffer)
        }
        else{
            for(let i=0;i<akkord.length;i++)
                buffers[i] = await this.m.getTone(tones[i])
            this.m.playMultipleSounds(buffers)
        }

        notes.push(staveNote)
        return notes;
    }
    async setTask() {
        await this.m.getTask();
            if (this.m.currentIndex < this.m.quizLen && this.m.question) {
                if(this.m.currentCategory == "mathe"){
                    this.m.question = "$" + this.m.question + "$";
                    for(let i=0;i<4;i++)
                        this.m.options[i] = "$" + this.m.options[i] + "$";
                } 
                if(this.m.currentCategory == "noten" || this.m.currentCategory == "akkorde"){
                    const fragsplitted = this.m.question.split("::");   //[0]: Text, [1]: Noten
                    View.renderText(fragsplitted[0]);
                    if(fragsplitted[1] != ""){
                        let notenString = fragsplitted[1].split(";");
                        noten = await this.getNoten(notenString);
                        
                        this.v.renderNoten(noten);
                        
                    }
                }
                else 
                    View.renderText(this.m.question);
                
                let shuffled = Array.from(this.m.options);
                this.m.randomizeArray(shuffled); 
                this.m.currentIndex++;
                shuffled.forEach((ans, i) => {
                    View.inscribeButtons(i, ans, ans);  // pos = tatsächlicher Antworttext
                });
            }
            else {
                console.log(this.m.currentIndex+ " < "+ this.m.quizLen +"&&"+ this.m.question)
                View.renderText("Quiz beendet!");
                this.showStats();
                View.disableButtons();
                this.m.reset();
                document.getElementById("next").textContent = "Nochmal Fragen lösen";
            }
            this.m.question = "";
    }

    async checkAnswer(answerText) {
        this.m.answer = answerText;
        console.log("Answer: "+answerText);
        await this.m.checkAnswer()
            if(this.m.isCorrect){
                this.m.correctAnswers++;
                View.renderErgebnis("✅ '"+answerText+"' ist Richtig!");
                this.m.isCorrect = false;
            }
            else
                View.renderErgebnis("❌ '"+answerText+"' ist Falsch!");
            this.m.options=[];
            this.m.xhrdata = {};
            View.disableButtons();
            this.updateProgressBar();
    }

    updateProgressBar() {
        const stats = this.m.getProgress();
        const percent = (stats.current / stats.total) * 100;
        document.getElementById("progressBar").style.width = `${percent}%`;
        document.getElementById("progressText").textContent = `${stats.current} / ${stats.total} beantwortet`;
    }
}

// ################ View #########################
class View {
    constructor(p) {
        this.p = p;
        this.setHandler();
        View.renderText("Bitte Kategorie auswählen");
        document.getElementById("next").disabled = true;
        View.disableButtons();

    }

    setHandler() {
        document.getElementById("answers").addEventListener("click", this.checkEvent.bind(this), false);
        document.getElementById("allgemein").addEventListener("click", this.startallg.bind(this), false);
        document.getElementById("it").addEventListener("click", this.startit.bind(this), false);
        document.getElementById("mathe").addEventListener("click", this.startmathe.bind(this), false);
        document.getElementById("noten").addEventListener("click", this.startnoten.bind(this), false);
        document.getElementById("akkorde").addEventListener("click", this.startakkorde.bind(this), false);
        document.getElementById("next").addEventListener("click", this.loadNext.bind(this), false)
        document.getElementById("cancel").addEventListener("click", this.cancelQuiz.bind(this), false)
    }   

    startallg(){
        this.p.m.setCategory("allg");
        this.startquiz();
    }

    startit(){
        this.p.m.setCategory("it");
        this.startquiz();
    }

    startmathe(){
        this.p.m.setCategory("mathe");
        this.startquiz();
    }

    startnoten(){
        this.p.m.setCategory("noten");
        this.startquiz();
    }

    startakkorde(){
        this.p.m.setCategory("akkorde");
        this.startquiz();
    }

    startquiz() {
        document.getElementById("next").disabled = false;
        this.p.m.reset();
        View.resetButtons();
        View.renderText("Quiz laden...");
        this.loadNext();
    }

    loadNext(){
        View.renderErgebnis("");
        document.getElementById("next").textContent = "Nächste Frage";
        this.p.updateProgressBar();
        this.p.setTask();

    }

    cancelQuiz(){
        View.renderText("Quiz abgebrochen");
        this.p.showStats();
        this.p.m.reset();
        this.p.updateProgressBar();
        document.getElementById("next").textContent = "Nochmal Fragen lösen";
        View.disableButtons();

    }

    static inscribeButtons(i, text, data) {
        const btn = document.querySelectorAll("#answers > *")[i];
        btn.innerHTML = text;
        window.renderMathInElement(btn, {delimiters: [
            {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: true}
        ],
          thowOnError: false
        } );
        btn.setAttribute("data-antwort", data);
        btn.disabled = false;
    }

    static resetButtons(){
        const btns = document.querySelectorAll(".answer");
        btns.forEach(button => {
            button.textContent = button.id;
        });
    }

    checkEvent(event) {
        console.log(event.type);
        console.log(event.target.nodeName);
        let button = event.target.closest("button");
        if (button) {
            const antwort = button.getAttribute("data-antwort");
            this.p.checkAnswer(antwort);
        }
    }

    renderNoten(noten){
        const {
            Renderer,
            Stave,
            StaveNote,
            Accidental,
            Voice,
            Formatter
        } = Vex.Flow;
          
        // Create an SVG renderer and attach it to the DIV element named "boo".
        const div = document.getElementById('boo');
        const renderer = new Renderer(div, Renderer.Backends.SVG);
          
          // Configure the rendering context. SOnst werden nicht unbedingt alle Noten angezeigt
        renderer.resize(400, 120);
        const context = renderer.getContext();
          
          // Create a stave of width 400 at position 10, 40 on the canvas.
        const stave = new Stave(10, 0, 200);
          
          // Add a clef and time signature.
        stave.addClef('treble').addTimeSignature('4/4');
          
          // Connect it to the rendering context and draw!
        stave.setContext(context).draw();
          
        
          // Create a voice in 4/4 and add above notes
        const voice = new Voice({
            num_beats: noten.length,
            beat_value: 4
        });
        voice.addTickables(noten);
          
          // Format and justify the notes to 400 pixels.
        new Formatter().joinVoices([voice]).format([voice], 350);
          
          // Render voice
        voice.draw(context, stave);
    }

    static renderText(text) {
        const div = document.getElementById("boo");
        div.innerHTML = ""; // Clear
        const p = document.createElement("p");
        p.innerHTML = text;
        console.log("Text:" +text);
        window.renderMathInElement(p, {delimiters: [
            {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false}
        ],
          thowOnError: false
        } );
        div.appendChild(p);
    }

    static renderErgebnis(text) {
        let erg = document.getElementById("ergebnis");
        erg.textContent = text;
        window.renderMathInElement(erg, {delimiters: [
            {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false}
        ],
          thowOnError: false
        } );
    }

    static disableButtons() {
        document.querySelectorAll(".answer").forEach(btn => {
            btn.disabled = true;
        });
    }
}
