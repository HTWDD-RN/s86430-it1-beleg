document.addEventListener('DOMContentLoaded', function () {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    const butIt = document.getElementById('it');
    const butAnsw = document.querySelectorAll('.answer');
    const butNext = document.getElementById('next');
    const butCancel = document.getElementById('cancel');
    const tfAufgabe = document.getElementById('tfAufgabe');
    const tfErg = document.getElementById('ergebnis');

    tfAufgabe.value = "";

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

    const defaultQuestions = ["A","B","C","D"];
    let question = "Was nimmt man für Websites?"
    let answers = ["HTML","Python","C","Pascal"];
    let Erg = answers[0];
    let currentQuestionIndex = 0;

    let questions = [];
    let questionCnt = 0;
    let corrAnswers = 0;
    
    function getXhr() { // API für asynchrone Aufrufe
        if (window.XMLHttpRequest) {
          var xhr = new XMLHttpRequest();
          return xhr;
        } 
        else return false;
    }
    function sendXhr() {
        xhr.onreadystatechange = xhrHandler;
        xhr.open('GET','https://idefix.informatik.htw-dresden.de:8888/api/quizzes');
        xhr.send(null);
        console.debug("Request send");
    }
    function xhrHandler() {
        console.log( "Status: " + xhr.readyState );
        if (xhr.readyState != 4) { return; }
        console.log( "Status: " + xhr.readyState + " " + xhr.status);
        if (xhr.status == 200) {
        tfAufgabe.innerHTML = xhr.responseText;
           } 
       }

    function ladeFrage() {
        const frageObjekt = quizData.it[questionCnt];
        tfAufgabe.value = frageObjekt.frage;
        tfErg.textContent = "";
        Erg = quizData.it[questionCnt].answers[0];

        // Antworten kopieren und mischen (Funktion mithilfe von ChatGBT)
        const mixedAnswers = [...frageObjekt.answers].sort(() => Math.random() - 0.5);

        butAnsw.forEach((btn, i) => {
            btn.textContent = mixedAnswers[i];
            btn.disabled = false;
        });
        questionCnt++;
    }

    function naechsteFrage() {
        currentQuestionIndex++;

        const total = quizData.it.length;
        const current = questionCnt;
        const percent = (current / total) * 100;
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${current} / ${total} beantwortet`;
        if (questionCnt < quizData.it.length) {
            ladeFrage();
        } else {
            tfAufgabe.textContent = "Quiz beendet!";
            tfErg.textContent = "🎉 Du hast alle Fragen beantwortet. Richtige antworten: " + corrAnswers + " / " + questionCnt;
            butAnsw.forEach(btn => {
                btn.textContent = "";
                btn.disabled = true;
            });
            butNext.disabled = true;
            currentQuestionIndex = 0;
            questionCnt = 0;
            corrAnswers = 0;
            questions = [];
        }
    }

    function abbrechen() {
        butAnsw.forEach(btn => {
            btn.textContent = btn.id;
            btn.disabled = false;
        });
        tfAufgabe.value = "Quiz abgebrochen!"
        tfErg.textContent = "Du hast von " + questionCnt + " Frage(n) " + corrAnswers + " richtig beantwortet."
        
        progressBar.style.width = "0%";
        progressText.textContent = `0 / ${quizData.it.length} beantwortet`;

        currentQuestionIndex = 0;
        questionCnt = 0;
        corrAnswers = 0;
        questions = [];
    }

    butIt.addEventListener('click', function () {
        
        naechsteFrage();
        /*
        tfAufgabe.textContent = quizData[questionCnt].frage;
        Erg= quizData[questionCnt].answers[0];

        butAnsw.forEach((button,i) =>{
            button.textContent = quizData.answers[i];
        })
        

        butNext.disabled = false;
        */
        butNext.disabled = false;
    });

    butNext.disabled = true;

    butAnsw.forEach(button => {
        button.addEventListener('click', function () {
          const text = this.textContent;

    
          if (text === Erg) {
            tfErg.textContent = '✅ "'+text+'" ist Richtig! (' + Erg + ')';
            tfErg.style.color = 'green';
            corrAnswers++;
          } else {
            tfErg.textContent = '❌ "'+text+'" ist Falsch! (' + Erg + ')';
            tfErg.style.color = 'red';
          }
          butAnsw.forEach(btn => {
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
        butNext.disabled = true;
    });

    var xhr = getXhr();
  });