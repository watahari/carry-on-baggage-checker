global.fetch = jest.fn();

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(navigator, 'language', {
  value: 'ja',
  writable: true,
});

beforeEach(() => {
  fetch.mockClear();
  localStorage.getItem.mockClear();
  localStorage.setItem.mockClear();
});