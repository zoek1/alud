import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import Box from "@mui/material/Box";
import React, {useEffect, useRef, useState} from "react";
import GraphiQLExplorer from "graphiql-explorer";
import GraphiQL from "graphiql";
import TextareaAutosize from "@mui/base/TextareaAutosize";
import Paper from "@mui/material/Paper";
import ReactJson from "react-json-view";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ChartSelector from "./chart-selector";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import {buildClientSchema, getIntrospectionQuery} from "graphql/index";
import jsonata from "jsonata";
import TabPanel from "./TabPanel";
import Story from "./Story";
import {redirect} from "react-router-dom";

const GRAPHQL_ENDPOINT = 'https://dex.dipdup.net/v1/graphql'; // 'https://swapi-graphql.netlify.app/.netlify/functions/index',

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

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

export default function NewChart (props){
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
    const [saving, setSaving] = useState(false);

    const graphiQLRef = useRef(null);
    const { address, getAddress } = props;

    const canSaveChart = address && !hasError && chartType && story !== '' && JSON.stringify(filteredData) !== '{}'


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

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const onSave = async () => {
        const storyData = {address, config, story, chartType, filteredData, filterQuery, query };

        if (!address) {
            getAddress();
        }

        if (canSaveChart && !saving) {
            setSaving(true);
            console.log(storyData);
            try {
                const newUrl = window.location.protocol + "//" + window.location.hostname + ":8000/charts.json"
                const response = await fetch(newUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'mode': 'no-cors',
                    },
                    body: JSON.stringify(storyData)
                });

                const data = response.json();

                return window.location = '/';
            } catch (e) {
                console.log(e)
                alert('Oh no, the chart can\'t be saved!')
            }

        } else {
            console.log('Don\'t save due to missing fields');
        }

        setSaving(false);
    }

    const catchResponseFromFetcher = async (params) => {
        const graphQLResponse = await fetcher(params);
        console.log(graphQLResponse);

        if (typeof graphQLResponse != 'string') setResponse(graphQLResponse);

        return graphQLResponse;
    }

    const handleChartTypeChange = (event) => {
        setChartType(event.target.value);
    };


    return <Box>
        <Box className="gutter"  sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="Build Graphics">
                <Tab style={{flexGrow: 1}} label="1. Query & Filter" {...a11yProps(0)} />
                <Tab style={{flexGrow: 1}} label="2. Configure Chart" {...a11yProps(1)} />
                <Tab style={{flexGrow: 1}} label="3. Write a Story" {...a11yProps(2)} />
                <Button variant="outlined" startIcon={<SaveIcon />} onClick={onSave} disabled={!canSaveChart}>
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
                    <Story chartType={chartType} filteredData={filteredData} config={config} setConfig={setConfig} story={story} />
                </div>
            </div>
        </TabPanel>
    </Box>
}