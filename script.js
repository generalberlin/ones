const PHONE = '905053185433';
const RAW_CARS = Array.isArray(window.CARS) ? window.CARS : [];

const normalizeImagePath = (path = '') => {
  const fileName = path.split('/').pop();
  return `assets/cars/${fileName}`;
};

const cars = RAW_CARS.map((car) => ({
  ...car,
  image: normalizeImagePath(car.image),
}));

const state = {
  search: '',
  segment: 'all',
  body: 'all',
};

const labels = {
  ekonomik: 'Ekonomik',
  ortasegment: 'Orta Segment',
  luks: 'Lüks',
  sedan: 'Sedan',
  hatchback: 'Hatchback',
  suv: 'SUV',
  panelvan: 'Panelvan',
  benzin: 'Benzin',
  dizel: 'Dizel',
  hibrit: 'Hibrit',
  elektrik: 'Elektrik',
  otomatik: 'Otomatik',
};

const fleetGrid = document.getElementById('fleetGrid');
const searchInput = document.getElementById('searchInput');
const segmentFilters = document.getElementById('segmentFilters');
const bodyFilters = document.getElementById('bodyFilters');

const uniqueValues = (key) => [...new Set(cars.map((item) => item[key]).filter(Boolean))];
const formatPrice = (value) => `${new Intl.NumberFormat('tr-TR').format(value)} ₺ / gün`;
const formatDeposit = (value) => `${new Intl.NumberFormat('tr-TR').format(value)} ₺ teminat`;
const capitalize = (text = '') => labels[text.toLowerCase()] || text;

function createFilterButtons(container, values, stateKey, allLabel) {
  const buttons = [{ value: 'all', label: allLabel }, ...values.map((value) => ({ value, label: capitalize(value) }))];

  container.innerHTML = buttons
    .map(
      ({ value, label }) => `
        <button class="filter-chip ${state[stateKey] === value ? 'active' : ''}" data-key="${stateKey}" data-value="${value}">
          ${label}
        </button>
      `
    )
    .join('');
}

function getFilteredCars() {
  const query = state.search.trim().toLowerCase();

  return cars.filter((car) => {
    const matchesSearch =
      !query ||
      [car.name, car.segment, car.body, car.fuel, car.transmission, ...(car.features || [])]
        .join(' ')
        .toLowerCase()
        .includes(query);

    const matchesSegment = state.segment === 'all' || car.segment === state.segment;
    const matchesBody = state.body === 'all' || car.body === state.body;

    return matchesSearch && matchesSegment && matchesBody;
  });
}

function buildWhatsappLink(carName) {
  const text = `Merhaba Ones Filo, ${carName} için fiyat ve rezervasyon bilgisi almak istiyorum.`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
}

function renderCars() {
  const filteredCars = getFilteredCars();

  if (!filteredCars.length) {
    fleetGrid.innerHTML = `
      <div class="empty-state">
        <h3>Uygun sonuç bulunamadı</h3>
        <p>Arama kelimesini veya filtreleri değiştirerek farklı araç seçeneklerini görüntüleyebilirsiniz.</p>
      </div>
    `;
    return;
  }

  fleetGrid.innerHTML = filteredCars
    .map((car) => {
      const features = (car.features || []).slice(0, 4);
      return `
        <article class="car-card">
          <div class="car-image-wrap">
            <img loading="lazy" src="${car.image}" alt="${car.name}" />
            <div class="car-price">${formatPrice(car.price)}</div>
          </div>

          <div class="car-body">
            <div class="car-topline">
              <span class="pill">${capitalize(car.segment)}</span>
              <span class="pill">${car.year}</span>
            </div>

            <h3 class="car-title">${car.name}</h3>

            <div class="car-meta">
              <div class="meta-item"><strong>Yakıt:</strong> ${capitalize(car.fuel)}</div>
              <div class="meta-item"><strong>Vites:</strong> ${capitalize(car.transmission)}</div>
              <div class="meta-item"><strong>Kasa:</strong> ${capitalize(car.body)}</div>
              <div class="meta-item"><strong>Teminat:</strong> ${formatDeposit(car.deposit)}</div>
            </div>

            <div class="car-features">
              ${features.map((feature) => `<span>${feature}</span>`).join('')}
            </div>

            <div class="car-actions">
              <a class="btn btn-secondary" href="tel:+${PHONE}">Hemen Ara</a>
              <a class="btn btn-primary" href="${buildWhatsappLink(car.name)}" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderFilters() {
  createFilterButtons(segmentFilters, uniqueValues('segment'), 'segment', 'Tüm Segmentler');
  createFilterButtons(bodyFilters, uniqueValues('body'), 'body', 'Tüm Kasalar');
}

searchInput.addEventListener('input', (event) => {
  state.search = event.target.value;
  renderCars();
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('.filter-chip');
  if (!button) return;

  const { key, value } = button.dataset;
  state[key] = value;
  renderFilters();
  renderCars();
});

renderFilters();
renderCars();
