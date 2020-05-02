window.addEventListener('DOMContentLoaded', (event) => {

  const comp = window.nlp.extend(window.compromiseOutput);

  const input = document.querySelector(".proseinput");
  const button = document.querySelector(".parsebutton");
  let alternates = {};

  const parseFunction = function (e) {

    let text = comp(input.value);
    let tagged = text.html({
      '(#Noun && !#Pronoun)': "keyword noun",
      '(#PresentTense && !#Gerund)': "keyword verb",
      '(#Gerund)': "keyword verb gerund",
      '(#PastTense)': "keyword verb past",
      '#Adjective': 'keyword adjective',
      '#Adverb': 'keyword adverb'
    })
    input.value = "";

    const textElement = document.createElement('p');
    textElement.innerHTML = tagged;
    document.body.appendChild(textElement);
    let keywords = [...document.querySelectorAll(".keyword")];
    keywords.forEach((keyword) => {
      let keywordText = keyword.innerText.replace(/[^a-zA-Z\s]/g, "");
      alternates[keyword.innerText] = [];
      let tag;;
      let nounPlural = false;
      let classList = keyword.classList;
      let verbPast = classList.contains('past');
      let verbGerund = classList.contains('gerund');
      if (classList.contains('noun')) {
        tag = 'n';
        let noun = comp(keywordText)
        if (noun.nouns().isPlural().out('array').length) {
          nounPlural = true;
          keywordText = noun.nouns().toSingular().text();
        }
      } else if (classList.contains('verb')) {
        tag = 'v';
        keywordText = comp(keywordText).verbs().toInfinitive().text();
      } else if (classList.contains('adjective')) {
        tag = 'adj';
      } else if (classList.contains('adverb')) {
        tag = 'adv';
      } else {
        return;
      }
      fetch(`https://api.datamuse.com/words?ml=${keywordText}`, {
          cache: 'no-cache',
        })
        .then((data) => {
          return data.json();
        })
        .then((data) => {
          data.forEach((alternate) => {
            if (alternate.tags && alternate.tags.includes(`${tag}`)) {
              let result = alternate.word;
              if (nounPlural) {
                result = comp(result).nouns().toPlural().text();
              } else if (verbPast) {
                let lexicon = {};
                lexicon[`${result}`] = 'Verb';
                result = comp(result, lexicon).verbs().toPastTense().text();
              } else if (verbGerund) {
                let lexicon = {};
                lexicon[`${result}`] = 'Verb';
                result = comp(result, lexicon).verbs().toGerund().text();
              }
              alternates[keyword.innerText].push(result);
            }
          });
        })
    })
    console.log(alternates);
  }

  button.addEventListener("click", parseFunction)

});