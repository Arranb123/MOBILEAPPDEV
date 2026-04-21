import { configure } from '@testing-library/react-native';

// Tell RNTL which components are host components (bypasses auto-detection issues in jest-expo)
configure({
  hostComponentNames: {
    text: 'Text',
    textInput: 'TextInput',
    switch: 'Switch',
    scrollView: 'ScrollView',
    image: 'Image',
  },
});
