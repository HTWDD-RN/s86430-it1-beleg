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
        this.quizData = {
            it: [
                {
                    a: "Was bedeutet HTML?",
                    l: ["HyperText Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Multi Language"],
                },
                {
                    a: "Was macht CSS?",
                    l: ["Farbe und Layout", "Struktur", "Programmiert Logik", "Verwaltet Datenbanken"],
                }
            ],
            mathe: [
                {a: "x^2 + x^2", l: ["2x^2", "x^4", "x^8", "2x^4"]},
                {a: "x^2 * x^2", l: ["x^4", "x^2", "2x^2", "4x"]},
                {a: "(x + 3)^2", l: ["x^2 + 6x + 9", "x^2 + 3", "x^2 + 9", "x^2 + 3x + 9"]},
                {a: "Ableitung von x^3", l: ["3x^2", "3x", "x^2", "x^3"]},
                {a: "Integral von 2x dx", l: ["x^2 + C", "2x + C", "x + C", "2x^2 + C"]},
                {a: "Lösung von x^2 = 9", l: ["±3", "3", "-3", "0"]},
                {a: "Was ist der Wert von sin(90°)?", l: ["1", "0", "-1", "0.5"]},
                {a: "Was ist 0!", l: ["1", "0", "undefiniert", "-1"]},
                {a: "Wie viele Nullstellen hat x^2 - 4?", l: ["2", "1", "0", "unendlich"]},
                {a: "Was ist die 1. Ableitung von sin(x)?", l: ["cos(x)", "-cos(x)", "-sin(x)", "1"]}
            ]
        };
        this.currentIndex = 0;
        this.correctAnswers = 0;
        this.jsondata = {};
        this.xhrdata = {};
        this.question = "";
        this.options = []
        this.answer = "";
        this.isCorrect = false; 
        this.quiznr = 5;
        this.quizLen = 0;

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
            if(cat = "allg") {
                this.quiznr = 1595
                this.quizLen = 10;
            }
            if(cat = "it") {
                this.quiznr = 1595
                this.quizLen = 10;
            }
            if(cat = "math"){
                this.quiznr = 1595;
            }
            if(cat == "piano"){
                this.quiznr = 1595;
            }
        //}
    }

    getTask(callback) {
        if(this.currentCategory == "allg")
            this.sendQstXhr(callback,this.quiznr+this.currentIndex);
        else{
            this.question = this.quizData.mathe[this.currentIndex].a;
            this.options = this.quizData.mathe[this.currentIndex].l;
            callback(true);
            //this.getLocalXhr(callback,this.currentIndex)
        }
    }

    checkAnswer(callback) {
        if(this.currentCategory == "allg")
        {
            let i=0;
            for(i=0; i< 4; i++) //4: Anzahl der Options
                if(this.answer === this.options[i])
                    break;
            this.sendAnsXhr(callback, this.quiznr+this.currentIndex -1 , i);

        }
        else{
            let correct = this.options[0];
            if (this.answer === correct) {
                this.isCorrect = true;
                this.correctAnswers++;
                callback(true);
            }
            callback(false);
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

    getLocalXhr(callback,index) {
        this.xhr = getXhr();
        this.xhr.onreadystatechange = () => {
            if (this.xhr.readyState !== 4) return;

            if (this.xhr.status === 200) {
                try{
                    this.jsondata = JSON.parse(this.xhr.responseText);
                    console.log("Daten aus JSON geladen:");
                    this.question = this.jsondata[this.currentCategory][index].a;
                    this.options = this.jsondata[this.currentCategory][index].l;
                    callback(true);  // Text ist Ergebnis
                }catch(e){
                    console.error("Fehler beim Parsen der Daten", e);
                    callback(false);
                }
            } else {
                callback("Fehler beim Laden der Aufgabe.");
            }
        };
        this.xhr.open('GET', 'quizdata.json');
        this.xhr.send(null);

    }
    
    sendQstXhr(callback,nr) {
        this.xhr = getXhr();
        this.xhr.onreadystatechange = () => {
            if (this.xhr.readyState !== 4) return;

            if (this.xhr.status === 200) {
                try{
                    this.xhrdata = JSON.parse(this.xhr.responseText);
                    console.log("Daten geladen:", this.xhrdata);
                    this.question = this.xhrdata.text;
                    this.options = this.xhrdata.options;
                    callback(true);  // Text ist Ergebnis
                }catch(e){
                    console.error("Fehler beim Parsen der Daten", e);
                    callback(false);
                }
            } else {
                callback("Fehler beim Laden der Aufgabe.");
            }
        };
        this.xhr.open('GET', 'https://idefix.informatik.htw-dresden.de:8888/api/quizzes/' + nr);
        this.xhr.setRequestHeader("Authorization", "Basic " + this.userdata);
        this.xhr.send(null);
    }

    sendAnsXhr(callback,nr, index) {
        this.xhr = getXhr();
        this.xhr.onreadystatechange = () => {
            if (this.xhr.readyState !== 4)
                return;

            if (this.xhr.status === 200) {
                try{
                    this.xhrdata= JSON.parse(this.xhr.responseText);
                    this.isCorrect = this.xhrdata.success;
                    console.log("Daten erhalten:", this.xhrdata);
                    callback(true);  // Text ist Ergebnis
                }catch(e){
                    console.error("Fehler beim Parsen der Daten", e);
                    callback(false);
                }
            } else {
                callback("Fehler beim Laden der Lösung.");
            }
        };
        this.xhr.open('POST', 'https://idefix.informatik.htw-dresden.de:8888/api/quizzes/'+nr+'/solve');
        this.xhr.setRequestHeader("Authorization", "Basic " + this.userdata);
        this.xhr.setRequestHeader("Content-Type", "application/json");
        this.xhr.send("["+index+"]");
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

   setTask() {
        //let frag = await this.m.getTask();
        this.m.getTask(() => {
            if (this.m.currentIndex < this.m.quizLen && this.m.question) {
                View.renderText(this.m.question);
                let shuffled = [...this.m.options].sort(() => Math.random() - 0.5);
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
        });
    }

    checkAnswer(answerText) {
        this.m.answer = answerText;
        this.m.checkAnswer(() => {
            if(this.m.isCorrect){
                this.m.correctAnswers++;
                View.renderErgebnis("✅ '"+answerText+"' ist Richtig!");
            }
            else
                View.renderErgebnis("❌ '"+answerText+"' ist Falsch!");
            this.m.options=[];
            this.m.xhrdata = {};
            View.disableButtons();
            this.updateProgressBar();
        });
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
    }

    setHandler() {
        document.getElementById("answers").addEventListener("click", this.checkEvent.bind(this), false);
        document.getElementById("allgemein").addEventListener("click", this.startallg.bind(this), false);
        document.getElementById("it").addEventListener("click", this.startit.bind(this), false);
        document.getElementById("next").addEventListener("click", this.loadNext.bind(this), false)
        document.getElementById("cancel").addEventListener("click", this.cancelQuiz.bind(this), false)
    }   

    startallg(){
        this.p.m.setCategory("allg");
        this.startquiz();
    }

    startit(){
        this.p.m.setCategory("it");
        this.p.updateProgressBar();
        this.startquiz();
    }
    startquiz() {
        document.getElementById("next").disabled = false;
        this.loadNext();
    }

    loadNext(){
        View.renderErgebnis("");
        document.getElementById("next").textContent = "Weiter";
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
        btn.textContent = text;
        btn.setAttribute("data-antwort", data);
        btn.disabled = false;
    }

    checkEvent(event) {
        console.log(event.type);
        if (event.target.nodeName === "BUTTON") {
            const antwort = event.target.getAttribute("data-antwort");
            this.p.checkAnswer(antwort);
        }
    }

    static renderText(text) {
        const div = document.getElementById("boo");
        div.innerHTML = ""; // Clear
        const p = document.createElement("p");
        p.textContent = text;
        div.appendChild(p);
    }

    static renderErgebnis(text) {
        let erg = document.getElementById("ergebnis");
        erg.textContent = text;
    }

    static disableButtons() {
        document.querySelectorAll(".answer").forEach(btn => {
            btn.disabled = true;
        });
    }
}
