const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

function activateTab(button) {
    const tabName = button.getAttribute('data-tab');

    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    tabContents.forEach(content => content.classList.remove('active'));

    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');

    const tabElement = document.getElementById(tabName);
    if (tabElement) {
        tabElement.classList.add('active');
    }
}

tabButtons.forEach(button => {
    button.addEventListener('click', () => activateTab(button));
});

const tabList = document.querySelector('.tabs-buttons');
const tabArray = Array.from(tabButtons);

tabList.addEventListener('keydown', (e) => {
    const current = document.activeElement;
    const idx = tabArray.indexOf(current);
    if (idx === -1) return;

    let nextIdx;
    if (e.key === 'ArrowRight') {
        nextIdx = (idx + 1) % tabArray.length;
    } else if (e.key === 'ArrowLeft') {
        nextIdx = (idx - 1 + tabArray.length) % tabArray.length;
    } else {
        return;
    }

    e.preventDefault();
    tabArray[nextIdx].focus();
    activateTab(tabArray[nextIdx]);
});
