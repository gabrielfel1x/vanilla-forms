const formCreator = document.getElementById("formCreator");
const questionsContainer = document.getElementById("questionsContainer");
const addQuestionBtn = document.getElementById("addQuestionBtn");
const loadFormsBtn = document.getElementById("loadFormsBtn");
const notification = document.getElementById("notification");

const baseUrl = "http://127.0.0.1:5000";

let editingFormId = null;

loadFormsBtn.addEventListener("click", loadForms);

addQuestionBtn.addEventListener("click", () => {
  addQuestion();
});

function addQuestion(questionData = {}) {
  const questionDiv = document.createElement("div");
  questionDiv.classList.add("question");

  questionDiv.innerHTML = `
        <input type="text" placeholder="Question text" required value="${
          questionData.text || ""
        }">
        <select class="question-type">
            <option value="short_answer" ${
              questionData.question_type === "short_answer" ? "selected" : ""
            }>Short Answer</option>
            <option value="long_answer" ${
              questionData.question_type === "long_answer" ? "selected" : ""
            }>Long Answer</option>
            <option value="multiple_choice" ${
              questionData.question_type === "multiple_choice" ? "selected" : ""
            }>Multiple Choice</option>
            <option value="checkbox" ${
              questionData.question_type === "checkbox" ? "selected" : ""
            }>Checkbox</option>
        </select>
        <div class="options-container"></div>
        <button type="button" class="add-option-btn" style="display:none;">Add Option</button>
        <button type="button" class="remove-question-btn">Remove Question</button>
    `;

  const questionTypeSelect = questionDiv.querySelector(".question-type");
  const optionsContainer = questionDiv.querySelector(".options-container");
  const addOptionBtn = questionDiv.querySelector(".add-option-btn");

  questionTypeSelect.addEventListener("change", () => {
    const selectedType = questionTypeSelect.value;
    if (selectedType === "multiple_choice" || selectedType === "checkbox") {
      addOptionBtn.style.display = "block";
      optionsContainer.innerHTML = "";
      if (questionData.options) {
        questionData.options.forEach((option) => {
          addOption(option, optionsContainer);
        });
      }
    } else {
      addOptionBtn.style.display = "none";
      optionsContainer.innerHTML = "";
    }
  });

  addOptionBtn.addEventListener("click", () => {
    addOption("", optionsContainer);
  });

  questionDiv
    .querySelector(".remove-question-btn")
    .addEventListener("click", () => {
      questionsContainer.removeChild(questionDiv);
    });

  questionsContainer.appendChild(questionDiv);

  if (questionData.question_type) {
    questionTypeSelect.dispatchEvent(new Event("change"));
  }
}

function addOption(label = "", optionsContainer) {
  const optionDiv = document.createElement("div");
  const optionInput = document.createElement("input");
  optionInput.type = "text";
  optionInput.placeholder = "Option text";
  optionInput.value = label;

  const removeOptionBtn = document.createElement("button");
  removeOptionBtn.type = "button";
  removeOptionBtn.textContent = "Remove Option";
  removeOptionBtn.addEventListener("click", () => {
    optionDiv.remove();
  });

  optionDiv.appendChild(optionInput);
  optionDiv.appendChild(removeOptionBtn);
  optionsContainer.appendChild(optionDiv);
}

formCreator.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("formTitle").value;
  const description = document.getElementById("formDescription").value;

  const questions = [...questionsContainer.children].map((questionDiv) => {
    const questionText = questionDiv.querySelector('input[type="text"]').value;
    const questionType = questionDiv.querySelector(".question-type").value;

    let options = [];
    if (questionType === "multiple_choice" || questionType === "checkbox") {
      const optionInputs = questionDiv.querySelectorAll(
        ".options-container div input[type='text']"
      );
      options = [...optionInputs].map((input) => input.value);
    }

    return { text: questionText, question_type: questionType, options };
  });

  const formData = {
    title,
    description,
    questions,
  };

  const request = editingFormId
    ? axios.put(`${baseUrl}/forms/${editingFormId}`, formData)
    : axios.post(`${baseUrl}/forms`, formData);

  request
    .then((response) => {
      showNotification(
        `Form ${editingFormId ? "edited" : "created"} successfully!`
      );
      loadForms();
      clearForm();
    })
    .catch((error) => {
      console.error("Error submitting form:", error);
      showNotification("Error submitting form. Please try again.", true);
    });
});

function showNotification(message, isError = false) {
  notification.textContent = message;
  notification.className = "notification";
  if (isError) {
    notification.classList.add("error");
  }
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

function loadForms() {
  axios
    .get(`${baseUrl}/forms`)
    .then((response) => {
      const forms = response.data;
      const formList = document.getElementById("formList");
      formList.innerHTML = "";

      forms.forEach((form) => {
        const div = document.createElement("div");
        div.classList.add("form-item");
        div.innerHTML = `<h3>${form.title}</h3><p>${form.description}</p><button class="edit-form-btn" data-id="${form.id}">Edit</button>`;

        const questionsDiv = document.createElement("div");
        questionsDiv.classList.add("questions");

        form.questions.forEach((question) => {
          const questionDiv = document.createElement("div");
          questionDiv.innerHTML = `<strong>Question:</strong> ${question.text} <br> <strong>Type:</strong> ${question.question_type}`;
          if (question.options && question.options.length > 0) {
            questionDiv.innerHTML += `<strong>Options:</strong> ${question.options.join(
              ", "
            )}`;
          }
          questionsDiv.appendChild(questionDiv);
        });

        div.appendChild(questionsDiv);
        formList.appendChild(div);
      });

      const editButtons = document.querySelectorAll(".edit-form-btn");
      editButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const formId = button.dataset.id;
          editForm(formId);
        });
      });

      showNotification("Forms loaded successfully!");
    })
    .catch((error) => {
      console.error("Error loading forms:", error);
      showNotification("Error loading forms. Please try again.", true);
    });
}

function editForm(formId) {
  editingFormId = formId;

  axios
    .get(`${baseUrl}/forms/${editingFormId}`)
    .then((response) => {
      const form = response.data;
      document.getElementById("formTitle").value = form.title;
      document.getElementById("formDescription").value = form.description;

      questionsContainer.innerHTML = "";
      form.questions.forEach((question) => addQuestion(question));
    })
    .catch((error) => {
      console.error("Error loading form for editing:", error);
      showNotification(
        "Error loading form for editing. Please try again.",
        true
      );
    });
}

function clearForm() {
  editingFormId = null;
  document.getElementById("formTitle").value = "";
  document.getElementById("formDescription").value = "";
  questionsContainer.innerHTML = "";
}
