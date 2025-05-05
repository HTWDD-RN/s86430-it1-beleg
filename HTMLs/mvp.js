"use strict";

document.addEventListener('DOMContentLoaded', function () {
    let m = new Model();
    let p = new Presenter();
    let v = new View(p);
    p.setModelAndView(m, v);
});

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
    }

    getTask() {
        if (this.currentIndex < this.quizData.it.length) {
            return this.quizData.it[this.currentIndex];
        }
        return null;
    }

    checkAnswer(answer) {
        let correct = this.quizData.it[this.currentIndex].answers[0];
        let isCorrect = (answer === correct);
        if (isCorrect) this.correctAnswers++;
        this.currentIndex++;
        return isCorrect;
    }

    getProgress() {
        return {
            total: this.quizData.it.length,
            current: this.currentIndex,
            correct: this.correctAnswers
        };
    }

    reset() {
        this.currentIndex = 0;
        this.correctAnswers = 0;
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
        let frag = this.m.getTask();
        if (frag) {
            View.renderText(frag.frage);
            let shuffled = [...frag.answers].sort(() => Math.random() - 0.5);
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
    }

    checkAnswer(answerText) {
        const isCorrect = this.m.checkAnswer(answerText);
        View.renderErgebnis(isCorrect ? "✅ Richtig!" : "❌ Falsch!");
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
    }

    setHandler() {
        document.getElementById("answers").addEventListener("click", this.checkEvent.bind(this), false);
        document.getElementById("it").addEventListener("click", this.start.bind(this), false);
        document.getElementById("next").addEventListener("click", this.loadNext.bind(this), false)
        document.getElementById("cancel").addEventListener("click", this.cancelQuiz.bind(this), false)
    }   


    start() {
        document.getElementById("next").disabled = false;
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
