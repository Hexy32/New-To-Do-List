"use strict";
const input = document.getElementById('input');
const ul = document.getElementById('list');
buttonEventListeners();
const totalItemsShown = 6;
document.documentElement.style.setProperty('--total-items', JSON.stringify(totalItemsShown));
addBlank();
let items = [];
let itemsValue = [];
let itemsCompleted = [];
let itemsStarred = [];
let valueTotal = 0;
let valueCompleted = 0;
window.onload = () => {
    const loadedItems = JSON.parse(localStorage.getItem('items'));
    const loadedItemsValue = JSON.parse(localStorage.getItem('itemsValue'));
    const loadedItemsCompleted = JSON.parse(localStorage.getItem('itemsCompleted'));
    const loadedItemsStarred = JSON.parse(localStorage.getItem('itemsStared'));
    console.log({
        Id: loadedItems,
        Value: loadedItemsValue,
        Completed: loadedItemsCompleted,
        Starred: loadedItemsStarred,
    });
    for (let i = 0; i < loadedItems.length; i++) {
        createListItem(loadedItems[i], loadedItemsValue[i], loadedItemsCompleted[i], true, loadedItemsStarred[i]);
    }
};
input.addEventListener('keydown', (e) => {
    const noLineBreaks = input.value.replace(/(\r\n|\n|\r| )/gm, '');
    if (e.key === 'Enter' && !e.shiftKey && noLineBreaks != '') {
        e.preventDefault();
        proccessAddingItem(input.value);
        input.value = '';
    }
});
const emptyStarSVG = document.querySelectorAll('.input-star')[0];
const starSVG = document.querySelectorAll('.input-star')[1];
emptyStarSVG.addEventListener('click', (event) => {
    emptyStarSVG.style.display = 'none';
    starSVG.style.display = 'block';
});
starSVG.addEventListener('click', (event) => {
    starSVG.style.display = 'none';
    emptyStarSVG.style.display = 'block';
});
function proccessAddingItem(value) {
    let isStarred = emptyStarSVG.style.display === 'none';
    createListItem(undefined, value, false, true, isStarred);
    starSVG.style.display = 'none';
    emptyStarSVG.style.display = 'block';
    refreshItems();
    unclickAllButtons();
}
function createListItem(id, value, completed, addToSave, starred) {
    removeBlank();
    const liElement = document.createElement('li');
    liElement.classList.add('item');
    liElement.id = JSON.stringify(Date.now());
    const emptyCheckboxSVG = document.createElement('img');
    emptyCheckboxSVG.classList.add('checkbox-empty');
    emptyCheckboxSVG.src = './svgs/check_box_outline_blank_black_24dp.svg';
    emptyCheckboxSVG.alt = 'Mark As Complete';
    const checkboxSVG = document.createElement('img');
    checkboxSVG.classList.add('checkbox');
    checkboxSVG.style.display = 'none';
    checkboxSVG.src = './svgs/check_box_black_24dp.svg';
    checkboxSVG.alt = 'Mark As Complete';
    const content = document.createElement('p');
    content.classList.add('content');
    content.textContent = value;
    const emptyStarSVG = document.createElement('img');
    emptyStarSVG.classList.add('star-empty');
    emptyStarSVG.src = './svgs/star_outline_black_24dp.svg';
    emptyStarSVG.alt = 'Star item';
    const starSVG = document.createElement('img');
    starSVG.classList.add('star');
    starSVG.src = './svgs/star_black_24dp.svg';
    starSVG.alt = 'Unstar item';
    starSVG.style.display = 'none';
    const deleteSVG = document.createElement('img');
    deleteSVG.classList.add('deleteSVG');
    deleteSVG.src = './svgs/delete_outline_black_24dp.svg';
    deleteSVG.alt = 'Delete Item';
    if (completed == true) {
        emptyCheckboxSVG.style.display = 'none';
        checkboxSVG.style.display = 'block';
        liElement.classList.add('completed');
        if (addToSave) {
            updateTotalItems(true, 'completed');
        }
    }
    if (starred == true) {
        emptyStarSVG.style.display = 'none';
        starSVG.style.display = 'block';
        liElement.classList.add('starred');
    }
    if (id != undefined) {
        liElement.id = id;
    }
    liElement.appendChild(emptyCheckboxSVG);
    liElement.appendChild(checkboxSVG);
    liElement.appendChild(content);
    liElement.appendChild(emptyStarSVG);
    liElement.appendChild(starSVG);
    liElement.appendChild(deleteSVG);
    const lastcontent = document.querySelectorAll('.content');
    if (lastcontent.length != 0 && !starred) {
        lastcontent[lastcontent.length - 1].parentElement.insertAdjacentElement('afterend', liElement);
    }
    else {
        ul.prepend(liElement);
    }
    updateEventListeners(liElement);
    if (addToSave) {
        items.push(liElement.id);
        itemsValue.push(value);
        itemsCompleted.push(completed);
        itemsStarred.push(starred);
        updateTotalItems(true, 'total');
    }
    setLocalStorage();
}
function updateEventListeners(x) {
    x.lastChild.addEventListener('click', (event) => {
        let target = event.currentTarget;
        for (let i = 0; i < items.length; i++) {
            if (items[i] === target.parentElement.id) {
                items.splice(i, 1);
                itemsValue.splice(i, 1);
                itemsCompleted.splice(i, 1);
                itemsStarred.splice(i, 1);
            }
        }
        target.parentElement.remove();
        addBlank();
        setLocalStorage();
        updateTotalItems(false, 'total');
        if (x.classList.contains('completed')) {
            updateTotalItems(false, 'completed');
        }
    });
    x.firstChild.addEventListener('click', (event) => {
        const target = event.currentTarget;
        for (let i = 0; i < items.length; i++) {
            if (items[i] === target.parentElement.id) {
                itemsCompleted[i] = true;
            }
        }
        target.style.display = 'none';
        const sibling = target.nextElementSibling;
        sibling.style.display = 'block';
        target.parentElement.classList.add('completed');
        refreshItems();
        unclickAllButtons();
        setLocalStorage();
        updateTotalItems(true, 'completed');
    });
    x.children[1].addEventListener('click', (event) => {
        const target = event.currentTarget;
        for (let i = 0; i < items.length; i++) {
            if (items[i] === target.parentElement.id) {
                itemsCompleted[i] = false;
            }
        }
        target.style.display = 'none';
        const sibling = target.previousElementSibling;
        sibling.style.display = 'block';
        target.parentElement.classList.remove('completed');
        refreshItems();
        unclickAllButtons();
        setLocalStorage();
        updateTotalItems(false, 'completed');
    });
    x.children[3].addEventListener('click', (event) => {
        const target = event.currentTarget;
        for (let i = 0; i < items.length; i++) {
            if (items[i] === target.parentElement.id) {
                itemsStarred[i] = true;
            }
        }
        target.style.display = 'none';
        const sibling = target.nextElementSibling;
        sibling.style.display = 'block';
        target.parentElement.classList.add('starred');
        target.parentElement.remove();
        refreshItems();
        unclickAllButtons();
        setLocalStorage();
    });
    x.children[4].addEventListener('click', (event) => {
        const target = event.currentTarget;
        for (let i = 0; i < items.length; i++) {
            if (items[i] === target.parentElement.id) {
                itemsStarred[i] = false;
            }
        }
        target.style.display = 'none';
        const sibling = target.previousElementSibling;
        sibling.style.display = 'block';
        target.parentElement.classList.remove('starred');
        target.parentElement.remove();
        refreshItems();
        unclickAllButtons();
        setLocalStorage();
    });
}
function addBlank() {
    while (ul.childElementCount < totalItemsShown) {
        const placeholderElement = document.createElement('li');
        placeholderElement.classList.add('placeholder-item');
        placeholderElement.classList.add('item');
        ul.appendChild(placeholderElement);
    }
}
function removeBlank() {
    const blankItem = ul.lastElementChild;
    if (blankItem.classList.contains('placeholder-item')) {
        blankItem.remove();
    }
    else {
        return;
    }
}
function setLocalStorage() {
    localStorage.clear;
    localStorage.setItem('items', JSON.stringify(items));
    localStorage.setItem('itemsValue', JSON.stringify(itemsValue));
    localStorage.setItem('itemsCompleted', JSON.stringify(itemsCompleted));
    localStorage.setItem('itemsStared', JSON.stringify(itemsStarred));
}
function updateTotalItems(addOrSub, counter) {
    const todoItems = document.querySelectorAll('.info')[0]
        .lastChild;
    const itemsCompleted = document.querySelectorAll('.info')[1]
        .lastChild;
    const totalItems = document.querySelectorAll('.info')[2]
        .lastChild;
    if (addOrSub) {
        if (counter === 'total') {
            valueTotal++;
        }
        else if (counter === 'completed') {
            valueCompleted++;
        }
    }
    else if (!addOrSub) {
        if (counter === 'total') {
            valueTotal--;
        }
        else if (counter === 'completed') {
            valueCompleted--;
        }
    }
    todoItems.textContent = JSON.stringify(valueTotal - valueCompleted);
    itemsCompleted.textContent = JSON.stringify(valueCompleted);
    totalItems.textContent = JSON.stringify(valueTotal);
}
function buttonEventListeners() {
    const todoItems = document.querySelectorAll('.info')[0];
    const itemsCompleted = document.querySelectorAll('.info')[1];
    const totalItems = document.querySelectorAll('.info')[2];
    todoItems.addEventListener('click', (event) => {
        const button = event.currentTarget;
        if (button.classList.contains('clicked-button')) {
            unclickAllButtons();
            filterItems('all');
        }
        else {
            unclickAllButtons();
            button.classList.add('clicked-button');
            filterItems('uncompleted');
        }
    });
    itemsCompleted.addEventListener('click', (event) => {
        const button = event.currentTarget;
        if (button.classList.contains('clicked-button')) {
            unclickAllButtons();
            filterItems('all');
        }
        else {
            unclickAllButtons();
            button.classList.add('clicked-button');
            filterItems('completed');
        }
    });
    totalItems.addEventListener('click', (event) => {
        const button = event.currentTarget;
        unclickAllButtons();
        filterItems('all');
    });
}
function filterItems(typeOfItem) {
    switch (typeOfItem) {
        case 'uncompleted':
            refreshItems();
            deleteFromDOM(true);
            return;
        case 'completed':
            refreshItems();
            deleteFromDOM(false);
            return;
        case 'all':
            refreshItems();
            return;
        default:
            console.error('Incompatable filter applied');
            return;
    }
    function deleteFromDOM(completed) {
        if (completed) {
            const DOMItems = ul.querySelectorAll('.completed');
            for (let i = 0; i < DOMItems.length; i++) {
                DOMItems[i].remove();
                addBlank();
            }
        }
        else {
            const DOMItems = ul.querySelectorAll('.item');
            for (let i = 0; i < DOMItems.length; i++) {
                if (DOMItems[i].classList[1] !== 'completed' &&
                    DOMItems[i].classList[0] !== 'placeholder-item') {
                    DOMItems[i].remove();
                    addBlank();
                }
            }
        }
    }
}
function unclickAllButtons() {
    const todoItems = document.querySelectorAll('.info')[0];
    const itemsCompleted = document.querySelectorAll('.info')[1];
    todoItems.classList.remove('clicked-button');
    itemsCompleted.classList.remove('clicked-button');
    filterItems('all');
}
function refreshItems() {
    const DOMItems = ul.querySelectorAll('.item');
    for (let i = 0; i < DOMItems.length; i++) {
        DOMItems[i].remove();
        addBlank();
    }
    for (let i = 0; i < items.length; i++) {
        createListItem(items[i], itemsValue[i], itemsCompleted[i], false, itemsStarred[i]);
    }
}
