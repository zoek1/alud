import ChartSelector from "./chart-selector";
import MDEditor from "@uiw/react-md-editor";
import Paper from "@mui/material/Paper";
import React, {useState} from "react";

export default function Story(props) {
    let hasError, setHasError;

    const {chartType, filteredData, config, setConfig, story } = props;
    const [hideError, setHideError] = useState(false);

    if (!props.setHasError) {
        hasError = hideError;
        setHasError = setHideError;
    } else {
        hasError = props.hasError;
        setHasError = props.setHasError;
    }

    return (<Paper className='story' elevation={3} style={{ width: '77%', marginTop: '26px', paddingBottom: '46px', marginBottom: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ChartSelector hideEditor={true} chartType={chartType} data={filteredData} config={config} setConfig={setConfig} hasError={hasError} setHasError={setHasError} />
        <MDEditor.Markdown source={story} style={{ whiteSpace: 'pre-wrap' }} />
    </Paper>);
}