import { render, screen } from '@testing-library/react';
import App from './App';

test('renders openlayersAndCanvas react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/openlayersAndCanvas react/i);
  expect(linkElement).toBeInTheDocument();
});
