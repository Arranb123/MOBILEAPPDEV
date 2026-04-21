// Component test: FormField renders correctly and fires onChangeText

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import FormField from '@/components/ui/form-field';

describe('FormField', () => {
  it('renders the label', () => {
    const { getByText } = render(
      <FormField label="Email" value="" onChangeText={() => {}} />
    );
    expect(getByText('Email')).toBeTruthy();
  });

  it('renders the placeholder', () => {
    const { getByPlaceholderText } = render(
      <FormField label="Email" value="" onChangeText={() => {}} placeholder="Enter your email" />
    );
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
  });

  it('uses label as default placeholder when none provided', () => {
    const { getByPlaceholderText } = render(
      <FormField label="Company" value="" onChangeText={() => {}} />
    );
    expect(getByPlaceholderText('Company')).toBeTruthy();
  });

  it('fires onChangeText when the user types', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <FormField label="Email" value="" onChangeText={onChangeText} placeholder="Enter email" />
    );
    fireEvent.changeText(getByPlaceholderText('Enter email'), 'test@example.com');
    expect(onChangeText).toHaveBeenCalledWith('test@example.com');
  });

  it('has the correct accessibilityLabel', () => {
    const { getByLabelText } = render(
      <FormField label="Password" value="" onChangeText={() => {}} />
    );
    expect(getByLabelText('Password')).toBeTruthy();
  });
});
