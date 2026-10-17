import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Foundation Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'ok',
            service: 'incubyte-salary-management-api',
            uptime: 12.34,
            timestamp: new Date().toISOString(),
          }),
      })
    ));
  });

  it('renders foundation title and architecture overview', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Incubyte Global Salary Management'
    );
    expect(screen.getByText('Backend API Health')).toBeInTheDocument();
    expect(screen.getByText('Architecture Foundation')).toBeInTheDocument();
    expect(screen.getByText('PRD P0 Implementation Roadmap')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Operational')).toBeInTheDocument();
    });
  });

  it('contains health verification action button and resolves health status', async () => {
    render(<App />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Operational')).toBeInTheDocument();
    });
  });
});
