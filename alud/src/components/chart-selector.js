import React, { useState, useEffect } from 'react';
import ReactJson from 'react-json-view'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bubble } from 'react-chartjs-2';

ChartJS.register(
 CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const ConfigEditor = props => {
  const {config, setConfig} = props;

  const updateConfigChange = obj => setConfig(obj.updated_src)

  return <>
    <ReactJson src={config} onAdd={updateConfigChange} onEdit={updateConfigChange} onDelete={updateConfigChange} style={props.style}/>
  </>
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.props.setHasError(true)
    console.log(error, errorInfo);
  }

  render() {
    if (this.props.hasError) {
      // You can render any custom fallback UI
      return <></>;
    }

    return this.props.children; 
  }
}

const ChartSelector = (props) => {
  const {hideEditor, chartType, data, config, setConfig, hasError, setHasError } = props;
  let Chart;

  useEffect(()=> {
    setHasError(false);
  }, [chartType, data, config])

  if (chartType == 'bubble') {
    try {
      Chart = <ErrorBoundary hasError={hasError} setHasError={setHasError}>
       <div
          style={{ 'grid-column-start': 'first'  }} 
       > 
       <Bubble
	  options={config}
	  data={data}
	/>
      </div>
      </ErrorBoundary>;
    } catch (e) {
      console.log("Failed generating chart");
      console.log(e);
    }

    if (hideEditor) return (<div style={{ width: '60%' }}>
      {Chart}
      </div>);

    return <div style={{display: 'grid', 'grid-template-columns': '64px [first] 47% 20px [end] 40%'}}>
      {Chart}
      <ConfigEditor style={{ 'grid-column-start': 'end' }} config={config} setConfig={setConfig} />
    </div>;
  }

  return <></>;

}

export default ChartSelector;
