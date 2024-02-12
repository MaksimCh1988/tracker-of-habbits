'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

/* page */
const page = {
  menu: document.querySelector('.menu__list'),
  header: {
    h1: document.querySelector('.h1'),
    progressPercent: document.querySelector('.progress__percent'),
    progressCoverBar: document.querySelector('.progress__cover-bar'),
  },
  daysList: document.querySelector('.days-list'),
  nextDayNumber: document.querySelector('.habbit__day'),
  popup: document.querySelector('.cover'),
  iconField: document.querySelector('.popup__icon-fieled'),
};

/* utils */

function loadData() {
  const habbitString = localStorage.getItem(HABBIT_KEY);
  const habbitArray = JSON.parse(habbitString);
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function togglePopup(event) {
  event.preventDefault();
  page.popup.classList.toggle('cover_hidden');
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = '';
  }
}

function validateAndGetFormData(form, fields) {
  const formData = new FormData(form);
  const res = {};
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove('error');
    if (!fieldValue) {
      form[field].classList.add('error');
    }
    res[field] = fieldValue;
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
    }
  }
  if (!isValid) {
    return undefined;
  }
  return res;
}

/* render */

function rerenderMenu(activeHabbit) {
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) {
      const element = document.createElement('button');
      element.setAttribute('menu-habbit-id', habbit.id);
      element.classList.add('menu__item');
      element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}"/>`;
      element.addEventListener('click', () => rerenderGlobal(habbit.id));
      if (activeHabbit.id === habbit.id) {
        element.classList.add('menu__item_active');
      }
      page.menu.appendChild(element);
      continue;
    }
    if (activeHabbit.id === habbit.id) {
      existed.classList.add('menu__item_active');
    } else {
      existed.classList.remove('menu__item_active');
    }
  }
}

function rerenderHead(activeHabbit) {
  page.header.h1.innerText = activeHabbit.name;
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1 ? 100 : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + ' %';
  page.header.progressCoverBar.setAttribute('style', `width: ${progress.toFixed(0)}%`);
}

function rerenderDays(activeHabbit) {
  page.daysList.innerHTML = '';
  for (const [index, comment] of activeHabbit.days.entries()) {
    const habbit = document.createElement('div');
    const day = index + 1;
    habbit.classList.add('habbit');
    habbit.innerHTML = `<div class="habbit__day">День ${day}</div>
    <div class="habbit__comment">${comment.comment}</div>
    <button class="habbit__delete" onclick='removeDay(event, ${index})'>
      <img src="./images/delete.svg" alt="Удалить день ${day}" />
    </button>`;
    page.daysList.appendChild(habbit);
  }
  page.nextDayNumber.innerText = `День ${activeHabbit.days.length + 1}`;
}

function rerenderGlobal(activeHabbitId) {
  const activeHabbit = habbits.find((habbit) => {
    return habbit.id === activeHabbitId;
  });
  if (!activeHabbit) {
    return;
  }
  globalActiveHabbitId = activeHabbitId;
  document.location.replace(document.location.pathname + '#' + activeHabbitId)
  rerenderMenu(activeHabbit);
  rerenderHead(activeHabbit);
  rerenderDays(activeHabbit);
}

/* working with days*/
function addDay(event) {
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ['comment']);
  if (!data) {
    return;
  }

  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment: data.comment }]),
      };
    }
    return habbit;
  });

  saveData();
  resetForm(event.target, ['comment']);
  rerenderGlobal(globalActiveHabbitId);
}

function removeDay(event, index) {
  event.preventDefault();
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.filter((_, i) => i != index),
      };
    }
    return habbit;
  });
  saveData();
  rerenderGlobal(globalActiveHabbitId);
}

/* working with habbits*/

function setIcon(context, icon) {
  page.iconField.value = icon;
  const activeIcon = document.querySelector('.icon.icon_active');
  activeIcon.classList.remove('icon_active');
  context.classList.add('icon_active');
}

function addHabbit(event) {
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
  if (!data) {
    return;
  }
  const maxId = habbits.reduce((acc, habbit) => (acc > habbit.id ? acc : habbit.id), 0);
  habbits.push({
    id: maxId + 1,
    name: data.name,
    target: data.target,
    icon: data.icon,
    days: [],
  });
  resetForm(event.target, ['name', 'icon', 'target']);
  
  togglePopup(event);
  saveData();
  rerenderGlobal(maxId + 1);
}

/* init */
(() => {
  loadData();
  rerenderGlobal(habbits[0].id);
})();
