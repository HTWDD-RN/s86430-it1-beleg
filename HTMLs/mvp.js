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
                    frage: "Was bedeutet HTML?",
                    answers: ["HyperText Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Multi Language"],
                },
                {
                    frage: "Was macht CSS?",
                    answers: ["Farbe und Layout", "Struktur", "Programmiert Logik", "Verwaltet Datenbanken"],
                }
            ]
        };
        this.currentIndex = 0;
        this.correctAnswers = 0;
        this.questdata = {};
        this.answer = "";
        this.xhrreq = false;
        this.isCorrect = false; 
        this.quiznr = 5;
        this.quizlen = 0;

        const username=  "richter_georg@outlook.com";
        const pw = "secret";
        this.userdata = btoa(username + ":" + pw); //Base-64
        this.xhr = getXhr();
    }

    setCategory(cat) {
        if (this.quizData[cat]) {
            this.currentCategory = cat;
            this.currentIndex = 0;
            this.correctAnswers = 0;
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
        }
    }

    getTask(callback) {
        if (this.currentIndex < this.quizLen) {
            let task= this.sendQstXhr(callback,this.quiznr+this.currentIndex);
        }else 
            callback(null);
    }

    checkAnswer(callback) {
        if(this.xhrreq == true)
        {
            this.xhrreq = false;
            let i=0;
            for(i=0; i< 4; i++) //4: Anzahl der Options
                if(this.answer === this.questdata.options[i])
                    break;
            this.sendAnsXhr(callback, this.questdata.id+this.currentIndex -1 , i);

        }
        else{
            let correct = this.quizData.it[this.currentIndex].answers[0];
            if (this.answer === correct) {
                this.correctAnswers++;
                return true;
            }
            return false;
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

    
    sendQstXhr(callback,nr) {
        this.xhr = getXhr();
        this.xhrreq = true;
        this.xhr.onreadystatechange = () => {
            if (this.xhr.readyState !== 4) return;

            if (this.xhr.status === 200) {
                try{
                    this.questdata = JSON.parse(this.xhr.responseText);
                    console.log("Daten geladen:", this.questdata);
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
                    this.questdata= JSON.parse(this.xhr.responseText);
                    console.log("Daten erhalten:", this.questdata);
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
            let frag = this.m.questdata;
            View.renderText(frag.text);
            if (frag && frag.text && frag.options) {
                View.renderText(frag.text);
                let shuffled = [...frag.options].sort(() => Math.random() - 0.5);
                this.m.currentIndex++;
                shuffled.forEach((ans, i) => {
                    View.inscribeButtons(i, ans, ans);  // pos = tatsächlicher Antworttext
                });
            } else {

                View.renderText("Quiz beendet!");
                this.showStats();
                View.disableButtons();
                this.m.reset();
                document.getElementById("next").textContent = "Nochmal Fragen lösen";
            }
            this.updateProgressBar();
        });
    }

    checkAnswer(answerText) {
        this.m.answer = answerText;
        this.m.checkAnswer(() => {
            let antw = this.m.questdata;
            if(antw){
                if(antw.success){
                    this.m.correctAnswers++;
                    View.renderErgebnis("✅ '"+answerText+"' ist Richtig!");
                }
                else
                    View.renderErgebnis("❌ '"+answerText+"' ist Falsch!");
                View.disableButtons();
                this.updateProgressBar();
            }
            else View.renderErgebnis("Fehler");
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
        document.getElementById("it").addEventListener("click", this.startit.bind(this), false);
        document.getElementById("next").addEventListener("click", this.loadNext.bind(this), false)
        document.getElementById("cancel").addEventListener("click", this.cancelQuiz.bind(this), false)
    }   


    startit() {
        document.getElementById("next").disabled = false;
        this.p.m.setCategory("it");
        this.loadNext();
    }

    loadNext(){
        View.renderErgebnis("");
        document.getElementById("next").textContent = "Weiter";
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
