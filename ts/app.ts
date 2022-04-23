//Defining global variables from the DOM
const input = document.getElementById('input') as HTMLInputElement
const ul = document.getElementById('list')!
//Running function(s) neccessary on load
buttonEventListeners()
//----The number of rows----//
const totalItemsShown = 6
//-------------------------//
//Update CSS variable based on ^
document.documentElement.style.setProperty(
  '--total-items',
  JSON.stringify(totalItemsShown)
)
addBlank()
//--------------------------//

//Items that needed to be define in the global scope
let items: string[] = []
let itemsValue: string[] = []
let itemsCompleted: boolean[] = []
let itemsStarred: boolean[] = []
let valueTotal = 0
let valueCompleted = 0

//Get from localStorage and input data on page load
window.onload = () => {
  //Get from localStorage and parse as a array from string
  const loadedItems = JSON.parse(localStorage.getItem('items') as string)
  const loadedItemsValue = JSON.parse(
    localStorage.getItem('itemsValue') as string
  )
  const loadedItemsCompleted = JSON.parse(
    localStorage.getItem('itemsCompleted') as string
  )
  const loadedItemsStarred = JSON.parse(
    localStorage.getItem('itemsStared') as string
  )

  //Just a log for debuging
  console.log({
    Id: loadedItems,
    Value: loadedItemsValue,
    Completed: loadedItemsCompleted,
    Starred: loadedItemsStarred,
  })

  //Create a list item based on all saved information
  for (let i = 0; i < loadedItems.length; i++) {
    createListItem(
      loadedItems[i],
      loadedItemsValue[i],
      loadedItemsCompleted[i],
      true,
      loadedItemsStarred[i]
    )
  }
}

//See if enter is pressed, if it is, clear the input and create the item
input.addEventListener('keydown', (e) => {
  const noLineBreaks = input.value.replace(/(\r\n|\n|\r| )/gm, '')
  if (e.key === 'Enter' && !e.shiftKey && noLineBreaks != '') {
    e.preventDefault()
    proccessAddingItem(input.value)
    input.value = ''
  }
})

//Add eventListeners to input box stars
const emptyStarSVG = document.querySelectorAll(
  '.input-star'
)[0] as HTMLImageElement
const starSVG = document.querySelectorAll('.input-star')[1] as HTMLImageElement

emptyStarSVG.addEventListener('click', (event) => {
  emptyStarSVG.style.display = 'none'
  starSVG.style.display = 'block'
})

starSVG.addEventListener('click', (event) => {
  starSVG.style.display = 'none'
  emptyStarSVG.style.display = 'block'
})

function proccessAddingItem(value: string) {
  let isStarred = emptyStarSVG.style.display === 'none'

  createListItem(undefined, value, false, true, isStarred)

  starSVG.style.display = 'none'
  emptyStarSVG.style.display = 'block'
  refreshItems()
  unclickAllButtons()
}

//Creates item given the id(can be undefined), value(required), if it is completed(required), if it gets added to main arrays(required).
function createListItem(
  id: string | undefined,
  value: string,
  completed: boolean,
  addToSave: boolean,
  starred: boolean
): void {
  removeBlank()

  //Create the main li element and give it an ID
  const liElement = document.createElement('li')
  liElement.classList.add('item')
  liElement.id = JSON.stringify(Date.now())

  //Create the empty checkbox SVG img element
  const emptyCheckboxSVG = document.createElement('img')
  emptyCheckboxSVG.classList.add('checkbox-empty')
  emptyCheckboxSVG.src = './svgs/check_box_outline_blank_black_24dp.svg'
  emptyCheckboxSVG.alt = 'Mark As Complete'

  //Create the checkbox SVG img element
  const checkboxSVG = document.createElement('img')
  checkboxSVG.classList.add('checkbox')
  checkboxSVG.style.display = 'none'
  checkboxSVG.src = './svgs/check_box_black_24dp.svg'
  checkboxSVG.alt = 'Mark As Complete'

  //Create the p element and input the value
  const content = document.createElement('p')
  content.classList.add('content')
  content.textContent = value

  //Create empty star SVG
  const emptyStarSVG = document.createElement('img')
  emptyStarSVG.classList.add('star-empty')
  emptyStarSVG.src = './svgs/star_outline_black_24dp.svg'
  emptyStarSVG.alt = 'Star item'

  //Create star SVG
  const starSVG = document.createElement('img')
  starSVG.classList.add('star')
  starSVG.src = './svgs/star_black_24dp.svg'
  starSVG.alt = 'Unstar item'
  starSVG.style.display = 'none'

  //Create delete SVG
  const deleteSVG = document.createElement('img')
  deleteSVG.classList.add('deleteSVG')
  deleteSVG.src = './svgs/delete_outline_black_24dp.svg'
  deleteSVG.alt = 'Delete Item'

  //Update item to be completed or not
  if (completed == true) {
    emptyCheckboxSVG.style.display = 'none'
    checkboxSVG.style.display = 'block'
    liElement.classList.add('completed')
    if (addToSave) {
      updateTotalItems(true, 'completed')
    }
  }

  if (starred == true) {
    emptyStarSVG.style.display = 'none'
    starSVG.style.display = 'block'
    liElement.classList.add('starred')
  }

  //Change id if one is given
  if (id != undefined) {
    liElement.id = id
  }

  //Add the remaining elements to the main li as a children
  liElement.appendChild(emptyCheckboxSVG)
  liElement.appendChild(checkboxSVG)
  liElement.appendChild(content)
  liElement.appendChild(emptyStarSVG)
  liElement.appendChild(starSVG)
  liElement.appendChild(deleteSVG)

  //Insert item at the end of all other items(that aren't placeholder items)
  const lastcontent = document.querySelectorAll('.content')
  if (lastcontent.length != 0 && !starred) {
    lastcontent[lastcontent.length - 1].parentElement!.insertAdjacentElement(
      'afterend',
      liElement
    )
  } else {
    ul.prepend(liElement)
  }

  //Update all that is nessesary when creating new item
  updateEventListeners(liElement)
  if (addToSave) {
    items.push(liElement.id)
    itemsValue.push(value)
    itemsCompleted.push(completed)
    itemsStarred.push(starred)
    updateTotalItems(true, 'total')
  }
  setLocalStorage()
}

