import React, { useState, useRef, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import 'graphiql/graphiql.min.css';

import Typography from '@mui/material/Typography';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';

import { NetworkType, DAppClient } from '@airgap/beacon-sdk';
import NewChart from "./components/NewChart";
import Box from "@mui/material/Box";
import Stories from "./components/Stories";
import {Link} from "@mui/material";

export default function App() {
  const [address, setAddress] = useState('');
  const dAppClient = useRef(null);

  const onLogin = async () => {
    if (!dAppClient.current || address === '') {
      dAppClient.current = new DAppClient({ name: 'Alud' });
    }

    try {
      const permissions = await dAppClient.current.requestPermissions();
      setAddress(permissions.address)

      return permissions.address;
    } catch (e) {
      console.log('Failed to get address')
    }
  }

  const onLogout = async () => {
    dAppClient.current = null;
    setAddress('')
  }

  const router = createBrowserRouter([
    {
      path: "/new",
      element: <NewChart address={address} getAddress={onLogin} />
    },
    {
      path: "/",
      element: <Stories />
    }
  ]);

  return (<div>
    <div>
      <AppBar className="gutter" position="static" color="primary">
        <Toolbar style={{ padding: 0 }}>
          <Typography variant="h6" component="div" sx={{  flexGrow: 1 }}>
            <Link href='/' sx={{color: 'white', display: 'flex', alignItems: 'center'}} underline="none">
              <img style={{width: '54px', marginRight: '5px' }} src='/logo512.png' /> Alud</Link>
          </Typography>
          {  window.location.pathname !== '/new' ?
            <Button color="inherit" href='/new'>New Chart</Button> : <></>
          }

          { address === '' ?
              <Button color="inherit" onClick={onLogin}>Login</Button> : <>
                <Typography variant="p" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }} component="div" >
                  {address}
                  <Button color="primary" sx={{ color: 'background.paper', paddingfLeft: 0, paddingRight: 0 }}  variant="outlined" size="small" onClick={onLogout}>Log out</Button>
                </Typography>
              </>}
        </Toolbar>
      </AppBar>
    </div>
    <RouterProvider router={router} />
  </div>
  );
}
