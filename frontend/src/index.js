import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import App from "./containers/App";
import reportWebVitals from "./reportWebVitals";
import { GameProvider } from './containers/hooks/useGamePage';


const httpUrl = `http://${window.location.hostname}:4000/`;
const wsUrl = `ws://${window.location.hostname}:4000/`;

console.log(httpUrl, wsUrl);

const httpLink = new HttpLink({
  uri: httpUrl
});

const wsLink = new GraphQLWsLink(createClient({
  url: wsUrl,
  options: {
    lazy: true,
  },
}));
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <GameProvider><App /></GameProvider>
    </ApolloProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();