const solutions = [
  { round: 1, question: 1, topic: 'Combinatorics', pdf: 'Problem1.pdf', released: true },
  { round: 1, question: 2, topic: 'Solution available', pdf: 'Problem2.pdf', released: true },
  { round: 1, question: 3, topic: 'Solution not released yet', pdf: 'Problem3.pdf', released: false },
  { round: 1, question: 4, topic: 'Solution not released yet', pdf: 'Problem4.pdf', released: false },
  { round: 1, question: 5, topic: 'Solution not released yet', pdf: 'Problem5.pdf', released: false },
  { round: 1, question: 6, topic: 'Geometric series', pdf: 'Problem6.pdf', released: true },
  { round: 1, question: 7, topic: 'Solution not released yet', pdf: 'Problem7.pdf', released: false },
  { round: 1, question: 8, topic: 'Solution not released yet', pdf: 'Problem8.pdf', released: false },
  { round: 1, question: 9, topic: 'Solution not released yet', pdf: 'Problem9.pdf', released: false },
  { round: 1, question: 10, topic: 'Circle geometry', pdf: 'Problem10.pdf', released: true },
  ...Array.from({ length: 10 }, (_, index) => ({ round: 1, question: index + 11, topic: 'Solution not released yet', pdf: `Problem${index + 11}.pdf`, released: false })),
  ...Array.from({ length: 10 }, (_, index) => ({ round: 2, question: index + 21, topic: 'Solution not released yet', pdf: `Problem${index + 21}.pdf`, released: false }))
];

const state = { filter: 'all', query: '' };
const grids = { 1: document.querySelector('#round-one-grid'), 2: document.querySelector('#round-two-grid') };
const emptyState = document.querySelector('#empty-state');

function card(solution) {
  const released = solution.released;
  const article = document.createElement('article');
  article.className = `solution-card ${released ? 'released' : 'pending'}`;
  article.dataset.status = released ? 'released' : 'pending';
  article.dataset.search = `question ${solution.question} ${solution.topic}`.toLowerCase();
  article.innerHTML = `
    <div>
      <div class="card-top">
        <div class="question-number">${solution.question}</div>
        <span class="status-label ${released ? '' : 'pending'}">${released ? 'Released' : 'Coming soon'}</span>
      </div>
      <p class="topic">${solution.topic}</p>
    </div>
    <button class="view-button" type="button" ${released ? '' : 'disabled'}>${released ? 'View solution' : 'Not released yet'}</button>
  `;
  if (released) article.querySelector('button').addEventListener('click', () => openViewer(solution));
  return article;
}

function render() {
  let visibleCount = 0;
  [1, 2].forEach(round => {
    grids[round].replaceChildren();
    solutions.filter(solution => solution.round === round).forEach(solution => {
      const released = solution.released;
      const matchesFilter = state.filter === 'all' || (state.filter === 'released' && released) || (state.filter === 'pending' && !released);
      const matchesQuery = !state.query || `question ${solution.question} ${solution.topic}`.toLowerCase().includes(state.query);
      if (matchesFilter && matchesQuery) {
        grids[round].appendChild(card(solution));
        visibleCount++;
      }
    });
  });
  emptyState.hidden = visibleCount !== 0;
}

function openViewer(solution) {
  const modal = document.querySelector('#pdf-modal');
  document.querySelector('#viewer-title').textContent = `Question ${solution.question} · ${solution.topic}`;
  document.querySelector('#pdf-frame').src = solution.pdf;
  document.querySelector('#download-link').href = solution.pdf;
  document.querySelector('#new-tab-link').href = solution.pdf;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  document.querySelector('#close-viewer').focus();
}

function closeViewer() {
  document.querySelector('#pdf-modal').hidden = true;
  document.querySelector('#pdf-frame').src = 'about:blank';
  document.body.style.overflow = '';
}

document.querySelectorAll('.filter-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.filter-button.active').classList.remove('active');
    button.classList.add('active');
    state.filter = button.dataset.filter;
    render();
  });
});
document.querySelector('#search-input').addEventListener('input', event => {
  state.query = event.target.value.trim().toLowerCase();
  render();
});
document.querySelector('#close-viewer').addEventListener('click', closeViewer);
document.querySelector('[data-close-viewer]').addEventListener('click', closeViewer);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !document.querySelector('#pdf-modal').hidden) closeViewer();
});

document.querySelector('#released-count').textContent = solutions.filter(solution => solution.released).length;
render();
