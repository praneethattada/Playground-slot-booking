import React from 'react'
import { useSelector } from 'react-redux';

const Validation = () => {
    var nm = /^[A-Z][a-z]{1,6}$/;
    var em=/^[a-zA-Z0-9._%+-]+@+[a-zA-Z]+[.org]|[.com]|[.co.in]|[.in]$/
    var valid= useSelector((state)=>state.valid)
    
  return (
    <div>
        
    </div>
  )
}

export default Validation