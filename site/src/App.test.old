import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { App } from './App';

describe('LoginModule', () => {
  test('initial state', () => {
    render(<App />);

    // it renders enabled submit button
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent('Submit');
  });

});

