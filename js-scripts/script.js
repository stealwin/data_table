window.addEventListener('DOMContentLoaded', function () {
    diffTemp('https://itrex-react-lab-files.s3.eu-central-1.amazonaws.com/react-test-api.json');
});

let table = document.querySelector('.data');
let tbody = table.querySelector('tbody');
let thead = table.querySelector('thead');

let infoInput = document.querySelector('.info');
let pagesCount = document.querySelector('.pages_count');
let pagesTable = document.querySelector('.pages');
let selectState = document.querySelector('.select_state');
let searchByName = document.querySelector('.search_name');
let prev = document.createElement('th');
let next = document.createElement('th');
/* количество элементов на странице */
let notesOnPage = 20;


function diffTemp(url) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            /* распарсиваем объект в ДЖСОН */
            myObj = JSON.parse(this.responseText);
            createPages();
            showPage(pages[0]);
            pagination();
            prevNextNav();
            stateFilter();
            searchState();
            searchName();

            tbody.addEventListener('click', (e) => {
                let id = e.target.parentNode.getAttribute('id');
                let elemInfo;
                for (j = 0; j < myObj.length; j++) {

                    if (id == myObj[j].email) {
                        elemInfo = myObj[j];
                    }

                }
                /* Выводим информацию об объекте в textarea */
                infoInput.value = `\t\t\t Profile info: \n
                Selected profile:${elemInfo.firstName} ${elemInfo.lastName} \n 
                  Description: ${elemInfo.description} \n 
                  Adress: ${elemInfo.adress.streetAddress} \n 
                  City: ${elemInfo.adress.city} \n 
                  State: ${elemInfo.adress.state}  \n 
                  Index:${elemInfo.adress.zip}`;

            });
        }
    };
    xhr.open('GET', url);
    xhr.send();
}

let pages = [];
let page;
let activePage;

/* функция динамического создания страниц */
function pagination() {

    for (page of pages) {
        page.addEventListener('click', function () {
            showPage(this, myObj);
        });

    }
}
/* функция которая выводит страницы на экран */
function showPage(page) {

    if (pagesTable.classList.contains('hide')) {
        pagesTable.classList.remove('hide');
    }
    if (activePage) {
        activePage.classList.remove('active');
    }
    activePage = page;
    page.classList.add('active');
    let pageNumber = +page.innerHTML;
    let start = (pageNumber - 1) * notesOnPage;
    let end = start + notesOnPage;
    notes = myObj.slice(start, end);
    renderTheadItems();
    tbody.innerHTML = '';
    for (j = 0; j < notes.length; j++) {

        renderTbodyItems(notes[j]);
       
    }
    sortItems();

    selectState.selectedIndex = 0;

}
/* функция создания страниц */
function createPages() {
    let countItems = myObj.length / notesOnPage;

    prev.classList.add('prev');
    next.classList.add('next');
    prev.textContent = 'Previous';
    next.textContent = 'Next';
    pagesCount.appendChild(prev);
    for (i = 1; i <= countItems; i++) {
        let th = document.createElement('th');
        th.innerHTML = i;
        pagesCount.appendChild(th);
        pages.push(th);

    }
    pagesCount.appendChild(next);
}
/* функция для кнопок Предыдущая и Следующая страницы */
function prevNextNav() {
    prev.addEventListener('click', function () {

        if (prev == activePage.previousElementSibling) {
            return;
        }
        page = activePage.previousElementSibling;
        showPage(page, myObj);
    });
    next.addEventListener('click', function () {
        if (next == activePage.nextElementSibling) {
            return;
        }
        page = activePage.nextElementSibling;
        showPage(page, myObj);
    });

}
/* создания элементов для поиска по штатам */
function stateFilter() {
    let states = [];
    for (j = 0; j < myObj.length; j++) {
        states.push(myObj[j].adress.state);
    }
    let uniqueStates = [...new Set(states)];

    for (state of uniqueStates) {
        let stateOption = document.createElement('option');
        stateOption.text = state;
        selectState.appendChild(stateOption);
    }
}
/* функция фильтра по штатам */

