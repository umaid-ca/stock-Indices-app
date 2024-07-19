"use client"
import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import "../../globals.css"
import { Alert, Box, TextField } from '@mui/material';
import { redirect, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useSession, getSession } from "next-auth/react"

const Stock_list = () => {
  const { data: session, status } = useSession()
    const [indicesList, setIndicesList] = useState([])
    const [filtereIndiceName, setFiltereIndiceName] = useState(null)
    const [message, setMessage] = React.useState([]);
    const router = useRouter()
    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'country', headerName: 'Country', width: 150 },
        { field: 'currency', headerName: 'Currency', width: 100 },
        {
          field: 'symbol',
          headerName: 'Indice Name',
          width: 100,
        },
      ];

    async function getData() {
        const url = "https://api.twelvedata.com/indices";
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
      
          const json = await response.json();
          const filterData = json.data.filter(item => item.country == 'United States' || item.country == 'United Kingdom' || item.country == 'Australia')
          setIndicesList(filterData)
          return filterData
        } catch (error) {
          console.error(error.message);
        }
      }
      useEffect(() => {
        getData()
      }, [])

      const filterData = (searchName) => {
        console.log(searchName, `searrch name`)
        if(searchName == '') {
            setFiltereIndiceName(null)
        } else {
            const filteredData = indicesList.filter(item => item.name == searchName || item.name.toLowerCase().includes(searchName.toLowerCase()))
            setFiltereIndiceName(filteredData)
        }
      }
      const handleRowClick = (element) => {
        console.log(element.row, `element`)
        setMessage(element.row);
        localStorage.setItem("Indice", JSON.stringify(element.row))
        router.push("/stockdeatils")
      };
      console.log(status, `status from session`)
      if (status == "loading") {
        return <h1>Loading...</h1>
    }else if(status == "authenticated") {
  return (
    
    <div>
      <button onClick={() => signOut({redirect: true, callbackUrl: "/login"})} className='logout_btn'>Log Out</button>
        <h1>Stock Indices List</h1>
        <TextField onChange={(event) => filterData(event.target.value)} style={{width: "500px", margin: "10px 0px 10px 0px"}} id="outlined-basic" label="Search By Name" variant="outlined" />
      <Box
      sx={{
        height: 570,
        width: '100%',
      }}
      >
      <DataGrid
        rows={filtereIndiceName != null ? filtereIndiceName : indicesList}
        columns={columns}
        getRowId={(row) => row.symbol}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        onRowClick={handleRowClick}
        pageSizeOptions={[10 ,20, 30]}
      />
    </Box>
    {message && <Alert severity="info">{message.name}</Alert>}
        </div>
  )
} else if(status == "unauthenticated") {
  return router.push("/login")
} 
}

export default Stock_list