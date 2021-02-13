import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router';
import { findByTestId, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from 'App';
const queryClient = new QueryClient();

const Wrapper = ({ children }: { children?: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const renderWithRouter = (
  ui: ReactElement,
  { route = '/', history = createHistory(createMemorySource(route)) }
) => ({
  ...render(<LocationProvider history={history}>{ui}</LocationProvider>),
  history,
});

test('if sign, navigation and nav works correctly', async () => {
  const {
    history: { navigate },
  } = renderWithRouter(
    <Wrapper>
      <App />
    </Wrapper>,
    { route: '/' }
  );
  await navigate('/signup');
  const emailInput = screen.getByTestId('email') as HTMLInputElement;
  const passwordInput = screen.getByTestId('password') as HTMLInputElement;
  const feedback = screen.getByTestId('feedback');
  const submit = screen.getByTestId('sign-button');

  userEvent.type(emailInput, 'teste');

  userEvent.type(passwordInput, 'te');

  userEvent.click(submit);

  expect(feedback).toHaveTextContent('Email inválido');
  userEvent.type(emailInput, '@gmail.com');

  userEvent.click(submit);
  expect(feedback).toHaveTextContent(
    'A senha precisa ter pelo menos três caracteres'
  );
  userEvent.type(passwordInput, 't');
  userEvent.click(submit);
  await screen.findByText('Usuário já está cadastrado');

  expect(feedback).toHaveTextContent('Usuário já está cadastrado');

  await navigate('/login');
  emailInput.setSelectionRange(0, emailInput.value.length);
  passwordInput.setSelectionRange(0, passwordInput.value.length);

  userEvent.type(emailInput, 'test12345678@gmail.com');
  userEvent.type(passwordInput, 'tes');

  userEvent.click(submit);

  await navigate('/details');
  expect(screen.getByTestId('details')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Mais dados de CNPJ' })
  ).not.toBeInTheDocument();
  await navigate('/');
  expect(
    screen.queryByRole('link', { name: 'Cadastro' })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
});
