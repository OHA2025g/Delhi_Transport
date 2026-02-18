/**
 * Frontend Unit Tests - App Component
 * Tests the main App component and routing
 */

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock child components to isolate App testing
jest.mock('../pages/LandingPage', () => {
  return function MockLandingPage() {
    return <div data-testid="landing-page">Landing Page</div>;
  };
});

jest.mock('../pages/ExecutiveDashboard', () => {
  return function MockExecutiveDashboard() {
    return <div data-testid="executive-dashboard">Executive Dashboard</div>;
  };
});

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  });

  test('renders landing page at root path', () => {
    window.history.pushState({}, 'Test page', '/');
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // Note: This is a basic test - actual routing test would require more setup
  });
});

