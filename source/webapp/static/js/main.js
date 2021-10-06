function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

async function makeRequest(url, method='GET', data=undefined) {
    let opts = {method, headers: {}};
    if (!csrfSafeMethod(method))
        opts.headers['X-CSRFToken'] = getCookie('csrftoken');

    if (data) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(data);
        console.log(opts.body);
    }
    let response = await fetch(url, opts);
    if (response.ok) {  // нормальный ответ
        return response.json();
    }
    else {            // ошибка
        let error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}

window.addEventListener('load', function() {
    const mainPage = document.getElementById('main');
    const addQuote = document.getElementById('addQuote');
    const submit = document.getElementById('submit');

    mainPage.onclick = MainPage;
    addQuote.onclick = ViewForm;
    submit.onclick = AddQuote;
});

async function AddQuote() {
    const allQuotes = document.getElementById('get');
    const form = document.getElementById('post');
    const message = document.getElementById('message');
    message.style.display = '';
    form.style.display = 'none';
    allQuotes.style.display = 'none';
    const text = document.getElementById('text').value;
    const author = document.getElementById('author').value;
    const email = document.getElementById('email').value;

    try {
        let response = await makeRequest('http://localhost:8000/api/quote/', 'POST',
            {"text": text, "author": author, "email": email} );
        console.log(response);
        message.innerText = 'Цитата созданна успешно!';
        message.style.background = '';
    }
    catch (error) {
        error = await error.response;
        console.log(error)
        console.log(error.status)
        console.log(error.statusText)
        message.innerHTML =  `<h4 style="font-size:50px;"> ${error.status}<b> ${error.statusText}</b> </h4> `;
        message.style.background = 'grey';
        }
    }


async function ViewForm() {
    const allQuotes = document.getElementById('get');
    const form = document.getElementById('post');
    const message = document.getElementById('message');
    message.style.display = 'none';
    form.style.display = '';
    allQuotes.style.display = 'none'
        let response = await makeRequest('http://localhost:8000/api/quote/', 'GET');
        console.log(response)
    }

async function MainPage() {
    const allQuotes = document.getElementById('get');
    const form = document.getElementById('post');
    const message = document.getElementById('message');
    message.style.display = 'none';
    form.style.display = 'none';
    allQuotes.innerHTML = '';
    allQuotes.innerHTML =  `<h1>Лучшие цитаты нашего двора!</h1>`
        let response = await makeRequest('http://localhost:8000/api/quote/', 'GET');
        for (let i = 0; i < response.length; i++){
            let p = document.createElement('p');
            p.innerHTML = `<b>№ ${i+1}</b> :  ${response[i]['text']}<br/>`;
            allQuotes.appendChild(p)
        console.log(response[i]['text']);
        }
        allQuotes.style.display = '';
    }

async function Click(url) {
    const A = document.getElementById('a').value;
    const B = document.getElementById('b').value;
    const text = document.getElementById('output');
    try {
        let response = await makeRequest(url, 'POST', {"A": A, "B": B});
        text.innerText =  response['answer'];
        text.style.background = 'green';
    }
    catch (error) {
        error = await error.response;
        error= error.json();
        error = await error;
        text.innerText =  error['error'];
        text.style.background = 'red';
    }
}

 function onClick(event) {
    event.preventDefault();
    let aId = event.target.dataset['a'];
    let a = document.getElementById(aId);
    let url = a.href;
    console.log(url);
    Click(url);

}