//Updates and applies all eventListeners for the spefic item given
function updateEventListeners(x: HTMLLIElement): void {
  //Delete Object
  x.lastChild!.addEventListener('click', (event) => {
    let target = event.currentTarget as HTMLButtonElement

    //Save changed info to arrays
    for (let i = 0; i < items.length; i++) {
      if (items[i] === target.parentElement!.id) {
        items.splice(i, 1)
        itemsValue.splice(i, 1)
        itemsCompleted.splice(i, 1)
        itemsStarred.splice(i, 1)
      }
    }

    target.parentElement!.remove()

    //Update all that is nessesary when deleting an item
    addBlank()
    setLocalStorage()
    updateTotalItems(false, 'total')
    if (x.classList.contains('completed')) {
      updateTotalItems(false, 'completed')
    }
  })

  //Complete item
  x.firstChild!.addEventListener('click', (event) => {
    const target = event.currentTarget as HTMLImageElement

    //Save changed info to correct array
    for (let i = 0; i < items.length; i++) {
      if (items[i] === target.parentElement!.id) {
        itemsCompleted[i] = true
      }
    }

    //Update to make it a completed item
    target.style.display = 'none'
    const sibling = target.nextElementSibling as HTMLImageElement
    sibling.style.display = 'block'
    target.parentElement!.classList.add('completed')

    //Update all that is nessesary when completing an item
    refreshItems()
    unclickAllButtons()
    setLocalStorage()
    updateTotalItems(true, 'completed')
  })

  //Uncomplete item
  x.children[1].addEventListener('click', (event) => {
    const target = event.currentTarget as HTMLImageElement

    //Save changed info to correct array
    for (let i = 0; i < items.length; i++) {
      if (items[i] === target.parentElement!.id) {
        itemsCompleted[i] = false
      }
    }

    //Update to make it an uncomplete the item
    target.style.display = 'none'
    const sibling = target.previousElementSibling as HTMLImageElement
    sibling.style.display = 'block'
    target.parentElement!.classList.remove('completed')

    //Update all that is nessesary when completing an item
    refreshItems()
    unclickAllButtons()
    setLocalStorage()
    updateTotalItems(false, 'completed')
  })

  //Star item
  x.children[3].addEventListener('click', (event) => {
    const target = event.currentTarget as HTMLImageElement

    //Save changed info to correct array
    for (let i = 0; i < items.length; i++) {
      if (items[i] === target.parentElement!.id) {
        itemsStarred[i] = true
      }
    }

    //Update to make it a starred item
    target.style.display = 'none'
    const sibling = target.nextElementSibling as HTMLImageElement
    sibling.style.display = 'block'
    target.parentElement!.classList.add('starred')
    target.parentElement!.remove()

    //Update all that is nessesary when completing an item
    refreshItems()
    unclickAllButtons()
    setLocalStorage()
  })

  //Unstar item
  x.children[4].addEventListener('click', (event) => {
    const target = event.currentTarget as HTMLImageElement

    //Save changed info to correct array
    for (let i = 0; i < items.length; i++) {
      if (items[i] === target.parentElement!.id) {
        itemsStarred[i] = false
      }
    }

    //Update to make it an unstarred the item
    target.style.display = 'none'
    const sibling = target.previousElementSibling as HTMLImageElement
    sibling.style.display = 'block'
    target.parentElement!.classList.remove('starred')
    target.parentElement!.remove()

    //Update all that is nessesary when completing an item
    refreshItems()
    unclickAllButtons()
    setLocalStorage()
  })
}

//Add placeholder items
function addBlank(): void {
  //Adds enough placeholder items to completely fill the space
  while (ul.childElementCount < totalItemsShown) {
    const placeholderElement = document.createElement('li')
    placeholderElement.classList.add('placeholder-item')
    placeholderElement.classList.add('item')
    ul.appendChild(placeholderElement)
  }
}

