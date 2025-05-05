document.addEventListener('DOMContentLoaded', function () {

    const butIt = document.getElementById('it');
    const butAntw = document.querySelectorAll('.answer');
    const butNext = document.getElementById('next');
    const butCancel = document.getElementById('cancel');
    const tfAufg = document.getElementById('tfAufgabe');
    const tfErg = document.getElementById('ergebnis');

    const quizData = {
        it: [
            {
                frage: "Was bedeutet HTML?",
                antworten: ["HyperText Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Multi Language"],
                korrekt: "HyperText Markup Language"
            },
            {
                frage: "Was macht CSS?",
                antworten: ["Struktur", "Farbe und Layout", "Programmiert Logik", "Verwaltet Datenbanken"],
                korrekt: "Farbe und Layout"
            }
        ]
        // weitere Kategorien später möglich
    };

    const defaultQuestions = ["A","B","C","D"];
    let question = "Was nimmt man für Websites?"
    let answers = ["HTML","Python","C","Pascal"];
    let Erg = answers[0];

    let questions = [];
    let questionCnt = 0;
    let corrAnswers = 0;
    
    function ladeFrage() {
        const frageObjekt = questions[currentQuestionIndex];
        tfAufgabe.value = frageObjekt.frage;
        tfErg.textContent = "";
        questionCnt++;
        answerButtons.forEach((btn, i) => {
            btn.textContent = frageObjekt.antworten[i];
            btn.disabled = false;
        });
    }

    function bewerteAntwort(antwort) {
        const korrekt = questions[currentQuestionIndex].korrekt;
        if (antwort === korrekt) {
            tfErg.textContent = "✅ Richtig!";
            tfErg.style.color = "green";
            corrAnswers ++;
        } else {
            tfErg.textContent = "❌ Falsch!";
            tfErg.style.color = "red";
        }
        // Nach Klick alle Buttons deaktivieren
        answerButtons.forEach(btn => btn.disabled = true);
    }

    function naechsteFrage() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            ladeFrage();
        } else {
            tfAufgabe.value = "Quiz beendet!";
            tfErg.textContent = "🎉 Du hast alle Fragen beantwortet. Richtige antworten: ";
            answerButtons.forEach(btn => {
                btn.textContent = "";
                btn.disabled = true;
            });
        }
    }

    function abbrechen() {
        tfAufgabe.value = "";
        tfErg.textContent = "";
        answerButtons.forEach(btn => {
            btn.textContent = btn.id;
            btn.disabled = false;
        });
        currentQuestionIndex = 0;
        questionCnt = 0;
        corrAnswers = 0;
        questions = [];
    }

    butIt.addEventListener('click', function () {
        
        tfAufg.textContent = question;
    
        butAntw.forEach((button,i) =>{
            button.textContent = answers[i];
        })
    });

    butAntw.forEach(button => {
        button.addEventListener('click', function () {
          const text = this.textContent;

    
          if (text === Erg) {
            ergebnis.textContent = '✅ "'+text+'" ist Richtig!';
            ergebnis.style.color = 'green';
          } else {
            ergebnis.textContent = '❌ "'+text+'" ist Falsch!';
            ergebnis.style.color = 'red';
          }
          butAntw.forEach(btn => {
            btn.disabled = true;
        });
        });
      });

    butNext.addEventListener('click', function () {
        naechsteFrage();
    });

    // "Abbruch"
    butCancel.addEventListener('click', function () {
        abbrechen();
    });
  });