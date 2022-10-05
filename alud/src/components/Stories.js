import React, {useEffect, useState} from 'react';
import Story from "./Story";
import Typography from "@mui/material/Typography";
import {Link} from "react-router-dom";

export default function Stories() {
    const [stories, setStories] = useState([]);

    useEffect(() => {
        if (stories.length === 0) {
             async function fetchData() {
                const url = window.location.protocol + "//" + window.location.hostname + ":8000/charts.json"
                const response = await fetch(url);

                try {
                    setStories(await response.json());
                } catch (e) {
                    console.log(e);
                }
            }

            fetchData();
        }

    }, [])

    return <div className="container" style={{ width: '100%', alignItems: 'center', flexDirection: 'column',  justifyContent: 'center'}}>
        {  stories.length === 0 ?
        <Typography variant="h3"  sx={{ marginTop: '10%'}}>No stories, create a new story <Link to={'new'}>here</Link>. </Typography> :

                stories.map((story) => <Story {...story} setConfig={() => {
                }}/>)

        }
    </div>
}