//Removes a single placeholder item when called
function removeBlank(): void {
  const blankItem = ul.lastElementChild!

  if (blankItem.classList.contains('placeholder-item')) {
    blankItem.remove()
  } else {
    return
  }
}

//Save data to localStorage
function setLocalStorage(): void {
  localStorage.clear
  localStorage.setItem('items', JSON.stringify(items))
  localStorage.setItem('itemsValue', JSON.stringify(itemsValue))
  localStorage.setItem('itemsCompleted', JSON.stringify(itemsCompleted))
  localStorage.setItem('itemsStared', JSON.stringify(itemsStarred))
}

//Calculate the "Total Items" and "Items Completed" stats
function updateTotalItems(addOrSub: boolean, counter: string): void {
  const todoItems = document.querySelectorAll('.info')[0]
    .lastChild as HTMLSpanElement
  const itemsCompleted = document.querySelectorAll('.info')[1]
    .lastChild as HTMLSpanElement
  const totalItems = document.querySelectorAll('.info')[2]
    .lastChild as HTMLSpanElement

  //Use simple logic to determ based on the input if to remove or add to the counts
  if (addOrSub) {
    if (counter === 'total') {
      valueTotal++
    } else if (counter === 'completed') {
      valueCompleted++
    }
  } else if (!addOrSub) {
    if (counter === 'total') {
      valueTotal--
    } else if (counter === 'completed') {
      valueCompleted--
    }
  }

  //Update the elements to reflect the data
  todoItems.textContent = JSON.stringify(valueTotal - valueCompleted)
  itemsCompleted.textContent = JSON.stringify(valueCompleted)
  totalItems.textContent = JSON.stringify(valueTotal)
}

//Add eventListeners to see if buttons were pressed
function buttonEventListeners(): void {
  const todoItems = document.querySelectorAll(
    '.info'
  )[0] as HTMLParagraphElement
  const itemsCompleted = document.querySelectorAll(
    '.info'
  )[1] as HTMLParagraphElement
  const totalItems = document.querySelectorAll(
    '.info'
  )[2] as HTMLParagraphElement

  //Add the eventListeners and logic for todoItems
  todoItems.addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLParagraphElement

    //Logic to detirmine which button is pressed (they cannot be both pressed)
    if (button.classList.contains('clicked-button')) {
      unclickAllButtons()
      filterItems('all')
    } else {
      unclickAllButtons()
      button.classList.add('clicked-button')
      filterItems('uncompleted')
    }
  })

  //Add the eventListeners and logic for itemsCompleted
  itemsCompleted.addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLParagraphElement

    //Logic to detirmine which button is pressed (they cannot be both pressed)
    if (button.classList.contains('clicked-button')) {
      unclickAllButtons()
      filterItems('all')
    } else {
      unclickAllButtons()
      button.classList.add('clicked-button')
      filterItems('completed')
    }
  })

  totalItems.addEventListener('click', (event) => {
    const button = event.currentTarget as HTMLParagraphElement

    //If button is pressed, it will remove all other pressed buttons and show all items.
    unclickAllButtons()
    filterItems('all')
  })
}

//Filter items based on given filter
function filterItems(typeOfItem: string): void {
  switch (typeOfItem) {
    case 'uncompleted':
      refreshItems()
      deleteFromDOM(true)
      return
    case 'completed':
      refreshItems()
      deleteFromDOM(false)
      return
    case 'all':
      refreshItems()
      return
    default:
      console.error('Incompatable filter applied')
      return
  }

  //Delete elements that are filtered out from JUST the DOM.
  function deleteFromDOM(completed: boolean): void {
    if (completed) {
      const DOMItems = ul.querySelectorAll('.completed')
      for (let i = 0; i < DOMItems.length; i++) {
        DOMItems[i].remove()
        addBlank()
      }
    } else {
      const DOMItems = ul.querySelectorAll('.item')
      for (let i = 0; i < DOMItems.length; i++) {
        if (
          DOMItems[i].classList[1] !== 'completed' &&
          DOMItems[i].classList[0] !== 'placeholder-item'
        ) {
          DOMItems[i].remove()
          addBlank()
        }
      }
    }
  }
}

//Unclickes all the buttons
function unclickAllButtons() {
  const todoItems = document.querySelectorAll(
    '.info'
  )[0] as HTMLParagraphElement
  const itemsCompleted = document.querySelectorAll(
    '.info'
  )[1] as HTMLParagraphElement

  todoItems.classList.remove('clicked-button')
  itemsCompleted.classList.remove('clicked-button')
  filterItems('all')
}

//Undo the delete, add back the items to the DOM
function refreshItems() {
  const DOMItems = ul.querySelectorAll('.item')
  //Remove all items from DOM
  for (let i = 0; i < DOMItems.length; i++) {
    DOMItems[i].remove()
    addBlank()
  }

  //Add all of them back
  for (let i = 0; i < items.length; i++) {
    createListItem(
      items[i],
      itemsValue[i],
      itemsCompleted[i],
      false,
      itemsStarred[i]
    )
  }
}
