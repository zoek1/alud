import React, { useState, useRef, useEffect } from 'react';
import jsonata from 'jsonata';
import GraphiQL from 'graphiql';
import { buildClientSchema, getIntrospectionQuery } from "graphql";
import 'graphiql/graphiql.min.css';
import GraphiQLExplorer from 'graphiql-explorer';

import TextareaAutosize from '@mui/base/TextareaAutosize';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/Save';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';

import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";

import ReactJson from 'react-json-view'

import ChartSelector from './components/chart-selector.js';

import { NetworkType, DAppClient } from '@airgap/beacon-sdk';

const GRAPHQL_ENDPOINT = 'https://dex.dipdup.net/v1/graphql'; // 'https://swapi-graphql.netlify.app/.netlify/functions/index',
const TEZOS_RPC_URL = 'https://api.tez.ie/rpc/FLorencenet';

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

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index ? 
          children
      : <></>}
    </div>
  );
}

const App = () => {
  const [schema, setSchema] = useState(null);
  const [explorerIsOpen, setExplorerIsOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState({});
  const [filterQuery, setFilterQuery] = useState('');	
  const [filteredData, setFilteredData] = useState({});
  const [chartType, setChartType] = useState('');
  const [config, setConfig] = useState({responsive: true})
  const [story, setStory] = useState("# Awesome Tezos Story");
  const [value, setValue] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [address, setAddress] = useState('');

  const graphiQLRef = useRef(null);
  const dAppClient = useRef(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const onSave = async () => {
    const address = 'tz0000000000000000000000';
    const hash = '908a9s999a9999a';
    const storyData = {address, hash, config, story, chartType, filteredData, filterQuery, query};
    if (!hasError && chartType && story !== '' && JSON.stringify(filteredData) !== '{}') {
      console.log(storyData);
    } else {
      console.log('Don\'t save due to missing fields');
    }

  }

  useEffect(() => {
    fetcher({
      query: getIntrospectionQuery()
    }).then(result => {
      setSchema(buildClientSchema(result.data))
    })
  }, []);

  const onLogin = async () => {
    if (!dAppClient.current || address === '') {
      dAppClient.current = new DAppClient({ name: 'Alud' });
    }

    try {
      const permissions = await dAppClient.current.requestPermissions();
      setAddress(permissions.address)
    } catch (e) {
      console.log('Failed to get address')
    }
  }

  const onLogout = async () => {
    dAppClient.current = null;
    setAddress('')
    
  }

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
  
  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  return (<Box>
    <AppBar className="gutter" position="static" color="primary">
      <Toolbar style={{ padding: 0 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Alud
        </Typography>
	{ address === '' ?
            <Button color="inherit" onClick={onLogin}>Login</Button> : <>
              <Typography variant="p" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }} component="div" >
	         {address} 
                 <Button color="primary" sx={{ color: 'background.paper', paddingfLeft: 0, paddingRight: 0 }}  variant="outlined" size="small" onClick={onLogout}>Log out</Button>
	      </Typography>
       	    </>}
      </Toolbar>
    </AppBar>
    <Box className="gutter"  sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={value} onChange={handleChange} aria-label="Build Graphics">
          <Tab style={{flexGrow: 1}} label="1. Query & Filter" {...a11yProps(0)} />
          <Tab style={{flexGrow: 1}} label="2. Configure Chart" {...a11yProps(1)} />
          <Tab style={{flexGrow: 1}} label="3. Write a Story" {...a11yProps(2)} />
          <Button variant="outlined" startIcon={<SaveIcon />} onClick={onSave} >
          Save
        </Button>
      </Tabs>
    </Box>

    <TabPanel value={value} index={0}>
      <div className='gutter container'>
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
          <Box style={{ 'display': 'grid', 'grid-template-columns': '64px [first] 46% 20px [end] auto' }}>
            <TextareaAutosize aria-label="Transformation query" placeholder="JSONata query" style={{ 'grid-column-start': 'first', 'height': 200 }} value={filterQuery} onChange={(event) => setFilterQuery(event.target.value)} />
	    <Paper style={{'grid-column-start': 'end'}}><ReactJson src={filteredData} /></Paper>
          </Box>
        </div>
      </div>
    </TabPanel>

    <TabPanel value={value} index={1}>
      <div className='gutter container'>
        <div style={{height: '100%', width: '100%'}}>
          <Box style={{ }}>
            <FormControl style={{ marginTop: '26px' }}>
            <InputLabel id="chart-type-selector">Select Chart Type</InputLabel>
            <Select
	      labelId="chart-type-selector"
	      id="chart-type-select"
	      value={chartType}
	      label="Age"
	      onChange={handleChartTypeChange}
	      >
	        <MenuItem value=''>None</MenuItem>
	        <MenuItem value='bar'>Bar Chart</MenuItem>
	        <MenuItem value='bubble'>Bubble Chart</MenuItem>
	        <MenuItem value='pie'>Pie Chart</MenuItem>
	        <MenuItem value='line'>Line Chart</MenuItem>
	        <MenuItem value='radar'>Radar Chart</MenuItem>
	        <MenuItem value='scatter'>Scatter Chart</MenuItem>
	    </Select>
            </FormControl>
	    <ChartSelector chartType={chartType} data={filteredData} config={config} setConfig={setConfig} hasError={hasError} setHasError={setHasError} />
          </Box>
        </div>
      </div>
    </TabPanel>

    <TabPanel value={value} index={2}>
      <div className='gutter container'>
        <div style={{height: '100%', width: '100%', marginTop: '26px'}}>
          <MDEditor
            value={story}
            onChange={setStory}
            previewOptions={{
              rehypePlugins: [[rehypeSanitize]],
            }}
          />
          <Paper className='story' elevation={3} style={{marginTop: '26px', paddingBottom: '46px', marginBottom: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
	    <ChartSelector hideEditor={true} chartType={chartType} data={filteredData} config={config} setConfig={setConfig} hasError={hasError} setHasError={setHasError} />
            <MDEditor.Markdown source={story} style={{ whiteSpace: 'pre-wrap' }} />
          </Paper>
        </div>
      </div>
    </TabPanel>

  </Box>)
};

export default App;
