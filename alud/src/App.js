import React, { useState, useRef, useEffect } from 'react';
import GraphiQL from 'graphiql';
import { buildClientSchema, getIntrospectionQuery } from "graphql";
import 'graphiql/graphiql.min.css';
import GraphiQLExplorer from 'graphiql-explorer';

const GRAPHQL_ENDPOINT = 'https://dex.dipdup.net/v1/graphql'; // 'https://swapi-graphql.netlify.app/.netlify/functions/index',

const fetcher = async graphQLParams => {
  const data = await fetch(
    GRAPHQL_ENDPOINT,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphQLParams),
      credentials: 'same-origin'
    },
  )
  
  return data.json().catch(()=> data.text());
}


const App = () => {
  const [schema, setSchema] = useState(null);
  const [explorerIsOpen, setExplorerIsOpen] = useState(true);
  const [query, setQuery] = useState('');
 
  const graphiQLRef = useRef(null);

  useEffect(() => {
    fetcher({
      query: getIntrospectionQuery()
    }).then(result => {
      setSchema(buildClientSchema(result.data))
    })
  }, []);

  return (<div className='container'>
    <GraphiQLExplorer
      schema={schema}
      query={query}
      onEdit={setQuery}
      onRunOperation={operationName =>
        graphiQLRef.current ? graphiQLRef.handleRunQuery(operationName) : console.log(graphiQLRef)
      }
      explorerIsOpen={explorerIsOpen}
      onToggleExplorer={() => setExplorerIsOpen(!explorerIsOpen) }
    />

    <GraphiQL
      ref={graphiQLRef}
      fetcher={fetcher}
      schema={schema}
      query={query}
      onEditQuery={setQuery}
      docExplorerOpen={false}
    />
  </div>)
};

export default App;
