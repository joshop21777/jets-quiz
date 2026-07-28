const jets = [
    {
        make: "Gulfstream",
        model: "G650",
        engine: "Rolls-Royce BR710",
        image: "images/gulfstream-g650.jpg"
    },
    {
        make: "Bombardier",
        model: "Global 7500",
        engine: "GE Passport",
        image: "images/bombardier-global7500.webp"
    },
    {
        make: "Embraer",
        model: "Legacy 650",
        engine: "Honeywell HTF7500E",
        image: "images/embraer-legacy650.jpg"
    },
    {
        make: "Dassault",
        model: "Falcon 8X",
        engine: "Rolls-Royce Pearl",
        image: "images/dassault-falcon8x.jpg"
    },
    {
        make: "Cessna",
        model: "Citation CJ4",
        engine: "Williams FJ44",
        image: "images/citation-cj4.jpg"
    },
    {
        make: "Cessna",
        model: "Citation Longitude",
        engine: "Honeywell HTF7700L",
        image: "images/citation-longitude.jpg"
    },
    {
        make: "Cessna",
        model: "Citation Latitude",
        engine: "Pratt & Whitney PW306D",
        image: "images/citation-latitude.jpg"
    },
    {
        make: "Cessna",
        model: "Citation Ascend",
        engine: "Pratt & Whitney PW545D",
        image: "images/citation-ascend.webp"
    }
];

const questionText = {
    make: "Who makes this aircraft?",
    model: "What model is this aircraft?",
    engine: "Which engine powers this aircraft?"
};

const setupView = document.querySelector("#setup-view");
const quizView = document.querySelector("#quiz-view");
const quizForm = document.querySelector("#quiz-form");
const modeInput = document.querySelector("#quiz-mode");
const countInput = document.querySelector("#question-count");
const progress = document.querySelector("#progress");
const score = document.querySelector("#score");
const prompt = document.querySelector("#question-prompt");
const image = document.querySelector("#jet-image");
const imageStatus = document.querySelector("#image-status");
const choices = document.querySelector("#choices");
const feedback = document.querySelector("#feedback");
const exitButton = document.querySelector("#exit-button");

const state = {
    mode: "make",
    questionNumber: 0,
    questionCount: jets.length,
    score: 0,
    queue: [],
    currentJet: null,
    currentField: "make",
    nextTimer: null
};

function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
}

function showSetup() {
    window.clearTimeout(state.nextTimer);
    image.closest(".image-frame").classList.remove("hidden");
    choices.className = "choices";
    quizView.classList.add("hidden");
    setupView.classList.remove("hidden");
}

function startQuiz(event) {
    event.preventDefault();

    const requestedCount = Number.parseInt(countInput.value, 10);
    if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > jets.length) {
        countInput.setCustomValidity(`Choose between 1 and ${jets.length} questions.`);
        countInput.reportValidity();
        return;
    }

    countInput.setCustomValidity("");
    state.mode = modeInput.value;
    state.questionCount = requestedCount;
    state.questionNumber = 0;
    state.score = 0;
    state.queue = shuffle(jets).slice(0, requestedCount);

    setupView.classList.add("hidden");
    quizView.classList.remove("hidden");
    showQuestion();
}

function chooseField() {
    if (state.mode !== "all") {
        return state.mode;
    }
    return shuffle(["make", "model", "engine"])[0];
}

function createAnswers(correctAnswer, field) {
    const alternatives = [...new Set(jets.map((jet) => jet[field]))]
        .filter((answer) => answer !== correctAnswer);
    return shuffle([correctAnswer, ...shuffle(alternatives).slice(0, 3)]);
}

function showQuestion() {
    if (state.questionNumber >= state.questionCount) {
        showResults();
        return;
    }

    state.currentJet = state.queue[state.questionNumber];
    state.currentField = chooseField();
    state.questionNumber += 1;

    progress.textContent = `Question ${state.questionNumber} of ${state.questionCount}`;
    score.textContent = `Score: ${state.score}`;
    prompt.textContent = questionText[state.currentField];
    feedback.textContent = "";
    choices.replaceChildren();

    imageStatus.hidden = false;
    imageStatus.textContent = "Loading aircraft...";
    image.onload = () => {
        imageStatus.hidden = true;
    };
    image.onerror = () => {
        imageStatus.hidden = false;
        imageStatus.textContent = "This aircraft image could not be loaded.";
    };
    image.src = state.currentJet.image;

    const correctAnswer = state.currentJet[state.currentField];
    createAnswers(correctAnswer, state.currentField).forEach((answer) => {
        const button = document.createElement("button");
        button.className = "choice-button";
        button.type = "button";
        button.textContent = answer;
        button.addEventListener("click", () => checkAnswer(button, answer, correctAnswer));
        choices.append(button);
    });
}

function checkAnswer(selectedButton, selectedAnswer, correctAnswer) {
    const buttons = [...choices.querySelectorAll("button")];
    buttons.forEach((button) => {
        button.disabled = true;
        if (button.textContent === correctAnswer) {
            button.classList.add("correct");
        }
    });

    if (selectedAnswer === correctAnswer) {
        state.score += 1;
        feedback.textContent = "Correct!";
    } else {
        selectedButton.classList.add("incorrect");
        feedback.textContent = `Not quite. The answer is ${correctAnswer}.`;
    }

    score.textContent = `Score: ${state.score}`;
    state.nextTimer = window.setTimeout(showQuestion, 1400);
}

function showResults() {
    progress.textContent = "Quiz complete";
    image.closest(".image-frame").classList.add("hidden");
    score.textContent = "Final score";
    prompt.textContent = `${state.score} out of ${state.questionCount}`;
    feedback.textContent = state.score === state.questionCount
        ? "Perfect recognition."
        : "Ready for another flight?";
    choices.className = "choices results";
    choices.replaceChildren();

    const playAgainButton = document.createElement("button");
    playAgainButton.className = "primary-button";
    playAgainButton.type = "button";
    playAgainButton.textContent = "Play again";
    playAgainButton.addEventListener("click", () => {
        image.closest(".image-frame").classList.remove("hidden");
        choices.className = "choices";
        showSetup();
    });
    choices.append(playAgainButton);
}

jets.forEach((jet) => {
    const preload = new Image();
    preload.src = jet.image;
});

quizForm.addEventListener("submit", startQuiz);
exitButton.addEventListener("click", showSetup);
