window.addEventListener('DOMContentLoaded', (event) => {

  let input = document.querySelector(".proseinput");
  let button = document.querySelector(".parsebutton");

  const parseFunction = function (e) {

    debugger;
    let text = input.value;

    const textElement = document.createElement('p');
    textElement.innerText = text;
    document.body.appendChild(textElement);
  }

  button.addEventListener("click", parseFunction)

});