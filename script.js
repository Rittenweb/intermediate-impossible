window.addEventListener('DOMContentLoaded', (event) => {

  window.nlp.extend(window.compromiseOutput);

  let input = document.querySelector(".proseinput");
  let button = document.querySelector(".parsebutton");

  const parseFunction = function (e) {

    let text = nlp(input.value);
    let tagged = text.html({
      '#Noun': "keyword noun",
      '#Verb': "keyword verb",
      '#Adjective': 'keyword adjective',
      '#Adverb': 'keyword adverb'
    })
    input.value = "";

    const textElement = document.createElement('p');
    textElement.innerHTML = tagged;
    document.body.appendChild(textElement);
  }

  button.addEventListener("click", parseFunction)

});