import React, { useState, useRef, useEffect } from 'react';
import jsonata from 'jsonata';
import GraphiQL from 'graphiql';
import { buildClientSchema, getIntrospectionQuery } from "graphql";
import 'graphiql/graphiql.min.css';
import GraphiQLExplorer from 'graphiql-explorer';

import TextareaAutosize from '@mui/base/TextareaAutosize';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import ReactJson from 'react-json-view'

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
  const [response, setResponse] = useState({});
  const [filterQuery, setFilterQuery] = useState('');	
  const [filteredData, setFilteredData] = useState({});

  const graphiQLRef = useRef(null);
  
  useEffect(() => {
    fetcher({
      query: getIntrospectionQuery()
    }).then(result => {
      setSchema(buildClientSchema(result.data))
    })
  }, []);

  useEffect(() => {
    if (filterQuery != '') {
      try {  
        const expression = jsonata(filterQuery);
        expression.evaluate(response, {}, (error, result) => {
          if (error) { 
	    console.log(error); 
	  } else {
	    setFilteredData(result);
	  }
        });
      } catch(err) { console.log(err) }
    }
  }, [filterQuery, response])

  const catchResponseFromFetcher = async (params) => {
    const graphQLResponse = await fetcher(params);
    console.log(graphQLResponse);

    if (typeof graphQLResponse != 'string') setResponse(graphQLResponse);

    return graphQLResponse;
  }

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

    <div style={{height: '100%', width: '100%'}}>
      <GraphiQL
        ref={ () =>  graphiQLRef}
        fetcher={catchResponseFromFetcher}
        schema={schema}
        query={query}
        onEditQuery={setQuery}
        docExplorerOpen={false}
      />
      <Box style={{ 'display': 'grid', 'grid-template-columns': '64px [first] 47% 20px [end] 40%' }}>
        <TextareaAutosize aria-label="Transformation query" placeholder="JSONata query" style={{ 'grid-column-start': 'first', 'height': 200 }} value={filterQuery} onChange={(event) => setFilterQuery(event.target.value)} />
	<Paper style={{'grid-column-start': 'end'}}><ReactJson src={filteredData} /></Paper>
      </Box>
    </div>
  </div>)
};

export default App;
