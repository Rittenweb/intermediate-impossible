window.addEventListener('DOMContentLoaded', (event) => {

  const comp = window.nlp.extend(window.compromiseOutput);

  const input = document.querySelector(".proseinput");
  const button = document.querySelector(".parsebutton");
  let alternates = {};
  let ctrling = false;

  const parseFunction = function parseFunction(e) {

    let text = comp(input.value);
    let tagged = text.html({
      '(#Noun && !#Pronoun)': "keyword noun",
      '(#PresentTense && !#Gerund)': "keyword verb",
      '#Gerund': "keyword verb gerund",
      '#PastTense': "keyword verb past",
      '#Adjective': 'keyword adjective',
      '#Adverb': 'keyword adverb'
    })
    input.value = "";

    const textElement = document.createElement('p');
    textElement.innerHTML = tagged;
    document.body.appendChild(textElement);
    let keywords = [...document.querySelectorAll(".keyword")];
    keywords.forEach((keyword) => {
      let text = keyword.innerText;
      keyword.dataset.original = text;
      if (text.endsWith(",") || text.endsWith(", ")) {
        keyword.dataset.comma = true;
      } else if (text.endsWith(".") || text.endsWith(". ")) {
        keyword.dataset.period = true;
      }
    })

    keywords.forEach((keyword) => {
      let keywordText = keyword.innerText.replace(/[^a-zA-Z\s]/g, "");
      alternates[keyword.innerText] = [];
      let tag;
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

    const groupButton = document.createElement('button');
    groupButton.innerText = "Roll Group";
    groupButton.classList.add('group-button');
    document.body.appendChild(groupButton);
    groupButton.addEventListener('click', rollGroup);

  }

  const rollOne = function rollOne(e) {
    if (!e.target.matches('.keyword')) {
      return;
    } else if (ctrling) {
      if (e.target.matches('.group')) {
        e.target.classList.remove('group');
      } else {
        e.target.classList.add('group');
      }
      return;
    }
    roll(e.target);
  }

  const rollGroup = function rollGroup() {
    const groupWords = [...document.querySelectorAll('.group')];
    groupWords.forEach(roll);
  }

  const roll = function roll(keywordSpan) {
    let thisAlts = alternates[keywordSpan.dataset.original];
    let newText = thisAlts[Math.floor(Math.random() * thisAlts.length)];
    if (keywordSpan.dataset.comma) {
      newText += ",";
    } else if (keywordSpan.dataset.period) {
      newText += ".";
    }
    newText += " ";
    keywordSpan.innerText = newText;
  }

  button.addEventListener("click", parseFunction);
  document.addEventListener('click', rollOne);
  document.addEventListener('keydown', (e) => {
    if (e.key === "Control") {
      ctrling = true;
    }
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === "Control") {
      ctrling = false;
    }
  })


});

// fetch('https://api.wordassociations.net/associations/v1.0/json/search?apikey=2f06934d-533f-4380-943c-460ce962753e&text=limp&lang=en&type=stimulus&pos=verb&limit=50')
//   .then((data) => {
//     return data.json();
//   })
//   .then((data) => {
//     console.log(data)
//   })