function searchState() {
    selectState.addEventListener('change', function () {
        searchByName.value='';
        tbody.innerHTML = '';
        renderTheadItems();
       
        let selectedState = selectState.options[selectState.selectedIndex].text;
        pagesTable.classList.add('hide');
        for (j = 0; j < myObj.length; j++) {

            if (selectState.selectedIndex == 0) {
                return showPage(pages[0], myObj);
            }

            if (selectedState == myObj[j].adress.state) {
                renderTbodyItems(myObj[j]);
            }
        }
        sortItems();

    });

}
/* функция поиска по имени */
function searchName() {

    searchByName.addEventListener('search', function () {
        selectState.selectedIndex = 0;
        tbody.innerHTML = '';
        renderTheadItems();
        pagesTable.classList.add('hide');

        for (j = 0; j < myObj.length; j++) {
            let inputLowCase = this.value.toLowerCase();
            let firstName = myObj[j].firstName.toLowerCase();
            let lastName = myObj[j].lastName.toLowerCase();

            if (this.value == 0) {
                return showPage(pages[0], myObj);
            }

            if (inputLowCase == firstName || inputLowCase == lastName) {
                renderTbodyItems(myObj[j]);
            }
        }
        sortItems();
    });

}
/* функция сортировки элементов по возрастанию и убыванию */
function sortItems() {

    let headers = table.querySelectorAll('th');
    let rows = tbody.querySelectorAll('tr');


    // Направление сортировки
    let directions = Array.from(headers).map(function (header) {
        return '';
    });

    // Преобразовать содержимое данной ячейки в заданном столбце
    function transform(index, content) {
        // Получить тип данных столбца
        let type = headers[index].getAttribute('data-type');
        switch (type) {
            case 'number':
                return parseFloat(content);
            case 'string':
            default:
                return content;
        }
    }

    function sortColumn(index) {
        // Получить текущее направление
        let direction = directions[index] || 'asc';

        // Фактор по направлению
        let multiplier = (direction === 'asc') ? 1 : -1;

        let newRows = Array.from(rows);

        newRows.sort(function (rowA, rowB) {
            let cellA = rowA.querySelectorAll('td')[index].innerHTML;
            let cellB = rowB.querySelectorAll('td')[index].innerHTML;

            let a = transform(index, cellA);
            let b = transform(index, cellB);

            switch (true) {
                case a > b:
                    return 1 * multiplier;
                case a < b:
                    return -1 * multiplier;
                case a === b:
                    return 0;
            }
        });

        // Удалить старые строки
        [].forEach.call(rows, function (row) {
            tbody.removeChild(row);
        });


        // Поменять направление
        directions[index] = direction === 'asc' ? 'desc' : 'asc';

        // Добавить новую строку
        newRows.forEach(function (newRow) {
            tbody.appendChild(newRow);
        });
    }
    let prevHead;

    [].forEach.call(headers, function (header, index) {

        header.addEventListener('click', function () {
            sortTriangle(header,prevHead);
            sortColumn(index);
            prevHead = header;
        });

    });


}
/* функция появления треугольника при сортировке */
function sortTriangle(header,prevHead){
    if (prevHead && prevHead != header) {
        prevHead.textContent = prevHead.textContent.substring(0, prevHead.textContent.length - 1);
    }
    if (!header.textContent.includes('▲') && !header.textContent.includes('▼') && prevHead != header) {
        header.textContent += "▲";

    } else if (header.textContent.includes('▲')) {
        header.textContent = header.textContent.substring(0, header.textContent.length - 1);
        header.textContent += "▼";

    } else if (header.textContent.includes('▼')) {
        header.textContent = header.textContent.substring(0, header.textContent.length - 1);
        header.textContent += "▲";

    }

}

function renderTheadItems(){
    thead.innerHTML = `<tr>
    <th class="id" data-type="number">id</th>
    <th class="first_name">First Name</th>
    <th class="last_name">Last Name</th>
    <th class="email">E-mail</th>
    <th class="phone" data-type="number">Phone</th>
    <th class="state">State</th>
                </tr>`;
}

function renderTbodyItems(arrItem){
    tbody.innerHTML += `<tr id="${arrItem.email}"><td>${arrItem.id}</td> 
    <td>${arrItem.firstName}</td>
    <td>${arrItem.lastName}</td>
    <td>${arrItem.email}</td>
    <td>${arrItem.phone}</td>
    <td>${arrItem.adress.state}</td></tr>`;

}